/*
   Base by https://github.com/G4NGGAAA
   Credits: G4NGGAAA
   BOLEH AMBIL/RENAME
   ASAL JANGAN HAPUS CREDIT YAA 🎩🎩
*/

// --- JANGAN DIHAPUS
global.owner = ["6285855962331"]; // Ganti dengan nomor Owner
global.namabot = "AlyaBot";
global.namaown = "G4NGGAAA";
global.packname = "Sticker by";
global.author = "AlyaBot";

// --- PENGATURAN API & TOKEN
// Masukkan API Key Gemini Anda di sini
global.geminiKey = "AIzaSyA0hBOwI0b1MB_CWxdTaL73rBiOvCNaYLw"; 

// Token untuk fitur Web Development (Opsional)
global.githubUsername = 'G4NGGAAA'; 
global.githubToken = 'TOKEN_GITHUB_ANDA'; 
global.vercelToken = 'TOKEN_VERCEL_ANDA';

// --- PENGATURAN BOT (JANGAN DIUBAH JIKA TIDAK MENGERTI)
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