/*
    Base by https://github.com/G4NGGAAA
    Credits: G4NGGAAA
    MODIFIED: Multi-Account, Panel Commands, Enhanced UI, Logger Module, Anti-spam, Auto-Sticker Reply, QR & Pairing.
    BOLEH AMBIL/RENAME
    ASAL JANGAN HAPUS CREDIT YAA 🎩🎩
*/

const { default: makeWASocket, DisconnectReason, jidDecode, proto, getContentType, useMultiFileAuthState, downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');
const readline = require("readline");
const PhoneNumber = require('awesome-phonenumber');
const chalk = require('chalk');
const fetch = require('node-fetch');
const qrcode = require('qrcode-terminal');
const logger = require('./logger'); // <-- Import our new logger

// --- Global State Management for Multiple Bots ---
const botInstances = {};
let sessionCounter = 1;

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

//~~~~~Main Bot Connection Function~~~~~//
async function startBot(sessionName, isFirstBot = false) {
    logger.info(`Starting bot for session: ${sessionName}...`);
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
        printQRInTerminal: false, // We will handle QR display manually
        auth: state,
        browser: selectedBrowser,
        getMessage: async (key) => { return { conversation: 'hi' } } // Required for some functionalities
    };

    ganggaaa = makeWASocket(connectOptions);
    botInstances[sessionName] = ganggaaa; // Store instance

    // --- Login Logic: QR/Pairing for first bot, Pairing only for others ---
    if (!ganggaaa.authState.creds.registered) {
        let choice = '1'; // Default to QR for the first bot
        if (isFirstBot) {
            choice = await question(
                chalk.yellow.bold('\nHow do you want to connect the main bot?\n') +
                chalk.cyan('1: ') + chalk.white('Scan QR Code\n') +
                chalk.cyan('2: ') + chalk.white('Use Pairing Code\n\n') +
                chalk.magenta('Enter your choice (1 or 2): ')
            );
        } else {
            logger.info(`Adding a new user. Please use Pairing Code.`);
            choice = '2';
        }

        if (choice.trim() === '2') {
            const phoneNumber = await question(chalk.yellow.bold('\nPlease enter the bot\'s phone number (e.g., 6281234567890):\n'));
            try {
                logger.info('Requesting pairing code...');
                let code = await ganggaaa.requestPairingCode(phoneNumber.trim());
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                logger.success('Your Pairing Code: ' + chalk.white.bgBlack.bold(` ${code} `));
                logger.info('Please enter this code on WhatsApp on your main device.');
            } catch (e) {
                logger.error('Failed to request pairing code. Please restart and try again.', e);
                delete botInstances[sessionName]; // Clean up failed instance
                return;
            }
        }
        // QR code will be handled by the 'connection.update' event
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

            // Log messages using the new logger
            if (m.isGroup) {
                const groupMetadata = await ganggaaa.groupMetadata(m.chat);
                const groupName = groupMetadata.subject || 'Unknown Group';
                logger.logGroup(pushname, budy || m.mtype, groupName);
            } else {
                logger.logPrivate(pushname, budy || m.mtype);
            }
            
            // --- Auto Sticker Reply Feature (with anti-spam delay) ---
            if (!m.isGroup) {
                const stickerKeywords = {
                    'hai': 'https://api.waifu.pics/sfw/wave',
                    'pagi': 'https://api.waifu.pics/sfw/shinobu',
                    'malam': 'https://api.waifu.pics/sfw/neko',
                    'wibu': 'https://api.waifu.pics/sfw/awoo'
                };
                if (stickerKeywords[budy.toLowerCase()]) {
                    try {
                        await sleep(Math.floor(Math.random() * 2000) + 1000); // Random delay
                        await ganggaaa.sendPresenceUpdate('composing', m.chat);
                        let response = await fetch(stickerKeywords[budy.toLowerCase()]);
                        let data = await response.json();
                        await ganggaaa.sendMessage(m.chat, { sticker: { url: data.url } });
                    } catch (err) {
                        logger.error('Failed to send auto sticker:', err);
                    }
                }
            }
            
            require("./case")(ganggaaa, m, chatUpdate, contacts);
        } catch (err) {
            console.log(err);
        }
    });

    ganggaaa.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    };
    
    // Other helper functions...
    ganggaaa.public = true;
    ganggaaa.serializeM = (m) => smsg(ganggaaa, m, contacts);

    ganggaaa.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            logger.info('QR Code received, please scan with your phone.');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason === DisconnectReason.loggedOut) {
                logger.error(`Device Logged Out from session ${sessionName}. Please clear the session and scan again.`);
                fs.rmSync(path.join(__dirname, sessionName), { recursive: true, force: true });
                delete botInstances[sessionName];
            } else if ([DisconnectReason.badSession, DisconnectReason.connectionClosed, DisconnectReason.connectionLost, DisconnectReason.connectionReplaced, DisconnectReason.restartRequired, DisconnectReason.timedOut].includes(reason)) {
                logger.warn(`Connection issue for ${sessionName}, attempting to reconnect...`);
                startBot(sessionName, false);
            } else {
                logger.error(`Unknown DisconnectReason for ${sessionName}: ${reason}|${connection}`);
                startBot(sessionName, false);
            }
        } else if (connection === 'open') {
            logger.success(`Successfully connected to WhatsApp! Bot for session ${sessionName} is now online.`);
            logger.info(`Connected User ID: ${ganggaaa.user.id.split(':')[0]}`);
        }
    });

    ganggaaa.ev.on('creds.update', saveCreds);

    // Add other necessary methods to ganggaaa instance
    ganggaaa.sendText = (jid, text, quoted = '', options) => ganggaaa.sendMessage(jid, { text: text, ...options }, { quoted });
    ganggaaa.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || '';
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(message, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    };
    
    return ganggaaa;
}

// --- Terminal Command Handler ---
function setupTerminalCommands() {
    logger.info("Terminal command handler is active. Type /help for commands.");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('line', async (input) => {
        const command = input.trim().toLowerCase();
        const args = command.split(' ');
        const cmd = args[0];

        switch (cmd) {
            case '/adduser':
                const newSessionName = `session_${++sessionCounter}`;
                logger.info(`Initiating process to add a new user with session name: ${newSessionName}`);
                await startBot(newSessionName, false);
                break;

            case '/clearsession':
                const sessionToClear = args[1];
                if (!sessionToClear) {
                    logger.warn("Usage: /clearsession <session_name> (e.g., /clearsession session_main)");
                    return;
                }
                try {
                    if (botInstances[sessionToClear]) {
                        await botInstances[sessionToClear].logout();
                         logger.info(`Logged out from ${sessionToClear}.`);
                    }
                    if (fs.existsSync(sessionToClear)) {
                        fs.rmSync(sessionToClear, { recursive: true, force: true });
                        logger.success(`Successfully cleared session: ${sessionToClear}`);
                    } else {
                        logger.warn(`Session folder not found: ${sessionToClear}`);
                    }
                    delete botInstances[sessionToClear];
                } catch (e) {
                    logger.error(`Failed to clear session ${sessionToClear}:`, e);
                }
                break;
            
            case '/list':
                 logger.info("Currently active bot sessions:");
                 const activeSessions = Object.keys(botInstances);
                 if(activeSessions.length > 0) {
                    activeSessions.forEach(session => {
                        const bot = botInstances[session];
                        const user = bot.user ? bot.user.id.split(':')[0] : 'Connecting...';
                        console.log(chalk.cyan(`  - ${session}: `) + chalk.white(`(${user})`));
                    });
                 } else {
                    logger.warn("No active sessions found.");
                 }
                break;

            case '/help':
                 console.log(chalk.yellow.bold('\n--- AlyaBot Panel Commands ---'));
                 console.log(chalk.cyan('/adduser') + chalk.white(' - Add a new bot instance via pairing code.'));
                 console.log(chalk.cyan('/clearsession <session_name>') + chalk.white(' - Deletes a specific session folder.'));
                 console.log(chalk.cyan('/list') + chalk.white(' - Shows all active bot sessions.'));
                 console.log(chalk.cyan('/exit') + chalk.white(' - Shuts down the bot script.\n'));
                break;

            case '/exit':
                logger.warn("Shutting down all bot instances...");
                process.exit(0);
                break;

            default:
                if (command.startsWith('/')) {
                   logger.warn("Unknown command. Type /help to see available commands.");
                }
                break;
        }
    });
}


// --- smsg function (unchanged from original but placed here) ---
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


// --- Main Execution ---
function main() {
    logger.startupBanner();
    setupTerminalCommands();
    startBot('session_main', true); // Start the first bot
}

main();

// File watcher (optional but good for development)
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    logger.warn(`Update detected in ${__filename}, restarting...`);
    delete require.cache[file];
    require(file);
});
