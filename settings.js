const chalk = require("chalk");
const fs = require("fs");

//########### BOT SETTING ###########//
global.owner = "6283122028438"
global.namaOwner = "Jeeyhosting⚡"
global.wa = "https://wa.me/6283122028438"
global.telegram = "https://t.me/Jeeyhosting"
global.thumbnail = "https://files.catbox.moe/6ju5n3.jpg"
// ==================== NOKOS CONFIG ====================
global.apiRumahOTP = "otp_YLOvdUvCMMVjlAVr" // API RumahOTP
global.UNTUNG_NOKOS = 1000 // Keuntungan per transaksi nokos
global.UNTUNG_DEPOSIT = 500 // Fee deposit QRIS
//####### PUSHKONTAK SETTING ########//
global.JedaPushkontak = 10000
global.JedaJpm = 20000

let file = require.resolve(__filename) 
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(chalk.blue(">> Update File :"), chalk.black.bgWhite(`${__filename}`))
delete require.cache[file]
require(file)
})