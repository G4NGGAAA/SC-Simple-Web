/*
   Base by https://github.com/G4NGGAAA
   Credits: G4NGGAAA
   BOLEH AMBIL/RENAME
   ASAL JANGAN HAPUS CREDIT YAA 🎩🎩
*/

//Owner Settings
global.owner = ["6285855962331"]; // Ganti dengan nomor Owner
global.namabot = "AlyaBot";
global.namaown = "G4NGGAAA";
global.packname = "Sticker by";
global.author = "AlyaBot";

//Bot Settings
global.BOT_NUMBER = '628xxxxxxxxxx';
global.BOT_NAME = 'Alya-Bot';

// --- PENGATURAN API & TOKEN
// Masukkan API Key Gemini Anda di sini
global.geminiKey = "IS SENDIR"; 

// Token untuk fitur Web Development (Opsional)
global.githubUsername = 'G4NGGAAA'; 
global.githubToken = 'TOKEN_GITHUB_ANDA'; 
global.vercelToken = 'TOKEN_VERCEL_ANDA';

// --- PENGATURAN BOT (JANGAN DIUBAH JIKA TIDAK MENGERTI)
// Konfigurasi delay untuk menghindari spam (dalam milidetik)
global.MIN_DELAY_MS = 500;
global.MAX_DELAY_MS = 1500;
global.prefix = '.';
global.aiChatEnabled = false; // Status default fitur AI
global.aiChatMode = 'pacar-tsundere'; // Mode kepribadian default AI
global.conversationHistory = {}; // Jangan diubah, untuk menyimpan riwayat chat AI

let fs = require('fs')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update ${__filename}`)
delete require.cache[file]
require(file)
})
