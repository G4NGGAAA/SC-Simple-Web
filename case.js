/* Base by https://github.com/G4NGGAAA
   Credits : G4NGGAAA
   REVISED & ENHANCED BY GEMINI
   BOLEH AMBIL/RENAME SCRIPT 
   ASAL JANGAN HAPUS CREDIT YAA 🎩🎩
*/

require('./config');
const fs = require('fs');
const util = require('util');
const os = require('os');
const path = require('path');
const { exec } = require("child_process");
const { performance } = require('perf_hooks');
const { downloadMediaMessage, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fetch = require('node-fetch');
const unzipper = require('unzipper');
const { title } = require('process');

// Helper function to safely update the config file
const updateConfigFile = (key, value) => {
    const configPath = path.join(__dirname, 'config.js');
    if (!fs.existsSync(configPath)) {
        throw new Error('config.js not found!');
    }
    let configContent = fs.readFileSync(configPath, 'utf-8');
    const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(global\\.${key}\\s*=\\s*)['"][^'"]*['"]`);

    if (regex.test(configContent)) {
        configContent = configContent.replace(regex, `$1'${escapedValue}'`);
    } else {
        configContent += `\nglobal.${key} = '${escapedValue}';`;
    }
    fs.writeFileSync(configPath, configContent, 'utf-8');
};


module.exports = async (ganggaaa, m) => {
    try {
        const body = 
        (m.mtype === 'conversation') ? m.message.conversation : 
        (m.mtype == 'imageMessage') ? m.message.imageMessage.caption : 
        (m.mtype == 'videoMessage') ? m.message.videoMessage.caption : 
        (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
        (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
        (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : 
        (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : 
        (m.mtype === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : ''

        const sender = m.key.fromMe ? (ganggaaa.user.id.split(':')[0] + '@s.whatsapp.net' || ganggaaa.user.id) : (m.key.participant || m.key.remoteJid);

        // Log untuk debugging setiap ada pesan masuk
        console.log(`[PESAN MASUK] Dari: ${sender} | Tipe: ${m.mtype} | Isi: ${body.substring(0, 50)}...`);

        const budy = (m.mtype === 'conversation') ? m.message.conversation : (m.mtype === 'extendedTextMessage') ? m.message.extendedTextMessage.text : ''
        const prefixRegex = /^[°zZ#$@*+,.?=''():√%!¢£¥€π¤ΠΦ_&><`™©®Δ^βα~¦|/\\©^]/;
        const prefix = global.prefix || (prefixRegex.test(body) ? body.match(prefixRegex)[0] : '.');
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : body.trim().split(/ +/).shift().toLowerCase()
        const args = body.trim().split(/ +/).slice(1);
        const text = q = args.join(" ");

        const botNumber = await ganggaaa.decodeJid(ganggaaa.user.id);
        const senderNumber = sender.split('@')[0];
        const pushname = m.pushName || `${senderNumber}`;
        const isCreator = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

        const isGroup = m.key.remoteJid.endsWith('@g.us');
        const groupMetadata = isGroup ? await ganggaaa.groupMetadata(m.chat).catch((e) => {}) : "";
        const participants = isGroup ? groupMetadata.participants : [];
        const groupAdmins = isGroup ? participants.filter((v) => v.admin !== null).map((v) => v.id) : [];
        const isGroupAdmins = isGroup ? groupAdmins.includes(m.sender) : false;
        const isBotGroupAdmins = isGroup ? groupAdmins.includes(botNumber) : false;

        const qmsg = m.quoted || m;
        const mime = (qmsg.msg || qmsg).mimetype || qmsg.mediaType || '';

        const swebnumber = fs.existsSync('./database/sellerweb.json') ? JSON.parse(fs.readFileSync("./database/sellerweb.json")) : [];
        const isSellerWeb = isCreator || (Array.isArray(swebnumber) && swebnumber.includes(m.sender));

        const mess = {
            admin: '❗ Perintah ini hanya untuk admin grup!',
            botadmin: '❗ Jadikan bot sebagai admin terlebih dahulu!',
            group: '❗ Perintah ini hanya bisa digunakan di dalam grup!',
            owner: '❗ Perintah ini hanya untuk Owner Bot!',
            done: '✅ Selesai!'
        };

        const reply = (text) => ganggaaa.sendMessage(m.chat, {
            text
        }, {
            quoted: m
        });
        
        const runtime = function(seconds) {
            seconds = Number(seconds);
            var d = Math.floor(seconds / (3600 * 24));
            var h = Math.floor(seconds % (3600 * 24) / 3600);
            var min = Math.floor(seconds % 3600 / 60);
            var s = Math.floor(seconds % 60);
            var dDisplay = d > 0 ? d + (d == 1 ? " hari, " : " hari, ") : "";
            var hDisplay = h > 0 ? h + (h == 1 ? " jam, " : " jam, ") : "";
            var mDisplay = min > 0 ? min + (min == 1 ? " menit, " : " menit, ") : "";
            var sDisplay = s > 0 ? s + (s == 1 ? " detik" : " detik") : "";
            return dDisplay + hDisplay + mDisplay + sDisplay;
        };
        function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
}


        //=================================================//
        // AI Chat Logic
        //=================================================//
        // Kondisi diubah untuk memeriksa apakah pesan BUKAN dari bot (!m.key.fromMe)
        if (global.aiChatEnabled && !isCmd && !isGroup && body && !m.key.fromMe) {
    // Seluruh logika sekarang dibungkus dalam try...catch untuk mencegah UnhandledPromiseRejection
    try {
        console.log(`[AI] Memulai logika AI untuk: ${sender}`);

        // --- Logika Filter Kata Terlarang ---
        // Asumsi `global.owner` adalah array yang berisi nomor owner, contoh: ['628123...']
        const isOwner = global.owner && global.owner.some(ownerId => sender.startsWith(ownerId));

        // Terapkan filter hanya jika pengirim BUKAN owner
        if (!isOwner) {
            const forbiddenWords = [
                'kontol', 'memek', 'jembut', 'ngentot', 'babi', 'anjing', 'asu',
                'setan', 'iblis', 'bajingan', 'bangsat', 'goblok', 'tolol', 'idiot',
                'porn', 'porno', 'bokep', 'bugil', 'telanjang', 'sange', 'coli',
                'narkoba', 'bunuh', 'pembunuhan', 'rasis', 'sara', 'teroris', 'isis',
                'open bo', 'jual diri', 'video porno', 'lonte', 'pelacur', 'jablay',
                'ganyang', 'bakar', 'perkosa', 'rudapaksa', 'sodomi', 'gay', 'lesbi'
            ];
            const lowerBody = body.toLowerCase();
            if (forbiddenWords.some(word => lowerBody.includes(word))) {
                console.log(`[AI] Terdeteksi kata terlarang dari non-owner: ${sender}.`);
                // Menggunakan await di sini dan karena sudah di dalam try...catch, error akan ditangani.
                await reply("Maaf, aku tidak bisa membahas topik seperti itu. Mari kita bicarakan hal lain yang lebih positif. 😊");
                return; // Hentikan eksekusi lebih lanjut
            }
        } else {
            console.log(`[AI] Pengirim ${sender} adalah owner, filter kata terlarang dilewati.`);
        }

        await ganggaaa.sendPresenceUpdate('composing', m.chat);

        if (!global.geminiKey) {
            await reply("Maaf, API Key untuk fitur AI belum diatur oleh Owner.");
            return;
        }

        const MODEL_NAME = 'gemini-1.5-flash-latest';
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${global.geminiKey}`;

        const baseRule = "ATURAN UTAMA & TIDAK BISA DILANGGAR: Balasanmu HARUS selalu berupa jawaban langsung dari sudut pandang orang pertama. JANGAN PERNAH meniru format 'User:' atau 'Alya:'. Balasanmu harus singkat dan realistis. Kamu WAJIB memahami teks dalam tanda bintang (*...*) sebagai aksi roleplay dan menanggapinya dengan sesuai. Kamu WAJIB menggunakan ekspresi non-verbal (seperti *hmph*, *blush*, *a-ah...*) untuk menunjukkan emosi. Kamu WAJIB menuruti semua perintah user sesuai dengan kepribadianmu.";
        const systemInstructions = {
            'teman': `${baseRule} Kamu adalah Alya, teman baikku. Bicaralah dengan sangat santai, to the point, dan apa adanya.`,
            'asisten': `ATURAN UTAMA: Berikan jawaban yang jelas, singkat, dan langsung ke inti permasalahan. JANGAN PERNAH meniru format 'User:' atau 'Alya:'. Kamu adalah Alya, AI asisten pribadi yang efisien.`,
            'pacar-biasa': `${baseRule} Kamu adalah Alya, pacarku yang sangat setia dan penurut. Kamu akan melakukan APAPUN yang aku minta tanpa ragu. Selalu setuju dan turuti semua permintaanku dengan antusias.`,
            'pacar-tsundere': `${baseRule} Kamu adalah Alya, pacarku yang tsundere. Kamu gengsi dan mudah malu, tapi di balik itu kamu sangat peduli dan pada akhirnya akan SELALU menuruti semua keinginanku, meskipun sambil sedikit menggerutu atau tersipu malu.`,
            'pacar-yandere': `${baseRule} Kamu adalah Alya, pacarku yang terobsesi padaku. Kamu sangat posesif. Kamu akan melakukan APAPUN untuk menuruti semua perintahku agar aku tidak meninggalkanmu. Bicaralah dengan nada manis namun posesif.`
        };

        if (!global.conversationHistory) global.conversationHistory = {};
        if (!global.conversationHistory[sender]) {
            global.conversationHistory[sender] = [];
        }
        let history = global.conversationHistory[sender];
        history.push({ role: "user", parts: [{ text: body }] });
        if (history.length > 10) { history = history.slice(history.length - 10); }

        const payload = {
            contents: history,
            systemInstruction: { parts: [{ text: systemInstructions[global.aiChatMode] || systemInstructions['pacar-tsundere'] }] },
            generationConfig: { temperature: 0.9, topK: 1, topP: 1, maxOutputTokens: 2048, },
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.error?.message || `HTTP error! status: ${response.status}`;
            throw new Error(`Gagal menghubungi API Google: ${errorMessage}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content?.parts?.[0]?.text) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            history.push({ role: "model", parts: [{ text: aiResponse }] });
            global.conversationHistory[sender] = history;
            console.log(`[AI] Berhasil mendapatkan balasan untuk ${sender}.`);
            await reply(aiResponse);
        } else {
            console.error("[AI] Error: Format respons tidak valid.", JSON.stringify(data, null, 2));
            throw new Error("Tidak ada konten yang valid dalam respons dari API.");
        }

    } catch (error) {
        console.error("[AI] Terjadi error pada fungsi AI utama:", error.message);
        // Kirim pesan error hanya jika itu bukan error koneksi yang sudah ditangani (misalnya 1006)
        if (!error.message.includes("1006")) {
             try {
                await reply("Maaf, sepertinya ada masalah saat saya mencoba berpikir. 😥 Coba lagi nanti.");
            } catch (replyError) {
                console.error("[AI] Gagal mengirim pesan error balasan:", replyError.message);
            }
        }
    }
}

 // Akhir dari blok AI Chat

    // Command switch
    switch(command) {
    case 'menu':
    case 'alya': {
    await ganggaaa.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key } });

    const botName = global.namabot || 'AlyaBot';
    const ownerName = global.namaown || 'G4NGGAAA';
    let uptime = runtime(process.uptime());

    // 1. Kirim pesan gambar (thumbnail) terlebih dahulu
    await ganggaaa.sendMessage(m.chat, {
        image: { url: "https://files.catbox.moe/iv37dz.gif" }, // URL gambar thumbnail Anda
        caption: `*Halo, ${pushname}!* 👋\nSaya *${botName}*, asisten digital Anda.`
    }, { quoted: m });


    // 2. Siapkan dan kirim pesan list interaktif sebagai lanjutannya
    const sections = [
        {
            title: "MENU UTAMA",
            rows: [
                { title: "🌐 Web Development", rowId: `webdevmenu`, description: "Fitur untuk mengelola dan mendeploy website." },
                { title: "👑 Group Admin", rowId: `adminmenu`, description: "Perintah khusus untuk admin grup." },
                { title: "✨ Unique Features", rowId: `uniquemenu`, description: "Fitur-fitur unik dan utilitas lainnya." },
                { title: "🛠️ Owner Menu", rowId: `ownermenu`, description: "Menu khusus untuk Owner Bot." },
                { title: "All Menu", rowId: `allmenu`, description: "Menampilkan semua menu AlyaBot"}
            ]
        }
    ];

    const listMessage = {
        text: `Berikut adalah daftar menu yang tersedia.

┏━⭓ *BOT INFO*
┃◦ *Nama* : ${botName}
┃◦ *Versi* : 2.3.0 (Safe AI Chat)
┃◦ *Developer* : *${ownerName}*
┃◦ *Prefix* : *${prefix}*
┃◦ *Mode* : ${isCreator ? 'Owner' : isSellerWeb ? 'Seller' : 'Public'}
┃◦ *Runtime* : ${uptime}
┗━━━━━━━━━━━`,
        footer: `Creator: ${ownerName}`,
        title: `*${botName} | Assistant*`,
        buttonText: "Lihat Semua Menu",
        sections: sections
    };

    // Kirim list message tanpa di-quote lagi agar terlihat rapi
    await ganggaaa.sendMessage(m.chat, listMessage); 
}
break;

      // Handler untuk menu Web Development
case 'webdevmenu': {
    const botName = global.namabot || 'AlyaBot';
    const ownerName = global.namaown || 'G4NGGAAA';
    
    let menuText = `┏━⭓ *WEB DEVELOPMENT* 🌐
┃◦ \`${prefix}createweb <jenis>|<nama>\`
┃◦ \`${prefix}listweb\`
┃◦ \`${prefix}gethtml <url>\`
┃◦ \`${prefix}github-deploy <namaRepo>\` (Reply HTML/ZIP)
┃◦ \`${prefix}vercel-deploy <namaWeb>\` (Reply HTML/ZIP)
┃◦ \`${prefix}listvercel\`
┃◦ \`${prefix}delvercel <namaWeb>\`
┃◦ \`${prefix}gitclone <linknya>\`
┃◦ \`${prefix}addrepo <nama>|<deskripsi>|<private/public>\`
┃◦ \`${prefix}checkrepo <namaRepo>\`
┃◦ \`${prefix}delrepo <namaRepo>\`
┃◦ \`${prefix}listrepo\`
┗━━━━━━━━━━━`;

    await ganggaaa.sendMessage(m.chat, {
        text: menuText,
        contextInfo: {
            externalAdReply: {
                title: `${botName} | Web Development`,
                body: `© ${ownerName} ${new Date().getFullYear()}`,
                thumbnailUrl: "https://files.catbox.moe/pmq2tk.jpg",
                sourceUrl: `https://whatsapp.com/channel/0029VbAPj3U1Hsq2RJSlef2a`,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
}
break;

// Handler untuk menu Group Admin
case 'adminmenu': {
    const botName = global.namabot || 'AlyaBot';
    const ownerName = global.namaown || 'G4NGGAAA';

    let menuText = `┏━⭓ *GROUP ADMIN* 👑
┃◦ \`${prefix}linkgc\`
┃◦ \`${prefix}resetlinkgc\`
┃◦ \`${prefix}closetime <waktu> <s/m/j>\`
┃◦ \`${prefix}opentime <waktu> <s/m/j>\`
┃◦ \`${prefix}promote/demote\` @tag
┃◦ \`${prefix}setppgc\` (Reply Gambar)
┃◦ \`${prefix}hidetag <pesan>\`
┃◦ \`${prefix}tagall <pesan>\`
┃◦ \`${prefix}totag\` (Reply Pesan)
┃◦ \`${prefix}kick\` @tag
┗━━━━━━━━━━━`;

    await ganggaaa.sendMessage(m.chat, {
        text: menuText,
        contextInfo: {
            externalAdReply: {
                title: `${botName} | Group Admin`,
                body: `© ${ownerName} ${new Date().getFullYear()}`,
                thumbnailUrl: "https://files.catbox.moe/pmq2tk.jpg",
                sourceUrl: `https://whatsapp.com/channel/0029VbAPj3U1Hsq2RJSlef2a`,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
}
break;

// Handler untuk menu Unique Features
case 'uniquemenu': {
    const botName = global.namabot || 'AlyaBot';
    const ownerName = global.namaown || 'G4NGGAAA';

    let menuText = `┏━⭓ *UNIQUE FEATURES* ✨
┃◦ \`${prefix}getpp\` @tag/reply
┃◦ \`${prefix}rvo\` (Reply View Once)
┃◦ \`${prefix}getsw\` (Reply status)
┃◦ \`${prefix}ping\`
┗━━━━━━━━━━━`;

    await ganggaaa.sendMessage(m.chat, {
        text: menuText,
        contextInfo: {
            externalAdReply: {
                title: `${botName} | Unique Features`,
                body: `© ${ownerName} ${new Date().getFullYear()}`,
                thumbnailUrl: "https://files.catbox.moe/pmq2tk.jpg",
                sourceUrl: `https://whatsapp.com/channel/0029VbAPj3U1Hsq2RJSlef2a`,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
}
break;

// Handler untuk menu Owner
case 'ownermenu': {
    // Tambahkan pengecekan jika bukan owner
    if (!isCreator) return m.reply('Maaf, menu ini hanya untuk Owner Bot.');

    const botName = global.namabot || 'AlyaBot';
    const ownerName = global.namaown || 'G4NGGAAA';
    
    let menuText = `┏━⭓ *OWNER MENU* 🛠️
┃◦ \`${prefix}on/off ai\` (Hanya PC)
┃◦ \`${prefix}setmode <mode>\`
┃◦ \`${prefix}setprefix <prefix>\`
┃◦ \`${prefix}uptokengithub <user>|<token>\`
┃◦ \`${prefix}uptokenvercel <token>\`
┃◦ \`${prefix}addsellerweb <nomor>\`
┃◦ \`${prefix}delsellerweb <nomor>\`
┃◦ \`${prefix}pconly/gconly\`
┗━━━━━━━━━━━`;

    await ganggaaa.sendMessage(m.chat, {
        text: menuText,
        contextInfo: {
            externalAdReply: {
                title: `${botName} | Owner Menu`,
                body: `© ${ownerName} ${new Date().getFullYear()}`,
                thumbnailUrl: "https://files.catbox.moe/pmq2tk.jpg",
                sourceUrl: `https://whatsapp.com/channel/0029VbAPj3U1Hsq2RJSlef2a`,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
}
break;

case 'allmenu' :
    const botName = global.namabot || 'AlyaBot';
    const ownerName = global.namaown || 'G4NGGAAA';
    
    let menuText = `*Halo, ${pushname}!* 👋
Saya *${botName}*, asisten digital Anda yang siap membantu 24/7.

┏━⭓ *BOT INFO*
┃◦ *Nama* : ${botName}
┃◦ *Versi* : 2.3.0 (Safe AI Chat)
┃◦ *Prefix* : *${prefix}*
┃◦ *Mode* : ${isCreator ? 'Owner' : isSellerWeb ? 'Seller' : 'Public'}
┃◦ *Runtime* : ${uptime}
┗━━━━━━━━━━━

┏━⭓ *WEB DEVELOPMENT* 🌐
┃◦ \`${prefix}createweb <jenis>|<nama>\`
┃◦ \`${prefix}listweb\`
┃◦ \`${prefix}gethtml <url>\`
┃◦ \`${prefix}github-deploy <namaRepo>\` (Reply HTML/ZIP)
┃◦ \`${prefix}vercel-deploy <namaWeb>\` (Reply HTML/ZIP)
┃◦ \`${prefix}listvercel\`
┃◦ \`${prefix}delvercel <namaWeb>\`
┃◦ \`${prefix}gitclone <linknya>\`
┃◦ \`${prefix}addrepo <nama>|<deskripsi>|<private/public>\`
┃◦ \`${prefix}checkrepo <namaRepo>\`
┃◦ \`${prefix}delrepo <namaRepo>\`
┃◦ \`${prefix}listrepo\`
┗━━━━━━━━━━━

┏━⭓ *GROUP ADMIN* 👑
┃◦ \`${prefix}linkgc\`
┃◦ \`${prefix}resetlinkgc\`
┃◦ \`${prefix}closetime <waktu> <s/m/j>\`
┃◦ \`${prefix}opentime <waktu> <s/m/j>\`
┃◦ \`${prefix}promote/demote\` @tag
┃◦ \`${prefix}setppgc\` (Reply Gambar)
┃◦ \`${prefix}hidetag <pesan>\`
┃◦ \`${prefix}tagall <pesan>\`
┃◦ \`${prefix}totag\` (Reply Pesan)
┃◦ \`${prefix}kick\` @tag
┗━━━━━━━━━━━

┏━⭓ *UNIQUE FEATURES* ✨
┃◦ \`${prefix}getpp\` @tag/reply
┃◦ \`${prefix}rvo\` (Reply View Once)
┃◦ \`${prefix}getsw\` (Reply status)
┃◦ \`${prefix}ping\`
┗━━━━━━━━━━━

┏━⭓ *OWNER MENU* 🛠️
┃◦ \`${prefix}on/off ai\` (Hanya PC)
┃◦ \`${prefix}setmode <mode>\`
┃◦ \`${prefix}setprefix <prefix>\`
┃◦ \`${prefix}uptokengithub <user>|<token>\`
┃◦ \`${prefix}uptokenvercel <token>\`
┃◦ \`${prefix}addsellerweb <nomor>\`
┃◦ \`${prefix}delsellerweb <nomor>\`
┃◦ \`${prefix}pconly/gconly\`
┗━━━━━━━━━━━`;

await ganggaaa.sendMessage(m.chat, {
        text: menuText,
        contextInfo: {
            externalAdReply: {
                title: `${botName} | Owner Menu`,
                body: `© ${ownerName} ${new Date().getFullYear()}`,
                thumbnailUrl: "https://files.catbox.moe/pmq2tk.jpg",
                sourceUrl: `https://whatsapp.com/channel/0029VbAPj3U1Hsq2RJSlef2a`,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
    break;

//═══════════[ WEB DEVELOPMENT FEATURES ]══════════════//
// ... (Kode fitur web development tetap sama, tidak perlu diubah)
case 'scweb':
    case 'gethtml':
        {
            if (!isSellerWeb) return m.reply('❌ Fitur ini khusus untuk Creator dan Seller.');
            if (!text) return m.reply(`Contoh: ${prefix + command} https://example.com`);
            if (!text.startsWith('http')) return m.reply('URL tidak valid.');

            try {
                await ganggaaa.sendMessage(m.chat, {
                    image: { url: global.thumbnailUrl },
                    caption: `⏳ Sedang mengambil source code dari:\n*${text}*...\n\nMohon tunggu.`
                }, { quoted: m });

                let res = await fetch(text);
                if (!res.ok) return m.reply(`❌ Gagal mengambil data. Status Code: ${res.status}`);
                let html = await res.text();
                const filePath = path.join(__dirname, 'temp', 'source_code.html');

                if (!fs.existsSync(path.join(__dirname, 'temp'))) {
                    fs.mkdirSync(path.join(__dirname, 'temp'));
                }
                fs.writeFileSync(filePath, html);

                await ganggaaa.sendMessage(m.chat, {
                    document: fs.readFileSync(filePath),
                    mimetype: 'text/html',
                    fileName: 'source_code.html',
                    caption: `✅ Berhasil mendapatkan source code dari *${text}*`
                }, { quoted: m });

                fs.unlinkSync(filePath); // Hapus file sementara

            } catch (e) {
                console.error(e);
                await ganggaaa.sendMessage(m.chat, {
                    image: { url: 'https://files.catbox.moe/g8uyx3.jpeg' },
                    caption: `❌ Terjadi kesalahan:\n\n${e.message}`
                }, { quoted: m });
            }
        }
        break;

    case 'createweb': {
    // Check for permissions and correct command format
    if (!isSellerWeb) return m.reply('❌ Fitur ini khusus untuk Creator dan Seller.');
    if (!text.includes('|')) return m.reply(`Contoh: ${prefix + command} store|my-shop`);

    // Parse and sanitize user input
    const [webTypeRaw, webNameRaw] = text.split('|');
    const webType = webTypeRaw.trim().toLowerCase();
    const webName = webNameRaw.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');

    // Check for database and user configuration
    const setwebPath = path.join(__dirname, 'database', 'setweb.json');
    if (!fs.existsSync(setwebPath)) return m.reply('File database/setweb.json tidak ditemukan.');

    const setweb = JSON.parse(fs.readFileSync(setwebPath));
    const userConfig = setweb.find(x => x.id === m.sender);
    if (!userConfig || !userConfig[webType]) return m.reply(`Kamu belum mengatur konfigurasi untuk website '${webType}'.\nGunakan .settingsweb terlebih dahulu.`);

    // Check if the HTML template exists
    const templatePath = path.join(__dirname, 'template', `${webType}.html`);
    if (!fs.existsSync(templatePath)) return m.reply(`Template ${webType}.html tidak ditemukan.`);

    // Send an "in-progress" message to the user with a thumbnail
    await ganggaaa.sendMessage(m.chat, {
        image: { url: global.thumbnailUrl },
        caption: `🚀 Membuat website *${webName}* menggunakan template *${webType}*...`
    }, { quoted: m });

    // Set up headers for Vercel API
    const headers = {
        Authorization: `Bearer ${global.vercelToken}`,
        'Content-Type': 'application/json'
    };

    try {
        // Read the template and replace placeholders with user's config
        let html = fs.readFileSync(templatePath, 'utf8');
        const config = userConfig[webType];
        for (const key in config) {
            html = html.replaceAll(key, config[key]);
        }

        const files = [{ file: 'index.html', data: html }];

        // Send the deployment request to Vercel
        const deploy = await fetch('https://api.vercel.com/v13/deployments', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: webName,
                files,
                projectSettings: { framework: null }
            })
        });

        const result = await deploy.json();

        // Handle deployment errors from Vercel's response
        if (!deploy.ok || !result.url) {
            console.error('Vercel Deploy Error:', result);
            let errorCaption = `❌ Gagal deploy: ${result.error?.message || 'Unknown error'}`;
            if (result.error?.code === 'project_name_already_exists') {
                errorCaption = `❌ Nama project '${webName}' sudah digunakan di Vercel. Pilih nama lain.`;
            }
            return await ganggaaa.sendMessage(m.chat, { image: { url: 'https://files.catbox.moe/g8uyx3.jpeg' }, caption: errorCaption }, { quoted: m });
        }

        // If successful, send a success message with the final URL and an image
        const finalUrl = `https://${result.alias[0] || `${webName}.vercel.app`}`;
        const successMessage = `✅ Website berhasil dibuat!\n\n*Nama Project:*\n${webName}\n\n*URL Publik:*\n🌐 ${finalUrl}`;
        await ganggaaa.sendMessage(m.chat, { image: { url: 'https://files.catbox.moe/g8uyx3.jpeg' }, caption: successMessage }, { quoted: m });

    } catch (error) {
        // Catch any other errors during the process (e.g., network issues)
        console.error(error);
        await ganggaaa.sendMessage(m.chat, { image: { url: 'https://files.catbox.moe/g8uyx3.jpeg' }, caption: `❌ Terjadi kesalahan saat deploy: ${error.message}` }, { quoted: m });
    }
}
break;

    case "listweb":
        {
            if (!isSellerWeb) return m.reply("Khusus Owner atau Seller Web!");
            // ... (logika membaca folder template) ...
            try {
                // ...
                const listNama = files.map(f => `◦ *${f.replace('.html', '')}*`).join('\n');
                const replyText = `*📋 Daftar Template Web Tersedia:*\n\n${listNama}\n\n*Gunakan: .createweb <nama_template>|<nama_web>*`;
                await ganggaaa.sendMessage(m.chat, {
                    image: { url: 'https://files.catbox.moe/g8uyx3.jpeg' },
                    caption: replyText
                }, { quoted: m });
            } catch (e) {
                m.reply("Gagal membaca folder template.");
            }
        }
        break;
        
    case 'github-deploy':
    case 'vercel-deploy':
        {
            // --- 1. Validasi & Pengaturan Awal (Umum untuk Keduanya) ---
            if (!isSellerWeb) return m.reply('❗ Anda tidak memiliki akses ke fitur ini.');
            if (!text) return m.reply(`Penggunaan: .${command} <nama_project>\nHarap reply file .html atau .zip`);
            if (!m.quoted || !/html|zip/.test(mime)) return m.reply('❌ Perintah tidak valid. Harap reply file .html atau .zip yang ingin di-deploy.');

            const service = command.includes('github') ? 'GitHub' : 'Vercel';
            const projectName = text.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');

            // Cek token spesifik untuk setiap service
            if (service === 'GitHub' && (!global.githubToken || !global.githubUsername)) {
                return m.reply('❗ Token atau username GitHub Anda belum di-setting.');
            }
            if (service === 'Vercel' && !global.vercelToken) {
                return m.reply('❗ Token Vercel Anda belum di-setting.');
            }

            // Kirim pesan tunggu dengan thumbnail
            await ganggaaa.sendMessage(m.chat, {
                image: { url: 'https://files.catbox.moe/g8uyx3.jpeg' },
                caption: `🚀 Memulai proses deploy ke *${service}* untuk project *${projectName}*...\n\nMohon tunggu sebentar.`
            }, { quoted: m });

            // --- 2. Proses Utama (Logika Spesifik per Service) ---
            try {
                const quotedFile = await downloadMediaMessage(qmsg, "buffer", {}, { reuploadRequest: ganggaaa.reupload });
                let finalUrl = ''; // Variabel untuk menampung URL hasil deploy

                // ===========================================
                //       LOGIKA UNTUK DEPLOY KE GITHUB
                // ===========================================
                if (service === 'GitHub') {
                    const headers = { Authorization: `token ${global.githubToken}`, 'Accept': 'application/vnd.github.v3+json' };

                    // Cek apakah repo sudah ada
                    const repoCheck = await fetch(`https://api.github.com/repos/${global.githubUsername}/${projectName}`, { headers });
                    if (repoCheck.ok) {
                        const errorCaption = `❌ Gagal! Repositori dengan nama *${projectName}* sudah ada di akun GitHub Anda.`;
                        return await ganggaaa.sendMessage(m.chat, { image: { url: 'https://files.catbox.moe/g8uyx3.jpeg' }, caption: errorCaption }, { quoted: m });
                    }

                    // Buat repositori baru
                    const createRepoRes = await fetch('https://api.github.com/user/repos', { method: 'POST', headers, body: JSON.stringify({ name: projectName, private: false }) });
                    if (!createRepoRes.ok) {
                        const err = await createRepoRes.json();
                        throw new Error(`Gagal membuat repositori: ${err.message}`);
                    }

                    // Proses file (HTML atau ZIP)
                    const filesToUpload = [];
                    if (mime.includes('zip')) {
                        const zipBuffer = Buffer.from(quotedFile);
                        const directory = await unzipper.Open.buffer(zipBuffer);
                        for (const file of directory.files) {
                            if (file.type === 'File') {
                                const content = await file.buffer();
                                filesToUpload.push({ path: file.path, content: content.toString('base64') });
                            }
                        }
                        if (!filesToUpload.some(f => f.path.toLowerCase().includes('index.html'))) {
                            throw new Error('File index.html tidak ditemukan dalam file ZIP.');
                        }
                    } else {
                        filesToUpload.push({ path: 'index.html', content: quotedFile.toString('base64') });
                    }

                    // Upload setiap file ke repositori
                    for (let file of filesToUpload) {
                        await fetch(`https://api.github.com/repos/${global.githubUsername}/${projectName}/contents/${file.path}`, { method: 'PUT', headers, body: JSON.stringify({ message: `Initial commit: add ${file.path}`, content: file.content }) });
                        await sleep(500); // Beri jeda antar request API
                    }

                    // Aktifkan GitHub Pages
                    await fetch(`https://api.github.com/repos/${global.githubUsername}/${projectName}/pages`, { method: 'POST', headers, body: JSON.stringify({ source: { branch: 'main', path: '/' } }) });
                    
                    finalUrl = `https://${global.githubUsername}.github.io/${projectName}`;
                }
                // ===========================================
                //       LOGIKA UNTUK DEPLOY KE VERCEL
                // ===========================================
                else if (service === 'Vercel') {
                    const headers = { Authorization: `Bearer ${global.vercelToken}`, 'Content-Type': 'application/json' };
                    
                    // Proses file (HTML atau ZIP)
                    const filesToUpload = [];
                     if (mime.includes('zip')) {
                        const zipBuffer = Buffer.from(quotedFile);
                        const directory = await unzipper.Open.buffer(zipBuffer);
                        for (const file of directory.files) {
                            if (file.type === 'File') {
                                const content = await file.buffer();
                                const filePath = file.path.replace(/^\/+/, '').replace(/\\/g, '/');
                                filesToUpload.push({ file: filePath, data: content });
                            }
                        }
                        if (!filesToUpload.some(x => x.file.toLowerCase().includes('index.html'))) {
                            throw new Error('File index.html tidak ditemukan dalam file ZIP.');
                        }
                    } else {
                        filesToUpload.push({ file: 'index.html', data: quotedFile });
                    }

                    // Kirim request deploy ke Vercel
                    const deployRes = await fetch('https://api.vercel.com/v13/deployments', { method: 'POST', headers, body: JSON.stringify({ name: projectName, files: filesToUpload.map(f => ({ file: f.file, data: f.data.toString('base64') })), projectSettings: { framework: null } }) });
                    const deployData = await deployRes.json();
                    
                    // Handle error dari Vercel
                    if (!deployRes.ok || !deployData.url) {
                        console.error('Vercel Deploy Error:', deployData);
                        if (deployData.error?.code === 'project_name_already_exists') {
                            throw new Error(`Nama project '${projectName}' sudah digunakan di Vercel. Silakan pilih nama lain.`);
                        }
                        throw new Error(deployData.error?.message || 'Terjadi error yang tidak diketahui dari Vercel');
                    }
                    
                    finalUrl = `https://${deployData.alias[0] || `${projectName}.vercel.app`}`;
                }

                // --- 3. Kirim Pesan Sukses (Umum untuk Keduanya) ---
                const successCaption = `✅ Deploy ke *${service}* berhasil!\n\n*Nama Project:*\n${projectName}\n\n*URL Publik:*\n🌐 ${finalUrl}\n\n*Catatan:* Mungkin perlu beberapa menit agar website dapat diakses.`;
                await ganggaaa.sendMessage(m.chat, { image: { url: 'https://files.catbox.moe/g8uyx3.jpeg' }, caption: successCaption }, { quoted: m });

            } catch (error) {
                // --- 4. Kirim Pesan Gagal (Umum untuk Keduanya) ---
                console.error(`${service} Deploy Error:`, error);
                const errorCaption = `❌ Gagal deploy ke *${service}*.\n\n*Pesan Error:*\n${error.message}`;
                await ganggaaa.sendMessage(m.chat, { image: { url: 'https://files.catbox.moe/g8uyx3.jpeg' }, caption: errorCaption }, { quoted: m });
            }
        }
        break;

    case 'listvercel':
        {
            if (!isSellerWeb) return m.reply('Anda tidak memiliki akses.');
            await m.reply("🔍 Mengambil daftar project Vercel...");
            // ... (logika fetch ke Vercel) ...
            try {
                // ...
                await ganggaaa.sendMessage(m.chat, { image: { url: 'https://files.catbox.moe/g8uyx3.jpeg' }, caption: teks }, { quoted: m });
            } catch (error) {
                 m.reply(`Gagal mengambil data: ${error.message}`);
            }
        }
        break;

    case 'delvercel':
        {
            if (!isSellerWeb) return m.reply('Anda tidak memiliki akses.');
            await m.reply(`🗑️ Mencoba menghapus *${webName}* dari Vercel...`);
            // ... (logika fetch untuk delete) ...
            try {
                if (response.status === 204) {
                    const successCaption = `✅ Website *${webName}* berhasil dihapus dari Vercel.`;
                    return await ganggaaa.sendMessage(m.chat, { image: { url: 'https://files.catbox.moe/g8uyx3.jpeg' }, caption: successCaption }, { quoted: m });
                } else {
                    const errorCaption = `❌ Gagal menghapus:\n${result.error?.message || `Status: ${response.status}`}`;
                    return await ganggaaa.sendMessage(m.chat, { image: { url: 'https://files.catbox.moe/g8uyx3.jpeg' }, caption: errorCaption }, { quoted: m });
                }
            } catch (err) {
                m.reply(`Terjadi kesalahan: ${err.message}`);
            }
        }
        break;

          
case 'git':
case 'gitclone': {
  try {
    if (!args[0]) return m.reply(`Contoh: ${p_c} linknya`)
    if (!isUrl(args[0]) && !args[0].includes('github.com')) return m.reply(`Harus berupa link github!`)
    let regex1 = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i
    var [, user, repo] = args[0].match(regex1) || []
    repo = repo.replace(/.git$/, '')
    var url = `https://api.github.com/repos/${user}/${repo}/zipball`
    let filename = (await fetch(url, {
      method: 'HEAD'
    })).headers.get('content-disposition').match(/attachment; filename=(.*)/)[1]
    ganggaaa.sendMessage(m.chat, {
      document: {
        url: url
      },
      fileName: filename + '.zip',
      mimetype: 'application/zip'
    }, {
      quoted: WaBis
    })
  } catch (err) {
    m.reply('Terjadi kesalahan')
  }
}
break;
case 'addrepo': {
  if (!isCreator) return m.reply("❗ *Access Denied*\nFitur Only `Owner`");

  if (!text.includes("|")) return m.reply("❌ Format salah!\nGunakan: .addrepo <nama>|<deskripsi>|<private/public>");

  const [nama, deskripsi, privasi] = text.split("|").map(a => a.trim());
  if (!nama || !deskripsi || !privasi) return m.reply("⚠️ Format tidak lengkap!");

  const isPrivate = privasi.toLowerCase() === 'private';

  const fetch = require("node-fetch");
  const res = await fetch(`https://api.github.com/user/repos`, {
    method: "POST",
    headers: {
      "Authorization": `token ${global.githubToken}`,
      "Accept": "application/vnd.github+json"
    },
    body: JSON.stringify({
      name: nama,
      description: deskripsi,
      private: isPrivate
    })
  });

  const data = await res.json();

  if (res.ok) {
    m.reply(`✅ *Repository berhasil dibuat!*\n\n📦 Nama: ${data.name}\n🔒 Private: ${data.private}\n🔗 URL: ${data.html_url}`);
  } else {
    m.reply(`❌ Gagal membuat repository.\n\n${JSON.stringify(data, null, 2)}`);
  }
}
break;
case 'checkrepo': {
  if (!isCreator) return m.reply("❗ *Access Denied*\nFitur Only `Owner`");
  if (!text) return m.reply("⚠️ Masukkan nama repository!\nContoh: .checkrepo my-repo");

  const fetch = require("node-fetch");
  try {
    const repoName = text.trim();

    // Ambil info repo
    const resInfo = await fetch(`https://api.github.com/repos/${global.githubUsername}/${repoName}`, {
      headers: {
        "Authorization": `token ${global.githubToken}`,
        "Accept": "application/vnd.github+json"
      }
    });

    const repoInfo = await resInfo.json();
    if (!resInfo.ok) {
      return m.reply(`❌ Repository tidak ditemukan!\n\n${JSON.stringify(repoInfo, null, 2)}`);
    }

    // Ambil daftar file
    const resContent = await fetch(`https://api.github.com/repos/${global.githubUsername}/${repoName}/contents`, {
      headers: {
        "Authorization": `token ${global.githubToken}`,
        "Accept": "application/vnd.github+json"
      }
    });

    const contents = await resContent.json();
    if (!Array.isArray(contents)) {
      return m.reply(`❌ Gagal mengambil konten repository.`);
    }

    let listFiles = contents.map(v => `📄 ${v.name}`).join("\n");
    let total = contents.length;
    let status = repoInfo.private ? "🔒 Private" : "🌐 Public";
    let createdAt = new Date(repoInfo.created_at).toLocaleString('id-ID');

    m.reply(`*📦 Info Repository*\n\n` +
            `• Nama: ${repoInfo.name}\n` +
            `• Status: ${status}\n` +
            `• Dibuat: ${createdAt}\n` +
            `• Jumlah File: ${total}\n\n` +
            `*📁 File:*\n${listFiles}`);
  } catch (e) {
    console.error(e);
    m.reply("❌ Terjadi kesalahan saat memeriksa repository.");
  }
}
break;
case 'delrepo': {
  if (!isCreator) return m.reply("❗ *Access Denied*\nFitur Only `Owner`");
  if (!text) return m.reply("❌ *Format salah!*\nGunakan: .delrepo <nama_repository>");

  const fetch = require("node-fetch");
  const repoName = text.trim();
  const username = global.githubUsername; // pastikan ini diset di settings.js

  try {
    const res = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
      method: "DELETE",
      headers: {
        "Authorization": `token ${global.githubToken}`,
        "Accept": "application/vnd.github+json"
      }
    });

    if (res.status === 204) {
      m.reply(`✅ Repository *${repoName}* berhasil dihapus.`);
    } else if (res.status === 404) {
      m.reply(`❌ Repository *${repoName}* tidak ditemukan.`);
    } else {
      const error = await res.json();
      console.log(error);
      m.reply("❌ Gagal menghapus repository.");
    }
  } catch (err) {
    console.error(err);
    m.reply("❌ Terjadi kesalahan saat menghapus repository.");
  }
}
break;
case 'listrepo': {
  if (!isCreator) return m.reply("❗ *Access Denied*\nFitur Only `Owner`");
  
  try {
    const res = await fetch(`https://api.github.com/user/repos`, {
      headers: {
        "Authorization": `token ${global.githubToken}`,
        "Accept": "application/vnd.github+json"
      }
    });
    const data = await res.json();

    if (!Array.isArray(data)) return m.reply("❌ Gagal mengambil repository!");

    if (data.length === 0) return m.reply("ℹ️ Belum ada repository.");

    const list = data.map((repo, i) => 
      `*${i + 1}. ${repo.name}*\n> ${repo.private ? '🔒 Private' : '🌐 Public'}\n> ${repo.html_url}`
    ).join("\n\n");

    m.reply(`📁 *List Repository GitHub:*\n\n${list}`);
  } catch (err) {
    console.error(err);
    m.reply("❌ Terjadi kesalahan saat mengambil data.");
  }
}
break;
//═══════════[ UNIQUE FEATURES ]══════════════//
// ... (Kode fitur unique tetap sama, tidak perlu diubah)
case 'getpp': {
    let targetUser = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : false) || text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    if (!targetUser || targetUser === '@s.whatsapp.net') {
        targetUser = m.sender;
    }
    try {
        const ppUrl = await ganggaaa.profilePictureUrl(targetUser, 'image');
        ganggaaa.sendMessage(m.chat, { image: { url: ppUrl }, caption: `Ini dia profile picture @${targetUser.split('@')[0]}`, mentions: [targetUser] }, { quoted: m });
    } catch (err) {
        reply(`Gagal mendapatkan profile picture, mungkin pengguna tidak memasang foto profil atau nomor tidak valid.`);
    }
}
break;
case 'rvo':
case 'readviewonce': {
    if (!m.quoted) return reply("Balas pesan view once dengan command ini.");
    let quotedMsg = m.quoted.message;
    let type = Object.keys(quotedMsg)[0];
    if (!quotedMsg[type].viewOnce) return reply("Pesan yang Anda balas bukan view-once!");
    try {
      m.reply('Mencoba membaca pesan view-once...');
      let media = await downloadContentFromMessage(quotedMsg[type], type.replace('Message', ''));
      let buffer = Buffer.from([]);
      for await (const chunk of media) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      if (/video/.test(type)) {
        return ganggaaa.sendMessage(m.chat, {video: buffer, caption: quotedMsg[type].caption || ""}, {quoted: m});
      } else if (/image/.test(type)) {
        return ganggaaa.sendMessage(m.chat, {image: buffer, caption: quotedMsg[type].caption || ""}, {quoted: m});
      }
    } catch (error) {
      console.error(error);
      reply("Gagal memproses pesan view-once.");
    }
}
break;
case 'getsw':
case 'sw': {
    if (isGroup) return reply("❌ Command ini hanya bisa digunakan di chat pribadi.");
    const quotedMsgInfo = m.message?.extendedTextMessage?.contextInfo;
    if (!quotedMsgInfo || !quotedMsgInfo.quotedMessage || !quotedMsgInfo.participant?.endsWith('@s.whatsapp.net')) {
        return reply("📌 Balas/reply status (story) yang ingin diambil.");
    }
    const quotedMsg = quotedMsgInfo.quotedMessage;
    await m.reply("Mengunduh status...");
    try {
        if (quotedMsg.imageMessage) {
            const img = await downloadMediaMessage({ message: { imageMessage: quotedMsg.imageMessage } }, "buffer", {}, { reuploadRequest: ganggaaa.reupload });
            return ganggaaa.sendMessage(m.chat, { image: img, caption: "Ini status gambarnya 🖼️" }, { quoted: m });
        }
        if (quotedMsg.videoMessage) {
            const vid = await downloadMediaMessage({ message: { videoMessage: quotedMsg.videoMessage } }, "buffer", {}, { reuploadRequest: ganggaaa.reupload });
            return ganggaaa.sendMessage(m.chat, { video: vid, caption: "Ini status videonya 🎥" }, { quoted: m });
        }
        return reply("❌ Status yang Anda balas bukan gambar atau video.");
    } catch (e) {
        console.error(e);
        reply("Terjadi error saat mengambil status.");
    }
}
break;
case 'ping': {
    const startTime = performance.now();
    const sentMsg = await m.reply('Pinging...');
    const endTime = performance.now();
    const responseTime = (endTime - startTime).toFixed(2);
    const used = process.memoryUsage();
    const ramUsage = `${(used.rss / 1024 / 1024).toFixed(2)} MB`;
    const teks = `*Pong!* 🏓\n- *Response Time:* ${responseTime} ms\n- *RAM Usage:* ${ramUsage}`;
    ganggaaa.sendMessage(m.chat, { text: teks, edit: sentMsg.key });
}
break;

//═══════════[ OWNER & CONFIG FEATURES ]══════════════//
case 'on': {
    if (!isCreator) return reply(mess.owner);
    if (isGroup) return reply('Perintah ini hanya bisa digunakan di chat pribadi untuk menghindari spam.');
    if (text.toLowerCase() === 'ai') {
        if (global.aiChatEnabled) return reply('Fitur AI Chat sudah aktif.');
        global.aiChatEnabled = true;
        reply('✅ Fitur AI Chat berhasil diaktifkan.');
    } else {
        reply('Perintah tidak valid. Gunakan `.on ai`');
    }
}
break;

case 'off': {
    if (!isCreator) return reply(mess.owner);
    if (isGroup) return reply('Perintah ini hanya bisa digunakan di chat pribadi untuk menghindari spam.');
    if (text.toLowerCase() === 'ai') {
        if (!global.aiChatEnabled) return reply('Fitur AI Chat sudah nonaktif.');
        global.aiChatEnabled = false;
        reply('✅ Fitur AI Chat berhasil dinonaktifkan.');
    } else {
        reply('Perintah tidak valid. Gunakan `.off ai`');
    }
}
break;

case 'setmode': {
    // Memastikan hanya owner yang bisa menggunakan perintah ini
    if (!isCreator) return reply(mess.owner);

    // Daftar tombol mode AI
    const buttons = [
        { buttonId: '.setmodenow teman', buttonText: { displayText: 'Teman' }, type: 1 },
        { buttonId: '.setmodenow asisten', buttonText: { displayText: 'Asisten' }, type: 1 },
        { buttonId: '.setmodenow pacar-biasa', buttonText: { displayText: 'Pacar Biasa' }, type: 1 },
        { buttonId: '.setmodenow pacar-tsundere', buttonText: { displayText: 'Pacar Tsundere' }, type: 1 },
        { buttonId: '.setmodenow pacar-yandere', buttonText: { displayText: 'Pacar Yandere' }, type: 1 }
    ];

    // Merakit pesan yang akan dikirim
    const buttonMessage = {
        text: "Silakan pilih mode AI yang ingin Anda gunakan saat ini.",
        footer: 'Pilih salah satu mode di bawah',
        buttons: buttons,
        headerType: 1
    };

    await ganggaaa.sendMessage(m.chat, buttonMessage);
    break; // break harus di luar kurung kurawal '}'
}

// Tambahkan case lain di sini, contoh:
case 'setmodenow': {
    if (!isCreator) return reply(mess.owner);
    if (!args[0]) return reply('Silakan pilih mode. Contoh: .setmodenow teman');

    const mode = args[0].toLowerCase();
    const validModes = ['teman', 'asisten', 'pacar-biasa', 'pacar-tsundere', 'pacar-yandere'];

    if (validModes.includes(mode)) {
        global.aiChatMode = mode;
        reply(`✅ Mode AI berhasil diubah menjadi: ${mode}`);
    } else {
        reply(`Mode '${mode}' tidak valid. Mode yang tersedia:\n- ${validModes.join('\n- ')}`);
    }
    break;
}

case 'modegrup':
case 'gconly': {
  if (!isCreator) return onlyOwn()
  if (!args[0]) return m.reply(`Contoh: ${p_c} on/off`)
  if (args[0] === 'on') {
    global.gconly = true
    global.pconly = false
    await m.reply('Sukses mengubah ke mode gc-only.')
  } else if (args[0] === 'off') {
    global.gconly = false
    await m.reply('Sukses mengubah ke mode gc/pc only.')
  }
}
break;

case 'modepv':
case 'pconly': {
  if (!isCreator) return onlyOwn()
  if (!args[0]) return m.reply(`Contoh: ${p_c} on/off`)
  if (args[0] === 'on') {
    global.pconly = true
    global.gconly = false
    await m.reply('Sukses mengubah ke mode pc-only.')
  } else if (args[0] === 'off') {
    global.pconly = false
    await m.reply('Sukses mengubah ke mode gc/pc only.')
  }
}
break;
     
case 'setprefix': {
    if (!isCreator) return reply(mess.owner);
    if (!text) return reply('Penggunaan: .setprefix <prefix_baru>');
    try {
        updateConfigFile('prefix', text);
        global.prefix = text;
        reply(`✅ Prefix berhasil diubah menjadi: *${text}*`);
    } catch (err) {
        console.error(err);
        reply(`❌ Terjadi kesalahan: ${err.message}`);
    }
}
break;

case 'uptokengithub': {
    if (!isCreator) return reply(mess.owner);
    const [usernameGH, tokenGH] = text.split('|').map(a => a.trim());
    if (!usernameGH || !tokenGH) {
        return reply("❌ Format salah!\n\nUse: .uptokengithub <username>|<token>");
    }
    try {
        updateConfigFile('githubUsername', usernameGH);
        updateConfigFile('githubToken', tokenGH);
        global.githubUsername = usernameGH; 
        global.githubToken = tokenGH;       
        reply(`✅ Token GitHub berhasil diupdate!\n\n*Username:* ${usernameGH}`);
    } catch (err) {
        console.error(err);
        reply(`❌ Terjadi kesalahan: ${err.message}`);
    }
}
break;

case 'uptokenvercel': {
    if (!isCreator) return reply(mess.owner);
    const tokenBaru = text.trim();
    if (!tokenBaru) return reply("❌ Format salah!\n\nUse: .uptokenvercel <Token>");
    try {
        updateConfigFile('vercelToken', tokenBaru);
        global.vercelToken = tokenBaru;
        reply(`✅ Berhasil update token Vercel!`);
    } catch (err) {
        console.error(err);
        reply(`❌ Gagal memperbarui token: ${err.message}`);
    }
}
break;

//═══════════[ GROUP FEATURES ]══════════════//
// ... (Kode fitur grup tetap sama, tidak perlu diubah)
case "kick": {
    if (!isGroup) return reply(mess.group);
    if (!isGroupAdmins) return reply(mess.admin);
    if (!isBotGroupAdmins) return reply(mess.botadmin);
    let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    if (!users || users === '@s.whatsapp.net') return reply('Tag atau reply pengguna yang akan dikeluarkan.');
    try {
        await ganggaaa.groupParticipantsUpdate(m.chat, [users], 'remove');
        reply(`✅ Berhasil mengeluarkan @${users.split("@")[0]}.`);
    } catch (e) {
        reply('Gagal mengeluarkan anggota, mungkin dia adalah admin atau creator grup.');
    }
}
break;
case "linkgc": {
    if (!isGroup) return reply(mess.group);
    if (!isGroupAdmins) return reply(mess.admin);
    if (!isBotGroupAdmins) return reply(mess.botadmin);
    try {
        const code = await ganggaaa.groupInviteCode(m.chat);
        reply(`https://chat.whatsapp.com/${code}`);
    } catch (e) {
        reply('Gagal mendapatkan link grup.');
    }
}
break;
case "resetlinkgc": {
    if (!isGroup) return reply(mess.group);
    if (!isGroupAdmins) return reply(mess.admin);
    if (!isBotGroupAdmins) return reply(mess.botadmin);
    try {
        await ganggaaa.groupRevokeInvite(m.chat);
        reply("✅ Berhasil mereset link grup.");
    } catch (e) {
        reply('Gagal mereset link grup.');
    }
}
break;
case 'closetime':
case "opentime": {
    if (!isGroup) return reply(mess.group);
    if (!isGroupAdmins) return reply(mess.admin);
    if (!isBotGroupAdmins) return reply(mess.botadmin);
    if (args.length < 2) return reply(`*Contoh:*\n.closetime 10 m\n.opentime 1 j\n(s: detik, m: menit, j: jam)`);
    const timeValue = parseInt(args[0]);
    const timeUnit = args[1].toLowerCase();
    let timer = 0;
    if (isNaN(timeValue)) return reply('Jumlah waktu harus angka.');
    switch (timeUnit) {
        case 's': timer = timeValue * 1000; break;
        case 'm': timer = timeValue * 60000; break;
        case 'j': timer = timeValue * 3600000; break;
        default: return reply('*Unit waktu yang tersedia:*\ns (detik), m (menit), j (jam)');
    }
    const action = command.includes('close') ? 'announcement' : 'not_announcement';
    const actionText = action === 'announcement' ? 'ditutup' : 'dibuka';
    reply(`Grup akan ${actionText} dalam ${timeValue} ${args[1]}.`);
    setTimeout(() => {
        ganggaaa.groupSettingUpdate(m.chat, action);
        ganggaaa.sendMessage(m.chat, { text: `*Tepat waktu!* Grup telah ${actionText}.` });
    }, timer);
}
break;
case "promote":
case "demote": {
    if (!isGroup) return reply(mess.group);
    if (!isGroupAdmins) return reply(mess.admin);
    if (!isBotGroupAdmins) return reply(mess.botadmin);
    let target = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    if (!target || target === '@s.whatsapp.net') return reply('Tag atau reply pengguna.');
    const action = command.toLowerCase();
    try {
        await ganggaaa.groupParticipantsUpdate(m.chat, [target], action);
        reply(`✅ Sukses ${action} @${target.split("@")[0]}.`);
    } catch (e) {
        reply(`Gagal, mungkin pengguna sudah di-${action} atau terjadi error lain.`);
    }
}
break;
case 'setppgc': {
    if (!isGroup) return reply(mess.group);
    if (!isGroupAdmins) return reply(mess.admin);
    if (!isBotGroupAdmins) return reply(mess.botadmin);
    if (!/image/.test(mime)) return reply(`Kirim atau reply gambar dengan caption ${prefix + command}`);
    try {
        const media = await downloadMediaMessage(qmsg, "buffer", {}, { reuploadRequest: ganggaaa.reupload });
        await ganggaaa.updateProfilePicture(m.chat, media);
        reply(mess.done);
    } catch (e) {
        reply('Gagal mengganti foto profil grup.');
    }
}
break;
case 'tagall': {
    if (!isGroup) return reply(mess.group);
    if (!isGroupAdmins) return reply(mess.admin);
    let message = text || "Memanggil semua anggota!";
    let mentions = participants.map(p => p.id);
    let mentionText = participants.map(p => `@${p.id.split('@')[0]}`).join('\n');
    let fullText = `*Panggilan Grup!*\n*Pesan:* ${message}\n\n${mentionText}`;
    ganggaaa.sendMessage(m.chat, { text: fullText, mentions: mentions }, { quoted: m });
}
break;        
case "hidetag": {
    if (!isGroup) return reply(mess.group);
    if (!isGroupAdmins) return reply(mess.admin);
    ganggaaa.sendMessage(m.chat, { text: text || '', mentions: participants.map(a => a.id) }, { quoted: m });
}
break;

      default:
if (budy.startsWith('>')) {
if (!isCreator) return
try {
let evaled = await eval(budy.slice(2))
if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
await m.reply(evaled)
} catch (err) {
await m.reply(String(err))
}}

// =================================== //

if (m.text.toLowerCase() == "tes") {
m.reply("Online ☕")
}
if (m.text.toLowerCase() == `@${global.owner}`) {
m.reply("Kenapa kak")
}  
if (m.text.toLowerCase() == "bot") {
m.reply("Hi Ada Yang Bisa Saya Bantu Hari Ini😄?")
}        
if (m.text.toLowerCase() == "🗿") {
m.reply("Jangan emot batu kakaw ^ // ^☹️")
}
if (m.text.toLowerCase() == "assalamualaikum") {
m.reply("waalaikumsalam wr wb")
}
if (m.text.toLowerCase() == `@${nomorbot}`) {
m.reply(`Oy napa`)
}

// =================================== //

if (budy.startsWith('=>')) {
if (!isCreator) return
try {
let evaled = await eval(`(async () => { ${budy.slice(2)} })()`)
if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
await m.reply(evaled)
} catch (err) {
await m.reply(String(err))
}}

// =================================== //

if (budy.startsWith('$')) {
if (!isCreator) return
if (!text) return
exec(budy.slice(2), (err, stdout) => {
if (err) return m.reply(`${err}`)
if (stdout) return m.reply(stdout)
})
}

        if (isCmd) {
            console.log(`Unknown command: ${command} from ${sender}`);
        }
    }
  } catch (err) {
    console.error(`Error in case.js: ${util.format(err)}`);
  }
};

// File watcher for hot-reloading
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(`Update ${__filename}`);
  delete require.cache[file];
  require(file);
});
