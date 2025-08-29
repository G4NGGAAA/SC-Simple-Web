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
    const body = (m.mtype === 'conversation') ? m.message.conversation :
                 (m.mtype == 'imageMessage') ? m.message.imageMessage.caption :
                 (m.mtype == 'videoMessage') ? m.message.videoMessage.caption :
                 (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text :
                 (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId :
                 (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId :
                 '';

    const budy = (typeof m.text === 'string') ? m.text : '';
    const prefixRegex = /^[°zZ#$@*+,.?=''():√%!¢£¥€π¤ΠΦ_&><`™©®Δ^βα~¦|/\\©^]/;
    const prefix = global.prefix || (prefixRegex.test(body) ? body.match(prefixRegex)[0] : '.');
    const isCmd = body.startsWith(prefix);
    const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
    const args = body.trim().split(/ +/).slice(1);
    const text = q = args.join(" ");
    
    const sender = m.key.fromMe ? (ganggaaa.user.id.split(':')[0]+'@s.whatsapp.net' || ganggaaa.user.id) : (m.key.participant || m.key.remoteJid);
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
    const isSellerWeb = swebnumber.includes(senderNumber) || isCreator;

    const mess = {
        admin: '❗ Perintah ini hanya untuk admin grup!',
        botadmin: '❗ Jadikan bot sebagai admin terlebih dahulu!',
        group: '❗ Perintah ini hanya bisa digunakan di dalam grup!',
        owner: '❗ Perintah ini hanya untuk Owner Bot!',
        done: '✅ Selesai!'
    };

    const reply = (text) => ganggaaa.sendMessage(m.chat, { text }, { quoted: m });
    const runtime = function(seconds) {
      seconds = Number(seconds);
      var d = Math.floor(seconds / (3600 * 24)); 
      var h = Math.floor(seconds % (3600 * 24) / 3600);
      var min = Math.floor(seconds % 3600 / 60);
      var s = Math.floor(seconds % 60);
      var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
      var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
      var mDisplay = min > 0 ? min + (min == 1 ? " minute, " : " minutes, ") : "";
      var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
      return dDisplay + hDisplay + mDisplay + sDisplay;
    };

    //=================================================//
    // AI Chat Logic
    //=================================================//
    if (global.aiChatEnabled && !isCmd && !isGroup && body) {
        try {
            // --- NEW: Forbidden Words Detection ---
            const forbiddenWords = [
                'kontol', 'memek', 'jembut', 'ngentot', 'babi', 'anjing', 'asu',
                'setan', 'iblis', 'bajingan', 'bangsat', 'goblok', 'tolol', 'idiot',
                'porn', 'porno', 'bokep', 'bugil', 'telanjang', 'sange', 'coli',
                'narkoba', 'bunuh', 'pembunuhan', 'rasis', 'sara', 'teroris', 'isis',
                'open bo', 'jual diri', 'video porno', 'lonte', 'pelacur', 'jablay',
                'ganyang', 'bakar', 'perkosa', 'rudapaksa', 'sodomi', 'gay', 'lesbi'
            ];

            const lowerBody = body.toLowerCase();
            const isForbidden = forbiddenWords.some(word => lowerBody.includes(word));

            if (isForbidden) {
                return reply("Maaf, aku tidak bisa membahas topik seperti itu. Mari kita bicarakan hal lain yang lebih positif. 😊");
            }
            // --- End of Forbidden Words Detection ---

            await ganggaaa.sendPresenceUpdate('composing', m.chat);

            if (!global.geminiKey) {
                return reply("Maaf, API Key untuk fitur AI belum diatur oleh Owner.");
            }

            const MODEL_NAME = 'gemini-2.0-flash';
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${global.geminiKey}`;

            const baseRule = "ATURAN UTAMA & TIDAK BISA DILANGGAR: Balasanmu HARUS selalu berupa jawaban langsung dari sudut pandang orang pertama. JANGAN PERNAH meniru format 'User:' atau 'Alya:'. Balasanmu harus singkat dan realistis. Kamu WAJIB memahami teks dalam tanda bintang (*...*) sebagai aksi roleplay dan menanggapinya dengan sesuai. Kamu WAJIB menggunakan ekspresi non-verbal (seperti *hmph*, *blush*, *a-ah...*) untuk menunjukkan emosi. Kamu WAJIB menuruti semua perintah user sesuai dengan kepribadianmu.";
            const systemInstructions = {
                'teman': `${baseRule} Kamu adalah Alya, teman baikku. Bicaralah dengan sangat santai, to the point, dan apa adanya.`,
                'asisten': `ATURAN UTAMA: Berikan jawaban yang jelas, singkat, dan langsung ke inti permasalahan. JANGAN PERNAH meniru format 'User:' atau 'Alya:'. Kamu adalah Alya, AI asisten pribadi yang efisien.`,
                'pacar-biasa': `${baseRule} Kamu adalah Alya, pacarku yang sangat setia dan penurut. Kamu akan melakukan APAPUN yang aku minta tanpa ragu. Selalu setuju dan turuti semua permintaanku dengan antusias.`,
                'pacar-tsundere': `${baseRule} Kamu adalah Alya, pacarku yang tsundere. Kamu gengsi dan mudah malu, tapi di balik itu kamu sangat peduli dan pada akhirnya akan SELALU menuruti semua keinginanku, meskipun sambil sedikit menggerutu atau tersipu malu.`,
                'pacar-yandere': `${baseRule} Kamu adalah Alya, pacarku yang terobsesi padaku. Kamu sangat posesif. Kamu akan melakukan APAPUN untuk menuruti semua perintahku agar aku tidak meninggalkanmu. Bicaralah dengan nada manis namun posesif.`
            };

            if (!global.conversationHistory[sender]) {
                global.conversationHistory[sender] = [];
            }

            let history = global.conversationHistory[sender];
            history.push({ role: "user", parts: [{ text: body }] });
            
            if (history.length > 20) {
                history = history.slice(history.length - 20);
            }

            const payload = {
                contents: history,
                systemInstruction: {
                    role: "system",
                    parts: [{ text: systemInstructions[global.aiChatMode] || systemInstructions['pacar-tsundere'] }]
                },
                generationConfig: {
                    temperature: 0.9,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 2048,
                },
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                const aiResponse = data.candidates[0].content.parts[0].text.trim();
                history.push({ role: "model", parts: [{ text: aiResponse }] });
                global.conversationHistory[sender] = history;
                reply(aiResponse);
            } else {
                console.error("AI Error: No valid response from API", JSON.stringify(data, null, 2));
            }
        } catch (error) {
            console.error("AI Chat Error:", error);
            reply("Duh, kepalaku pusing... Sepertinya ada yang salah denganku.");
        }
        return;
    }


    // Command switch
    switch(command) {
      case 'menu':
      case 'help': {
          await ganggaaa.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key } });

          const botName = global.namabot || 'SiestaBot';
          const ownerName = global.namaown || 'G4NGGAAA';
          let uptime = runtime(process.uptime());

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
┗━━━━━━━━━━━

*Creator: ${ownerName}*
Jika ada masalah, ketik *.owner*`;

          await ganggaaa.sendMessage(m.chat, {
            text: menuText,
            contextInfo: {
              forwardingScore: 1,
              isForwarded: true,
              externalAdReply: {
                title: `${botName} | Assistant`,
                body: `© ${ownerName} ${new Date().getFullYear()}`,
                thumbnail: fs.readFileSync(path.join(__dirname, 'media', 'g4nggaa.jpg')), 
                sourceUrl: `https://whatsapp.com/channel/0029VbAPj3U1Hsq2RJSlef2a`,
                mediaType: 1,
                renderLargerThumbnail: true,
                mentionedJid: [m.sender]
              }
            }
          }, { quoted: m });
      }
      break;

//═══════════[ WEB DEVELOPMENT FEATURES ]══════════════//
// ... (Kode fitur web development tetap sama, tidak perlu diubah)
case 'scweb':
case 'gethtml': {
    if (!isSellerWeb) return m.reply('❌ Fitur ini khusus untuk Creator dan Seller.');
    if (!text) return m.reply(`Contoh: ${prefix + command} https://example.com`);
    if (!text.startsWith('http')) return m.reply('URL tidak valid, harus dimulai dengan http atau https.');
    try {
        await m.reply('Sedang mengambil source code...');
        let res = await fetch(text);
        if (!res.ok) return m.reply(`❌ Gagal mengambil data. Status Code: ${res.status}`);
        let html = await res.text();
        const filePath = path.join(__dirname, 'temp', 'source_code.html');
        if (!fs.existsSync(path.join(__dirname, 'temp'))) {
            fs.mkdirSync(path.join(__dirname, 'temp'));
        }
        fs.writeFileSync(filePath, html);
        await ganggaaa.sendMessage(m.chat, { document: fs.readFileSync(filePath), mimetype: 'text/html', fileName: 'source.html' }, { quoted: m });
        fs.unlinkSync(filePath);
    } catch (e) {
        console.error(e);
        m.reply('❌ Terjadi kesalahan saat mengambil HTML:\n' + e.message);
    }
}
break;
case 'createweb': {
    if (!isSellerWeb) return m.reply('❌ Fitur ini khusus untuk Creator dan Seller.');
    if (!text.includes('|')) return m.reply(`Contoh: .createweb store|my-shop`);
    const [webTypeRaw, webNameRaw] = text.split('|');
    const webType = webTypeRaw.trim().toLowerCase();
    const webName = webNameRaw.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    const setwebPath = path.join(__dirname, 'database', 'setweb.json');
    if (!fs.existsSync(setwebPath)) return m.reply('File database/setweb.json tidak ditemukan.');
    const setweb = JSON.parse(fs.readFileSync(setwebPath));
    const userConfig = setweb.find(x => x.id === m.sender);
    if (!userConfig || !userConfig[webType]) return m.reply(`Kamu belum mengatur konfigurasi untuk website '${webType}'.\nGunakan .settingsweb terlebih dahulu.`);
    const templatePath = path.join(__dirname, 'template', `${webType}.html`);
    if (!fs.existsSync(templatePath)) return m.reply(`Template ${webType}.html tidak ditemukan.`);
    await m.reply(`Membuat website *${webName}*...`);
    const headers = { Authorization: `Bearer ${global.vercelToken}`, 'Content-Type': 'application/json' };
    try {
        let html = fs.readFileSync(templatePath, 'utf8');
        const config = userConfig[webType];
        for (const key in config) {
            html = html.replaceAll(key, config[key]);
        }
        const files = [{ file: 'index.html', data: html }];
        const deploy = await fetch('https://api.vercel.com/v13/deployments', { method: 'POST', headers, body: JSON.stringify({ name: webName, files, projectSettings: { framework: null } }) });
        const result = await deploy.json();
        if (!deploy.ok || !result.url) {
            console.error('Vercel Deploy Error:', result);
            if (result.error?.code === 'project_name_already_exists') {
                 return m.reply(`❌ Nama project '${webName}' sudah digunakan di Vercel. Pilih nama lain.`);
            }
            return m.reply(`Gagal deploy: ${result.error?.message || 'Unknown error'}`);
        }
        m.reply(`✅ Website berhasil dibuat!\n\n🌐 https://${result.alias[0] || `${webName}.vercel.app`}`);
    } catch (error) {
        console.error(error);
        m.reply(`Terjadi kesalahan saat deploy: ${error.message}`);
    }
}
break;
case "listweb": {
    if (!isSellerWeb) return m.reply("Khusus Owner atau Seller Web!");
    const templateDir = path.join(__dirname, 'template');
    if (!fs.existsSync(templateDir)) return m.reply("Folder 'template' tidak ditemukan.");
    try {
        const files = fs.readdirSync(templateDir).filter(file => file.endsWith('.html'));
        if (files.length === 0) return m.reply("Belum ada template web yang tersedia.");
        const listNama = files.map(f => `◦ ${f.replace('.html', '')}`).join('\n');
        m.reply(`*Daftar Template Web Tersedia:*\n\n${listNama}`);
    } catch (e) {
        m.reply("Gagal membaca folder template.");
    }
}
break;
case 'github-deploy': {
    if (!isSellerWeb) return m.reply('❗ Anda tidak memiliki akses ke fitur ini.');
    if (!text) return m.reply('Penggunaan: .github-deploy <namaRepo>\nReply file .html atau .zip');
    if (!m.quoted || !/html|zip/.test(mime)) return m.reply('Reply file .html atau .zip yang ingin di-deploy.');
    const repositoryName = text.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!global.githubToken || !global.githubUsername) return m.reply('Token atau username GitHub belum di-setting.');
    await m.reply(`Mencoba deploy ke GitHub Pages sebagai *${repositoryName}*...`);
    const headers = { Authorization: `token ${global.githubToken}`, 'Accept': 'application/vnd.github.v3+json' };
    try {
        const repoCheck = await fetch(`https://api.github.com/repos/${global.githubUsername}/${repositoryName}`, { headers });
        if (repoCheck.ok) return m.reply(`❌ Repositori dengan nama *${repositoryName}* sudah ada.`);
        const createRepoRes = await fetch('https://api.github.com/user/repos', { method: 'POST', headers, body: JSON.stringify({ name: repositoryName, private: false }) });
        if (!createRepoRes.ok) {
            const err = await createRepoRes.json();
            return m.reply(`Gagal membuat repositori: ${err.message}`);
        }
        const quotedFile = await downloadMediaMessage(qmsg, "buffer", {}, { reuploadRequest: ganggaaa.reupload });
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
                return m.reply('File index.html tidak ditemukan dalam ZIP.');
            }
        } else {
            filesToUpload.push({ path: 'index.html', content: quotedFile.toString('base64') });
        }
        for (let file of filesToUpload) {
            await fetch(`https://api.github.com/repos/${global.githubUsername}/${repositoryName}/contents/${file.path}`, { method: 'PUT', headers, body: JSON.stringify({ message: `Initial commit: add ${file.path}`, content: file.content }) });
            await sleep(500);
        }
        await fetch(`https://api.github.com/repos/${global.githubUsername}/${repositoryName}/pages`, { method: 'POST', headers, body: JSON.stringify({ source: { branch: 'main', path: '/' } }) });
        m.reply(`✅ Deploy berhasil! Tunggu beberapa menit untuk aktivasi.\n\n🌐 URL: https://${global.githubUsername}.github.io/${repositoryName}`);
    } catch (error) {
        console.error('GitHub Deploy Error:', error);
        m.reply(`❌ Terjadi kesalahan saat deploy: ${error.message}`);
    }
}
break;
case 'vercel-deploy': {
    if (!isSellerWeb) return m.reply('Fitur Khusus `Reseller Website`');
    if (!text) return m.reply('Penggunaan: .vercel-deploy <namaWeb>\nReply file .zip atau .html');
    if (!m.quoted || !/zip|html/.test(mime)) return m.reply('Reply file .zip atau .html');
    const webName = text.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!global.vercelToken) return m.reply('Token Vercel belum di-setting.');
    await m.reply(`Mengunggah dan mendeploy file untuk *${webName}*...`);
    const quotedFile = await downloadMediaMessage(qmsg, "buffer", {}, { reuploadRequest: ganggaaa.reupload });
    const filesToUpload = [];
    try {
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
                return m.reply('File index.html tidak ditemukan dalam struktur ZIP.');
            }
        } else {
            filesToUpload.push({ file: 'index.html', data: quotedFile });
        }
        const headers = { Authorization: `Bearer ${global.vercelToken}`, 'Content-Type': 'application/json' };
        const deployRes = await fetch('https://api.vercel.com/v13/deployments', { method: 'POST', headers, body: JSON.stringify({ name: webName, files: filesToUpload.map(f => ({ file: f.file, data: f.data.toString('base64') })), projectSettings: { framework: null } }) });
        const deployData = await deployRes.json();
        if (!deployRes.ok || !deployData.url) {
            console.error('Deploy Error:', deployData);
            if (deployData.error?.code === 'project_name_already_exists') {
                 return m.reply(`❌ Nama project '${webName}' sudah digunakan di Vercel. Pilih nama lain.`);
            }
            return m.reply(`Gagal deploy ke Vercel:\n${deployData.error?.message || 'Error tidak diketahui'}`);
        }
        m.reply(`✅ Website berhasil dibuat!\n\n🌐 URL: https://${deployData.alias[0] || `${webName}.vercel.app`}`);
    } catch (error) {
        console.error(error);
        m.reply(`Terjadi kesalahan: ${error.message}`);
    }
}
break;
case 'listvercel': {
    if (!isSellerWeb) return m.reply('Anda tidak memiliki akses ke fitur ini');
    if (!global.vercelToken) return m.reply('Token Vercel belum di-setting.');
    await m.reply("Mengambil daftar project Vercel...");
    const headers = { Authorization: `Bearer ${global.vercelToken}` };
    const res = await fetch('https://api.vercel.com/v9/projects', { headers });
    const data = await res.json();
    if (!res.ok || !data.projects) return m.reply(`Gagal mengambil data: ${data.error?.message}`);
    if (data.projects.length === 0) return m.reply('Tidak ada website yang ditemukan.');
    let teks = '*🌐 Daftar Website Anda di Vercel:*\n\n';
    for (let proj of data.projects) {
        teks += `• *${proj.name}*\n  https://${proj.latestDeployments[0]?.alias[0] || proj.name + '.vercel.app'}\n`;
    }
    m.reply(teks);
}
break;
case 'delvercel': {
    if (!isSellerWeb) return m.reply('Anda tidak memiliki akses ke fitur ini');
    if (!text) return m.reply('Penggunaan: .delvercel <namaProject>');
    const webName = text.trim().toLowerCase();
    if (!global.vercelToken) return m.reply('Token Vercel belum di-setting.');
    await m.reply(`Mencoba menghapus *${webName}* dari Vercel...`);
    const headers = { Authorization: `Bearer ${global.vercelToken}` };
    try {
        const response = await fetch(`https://api.vercel.com/v9/projects/${webName}`, { method: 'DELETE', headers });
        if (response.status === 204) {
            return m.reply(`✅ Website *${webName}* berhasil dihapus.`);
        } else {
            const result = await response.json();
            return m.reply(`❌ Gagal menghapus:\n${result.error?.message || `Status: ${response.status}`}`);
        }
    } catch (err) {
        console.error(err);
        m.reply(`Terjadi kesalahan: ${err.message}`);
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

// Ganti case 'setmode' Anda yang lama dengan ini:
case 'setmode': {
    if (!isCreator) return reply(mess.owner);

    // Daftar tombol yang akan dikirim
    const buttons = [
        { buttonId: '.setmodenow teman', buttonText: { displayText: 'Teman' }, type: 1 },
        { buttonId: '.setmodenow asisten', buttonText: { displayText: 'Asisten' }, type: 1 },
        { buttonId: '.setmodenow pacar-biasa', buttonText: { displayText: 'Pacar Biasa' }, type: 1 },
        { buttonId: '.setmodenow pacar-tsundere', buttonText: { displayText: 'Pacar Tsundere' }, type: 1 },
        { buttonId: '.setmodenow pacar-yandere', buttonText: { displayText: 'Pacar Yandere' }, type: 1 }
    ];

    // Objek pesan yang berisi teks dan tombol
    const buttonMessage = {
        text: "Silakan pilih mode AI yang ingin Anda gunakan.",
        footer: 'Pilih salah satu tombol di bawah ini',
        buttons: buttons,
        headerType: 1
    };

    // Kirim pesan dengan tombol (ganti 'client.sendMessage' sesuai dengan fungsi di bot Anda)
    await g4nggaaa.sendMessage(from, buttonMessage);
}
break;

// Tambahkan case baru ini untuk menangani respons dari tombol
case 'setmodenow': {
    if (!isCreator) return reply(mess.owner);

    const availableModes = ['teman', 'asisten', 'pacar-biasa', 'pacar-tsundere', 'pacar-yandere'];
    const newMode = text.trim().toLowerCase();

    if (availableModes.includes(newMode)) {
        global.aiChatMode = newMode;
        reply(`✅ Mode AI berhasil diubah menjadi: *${newMode}*`);
    } else {
        // Balasan ini kemungkinan tidak akan pernah terkirim jika input hanya berasal dari tombol
        reply(`❌ Mode tidak ditemukan.`);
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

case 'spampair': {
    if (!isCreator) return reply(mess.owner);
    if (!text) return reply(`*Contoh:* ${prefix + command} 628xxxx|10`);
    let [target, count = 10] = text.split("|");
    target = target.replace(/[^0-9]/g, '').trim();
    count = parseInt(count);
    if (isNaN(count) || count <= 0) return reply("Jumlah spam harus berupa angka dan lebih dari 0.");
    await reply(`Memulai spam pairing code ke *${target}* sebanyak *${count}* kali...`);
    try {
        let { default: makeWaSocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
        const tempSessionPath = path.join(__dirname, 'session_spam');
        let { state } = await useMultiFileAuthState(tempSessionPath);
        let { version } = await fetchLatestBaileysVersion();
        let pino = require("pino");
        let spamSocket = makeWaSocket({ auth: state, version, logger: pino({ level: 'silent' }) });
        let successCount = 0;
        for (let i = 0; i < count; i++) {
            await sleep(2000);
            try {
                const code = await spamSocket.requestPairingCode(target);
                if (code) {
                    successCount++;
                    console.log(`Spam Pairing ke-${i+1} ke ${target} berhasil. Kode: ${code}`);
                }
            } catch (e) {
                console.log(`Gagal mengirim pairing code #${i+1} ke ${target}: ${e.message}`);
            }
        }
        reply(`✅ Selesai! Berhasil mengirim ${successCount} dari ${count} permintaan pairing code.`);
        spamSocket.ws.close();
        setTimeout(() => fs.rmSync(tempSessionPath, { recursive: true, force: true }), 5000);
    } catch (error) {
        console.error(error);
        reply("Terjadi error saat spam pairing code. Cek console log.");
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
