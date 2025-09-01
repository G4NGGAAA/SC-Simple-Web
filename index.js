/*
    Base by https://github.com/G4NGGAAA
    Credits: G4NGGAAA
    MODIFIED: Menggunakan Global Config dan Logger Baru.
*/

// PENTING: Muat konfigurasi global terlebih dahulu
require('./config.js'); 

const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, proto, getContentType } = require("@whiskeysockets/baileys");
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const logger = require('./logger'); // Menggunakan logger baru Anda

// Set untuk menyimpan ID pesan yang sudah diproses
const processedMessages = new Set();

// Helper untuk menormalisasi nomor telepon
const normalizePhoneNumber = (number) => {
    let cleaned = ('' + number).replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
    }
    return cleaned;
};

//~~~~~ Fungsi Koneksi Bot Utama ~~~~~//
async function startAlyaBot() {
    if (!global.botNumber || global.botNumber === '08xxxxxxxxxx') {
        logger.error("Nomor bot belum diatur di file config.js!");
        process.exit(1);
    }
    const formattedBotNumber = normalizePhoneNumber(global.botNumber);

    const sessionName = "session_alya";
    logger.info(`Memuat sesi: ${sessionName}...`);

    const { state, saveCreds } = await useMultiFileAuthState(sessionName);
    
    const connectOptions = {
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        browser: [global.botName, "Chrome", "12.0.0"], // Menggunakan global.botName
        getMessage: async (key) => ({ conversation: 'hi' })
    };
    
    const ganggaaa = makeWASocket(connectOptions);
    
    // --- Logik Login dengan Custom Pairing Code ---
    if (!ganggaaa.authState.creds.registered) {
        logger.info(`Meminta pairing code untuk nomor ${formattedBotNumber}...`);
        logger.info(`Mencoba menggunakan kode kustom: ${global.customPairingCode}`);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Menggunakan global.customPairingCode
            const code = await ganggaaa.requestPairingCode(formattedBotNumber, global.customPairingCode);

            logger.success('Kode Pairing Berhasil Diminta!');
            logger.info(`Sekarang masukkan kode "${code}" di HP Anda.`);
            logger.info('Buka: WhatsApp > Perangkat Tertaut > Tautkan dengan nomor telepon.');

        } catch (e) {
            logger.error('Gagal meminta pairing code.', e);
            process.exit(1);
        }
    }

    // Event handler untuk pesan masuk
    ganggaaa.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            let mek = chatUpdate.messages[0];
            if (!mek.message || (mek.key && mek.key.remoteJid === 'status@broadcast')) return;

            const messageId = mek.key.id;
            if (processedMessages.has(messageId)) return;
            processedMessages.add(messageId);
            setTimeout(() => processedMessages.delete(messageId), 10000);

            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;

            const m = smsg(ganggaaa, mek);
            const pushname = m.pushName || 'Unknown';
            const budy = (typeof m.text === 'string' ? m.text : '');

            if (m.isGroup) {
                const groupMetadata = await ganggaaa.groupMetadata(m.chat);
                const groupName = groupMetadata.subject || 'Unknown Group';
                logger.logGroup(pushname, budy || m.mtype, groupName);
            } else {
                logger.logPrivate(pushname, budy || m.mtype);
            }
        } catch (err) {
            logger.error("Terjadi error di 'messages.upsert':", err);
        }
    });

    // Event handler untuk status koneksi
    ganggaaa.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason === DisconnectReason.loggedOut) {
                logger.error(`Perangkat Keluar. Hapus folder "${sessionName}" dan jalankan ulang.`);
                if (fs.existsSync(path.join(__dirname, sessionName))) {
                   fs.rmSync(path.join(__dirname, sessionName), { recursive: true, force: true });
                }
                process.exit(1);
            } else {
                logger.warn(`Koneksi terputus, mencoba menyambung kembali...`);
                startAlyaBot();
            }
        } else if (connection === 'open') {
            logger.success(`Berhasil terhubung ke WhatsApp! Bot sekarang online.`);
            logger.info(`Nama Perangkat: ${global.botName}`);
        }
    });

    ganggaaa.ev.on('creds.update', saveCreds);
    return ganggaaa;
}

// --- Fungsi smsg (serializer pesan) ---
function smsg(ganggaaa, m) {
    if (!m) return m;
    if (m.key) {
        m.id = m.key.id;
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16;
        m.chat = m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat.endsWith('@g.us');
        m.sender = ganggaaa.decodeJid(m.fromMe && ganggaaa.user.id || m.participant || m.key.participant || m.chat || '');
        if (m.isGroup) m.participant = ganggaaa.decodeJid(m.key.participant) || '';
        m.pushName = m.fromMe ? (ganggaaa.user.name || global.botName) : (m.sender.split('@')[0]);
    }
    if (m.message) {
        m.mtype = getContentType(m.message);
        m.msg = (m.mtype === 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype]);
        let quoted = m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null;
        if (m.quoted) {
            let type = getContentType(quoted);
            m.quoted = m.quoted[type];
            if (typeof m.quoted === 'string') m.quoted = { text: m.quoted };
            m.quoted.sender = ganggaaa.decodeJid(m.msg.contextInfo.participant);
        }
    }
    m.text = m.msg?.text || m.msg?.caption || m.message?.conversation || '';
    return m;
}

// --- Eksekusi Utama ---
logger.startupBanner();
startAlyaBot().catch(err => logger.error("Gagal memulai bot:", err));
