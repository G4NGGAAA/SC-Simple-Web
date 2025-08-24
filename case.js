/* 
   Base by https://github.com/G4NGGAAA
   Credits : G4NGGAAA
   BOLEH AMBIL/RENAME SCRIPT 
   ASAL JANGAN HAPUS CREDIT YAA 🎩🎩
*/

require('./config');
const fs = require('fs');
const util = require('util');
const os = require('os');
const { exec } = require("child_process");
const { performance } = require('perf_hooks');
const { downloadMediaMessage, downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = async (ganggaaa, m) => {
  try {
    const body = (
      (m.mtype === 'conversation' && m.message.conversation) ||
      (m.mtype === 'imageMessage' && m.message.imageMessage.caption) ||
      (m.mtype === 'documentMessage' && m.message.documentMessage.caption) ||
      (m.mtype === 'videoMessage' && m.message.videoMessage.caption) ||
      (m.mtype === 'extendedTextMessage' && m.message.extendedTextMessage.text) ||
      (m.mtype === 'buttonsResponseMessage' && m.message.buttonsResponseMessage.selectedButtonId) ||
      (m.mtype === 'templateButtonReplyMessage' && m.message.templateButtonReplyMessage.selectedId)
    ) || '';

    const budy = (typeof m.text === 'string') ? m.text : '';
    const prefixRegex = /^[°zZ#$@*+,.?=''():√%!¢£¥€π¤ΠΦ_&><`™©®Δ^βα~¦|/\\©^]/;
    const prefix = prefixRegex.test(body) ? body.match(prefixRegex)[0] : '.';
    const isCmd = body.startsWith(prefix);
    const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
    const args = body.trim().split(/ +/).slice(1);
    const text = q = args.join(" ");
    const sender = m.key.fromMe ? (ganggaaa.user.id.split(':')[0]+'@s.whatsapp.net' || ganggaaa.user.id) : (m.key.participant || m.key.remoteJid);
    const botNumber = await ganggaaa.decodeJid(ganggaaa.user.id);
    const senderNumber = sender.split('@')[0];
    const isCreator = (m && m.sender && [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)) || false;
    const swebnumber = JSON.parse(fs.readFileSync("./database/sellerweb.json"))
    const isSellerWeb = swebnumber.includes(senderNumber) || isBot
    const pushname = m.pushName || `${senderNumber}`;
    const isBot = botNumber.includes(senderNumber);
     
     //Group functions
    const groupMetadata = isGroup ? await ganggaaa.groupMetadata(m.chat).catch((e) => {}) : "";
    const groupOwner = isGroup ? groupMetadata.owner : "";
    const groupName = isGroup ? groupMetadata.subject : "";
    const participants = isGroup ? await groupMetadata.participants : "";
    const groupAdmins = isGroup ? await participants.filter((v) => v.admin !== null).map((v) => v.id) : "";
    const groupMembers = isGroup ? groupMetadata.participants : "";
    const isGroupAdmins = isGroup ? groupAdmins.includes(m.sender) : false;
    const isBotGroupAdmins = isGroup ? groupAdmins.includes(botNumber) : false;
    const isBotAdmins = isGroup ? groupAdmins.includes(botNumber) : false;
    const isAdmins = isGroup ? groupAdmins.includes(m.sender) : false;

    // Helper functions
    const reply = (text) => ganggaaa.sendMessage(m.chat, { text }, { quoted: m });
    const runtime = function(seconds) {
      seconds = Number(seconds);
      var d = Math.floor(seconds / (3600 * 24)); 
      var h = Math.floor(seconds % (3600 * 24) / 3600);
      var m = Math.floor(seconds % 3600 / 60);
      var s = Math.floor(seconds % 60);
      var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
      var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
      var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
      var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
      return dDisplay + hDisplay + mDisplay + sDisplay;
    };
    const formatp = function(bytes) {
      if (bytes == 0) return '0 Bytes';
      var k = 1024;
      var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      var i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    //~~~~~Fitur Case~~~~~//
    switch(command) {
      case 'menu':
      case 'ganggaa':
      case 'web': {
         await ganggaaa.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key } });

        // Default values jika global variable tidak ada
        const botName = global.namabot || 'SiestaBot';
        const ownerName = global.namaown || global.own || 'G4NGGAAA';
        const ownerNumber = global.owner ? global.owner[0] : '6285855962331';

        let uptime = runtime(process.uptime());

        let menuText = `*ʜᴀʟᴏ ${pushname}.*  
ɴᴀᴍᴀ ꜱᴀʏᴀ ᴀᴅᴀʟᴀʜ *${botName}*, ꜱᴀʏᴀ ᴀᴅᴀʟᴀʜ ᴀꜱɪꜱꜱᴛᴇɴ ʏᴀɴɢ ꜱɪᴀᴘ ᴍᴇʟᴀʏᴀɴɪ ᴋᴀᴍᴜ 24ᴊᴀᴍ

┏━⭓ *ʙᴏᴛ ɪɴғᴏ*
┃◦ ɴᴀᴍᴀ : *${botName}*
┃◦ ᴠᴇʀꜱɪ : *1.0.0*
┃◦ ᴛʏᴘᴇ : *ᴄᴀꜱᴇ*
┃◦ ᴍᴏᴅᴇ : *ꜱᴇʟғ*
┃◦ ʀᴜɴᴛɪᴍᴇ : *${uptime}*
┗━━━━━━━━━━━

┏━⭓ *ᴍᴇɴᴜ ᴘɪʟɪʜᴀɴ*
┃◦ ${prefix}createweb
┃◦ ${prefix}listweb
┃◦ ${prefix}gethtml
┃◦ ${prefix}github-deploy
┃◦ ${prefix}vercel-deploy
┃◦ ${prefix}listvercel
┃◦ ${prefix}delvercel
┗━━━━━━━━━━━

┏━⭓ *ᴍᴇɴᴜ ᴘɪʟɪʜᴀɴ*
┃◦ ${prefix}linkgc
┃◦ ${prefix}resetlinkgc
┃◦ ${prefix}closetime/opentime
┃◦ ${prefix}promote/demote
┃◦ ${prefix}setppgc/delppgc
┃◦ ${prefix}hidetag
┃◦ ${prefix}tagall
┃◦ ${prefix}totag
┃◦ ${prefix}kick
┗━━━━━━━━━━━

┏━⭓ *ᴍᴇɴᴜ ᴏᴡɴᴇʀ*
┃◦ ${prefix}uptokengithub
┃◦ ${prefix}uptokenvercel
┃◦ ${prefix}addsellerweb
┃◦ ${prefix}delsellerweb
┗━━━━━━━━━━━


✘ ᴄʀᴇᴀᴛᴏʀ: *${ownerName}*
✘ ɴᴏᴍᴏʀ: *${ownerNumber}*
ᴊɪᴋᴀ ᴀᴅᴀ ᴍᴀꜱᴀʟᴀʜ, ꜱɪʟᴀᴋᴀɴ ᴋᴇᴛɪᴋ *.ᴏᴡɴᴇʀ*`;

        await ganggaaa.sendMessage(m.chat, {
          text: menuText,
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            externalAdReply: {
              title: `${botName}`,
              body: `${ownerNumber}`,
              thumbnail: fs.readFileSync('./database/g4nggaa.jpg'), 
              sourceUrl: `https://whatsapp.com/channel/0029VbAPj3U1Hsq2RJSlef2a`,
              mediaType: 1,
              renderLargerThumbnail: true,
              mentionedJid: [m.sender]
            }
          }
        }, { quoted: m });
      }
      break;

//════════════════════════════════════════════════//
case 'scweb':
case 'gethtml': {
    if (!isCreator && !isSellerWeb) return m.reply('❌ Hanya Creator yang bisa menggunakan fitur ini');
    if (!text) return m.reply(`Contoh: ${prefix + command} https://example.com`);

    try {
        let res = await fetch(text);
        if (!res.ok) return m.reply('❌ Gagal mengambil data dari URL tersebut');
        let html = await res.text();

        const filePath = path.join(__dirname, './temp/html_dump.html');
        fs.writeFileSync(filePath, html);

        await ganggaaa.sendMessage(m.chat, {
            document: fs.readFileSync(filePath),
            mimetype: 'text/html',
            fileName: 'source.html'
        }, { quoted: m });

        fs.unlinkSync(filePath); // hapus setelah terkirim
    } catch (e) {
        console.error(e);
        m.reply('❌ Terjadi kesalahan saat mengambil HTML\n'+e.message);
    }
}
break;

    case 'createweb': {
  if (!text.includes('|')) return m.reply(`Contoh: .createweb store|tokoku`)
  const [webTypeRaw, webNameRaw] = text.split('|')
  const webType = webTypeRaw.trim().toLowerCase()
  const webName = webNameRaw.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '')

  const setweb = JSON.parse(fs.readFileSync('./database/setweb.json'))
  const userConfig = setweb.find(x => x.id === m.sender)
  if (!userConfig || !userConfig[webType]) return m.reply(`Kamu belum mengatur konfigurasi untuk website '${webType}'.\nGunakan .settingsweb terlebih dahulu.`)

  const templatePath = `./template/${webType}.html`
  if (!fs.existsSync(templatePath)) return m.reply(`Template ${webType}.html tidak ditemukan.`)

  const projectName = webName // nama project dan subdomain yang diinginkan
  const headers = {
    Authorization: `Bearer ${global.vercelToken}`,
    'Content-Type': 'application/json'
  }

  // Cek apakah project dengan nama ini sudah ada di akun Vercel Anda
  const checkProject = await fetch(`https://api.vercel.com/v10/projects?search=${projectName}`, {
    method: 'GET',
    headers
  })
  const projectList = await checkProject.json().catch(() => null)

  if (projectList && projectList.projects && projectList.projects.find(p => p.name === projectName)) {
    return m.reply(`❌ Nama project '${projectName}' sudah digunakan di akun Vercel Anda. Pilih nama lain.`)
  }

  // Jika belum ada, lanjutkan baca template dan deploy
  let html = fs.readFileSync(templatePath, 'utf8')
  const config = userConfig[webType]
  for (const key in config) {
    html = html.replaceAll(key, config[key])
  }

  // Buat project baru di Vercel
  await fetch('https://api.vercel.com/v9/projects', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: projectName })
  }).catch(() => {})

  const files = [{
    file: 'index.html',
    data: Buffer.from(html).toString('base64'),
    encoding: 'base64'
  }]

  const deploy = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: projectName,
      project: projectName,
      files,
      projectSettings: { framework: null }
    })
  })

  const result = await deploy.json().catch(() => null)
  if (!result || !result.url) return m.reply(`Gagal deploy: ${JSON.stringify(result)}`)

  m.reply(`✅ Website berhasil dibuat!\n\n🌐 https://${projectName}.vercel.app`)
}

case "listweb": {
  if (!isCreator && !isSellerWeb) return m.reply("Khusus Owner atau Seller Web!");

  
  let path = './template';

  let files;
  try {
    files = fs.readdirSync(path).filter(file => file.endsWith('.html'));
  } catch (e) {
    return m.reply("Folder template tidak ditemukan atau gagal dibaca.");
  }

  if (files.length === 0) return m.reply("Belum ada file web yang tersedia di folder template.");

  const listNama = files.map(f => f.replace('.html', '')).join('\n- ');
  m.reply(`*Daftar Template Web Tersedia:*\n\n- ${listNama}`);
}
break;

case 'github-deploy':
case 'dgithub': {
if (!isSellerWeb && !isCreator) return m.reply('❗ *Anda Tidak memiliki Akses Ke fitur ini.')
  if (!text) return m.reply('Penggunaan: .github-deploy <namaWeb>')
  if (!qmsg || !/html/.test(qmsg.mimetype)) return m.reply('Reply file .html')

  const webName = text.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '')
  const repositoryName = `${webName}-website` // Nama repositori yang akan dibuat

  // 1. Membuat repositori di GitHub jika belum ada
  const githubApiUrl = 'https://api.github.com/user/repos'
  const headers = {
    Authorization: `token ${global.githubToken}`,
    'Content-Type': 'application/json',
  }
  
  const createRepoPayload = {
    name: repositoryName,
    private: false, // Pilih private atau public sesuai kebutuhan Anda
    auto_init: true, // Inisialisasi repositori dengan README
    gitignore_template: 'Node' // Sesuaikan template jika perlu
  }

  try {
    // Cek apakah repositori sudah ada
    const repoRes = await fetch(githubApiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(createRepoPayload),
    })

    if (repoRes.status === 422) {
      return m.reply(`❌ Repositori dengan nama *${repositoryName}* sudah ada.`)
    }

    const repoData = await repoRes.json()

    // 2. Download file dari message yang di-reply
    const quotedFile = await ganggaaa.downloadMediaMessage(qmsg)
    const filesToUpload = []

    // 3. Menangani file ZIP dan HTML
    if (qmsg.mimetype.includes('zip')) {
      const unzipper = require('unzipper')
      const zipBuffer = Buffer.from(quotedFile)
      const directory = await unzipper.Open.buffer(zipBuffer)

      for (const file of directory.files) {
        if (file.type === 'File') {
          const content = await file.buffer()
          const filePath = file.path.replace(/^\/+/, '').replace(/\\/g, '/')
          filesToUpload.push({
            file: filePath,
            data: content.toString('base64'),
            encoding: 'base64'
          })
        }
      }

      if (!filesToUpload.some(x => x.file.toLowerCase().endsWith('index.html'))) {
        return m.reply('File index.html tidak ditemukan dalam struktur ZIP.')
      }

    } else if (qmsg.mimetype.includes('html')) {
      filesToUpload.push({
        file: 'index.html',
        data: Buffer.from(quotedFile).toString('base64'),
        encoding: 'base64'
      })
    } else {
      return m.reply('File tidak dikenali. Kirim file .zip atau .html.')
    }

    // 4. Menambahkan file ke repositori GitHub
    const githubRepoUrl = `https://api.github.com/repos/${global.githubUsername}/${repositoryName}/contents`
    for (let file of filesToUpload) {
      const fileUrl = `${githubRepoUrl}/${file.file}`
      await fetch(fileUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: `Add ${file.file}`,
          content: file.data,
        }),
      }).catch(() => {
        return m.reply(`❌ Gagal mengunggah file ${file.file} ke GitHub.`)
      })
    }

    // 5. Mengaktifkan GitHub Pages
    const enablePagesUrl = `https://api.github.com/repos/${global.githubUsername}/${repositoryName}/pages`
    await fetch(enablePagesUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        source: {
          branch: 'main',
          path: '/',
        }
      })
    })

    m.reply(`✅ Website berhasil dibuat di GitHub Pages!\n\n🌐 URL: https://${global.githubUsername}.github.io/${repositoryName}`)

  } catch (error) {
    console.log('Error:', error)
    m.reply(`❌ Terjadi kesalahan saat deploy ke GitHub Pages.`)
  }
}
break;

case 'dvercel':
case 'vercel-deploy': {
  if (!isCreator && !isSellerWeb) return m.reply('Fitur Khusus `Reseller Website`')
  if (!text) return m.reply('Penggunaan: .vercel-deploy <namaWeb>')
  if (!qmsg || !/zip|html/.test(qmsg.mimetype)) return m.reply('Reply file .zip atau .html')

  const webName = text.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '')
  const domainCheckUrl = `https://${webName}.vercel.app`

  try {
    const check = await fetch(domainCheckUrl)
    if (check.status === 200) return m.reply(`❌ Nama web *${webName}* sudah digunakan. Silakan gunakan nama lain.`)
  } catch (e) {}

  const quotedFile = await ganggaaa.downloadMediaMessage(qmsg)
  const filesToUpload = []

  if (qmsg.mimetype.includes('zip')) {
    const unzipper = require('unzipper')
    const zipBuffer = Buffer.from(quotedFile)
    const directory = await unzipper.Open.buffer(zipBuffer)

    for (const file of directory.files) {
      if (file.type === 'File') {
        const content = await file.buffer()
        const filePath = file.path.replace(/^\/+/, '').replace(/\\/g, '/')
        filesToUpload.push({
          file: filePath,
          data: content.toString('base64'),
          encoding: 'base64'
        })
      }
    }

    if (!filesToUpload.some(x => x.file.toLowerCase().endsWith('index.html'))) {
      return m.reply('File index.html tidak ditemukan dalam struktur ZIP.')
    }

  } else if (qmsg.mimetype.includes('html')) {
    filesToUpload.push({
      file: 'index.html',
      data: Buffer.from(quotedFile).toString('base64'),
      encoding: 'base64'
    })
  } else {
    return m.reply('File tidak dikenali. Kirim file .zip atau .html.')
  }

  const headers = {
    Authorization: `Bearer ${global.vercelToken}`,
    'Content-Type': 'application/json'
  }

  await fetch('https://api.vercel.com/v9/projects', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: webName })
  }).catch(() => {})

  const deployRes = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: webName,
      project: webName,
      files: filesToUpload,
      projectSettings: { framework: null }
    })
  })

  const deployData = await deployRes.json().catch(() => null)
  if (!deployData || !deployData.url) {
    console.log('Deploy Error:', deployData)
    return m.reply(`Gagal deploy ke Vercel:\n${JSON.stringify(deployData)}`)
  }

  m.reply(`✅ Website berhasil dibuat!\n\n🌐 URL: https://${webName}.vercel.app`)
}
break;

case 'listvercel': {
if (!isCreator && !isSellerWeb) return m.reply('Anda tidak memiliki akses ke fitur ini')
  const headers = {
    Authorization: `Bearer ${global.vercelToken}`
  }

  const res = await fetch('https://api.vercel.com/v9/projects', { headers })
  const data = await res.json()

  if (!data.projects || data.projects.length === 0) return m.reply('Tidak ada website yang ditemukan.')

  let teks = '*🌐 Daftar Website Anda:*\n\n'
  for (let proj of data.projects) {
    teks += `• ${proj.name} → https://${proj.name}.vercel.app\n`
  }

  m.reply(teks)
}
break;

case 'delvercel': {
if (!isCreator && !isSellerWeb) return m.reply('Anda tidak memiliki akses ke fitur ini');
  if (!text) return m.reply('Penggunaan: .delvercel <namaDeploy>')
  const webName = text.trim().toLowerCase()

  const headers = {
    Authorization: `Bearer ${global.vercelToken}`
  }

  try {
    const response = await fetch(`https://api.vercel.com/v9/projects/${webName}`, {
      method: 'DELETE',
      headers
    })

    if (response.status === 200 || response.status === 204) {
      return m.reply(`✅ Website *${webName}* berhasil dihapus dari Vercel.`)
    } else if (response.status === 404) {
      return m.reply(`⚠️ Website *${webName}* tidak ditemukan di akun Vercel kamu.`)
    } else if (response.status === 403 || response.status === 401) {
      return m.reply(`⛔ Token Vercel tidak valid atau tidak punya akses ke project ini.`)
    } else {
      let result = {}
      try {
        result = await response.json()
      } catch (e) {}
      return m.reply(`❌ Gagal menghapus website:\n${result.error?.message || 'Tidak diketahui'}`)
    }

  } catch (err) {
    console.error(err)
    m.reply(`Terjadi kesalahan saat mencoba menghapus:\n${err.message}`)
  }
}
break;

      case 'uptokengithub': {
  if (!isCreator) {
    ganggaaa.reply("*Fitur ini hanya untuk Creator.*");
  }

  const args = text.split('|').map(a => a.trim());
  if (args.length < 2) {
    ganggaaa.reply("❌ Format salah!\n\nGunakan:\n/uptokengithub <usernameGithub>|<tokenGithub>\n\nContoh:\n/uptokengithub ErizaOffc|ghp_abcdefghj");
  }

  const [usernameGH, tokenGH] = args;
  const filePath = './config.js';

  if (!fs.existsSync(filePath)) {
    ganggaaa.reply("❌ File config.js tidak ditemukan.");
  }

  try {
    let isi = fs.readFileSync(filePath, 'utf-8');

    if (!isi.includes("global.username_gh") || !isi.includes("global.token_gh")) {
      ganggaaa.reply("❌ global.githubUser atau global.githubToken tidak ditemukan di config.js.");
    }

    isi = isi
      .replace(/global\.username_gh\s*=\s*["'][^"']*["']/, `global.username_gh = '${usernameGH}'`)
      .replace(/global\.token_gh\s*=\s*["'][^"']*["']/, `global.token_gh = '${tokenGH}'`);

    fs.writeFileSync(filePath, isi, 'utf-8');

    ganggaaa.reply(`✅ *Token GitHub berhasil diupdate!*\n\n*Username:* ${usernameGH}\n*Token:* ${tokenGH}`);
  } catch (err) {
    console.error(err);
    ganggaaa.reply(`❌ Terjadi kesalahan:\n${err.message}`);
  }
}
break;

case 'uptokenvercel': {
  if (!isCreator) {
    ganggaaa.reply("🥢 Fitur ini hanya untuk Creator.");
  }

  const tokenBaru = text.trim();
  if (!tokenBaru || tokenBaru.length < 5) {
    ganggaaa.reply("❌ Format salah!\n\nGunakan:\n/uptokenvercel <Token>\n\nContoh:\n/uptokenvercel abcdEfghIj");
  }

  const filePath = './config.js';
  if (!fs.existsSync(filePath)) {
    ganggaaa.reply("❌ File config.js tidak ditemukan.");
  }

  try {
    let isi = fs.readFileSync(filePath, 'utf-8');
    if (!isi.includes("global.vercelToken")) {
      ganggaaa.reply("❌ global.vercelToken tidak ditemukan di dalam config.js.");
      break;
    }

    isi = isi.replace(/global\.vercelToken\s*=\s*["'][^"']*["']/, `global.vercelToken = '${tokenBaru}'`);
    fs.writeFileSync(filePath, isi, 'utf-8');

    ganggaaa.reply(`✅ *Berhasil update token Vercel!*\n\n*Token baru:* ${tokenBaru}`);
  } catch (err) {
    console.error(err);
    ganggaaa.reply(`❌ Gagal memperbarui token:\n${err.message}`);
  }
}
break;
//════════════════════════════════════════════════//
case'dor': case "kick": case "kik": {
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (!isGroup) return reply(mess.group);
if (!isBotAdmins) return reply(mess.botadmin)
if (text || m.quoted) {
const input = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" : false
var onWa = await ganggaaa.onWhatsApp(input.split("@")[0])
if (onWa.length < 1) return m.reply("Nomor tidak terdaftar di whatsapp")
const res = await ganggaaa.groupParticipantsUpdate(m.chat, [input], 'remove')
await m.reply(`Berhasil mengeluarkan ${input.split("@")[0]} dari grup ini`)
} else {
return m.reply("@tag/reply")
}
}

break;
case "linkgc": {
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (!isGroup) return reply(mess.group);
if (!isBotAdmins) return reply(mess.botadmin)
const urlGrup = "https://chat.whatsapp.com/" + await ganggaaa.groupInviteCode(m.chat)
var teks = `
${urlGrup}
`
await ganggaaa.sendMessage(m.chat, {text: teks, matchedText: `${urlGrup}`}, {quoted: m})
}

break;
case "resetlinkgc": {
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (!isGroup) return reply(mess.group);
if (!isBotAdmins) return reply(mess.botadmin)
await ganggaaa.groupRevokeInvite(m.chat)
m.reply("Berhasil mereset link grup ✅")
}

break;
case "totag":{
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (!isGroup) return reply(mess.group);
 let users = participants.map(u => u.id).filter(v => v !== ganggaaa.user.jid)
 if (!m.quoted) return reply(`✳️ Reply to a message`)
 ganggaaa.sendMessage(m.chat, { forward: m.quoted.fakeObj, mentions: users } )
}
break;
case 'closetime':
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (!isGroup) return reply(mess.group);
if (!isBotAdmins) return reply(mess.botadmin)
if (args[1]=="detik") {var timer = args[0]*`1000`
} else if (args[1]=="menit") {var timer = args[0]*`60000`
} else if (args[1]=="jam") {var timer = args[0]*`3600000`
} else if (args[1]=="hari") {var timer = args[0]*`86400000`
} else {return reply("*pilih:*\ndetik\nmenit\njam\n\n*contoh*\n10 detik")}
 reply(`Close time ${q} dimulai dari sekarang`)
setTimeout( () => {
const close = `*Tepat waktu* grup ditutup oleh admin\nsekarang hanya admin yang dapat mengirim pesan`
ganggaaa.groupSettingUpdate(from, 'announcement')
reply(close)
}, timer)
break;

case "opentime": {
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (!isGroup) return reply(mess.group);
if (!isBotAdmins) return reply(mess.botadmin)
if (args[1] == 'detik') {
var timer = args[0] * `1000`
} else if (args[1] == 'menit') {
var timer = args[0] * `60000`
} else if (args[1] == 'jam') {
var timer = args[0] * `3600000`
} else if (args[1] == 'hari') {
var timer = args[0] * `86400000`
} else {
return reply('*pilih:*\ndetik\nmenit\njam\n\n*contoh*\n10 detik')
}
reply(`Open Time ${q} Dimulai Dari Sekarang`)
setTimeout(() => {
const nomor = m.participant
const open = `*Tepat Waktu* Grup Dibuka Oleh Admin\nSekarang Member Dapat Mengirim Pesan`
ganggaaa.groupSettingUpdate(m.chat, 'not_announcement')
reply(open)
}, timer)
}

break;

case "closegc": case "close": 
case "opengc": case "open": {
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (!isGroup) return reply(mess.group);
if (!isBotAdmins) return reply(mess.botadmin)
m.reply(`.${command}time 1 detik`)
}
break;
case "demote":
case "promote": {
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (!isGroup) return reply(mess.group);
if (!isBotAdmins) return reply(mess.botadmin)
if (m.quoted || text) {
var action
let target = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '')+'@s.whatsapp.net'
if (/demote/.test(command)) action = "Demote"
if (/promote/.test(command)) action = "Promote"
await ganggaaa.groupParticipantsUpdate(m.chat, [target], action.toLowerCase()).then(async () => {
await ganggaaa.sendMessage(m.chat, {text: `Sukses ${action.toLowerCase()} @${target.split("@")[0]}`, mentions: [target]}, {quoted: m})
})
} else {
return m.reply("@tag/6285###")
}
}

break;
case 'delppgc':{
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (!isGroup) return reply(mess.group);
if (!isBotAdmins) return reply(mess.botadmin)
await ganggaaa.removeProfilePicture(from)
}
break;
case 'setppgc':
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (!isGroup) return reply(mess.group);
if (!isBotAdmins) return reply(mess.botadmin)
if (!/image/.test(mime)) return reply(`Send/Reply Image Caption Caption ${prefix + command}`)
if (/webp/.test(mime)) return reply(`Kirim/Balas Gambar Dengan Caption ${prefix + command}`)
var medis = await ganggaaa.downloadAndSaveMediaMessage(quoted, 'ppbot.jpeg')
if (text == 'full') {
var {
img
} = await generateProfilePicture(medis)
await ganggaaa.query({
tag: 'iq',
attrs: {
to: m.chat,
type: 'set',
xmlns: 'w:profile:picture'
},
content: [{
tag: 'picture',
attrs: {
type: 'image'
},
content: img
}]
})
fs.unlinkSync(medis)
reply(mess.done)
} else {
var memeg = await ganggaaa.updateProfilePicture(m.chat, {
url: medis
})
fs.unlinkSync(medis)
reply(mess.done)
}

break;
case 'tagall':{
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (!isGroup) return reply(mess.group);
const textMessage = args.join(" ") || "nothing";
let teks = `tagall message :\n> *${textMessage}*\n\n`;
const groupMetadata = await ganggaaa.groupMetadata(m.chat);
const participants = groupMetadata.participants;
for (let mem of participants) {
teks += `@${mem.id.split("@")[0]}\n`;
}
ganggaaa.sendMessage(m.chat, {
text: teks,
mentions: participants.map((a) => a.id)
}, { quoted: m });
}
break;         
case "h":
case "hidetag": {
if (!isGroupAdmins && !isOwner) return reply(mess.admin)
if (!isGroup) return reply(mess.group);
if (m.quoted) {
ganggaaa.sendMessage(m.chat, {
forward: m.quoted.fakeObj,
mentions: participants.map(a => a.id)
})
}
if (!m.quoted) {
ganggaaa.sendMessage(m.chat, {
text: q ? q : '',
mentions: participants.map(a => a.id)
}, { quoted: m })
}
}
break;

//════════════════════════════════════════════════//
case "addsellerweb": { 
    if (!isCreator) return reply("❗ *Access Denied*\nFitur Only `Owner`")
    // Ketika Ada Orang Lain/ Selain Owner Yang Mengetik Command Ini Maka Bot Tidak Akan Merespon Walau Menggunakan Mode Public Dan Ini Akan Mengurangi Spam
    if (!args[0]) return reply(`Penggunaan ${prefix+command} nomor\nContoh ${prefix+command} 6285659202292`)
   let prrkek = q.split("|")[0].replace(/[^0-9]/g, '')
    let ceknya = await kxz.onWhatsApp(prrkek) // Mengecek Apkah Nomor ${prrkek} Terdaftar Di WhatsApp 
    if (ceknya.length == 0) return reply(`Masukkan Nomor Yang Valid Dan Terdaftar Di WhatsApp!!!`)
    swebnumber.push(prrkek)
    fs.writeFileSync("./database/sellerweb.json", JSON.stringify(swebnumber))
    m.reply(`Successfully Added ${prrkek} To Seller Web`)
}
break;

case "delsellerweb": {
    if (!isCreator) return reply("❗ *Access Denied*\nFitur Only `Owner`")
    // Ketika Ada Orang Lain/ Selain Owner Yang Mengetik Command Ini Maka Bot Tidak Akan Merespon Walau Menggunakan Mode Public Dan Ini Akan Mengurangi Spam
    if (!args[0]) return reply(`Penggunaan ${prefix+command} nomor\nContoh ${prefix+command} 6285659202292`)
    let ya = q.split("|")[0].replace(/[^0-9]/g, '') + `@s.whatsapp.net`
    let unp = swebnumber.indexOf(ya)
    swebnumber.splice(unp, 1)
    fs.writeFileSync("./database/sellerweb.json", JSON.stringify(swebnumber))
    m.reply(`Successfully Removed ${ya} From Seller Web`)
}
break;

case "listsellerweb": {
  if (!isCreator) return reply("❗ *Access Denied*\nFitur Only `Owner`")
  let data = fs.readFileSync("./database/sellerweb.json", 'utf8')
  let json = JSON.parse(data)
  let tekt = "List of Seller Web:\n"
  json.forEach((item, index) => {
    tekt += `\`${index + 1}. ${item.replace(/@s\.whatsapp\.net/g, '')}\`\n`
  })
  m.reply(tekt)
}
break;
//════════════════════════════════════════════════//
      case 'ping':
      case 'botstatus':
      case 'statusbot': {
        const used = process.memoryUsage();
        const cpus = os.cpus().map(cpu => {
          cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0);
          return cpu;
        });

        const cpu = cpus.reduce((last, cpu, _, { length }) => {
          last.total += cpu.total;
          last.speed += cpu.speed / length;
          last.times.user += cpu.times.user;
          last.times.nice += cpu.times.nice;
          last.times.sys += cpu.times.sys;
          last.times.idle += cpu.times.idle;
          last.times.irq += cpu.times.irq;
          return last;
        }, {
          speed: 0,
          total: 0,
          times: {
            user: 0,
            nice: 0,
            sys: 0,
            idle: 0,
            irq: 0
          }
        });

        let old = performance.now();
        let neww = performance.now();
        let latensi = neww - old;

        let teks = `*˗ˏˋ 𝗛𝗲𝗶𝗶𝗶 ${pushname}~ ˎˊ˗*
𝗚𝗶𝗺𝗮𝗻𝗮 𝗸𝗮𝗯𝗮𝗿𝗻𝘆𝗮𝗮? 𝗦𝗲𝗺𝗼𝗴𝗮 𝗯𝗮𝗶𝗸-𝗯𝗮𝗶𝗸 𝗮𝗷𝗰 𝘆𝗮𝗮~  
𝗞𝗼𝗸 𝘁𝗶𝗯𝗮-𝘁𝗶𝗯𝗮 𝗻𝗴𝗲𝘁𝗶𝗸 *${prefix}ping* 𝘀𝗶𝗶?  
𝗣𝗲𝗻𝗴𝗲𝗻 𝗽𝗲𝗿𝗵𝗮𝘁𝗶𝗮?? 𝗱𝗮𝗿𝗶 𝗮𝗸𝘂 𝘆𝗮?

*✦ 𝗕𝗢𝗧 𝗦𝗬𝗦𝗧𝗘𝗠 𝗦𝗧𝗔𝗧𝗨𝗦 ✦*

✧ 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲 𝗧𝗶𝗺𝗲 : *${latensi.toFixed(4)} 𝘀𝗲𝗰*  
✧ 𝗨𝗽𝘁𝗶𝗺𝗲        : *${runtime(process.uptime())}*  
  𝗔𝗸𝘂 𝘂𝗱𝗮𝗵 𝗵𝗶𝗱𝘂𝗽 𝘀𝗲𝗹𝗮𝗺𝗮 𝗶𝘁𝘂 𝗹𝗼𝗵𝗵

*✦ 𝗦𝗘𝗥𝗩𝗘𝗥 𝗣𝗘𝗥𝗙𝗢𝗥𝗠𝗔𝗡𝗖𝗘 ✦*

✧ 𝗥𝗔𝗠 𝗨𝘀𝗲𝗱      : *${formatp(os.totalmem() - os.freemem())} / ${formatp(os.totalmem())}*  
✧ 𝗖𝗣𝗨 𝗠𝗼𝗱𝗲𝗹     : *${cpus[0].model.trim()}*  
✧ 𝗖𝗣𝗨 𝗦𝗽𝗲𝗲𝗱     : *${cpu.speed.toFixed(2)} 𝗠𝗛𝘇*  
  𝗘𝗵 𝗶𝗻𝗶 𝗸𝗲𝗻𝗰𝗮𝗻𝗴 𝗲𝗻𝗴𝗴𝗮 𝘀𝗶𝗵?  
✧ 𝗖𝗣𝗨 𝗖𝗼𝗿𝗲𝘀     : *${cpus.length} 𝗰𝗼𝗿𝗲(𝘀)*  

*✦ 𝗖𝗣𝗨 𝗨𝗧𝗜𝗟𝗜𝗭𝗔𝗧𝗜𝗢𝗡 ✦*

${Object.keys(cpu.times).map(type => `✧ ${type.toLowerCase().padEnd(6)} : *${(100 * cpu.times[type] / cpu.total).toFixed(2)}%*`).join('\n')}

> 𝗗𝗶𝗸𝗲𝗿𝗷𝗮𝗶𝗻 𝗱𝗲𝗻𝗴𝗮𝗻 𝘀𝗮𝘆𝗮𝗻𝗴 𝗱𝗮𝗿𝗶 𝗯𝗼𝘁 𝗺𝘂~
`.trim();

        await ganggaaa.sendMessage(m.chat, { text: teks }, { quoted: m });
        break;
      }
      
      case 'getpp': {
        let userss = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        
        // Jika tidak ada user yang disebutkan/dibalas, gunakan sender
        if (!userss || userss === '@s.whatsapp.net') {
            userss = m.sender;
        }
        
        let ghosst = userss;
        try {
            var ppuser = await ganggaaa.profilePictureUrl(ghosst, 'image');
        } catch (err) {
            var ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60';
        }
        
        ganggaaa.sendMessage(m.chat, { 
            image: { url: ppuser },
            caption: `Profile picture dari @${ghosst.split('@')[0]}`,
            mentions: [ghosst]
        }, { quoted: m });
      }
      break;
      
      case '🐦':
      case 'rvo':
      case 'readviewonce': {
        if (!m.quoted) return reply("Balas pesan view once dengan command ini");
        
        let msg = m.quoted.message;
        let type = Object.keys(msg)[0];
        if (!msg[type].viewOnce) return reply("Pesan itu bukan viewonce!");
        
        try {
          let media = await downloadContentFromMessage(msg[type], type == 'imageMessage' ? 'image' : type == 'videoMessage' ? 'video' : 'audio');
          let buffer = Buffer.from([]);
          for await (const chunk of media) {
            buffer = Buffer.concat([buffer, chunk]);
          }
          
          if (/video/.test(type)) {
            return ganggaaa.sendMessage(m.chat, {video: buffer, caption: msg[type].caption || ""}, {quoted: m});
          } else if (/image/.test(type)) {
            return ganggaaa.sendMessage(m.chat, {image: buffer, caption: msg[type].caption || ""}, {quoted: m});
          } else if (/audio/.test(type)) {
            return ganggaaa.sendMessage(m.chat, {audio: buffer, mimetype: "audio/mpeg", ptt: true}, {quoted: m});
          }
        } catch (error) {
          console.error(error);
          reply("Terjadi error saat memproses view once");
        }
      }
      break;

      case 'getsw':
      case 'ambilsw':
      case 'sw': {
        if (m.isGroup) return reply("❌ command ini cuma bisa di chat pribadi yaa~");

        const quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) return reply("📌 balas status gambar/video yang mau diambil dong~");

        try {
          if (quotedMsg.imageMessage) {
            const img = await downloadMediaMessage({ message: { imageMessage: quotedMsg.imageMessage } }, "buffer", {}, { reuploadRequest: ganggaaa });
            return ganggaaa.sendMessage(m.chat, { image: img, caption: "nih statusnyaa~ 🖼️" }, { quoted: m });
          }

          if (quotedMsg.videoMessage) {
            const vid = await downloadMediaMessage({ message: { videoMessage: quotedMsg.videoMessage } }, "buffer", {}, { reuploadRequest: ganggaaa });
            return ganggaaa.sendMessage(m.chat, { video: vid, caption: "nih status videonyaa~ 🎥" }, { quoted: m });
          }

          return reply("❌ cuma bisa ambil gambar atau video aja yaa 😿");
        } catch (e) {
          console.error(e);
          reply("ada error pas ambil statusnyaa 😿");
        }
        break;
      }

      case 'spam-pairing': 
      case 'spampair': {
        if (!text) return reply(`*Example:* ${prefix + command} +628xxxxxx|150`);
        
        reply("Tunggu sebentar...");
        let [peenis, pepekk = "200"] = text.split("|");
        let target = peenis.replace(/[^0-9]/g, '').trim();
        
        // Hanya untuk owner bot
        if (!isCreator) return reply("Perintah ini hanya untuk owner bot");
        
        try {
          let { default: makeWaSocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
          let { state } = await useMultiFileAuthState('pepek');
          let { version } = await fetchLatestBaileysVersion();
          let pino = require("pino");
          let sucked = await makeWaSocket({ auth: state, version, logger: pino({ level: 'fatal' }) });
          
          let prc;
          for (let i = 0; i < pepekk; i++) {
            await sleep(1500);
            prc = await sucked.requestPairingCode(target);
            console.log(`_Succes Spam Pairing Code - Number : ${target} - Code : ${prc}_`);
          }
          
          await sleep(15000);
          reply(`Spam pairing code selesai. Kode terakhir: ${prc}`);
        } catch (error) {
          console.error(error);
          reply("Terjadi error saat melakukan spam pairing code");
        }
        break;

      default:
        // Do nothing for unhandled commands
    }
  } catch (err) {
    console.log(util.format(err));
  }
};

//~~~~~Status Diperbarui~~~~~//
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(`Update ${__filename}`);
  delete require.cache[file];
  require(file);
});
