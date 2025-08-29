/*
    Base by https://github.com/G4NGGAAA
    Credits: G4NGGAAA
    MODIFIED: Anti-spam measures, new UI, Auto-Sticker Reply, QR & Pairing, qr-terminal support for Termux.
    BOLEH AMBIL/RENAME
    ASAL JANGAN HAPUS CREDIT YAA 🎩🎩
*/

const { default: makeWASocket, DisconnectReason, jidDecode, proto, getContentType, useMultiFileAuthState, downloadContentFromMessage } = require("@whiskeysockets/baileys");
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const readline = require("readline");
const PhoneNumber = require('awesome-phonenumber');
const chalk = require('chalk');
const fetch = require('node-fetch');
const qrcode = require('qrcode-terminal'); // <-- Added for better QR code display in terminal

// Helper function to ask questions in the terminal
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

// Helper function for creating delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

//~~~~~Main Connection Function~~~~~//
async function Startganggaaa() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    let ganggaaa;

    // --- NEW: Randomized browser identity to avoid spam detection ---
    const browsers = [
        ["Ubuntu", "Chrome", "20.0.04"],
        ["Windows", "Chrome", "108.0.0.0"],
        ["Mac OS", "Safari", "15.3"],
        ["Windows", "Firefox", "107.0"],
        ["Mac OS", "Chrome", "108.0.0.0"]
    ];
    const selectedBrowser = browsers[Math.floor(Math.random() * browsers.length)];

    // --- Tampilan startup yang lebih menarik ---
    console.log(chalk.green.bold(`
    --------------------------------------
    ☘️ Selamat datang di AlyaBot 
      terimakasih telah menggunakan script ini 👍
    --------------------------------------
    `));

    console.log(chalk.yellow.bold("📁      Inisialisasi modul..."));
    console.log(chalk.cyan.bold("- API Baileys Telah Dimuat"));
    console.log(chalk.cyan.bold("- Sistem File Siap Digunakan"));
    console.log(chalk.cyan.bold("- Database Telah Diinisialisasi"));

    console.log(chalk.blue.bold("\n🤖 Info Bot:"));
    console.log(chalk.white.bold("   | GitHub: ") + chalk.cyan.bold("https://github.com/G4NGGAAA"));
    console.log(chalk.white.bold("   | Developer: ") + chalk.green.bold("G4NGGAAA"));
    console.log(chalk.white.bold("   | Status Server: ") + chalk.green.bold("Online"));
    console.log(chalk.white.bold("   | Versi Node.js: ") + chalk.magenta.bold(process.version));
    console.log(chalk.white.bold("   | Browser ID: ") + chalk.yellow.bold(selectedBrowser.join(' '))); // Display selected browser
    console.log(chalk.yellow.bold("\n✨ Fitur Unggulan Aktif:"));
    console.log(chalk.white.bold("   | Auto-Sticker Reply (Delayed)"));


    // --- Check for existing session ---
    if (!fs.existsSync('./session/creds.json')) {
        const choice = await question(
            chalk.yellow.bold('\nBagaimana Anda ingin terhubung?\n') +
            chalk.cyan('1: ') + chalk.white('Pindai Kode QR\n') +
            chalk.cyan('2: ') + chalk.white('Gunakan Kode Pemasangan\n\n') +
            chalk.magenta('Masukkan pilihan Anda (1 atau 2): ')
        );

        if (choice.trim() === '2') {
            ganggaaa = makeWASocket({ logger: pino({ level: "silent" }), printQRInTerminal: false, auth: state, browser: selectedBrowser });
            const phoneNumber = await question(chalk.yellow.bold('\nSilakan masukkan nomor telepon bot Anda (contoh: 6281234567890):\n'));
            console.log(chalk.blue('Meminta kode pemasangan...'));
            try {
                let code = await ganggaaa.requestPairingCode(phoneNumber.trim());
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(chalk.green.bold('Kode Pemasangan Anda: '), chalk.white.bgBlack.bold(` ${code} `));
                console.log(chalk.yellow('Silakan masukkan kode ini di WhatsApp pada perangkat utama Anda.'));
            } catch (e) {
                console.error(chalk.red('Gagal meminta kode pemasangan. Silakan mulai ulang dan coba lagi.'), e);
                process.exit(1);
            }
        } else {
            // Using QR code, but will be handled by the 'connection.update' event
            ganggaaa = makeWASocket({ logger: pino({ level: "silent" }), printQRInTerminal: false, auth: state, browser: selectedBrowser });
        }
    } else {
        console.log(chalk.green.bold('\nMenemukan sesi yang ada. Menghubungkan secara otomatis...'));
        ganggaaa = makeWASocket({ logger: pino({ level: "silent" }), printQRInTerminal: false, auth: state, browser: selectedBrowser });
    }

    const contacts = {};

    ganggaaa.ev.on('contacts.update', updates => {
        for (const update of updates) {
            contacts[update.id] = {...contacts[update.id], ...update };
        }
    });

    ganggaaa.ev.on('messages.upsert', async chatUpdate => {
        try {
            let mek = chatUpdate.messages[0]
            if (!mek.message) return
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
            if (mek.key && mek.key.remoteJid === 'status@broadcast') return
            if (!ganggaaa.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return

            const m = smsg(ganggaaa, mek, contacts)
            const pushname = m.pushName || 'Unknown'
            const budy = (typeof m.text === 'string' ? m.text : '')
            const command = budy.toLowerCase().split(' ')[0] || ''

            // --- Fitur Balasan Stiker Otomatis (dengan delay anti-spam) ---
            if (!m.isGroup) {
                const stickerKeywords = {
                    'hai': 'https://api.waifu.pics/sfw/wave',
                    'pagi': 'https://api.waifu.pics/sfw/shinobu',
                    'malam': 'https://api.waifu.pics/sfw/neko',
                    'wibu': 'https://api.waifu.pics/sfw/awoo'
                };
                if (stickerKeywords[budy.toLowerCase()]) {
                    try {
                        // Random delay between 1 to 3 seconds
                        await sleep(Math.floor(Math.random() * 2000) + 1000);

                        await ganggaaa.sendPresenceUpdate('composing', m.chat); // Show 'typing...'

                        let response = await fetch(stickerKeywords[budy.toLowerCase()]);
                        let data = await response.json();
                        await ganggaaa.sendMessage(m.chat, { sticker: { url: data.url } });
                        console.log(chalk.bgGreen.white(`[AUTO STICKER]`), `Replied to "${budy}" with a sticker for ${pushname}.`);
                    } catch (err) {
                        console.log(chalk.red('Gagal mengirim stiker otomatis:'), err);
                    }
                }
            }


            if (m.message && m.isGroup) {
                try {
                    const groupMetadata = await ganggaaa.groupMetadata(m.chat);
                    const groupName = groupMetadata.subject || 'Unknown Group';
                    console.log(`
┌────────── [ GROUP CHAT LOG ] ──────────┐
│ 🕒 Waktu      : ${chalk.green(new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }))}
│ 📝 Pesan      : ${chalk.blue(budy || m.mtype)}
│ 👤 Pengirim    : ${chalk.magenta(pushname)} (${chalk.cyan(m.sender)})
│ 🏠 Grup        : ${chalk.yellow(groupName)} (${chalk.cyan(m.chat)})
└────────────────────────────────────────┘`);
                } catch (err) { console.log('Error fetching group metadata:', err); }
            } else if (m.message && !m.isGroup) {
                console.log(`
┌───────── [ PRIVATE CHAT LOG ] ─────────┐
│ 🕒 Waktu      : ${chalk.green(new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }))}
│ 📝 Pesan      : ${chalk.blue(budy || m.mtype)}
│ 👤 Pengirim    : ${chalk.magenta(pushname)} (${chalk.cyan(m.sender)})
└────────────────────────────────────────┘`);
            }

            // Pass the processed message to the command handler
            require("./case")(ganggaaa, m, chatUpdate, contacts)
        } catch (err) {
            console.log(err)
        }
    })

    ganggaaa.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }

    ganggaaa.getName = async(jid, withoutContact = false) => {
        let id = ganggaaa.decodeJid(jid)
        withoutContact = ganggaaa.withoutContact || withoutContact
        let v
        if (id.endsWith("@g.us")) {
            try {
                v = await ganggaaa.groupMetadata(id) || {};
                return v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international');
            } catch (err) {
                return PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international');
            }
        } else {
            v = id === '0@s.whatsapp.net' ? { id, name: 'WhatsApp' } : id === ganggaaa.decodeJid(ganggaaa.user.id) ?
                ganggaaa.user : (contacts[id] || {});
            return (withoutContact ? '' : v.name) || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international');
        }
    }

    ganggaaa.public = true // Set to true to respond to everyone
    ganggaaa.serializeM = (m) => smsg(ganggaaa, m, contacts);

    ganggaaa.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        // --- NEW: Handle QR code with qr-terminal ---
        if (qr) {
            console.log(chalk.yellow.bold('\nPindai kode QR di bawah ini dengan aplikasi WhatsApp Anda.\n'));
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if ([DisconnectReason.badSession, DisconnectReason.connectionClosed, DisconnectReason.connectionLost, DisconnectReason.connectionReplaced, DisconnectReason.restartRequired, DisconnectReason.timedOut].includes(reason)) {
                console.log(chalk.yellow('Koneksi bermasalah, mencoba menyambung kembali...'));
                Startganggaaa();
            } else if (reason === DisconnectReason.loggedOut) {
                console.log(chalk.red('Perangkat Keluar, harap hapus folder "session" dan mulai ulang.'));
                process.exit();
            } else {
                console.error(`Unknown DisconnectReason: ${reason}|${connection}`);
                Startganggaaa(); // Attempt to reconnect on unknown errors as well
            }
        } else if (connection === 'open') {
            console.log(chalk.green.bold('\n[Terhubung] Berhasil terhubung ke WhatsApp! Bot sekarang online.'));
            console.log(chalk.cyan.italic('ID Pengguna Terhubung: ' + JSON.stringify(ganggaaa.user.id, null, 2)));
        }
    });

    ganggaaa.ev.on('creds.update', saveCreds)
    ganggaaa.sendText = (jid, text, quoted = '', options) => ganggaaa.sendMessage(jid, { text: text, ...options }, { quoted })

    ganggaaa.downloadMediaMessage = async(message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        return buffer
    }

    return ganggaaa
}

Startganggaaa()

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
    }
    if (m.message) {
        m.mtype = getContentType(m.message)
        m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype])
        m.body = m.message.conversation || m.msg.caption || m.msg.text || (m.mtype == 'listResponseMessage') && m.msg.singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.msg.selectedButtonId || (m.mtype == 'viewOnceMessage') && m.msg.caption || m.text
        let quoted = m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null
        m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
        if (m.quoted) {
            let type = getContentType(quoted)
            m.quoted = m.quoted[type]
            if (['productMessage'].includes(type)) {
                type = getContentType(m.quoted)
                m.quoted = m.quoted[type]
            }
            if (typeof m.quoted === 'string') m.quoted = { text: m.quoted }
            m.quoted.mtype = type
            m.quoted.id = m.msg.contextInfo.stanzaId
            m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
            m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false
            m.quoted.sender = ganggaaa.decodeJid(m.msg.contextInfo.participant)
            m.quoted.fromMe = m.quoted.sender === ganggaaa.decodeJid(ganggaaa.user.id)
            m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
            m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
            m.getQuotedObj = m.getQuotedMessage = async() => { if (!m.quoted.id) return false; return m.quoted; }
            let vM = m.quoted.fakeObj = M.fromObject({ key: { remoteJid: m.quoted.chat, fromMe: m.quoted.fromMe, id: m.quoted.id }, message: quoted, ...(m.isGroup ? { participant: m.quoted.sender } : {}) })
            m.quoted.delete = () => ganggaaa.sendMessage(m.quoted.chat, { delete: vM.key })
            m.quoted.copyNForward = (jid, forceForward = false, options = {}) => ganggaaa.copyNForward(jid, vM, forceForward, options)
            m.quoted.download = () => ganggaaa.downloadMediaMessage(m.quoted)
        }
    }
    if (m.msg && m.msg.url) m.download = () => ganggaaa.downloadMediaMessage(m.msg)
    m.text = m.msg.text || m.msg.caption || m.message.conversation || m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || ''
    m.reply = (text, chatId = m.chat, options = {}) => Buffer.isBuffer(text) ? ganggaaa.sendMedia(chatId, text, 'file', '', m, { ...options }) : ganggaaa.sendText(chatId, text, m, { ...options })
    m.copy = () => smsg(ganggaaa, M.fromObject(M.toObject(m)))
    m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => ganggaaa.copyNForward(jid, m, forceForward, options)

    return m
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.yellow(`Update detected in ${__filename}`))
    delete require.cache[file]
    require(file)
})