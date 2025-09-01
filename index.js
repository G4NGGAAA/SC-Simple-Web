/*
/*
    Base by https://github.com/G4NGGAAA
    Credits: G4NGGAAA
    MODIFIED: Disederhanakan, digabungkan dengan logger, dan ditambahkan fitur anti-spam.
    UPDATE: Ditambahkan pencegahan pesan duplikat & tindakan anti-deteksi spam.
*/

// ================= KONFIGURASI BOT =================
// Ganti dengan nomor WhatsApp Bot Anda (wajib diawali 62)
const BOT_NUMBER = '628xxxxxxxxxx'; 
// Nama Bot yang akan muncul di Perangkat Tertaut
const BOT_NAME = 'Alya-Bot';
// Kode Pairing Kustom Anda (4-8 karakter, hanya huruf & angka)
const CUSTOM_PAIRING_CODE = 'ALYABOT123'; 
// Konfigurasi delay untuk menghindari spam (dalam milidetik)
const MIN_DELAY_MS = 500;  // Jeda minimal sebelum membalas (0.5 detik)
const MAX_DELAY_MS = 1500; // Jeda maksimal sebelum membalas (1.5 detik)
// ====================================================

import { Boom } from '@hapi/boom';
import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    getContentType
} from '@whiskeysockets/baileys';
import fs from 'fs';
import pino from 'pino';
import path from 'path';
import chalk from 'chalk';

const sessionName = "session_alya";
// Cache untuk menyimpan ID pesan yang sudah diproses
const processedMessages = new Set();

// ================= LOGGER KUSTOM DENGAN CHALK =================
const getTimestamp = () => new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

const info = (message, ...args) => console.log(chalk.cyan.bold(`[i INFO]`), chalk.cyan(`[${getTimestamp()}]`), chalk.cyan(message), ...args);
const success = (message, ...args) => console.log(chalk.green.bold(`[✓ SUCCESS]`), chalk.green(`[${getTimestamp()}]`), chalk.green(message), ...args);
const error = (message, ...args) => console.log(chalk.red.bold(`[✗ ERROR]`), chalk.red(`[${getTimestamp()}]`), chalk.red(message), ...args);
const warn = (message, ...args) => console.log(chalk.yellow.bold(`[⚠ WARN]`), chalk.yellow(`[${getTimestamp()}]`), chalk.yellow(message), ...args);

const logPrivate = (sender, message) => {
    console.log(`
${chalk.magenta('┌───[ PRIVATE MSG ]')}
${chalk.magenta('│')} ${chalk.white('Time:')}    ${chalk.green(getTimestamp())}
${chalk.magenta('│')} ${chalk.white('Sender:')}  ${chalk.cyan(sender)}
${chalk.magenta('│')} ${chalk.white('Message:')} ${chalk.blue(message)}
${chalk.magenta('└───')}`);
};

const logGroup = (sender, message, groupName) => {
    console.log(`
${chalk.yellow('┌───[ GROUP MSG ]')}
${chalk.yellow('│')} ${chalk.white('Time:')}    ${chalk.green(getTimestamp())}
${chalk.yellow('│')} ${chalk.white('Group:')}   ${chalk.magenta(groupName)}
${chalk.yellow('│')} ${chalk.white('Sender:')}  ${chalk.cyan(sender)}
${chalk.yellow('│')} ${chalk.white('Message:')} ${chalk.blue(message)}
${chalk.yellow('└───')}`);
};

const startupBanner = () => {
    const banner = `
${chalk.blue.bold(' █████╗░░█████╗░███╗░░██╗ █████╗░ █████╗░░█████╗░')}
${chalk.blue.bold('██╔═══╝░██╔══██╗████╗░██║██╔═══╝░██╔═══╝░██╔══██╗')}
${chalk.blue.bold('██║ ███╗███████║██╔██╗██║██║ ███╗██║ ███╗███████║')}
${chalk.blue.bold('██║ ╚═████╔═══████║╚████║██║ ╚═████║ ╚═████╔═══██')}
${chalk.blue.bold('╚█████╔╝██║░░░████║░╚███║╚█████╔╝╚█████╔╝██║░░░██')}
${chalk.blue.bold('░╚════╝░╚═╝░░░╚═╚═╝░░╚══╝░╚════╝░░╚════╝░╚═╝░░░╚═\')}

${chalk.green.bold('     Welcome to AlyaBot - Created with <3 by G4NGGAAA')}
${chalk.cyan('--------------------------------------------------------------')}
    `;
    console.log(banner);
    info('Initializing modules...');
    success('API Baileys Loaded');
    success('File System Ready');
    console.log(chalk.cyan('--------------------------------------------------------------'));
};
// ============================================================

// [BARU] Fungsi untuk mensimulasikan delay dan status mengetik
async function humanizeDelay(sock, jid) {
    try {
        await sock.sendPresenceUpdate('composing', jid); // Kirim status "mengetik..."
        const delay = Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS;
        await new Promise(resolve => setTimeout(resolve, delay));
        await sock.sendPresenceUpdate('paused', jid); // Hentikan status "mengetik..." (opsional)
    } catch (e) {
        warn('Gagal mengirim presence update:', e);
    }
}


// Fungsi utama untuk menjalankan bot
async function startAlyaBot() {
    if (!BOT_NUMBER || BOT_NUMBER === '628xxxxxxxxxx') {
        error("Harap atur BOT_NUMBER di dalam file index.js!");
        process.exit(1);
    }
    
    info(`Memuat sesi: ${sessionName}...`);
    const { state, saveCreds } = await useMultiFileAuthState(sessionName);

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        browser: [BOT_NAME, "Chrome", "12.0.0"],
    });

    if (!sock.authState.creds.registered) {
        warn(`Sesi tidak ditemukan, meminta pairing code...`);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            info(`Meminta kode untuk nomor: ${BOT_NUMBER}`);
            info(`Menggunakan kode kustom: ${CUSTOM_PAIRING_CODE}`);
            const code = await sock.requestPairingCode(BOT_NUMBER, CUSTOM_PAIRING_CODE);
            console.log(chalk.cyan('------------------------------------------------'));
            console.log(`${chalk.green.bold('✅ KODE PAIRING ANDA:')} ${chalk.white.bold(code)}`);
            console.log(chalk.cyan('------------------------------------------------'));
            console.log(chalk.yellow('Buka WhatsApp di HP > Perangkat Tertaut > Tautkan dengan nomor telepon > Masukkan kode di atas.'));
        } catch (e) {
            error('Gagal meminta pairing code:', e);
            if (fs.existsSync(sessionName)) {
                fs.rmSync(sessionName, { recursive: true, force: true });
            }
            process.exit(1);
        }
    }

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason === DisconnectReason.loggedOut) {
                error(`Perangkat Keluar. Hapus folder "${sessionName}" dan jalankan ulang.`);
                if (fs.existsSync(sessionName)) {
                    fs.rmSync(sessionName, { recursive: true, force: true });
                }
                process.exit(1);
            } else {
                warn(`Koneksi terputus, mencoba menyambung kembali...`);
                startAlyaBot();
            }
        } else if (connection === 'open') {
            success(`Berhasil terhubung ke WhatsApp! Bot "${BOT_NAME}" sekarang online.`);
            sock.sendPresenceUpdate('available'); 
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            const messageId = mek.key.id;

            if (processedMessages.has(messageId)) {
                warn(`Pesan duplikat terdeteksi dan diabaikan: ${messageId}`);
                return;
            }
            processedMessages.add(messageId);
            setTimeout(() => {
                processedMessages.delete(messageId);
            }, 10000);

            if (!mek.message || mek.key.remoteJid === 'status@broadcast') return;

            const from = mek.key.remoteJid;
            const isGroup = from.endsWith('@g.us');
            const sender = isGroup ? mek.key.participant : from;
            const pushname = mek.pushName || 'Tanpa Nama';
            const body = mek.message.conversation || mek.message.extendedTextMessage?.text || '';

            if (isGroup) {
                const groupMetadata = await sock.groupMetadata(from);
                logGroup(pushname, body, groupMetadata.subject);
            } else {
                logPrivate(pushname, body);
            }

            if (body.toLowerCase() === 'halo' || body.toLowerCase() === 'ping') {
                await humanizeDelay(sock, from); 
                await sock.sendMessage(from, { text: 'Halo! Bot Alya aktif.' }, { quoted: mek });
            }

        } catch (err) {
            error("Terjadi error di 'messages.upsert':", err);
        }
    });
}

startupBanner();
startAlyaBot().catch(err => error("Gagal memulai bot:", err));
