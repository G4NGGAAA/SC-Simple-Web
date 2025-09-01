/*
    Base by https://github.com/G4NGGAAA
    Credits: G4NGGAAA
    MODIFIED: Simplified to single bot, enhanced visuals, connection flow fix.
    BOLEH AMBIL/RENAME
    ASAL JANGAN HAPUS CREDIT YAA 🎩🎩
*/

const { default: makeWASocket, DisconnectReason, jidDecode, proto, getContentType, useMultiFileAuthState, downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');
const readline = require("readline");
const chalk = require('chalk');
const fetch = require('node-fetch');
const qrcode = require('qrcode-terminal');
const logger = require('./logger'); // <-- Mengimpor logger kustom kita

// Helper untuk bertanya di terminal
const question = (text) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(text, (answer) => {
            resolve(answer);
            rl.close();
        });
    });
};

// Helper untuk menunda eksekusi
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

//~~~~~ Fungsi Koneksi Bot Utama ~~~~~//
async function startAlyaBot() {
    const sessionName = "session_alya";
    logger.info(`Memuat sesi: ${chalk.cyan(sessionName)}...`);

    const { state, saveCreds } = await useMultiFileAuthState(sessionName);
    let ganggaaa;

    const browsers = [
        ["AlyaBot", "Chrome", "12.0.0"],
        ["AlyaBot", "Safari", "15.3"],
        ["AlyaBot", "Firefox", "107.0"],
    ];
    const selectedBrowser = browsers[Math.floor(Math.random() * browsers.length)];

    const connectOptions = {
        logger: require('pino')({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        browser: selectedBrowser,
        getMessage: async (key) => { return { conversation: 'hi' } }
    };

    // --- Logik Login: QR atau Pairing Code ---
    if (!fs.existsSync(`./${sessionName}/creds.json`)) {
        const choice = await question(
            chalk.yellow('\nSesi tidak ditemukan. Bagaimana Anda ingin terhubung?\n') +
            chalk.cyan('  1: ') + chalk.white('Scan QR Code\n') +
            chalk.cyan('  2: ') + chalk.white('Gunakan Pairing Code\n\n') +
            chalk.magentaBright('Masukkan pilihan Anda (1 atau 2): ')
        );

        if (choice.trim() === '2') {
            connectOptions.printQRInTerminal = false;
            ganggaaa = makeWASocket(connectOptions);
            const phoneNumber = await question(chalk.yellow('Silakan masukkan nomor telepon bot (contoh: 6281234567890): '));
            try {
                logger.info('Meminta pairing code...');
                let code = await ganggaaa.requestPairingCode(phoneNumber.trim());
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                logger.success('Pairing Code Anda: ' + chalk.white.bgBlue.bold(` ${code} `));
                logger.info('Silakan masukkan kode ini di WhatsApp pada perangkat utama Anda.');
            } catch (e) {
                logger.error('Gagal meminta pairing code. Silakan mulai ulang.', e);
                process.exit(1);
            }
        } else {
             logger.info('Silakan scan QR code yang akan muncul di bawah ini...');
             ganggaaa = makeWASocket(connectOptions);
        }
    } else {
        logger.info("Sesi ditemukan, menghubungkan secara otomatis...");
        ganggaaa = makeWASocket(connectOptions);
    }
    
    const contacts = {};

    ganggaaa.ev.on('contacts.update', updates => {
        for (const update of updates) {
            contacts[update.id] = { ...contacts[update.id], ...update };
        }
    });

    ganggaaa.ev.on('messages.upsert', async chatUpdate => {
        try {
            let mek = chatUpdate.messages[0];
            if (!mek.message || (mek.key && mek.key.remoteJid === 'status@broadcast') || (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16)) return;
            
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;

            const m = smsg(ganggaaa, mek, contacts);
            const pushname = m.pushName || 'Unknown';
            const budy = (typeof m.text === 'string' ? m.text : '');

            if (m.isGroup) {
                const groupMetadata = await ganggaaa.groupMetadata(m.chat);
                const groupName = groupMetadata.subject || 'Unknown Group';
                logger.logGroup(pushname, budy || m.mtype, groupName);
            } else {
                logger.logPrivate(pushname, budy || m.mtype);
            }
            
            if (!m.isGroup) {
                const stickerKeywords = { 'hai': 'https://api.waifu.pics/sfw/wave', 'pagi': 'https://api.waifu.pics/sfw/shinobu', 'malam': 'https://api.waifu.pics/sfw/neko', 'wibu': 'https://api.waifu.pics/sfw/awoo' };
                if (stickerKeywords[budy.toLowerCase()]) {
                    try {
                        await sleep(Math.floor(Math.random() * 2000) + 1000);
                        await ganggaaa.sendPresenceUpdate('composing', m.chat);
                        let response = await fetch(stickerKeywords[budy.toLowerCase()]);
                        let data = await response.json();
                        await ganggaaa.sendMessage(m.chat, { sticker: { url: data.url } });
                    } catch (err) {
                        logger.error('Gagal mengirim stiker otomatis:', err);
                    }
                }
            }
            
            // Logika command Anda akan ditangani di sini
            require("./case")(ganggaaa, m, chatUpdate, contacts);

        } catch (err) {
            console.log(err);
        }
    });

    ganggaaa.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            logger.info('QR Code diterima, silakan scan dengan ponsel Anda.');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason === DisconnectReason.loggedOut) {
                logger.error(`Perangkat Keluar. Harap hapus folder "${sessionName}" dan scan ulang.`);
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
            logger.info(`User ID Terhubung: ${ganggaaa.user.id.split(':')[0]}`);
        }
    });

    ganggaaa.ev.on('creds.update', saveCreds);
    
    // --- Helper Functions ---
    ganggaaa.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    };
    
    ganggaaa.sendText = (jid, text, quoted = '', options) => ganggaaa.sendMessage(jid, { text: text, ...options }, { quoted });

    return ganggaaa;
}


// --- Fungsi smsg (tidak diubah) ---
function smsg(ganggaaa, m, contacts) {
    if (!m) return m
    let M = proto.WebMessageInfo
    if (m.key) {
        m.id = m.key.id
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = ganggaaa.decodeJid(m.fromMe && ganggaaa.user.id || m.participant || m.key.participant || m.chat || '')
        if (m.isGroup) m.participant = ganggaaa.decodeJid(m.key.participant) || ''
        m.pushName = m.fromMe ? (ganggaaa.user.name || 'Owner') : (contacts[m.sender]?.name || contacts[m.sender]?.notify || m.sender.split('@')[0])
    }
    if (m.message) {
        m.mtype = getContentType(m.message)
        m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype])
        m.body = m.message.conversation || m.msg.caption || m.msg.text || (m.mtype == 'listResponseMessage') && m.msg.singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.msg.selectedButtonId || (m.mtype == 'viewOnceMessage') && m.msg.caption || m.text
        let quoted = m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null
        if (m.quoted) {
            let type = getContentType(quoted)
            m.quoted = m.quoted[type]
            if (typeof m.quoted === 'string') m.quoted = { text: m.quoted }
            m.quoted.sender = ganggaaa.decodeJid(m.msg.contextInfo.participant)
        }
    }
    m.text = m.msg?.text || m.msg?.caption || m.message?.conversation || ''
    return m
}

// --- Eksekusi Utama ---
logger.startupBanner();
startAlyaBot();
