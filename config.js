/*
   Base by https://github.com/G4NGGAAA
   Credits: G4NGGAAA
   BOLEH AMBIL/RENAME
   ASAL JANGAN HAPUS CREDIT YAA 🎩🎩
*/

global.owner = ['6285855962331'];
global.saluran = 'https://example.com';
global.bot = "6285183131924"
global.namabot = "SiestaBot" 
global.namaown = "G4NGGAAA"
global.idch = "120363403378232838@newsleter"

//Token Github & Vercel
global.username_gh = 'Username GitHub'
global.token_gh = 'Token GitHub'
global.vercelToken = 'Token Vercel'

let fs = require('fs')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`Update ${__filename}`)
delete require.cache[file]
require(file)
})