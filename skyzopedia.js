const util = require("util");
const chalk = require("chalk");
const fs = require("fs");
const axios = require("axios");
const fetch = require("node-fetch");
const ssh2 = require("ssh2");
const { exec, spawn, execSync } = require('child_process');
const { prepareWAMessageMedia, generateWAMessageFromContent } = require("baileys");
const LoadDataBase = require("./source/LoadDatabase.js");

//###############################//
module.exports = async (m, sock) => {
try {
await LoadDataBase(sock, m)

// Initialize nokos settings
if (!global.db.settings.nokos) {
    global.db.settings.nokos = {
        enablePrivate: true,
        enableGroup: false,
        autoCheckInterval: 2000
    };
}

const isCmd = m?.body?.startsWith(m.prefix)
// ... lanjutan kode
const quoted = m.quoted ? m.quoted : m
const mime = quoted?.msg?.mimetype || quoted?.mimetype || null
const args = m.body.trim().split(/ +/).slice(1)
const qmsg = (m.quoted || m)
const text = q = args.join(" ")
const command = isCmd ? m.body.slice(m.prefix.length).trim().split(' ').shift().toLowerCase() : ''
const cmd = m.prefix + command
const botNumber = await sock.user.id.split(":")[0]+"@s.whatsapp.net"
const isOwner = global.owner+"@s.whatsapp.net" == m.sender || m.sender == botNumber || db.settings.developer.includes(m.sender)
const isReseller = db.settings.reseller.includes(m.sender)
  m.isGroup = m.chat.endsWith('g.us');
  m.metadata = {};
  m.isAdmin = false;
  m.isBotAdmin = false;
  if (m.isGroup) {
    let meta = await global.groupMetadataCache.get(m.chat)
    if (!meta) meta = await sock.groupMetadata(m.chat).catch(_ => {})
    m.metadata = meta;
    const p = meta?.participants || [];
    m.isAdmin = p?.some(i => (i.id === m.sender || i.jid === m.sender) && i.admin !== null);
    m.isBotAdmin = p?.some(i => (i.id === botNumber || i.jid == botNumber) && i.admin !== null);
  } 
// ==================== NOKOS GLOBAL CACHE ====================
if (!global.cachedServicesNokos) global.cachedServicesNokos = [];
if (!global.cachedCountriesNokos) global.cachedCountriesNokos = {};
if (!global.activeOrdersNokos) global.activeOrdersNokos = {};
if (!global.lastNokosData) global.lastNokosData = {};

//###############################//

if (isCmd) {
console.log(chalk.white("• Sender :"), chalk.blue(m.chat) + "\n" + chalk.white("• Command :"), chalk.blue(cmd) + "\n")
}

//###############################//

if (!isCmd && m.body) {
const responder = db.settings.respon.find(v => v.id.toLowerCase() == m.body.toLowerCase())
if (responder && responder.response) {
await m.reply(responder.response)
}}

const FakeSticker = {
        key: {
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast"
        },
        message: {
            stickerPackMessage: {
                stickerPackId: "\000",
                name: `Powered By ${global.namaOwner}.`,
                publisher: "kkkk"
            }
        }
    }


//###############################//
if (global.topupState && global.topupState[m.sender]?.waiting) {
    const input = m.body.toLowerCase().trim();
    
    if (input === "batal") {
        delete global.topupState[m.sender];
        return m.reply("❌ Topup dibatalkan.");
    }
    
    const amount = parseInt(input);
    if (isNaN(amount) || amount < 2000) {
        return m.reply("🚫 Nominal tidak valid!\n\nMinimal Rp 2.000\nContoh: 5000");
    }
    
    delete global.topupState[m.sender];
    
    // Redirect ke proses deposit
    text = amount.toString();
    args[0] = amount;
    m.body = `.topup_nokos ${amount}`;
    command = "topup_nokos";
}
switch (command) {
case "menu": {
//###############################//
// 🚀 MENU UTAMA NOKOS
//###############################//
case "ordernokos":
case "nokos": {
    // Validasi apakah fitur aktif
    const isPrivate = !m.isGroup;
    const nokosSettings = global.db.settings.nokos;
    
    if (isPrivate && !nokosSettings.enablePrivate) {
        return m.reply("❌ Fitur Nokos dimatikan untuk chat pribadi.\n\nHubungi owner untuk mengaktifkan.");
    }
    
    if (m.isGroup && !nokosSettings.enableGroup) {
        return m.reply("❌ Fitur Nokos dimatikan untuk group.\n\nHubungi admin/owner untuk mengaktifkan.");
    }

    const fs = require("fs");
    const name = m.pushName || "User";
    const userId = m.sender.split("@")[0];
    
    const dbDir = "./database";
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    
    const saldoPath = "./database/saldoOtp.json";
    if (!fs.existsSync(saldoPath)) fs.writeFileSync(saldoPath, JSON.stringify({}));
    
    const saldoData = JSON.parse(fs.readFileSync(saldoPath));
    const saldoUser = saldoData[userId] || 0;

    const caption = `
👋 Halo *${name}*!  
Selamat datang di *Layanan Nomor RumahOtp*

╭─⭐ *INFO AKUN*
│ 👤 Nama: *${name}*  
│ 🆔 ID: \`${userId}\`  
│ 💰 Saldo: Rp${saldoUser.toLocaleString("id-ID")}
│ 📍 Chat: ${m.isGroup ? "Group" : "Private"}
╰────────────

╭─🎯 *KEUNGGULAN*
│ ✅ Verifikasi instan
│ ✅ Harga mulai Rp 2.000
│ ✅ Auto refund jika gagal
│ ✅ Support 24/7
│ ✅ Real-time OTP (2 detik)
╰────────────

📱 Pilih menu di bawah untuk memulai:
`;

    let msg = await generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        hasMediaAttachment: true,
                        ...(await prepareWAMessageMedia(
                            { image: { url: global.thumbnail } },
                            { upload: sock.waUploadToServer }
                        ))
                    },
                    body: { text: caption },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: "Menu Nokos",
                                    sections: [{
                                        title: "Layanan Tersedia",
                                        rows: [
                                            {
                                                title: "🌍 Order Nomor",
                                                description: "Pesan nomor virtual",
                                                id: ".pilih_layanan_nokos"
                                            },
                                            {
                                                title: "💰 Topup Saldo",
                                                description: "Isi saldo deposit",
                                                id: ".topup_nokos"
                                            },
                                            {
                                                title: "💳 Cek Saldo",
                                                description: "Lihat saldo kamu",
                                                id: ".ceksaldo_nokos"
                                            },
                                            {
                                                title: "🛒 History Order",
                                                description: "Riwayat pembelian",
                                                id: ".history_nokos"
                                            }
                                        ]
                                    }]
                                })
                            }
                        ]
                    }
                }
            }
        }
    }, { userJid: m.sender, quoted: m });

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break;

//###############################//
// 📦 STEP 1: PILIH LAYANAN
//###############################//
case "pilih_layanan_nokos": {
    const isPrivate = !m.isGroup;
    const nokosSettings = global.db.settings.nokos;
    
    if (isPrivate && !nokosSettings.enablePrivate) {
        return m.reply("❌ Fitur Nokos dimatikan untuk chat pribadi.");
    }
    
    if (m.isGroup && !nokosSettings.enableGroup) {
        return m.reply("❌ Fitur Nokos dimatikan untuk group.");
    }

    const axios = require("axios");
    const API_KEY = global.apiRumahOTP;
    
    if (!API_KEY) return m.reply("❌ API Key RumahOTP belum diset di settings.js!");

    await m.reply("⏳ Memuat daftar layanan...");

    try {
        const res = await axios.get("https://www.rumahotp.com/api/v2/services", {
            headers: { "x-apikey": API_KEY }
        });

        if (!res.data.success || !Array.isArray(res.data.data)) {
            return m.reply("❌ Gagal memuat layanan dari server.");
        }

        const services = res.data.data;
        global.cachedServicesNokos = services;

        const perPage = 20;
        const totalPages = Math.ceil(services.length / perPage);
        const list = services.slice(0, perPage);

        const rows = list.map(srv => ({
            title: srv.service_name,
            description: `ID: ${srv.service_code}`,
            id: `.pilih_negara_nokos ${srv.service_code}`
        }));

        if (totalPages > 1) {
            rows.push({
                title: "➡️ Halaman Berikutnya",
                description: "Lihat layanan lainnya",
                id: ".layanan_page_nokos 2"
            });
        }

        rows.push({
            title: "⬅️ Kembali",
            description: "Menu utama",
            id: ".nokos"
        });

        let msg = await generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { 
                            text: `📲 *Pilih Aplikasi/Layanan*\n\nTotal layanan: *${services.length}*\nHalaman: 1/${totalPages}`
                        },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: "Pilih Layanan",
                                    sections: [{ title: "Daftar Layanan", rows }]
                                })
                            }]
                        }
                    }
                }
            }
        }, { userJid: m.sender, quoted: m });

        await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch (err) {
        console.error(err);
        m.reply("❌ Terjadi kesalahan saat memuat layanan.");
    }
}
break;

//###############################//
// 📄 PAGINATION LAYANAN
//###############################//
case "layanan_page_nokos": {
    const isPrivate = !m.isGroup;
    const nokosSettings = global.db.settings.nokos;
    
    if (isPrivate && !nokosSettings.enablePrivate) {
        return m.reply("❌ Fitur Nokos dimatikan untuk chat pribadi.");
    }
    
    if (m.isGroup && !nokosSettings.enableGroup) {
        return m.reply("❌ Fitur Nokos dimatikan untuk group.");
    }

    const page = parseInt(args[0]) || 1;
    const services = global.cachedServicesNokos;

    if (!services || services.length === 0) {
        return m.reply("❌ Data layanan tidak ditemukan. Silakan ketik *.nokos* lagi.");
    }

    const perPage = 20;
    const totalPages = Math.ceil(services.length / perPage);
    
    if (page < 1 || page > totalPages) {
        return m.reply(`❌ Halaman tidak valid. Total halaman: ${totalPages}`);
    }

    const start = (page - 1) * perPage;
    const list = services.slice(start, start + perPage);

    const rows = list.map(srv => ({
        title: srv.service_name,
        description: `ID: ${srv.service_code}`,
        id: `.pilih_negara_nokos ${srv.service_code}`
    }));

    if (page > 1) {
        rows.push({
            title: "⬅️ Halaman Sebelumnya",
            description: `Hal ${page - 1}`,
            id: `.layanan_page_nokos ${page - 1}`
        });
    }
    if (page < totalPages) {
        rows.push({
            title: "➡️ Halaman Berikutnya",
            description: `Hal ${page + 1}`,
            id: `.layanan_page_nokos ${page + 1}`
        });
    }

    rows.push({
        title: "⬅️ Kembali",
        description: "Menu utama",
        id: ".nokos"
    });

    let msg = await generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { 
                        text: `📲 *Pilih Aplikasi/Layanan*\n\nTotal: *${services.length}*\nHalaman: ${page}/${totalPages}`
                    },
                    nativeFlowMessage: {
                        buttons: [{
                            name: "single_select",
                            buttonParamsJson: JSON.stringify({
                                title: "Pilih Layanan",
                                sections: [{ title: "Daftar Layanan", rows }]
                            })
                        }]
                    }
                }
            }
        }
    }, { userJid: m.sender, quoted: m });

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break;

//###############################//
// 🌍 STEP 2: PILIH NEGARA
//###############################//
case "pilih_negara_nokos": {
     const isPrivate = !m.isGroup;
    const nokosSettings = global.db.settings.nokos;
    
    if (isPrivate && !nokosSettings.enablePrivate) {
        return m.reply("❌ Fitur Nokos dimatikan untuk chat pribadi.");
    }
    
    if (m.isGroup && !nokosSettings.enableGroup) {
        return m.reply("❌ Fitur Nokos dimatikan untuk group.");
    }
    const serviceId = args[0];
    if (!serviceId) return m.reply("❌ ID layanan tidak valid!");

    const axios = require("axios");
    const API_KEY = global.apiRumahOTP;

    await m.reply("⏳ Memuat daftar negara...");

    try {
        const res = await axios.get(
            `https://www.rumahotp.com/api/v2/countries?service_id=${serviceId}`,
            { headers: { "x-apikey": API_KEY } }
        );

        if (!res.data.success) return m.reply("❌ Gagal memuat negara.");

        const countries = res.data.data.filter(c => c.pricelist && c.pricelist.length > 0);
        
        if (countries.length === 0) {
            return m.reply("⚠️ Tidak ada negara tersedia untuk layanan ini.");
        }

        global.cachedCountriesNokos[serviceId] = countries;

        let serviceName = "Layanan";
        if (global.cachedServicesNokos) {
            const s = global.cachedServicesNokos.find(a => a.service_code == serviceId);
            if (s) serviceName = s.service_name;
        }

        const perPage = 20;
        const totalPages = Math.ceil(countries.length / perPage);
        const list = countries.slice(0, perPage);

        function getStockRate(stock) {
            if (stock >= 100) return "🟢";
            if (stock >= 50) return "🟡";
            if (stock >= 20) return "🟠";
            if (stock >= 1) return "🔴";
            return "⚫";
        }

        const rows = list.map(c => {
            const rate = getStockRate(c.stock_total);
            return {
                title: `${c.name} (${c.prefix})`,
                description: `Stok: ${c.stock_total} ${rate}`,
                id: `.pilih_harga_nokos ${serviceId} ${c.iso_code} ${c.number_id}`
            };
        });

        if (totalPages > 1) {
            rows.push({
                title: "➡️ Halaman Berikutnya",
                description: "Negara lainnya",
                id: `.negara_page_nokos ${serviceId} 2`
            });
        }

        rows.push({
            title: "⬅️ Kembali",
            description: "Pilih layanan lagi",
            id: ".pilih_layanan_nokos"
        });

        let msg = await generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { 
                            text: `🌍 *Pilih Negara*\n\nLayanan: *${serviceName}*\nTotal negara: *${countries.length}*\nHalaman: 1/${totalPages}\n\n📊 Rate Stok:\n🟢 100+ | 🟡 50-99 | 🟠 20-49 | 🔴 1-19 | ⚫ 0`
                        },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: "Pilih Negara",
                                    sections: [{ title: "Daftar Negara", rows }]
                                })
                            }]
                        }
                    }
                }
            }
        }, { userJid: m.sender, quoted: m });

        await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch (err) {
        console.error(err);
        m.reply("❌ Gagal memuat negara.");
    }
}
break;

//###############################//
// 📄 PAGINATION NEGARA
//###############################//
case "negara_page_nokos": {
    const isPrivate = !m.isGroup;
    const nokosSettings = global.db.settings.nokos;
    
    if (isPrivate && !nokosSettings.enablePrivate) {
        return m.reply("❌ Fitur Nokos dimatikan untuk chat pribadi.");
    }
    
    if (m.isGroup && !nokosSettings.enableGroup) {
        return m.reply("❌ Fitur Nokos dimatikan untuk group.");
    }
    const serviceId = args[0];
    const page = parseInt(args[1]) || 1;

    const countries = global.cachedCountriesNokos[serviceId];
    if (!countries || countries.length === 0) {
        return m.reply("❌ Data negara tidak ditemukan. Silakan mulai dari awal.");
    }

    let serviceName = "Layanan";
    if (global.cachedServicesNokos) {
        const s = global.cachedServicesNokos.find(a => a.service_code == serviceId);
        if (s) serviceName = s.service_name;
    }

    const perPage = 20;
    const totalPages = Math.ceil(countries.length / perPage);
    
    if (page < 1 || page > totalPages) {
        return m.reply(`❌ Halaman tidak valid. Total: ${totalPages}`);
    }

    const start = (page - 1) * perPage;
    const list = countries.slice(start, start + perPage);

    function getStockRate(stock) {
        if (stock >= 100) return "🟢";
        if (stock >= 50) return "🟡";
        if (stock >= 20) return "🟠";
        if (stock >= 1) return "🔴";
        return "⚫";
    }

    const rows = list.map(c => {
        const rate = getStockRate(c.stock_total);
        return {
            title: `${c.name} (${c.prefix})`,
            description: `Stok: ${c.stock_total} ${rate}`,
            id: `.pilih_harga_nokos ${serviceId} ${c.iso_code} ${c.number_id}`
        };
    });

    if (page > 1) {
        rows.push({
            title: "⬅️ Halaman Sebelumnya",
            description: `Hal ${page - 1}`,
            id: `.negara_page_nokos ${serviceId} ${page - 1}`
        });
    }
    if (page < totalPages) {
        rows.push({
            title: "➡️ Halaman Berikutnya",
            description: `Hal ${page + 1}`,
            id: `.negara_page_nokos ${serviceId} ${page + 1}`
        });
    }

    rows.push({
        title: "⬅️ Kembali",
        description: "Pilih layanan",
        id: ".pilih_layanan_nokos"
    });

    let msg = await generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { 
                        text: `🌍 *Pilih Negara*\n\nLayanan: *${serviceName}*\nTotal: *${countries.length}*\nHalaman: ${page}/${totalPages}\n\n📊 Rate Stok:\n🟢 100+ | 🟡 50-99 | 🟠 20-49 | 🔴 1-19 | ⚫ 0`
                    },
                    nativeFlowMessage: {
                        buttons: [{
                            name: "single_select",
                            buttonParamsJson: JSON.stringify({
                                title: "Pilih Negara",
                                sections: [{ title: "Daftar Negara", rows }]
                            })
                        }]
                    }
                }
            }
        }
    }, { userJid: m.sender, quoted: m });

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break;

//###############################//
// 💰 STEP 3: PILIH HARGA
//###############################//
case "pilih_harga_nokos": {
   const isPrivate = !m.isGroup;
    const nokosSettings = global.db.settings.nokos;
    
    if (isPrivate && !nokosSettings.enablePrivate) {
        return m.reply("❌ Fitur Nokos dimatikan untuk chat pribadi.");
    }
    
    if (m.isGroup && !nokosSettings.enableGroup) {
        return m.reply("❌ Fitur Nokos dimatikan untuk group.");
    }
    const serviceId = args[0];
    const isoCode = args[1];
    const numberId = args[2];

    if (!serviceId || !isoCode || !numberId) {
        return m.reply("❌ Data tidak lengkap!");
    }

    const axios = require("axios");
    const API_KEY = global.apiRumahOTP;
    const UNTUNG = global.UNTUNG_NOKOS || 0;

    await m.reply("⏳ Memuat harga...");

    try {
        let negara = null;

        if (global.cachedCountriesNokos && global.cachedCountriesNokos[serviceId]) {
            negara = global.cachedCountriesNokos[serviceId].find(
                c => String(c.number_id) === String(numberId)
            );
        }

        if (!negara) {
            const res = await axios.get(
                `https://www.rumahotp.com/api/v2/countries?service_id=${serviceId}`,
                { headers: { "x-apikey": API_KEY } }
            );
            negara = (res.data?.data || []).find(
                c => String(c.number_id) === String(numberId)
            );
        }

        if (!negara) {
            return m.reply(`❌ Negara ${isoCode.toUpperCase()} tidak ditemukan.`);
        }

        const providers = (negara.pricelist || [])
            .filter(p => p.available && p.stock > 0)
            .map(p => {
                const base = Number(p.price) || 0;
                const hargaFinal = base + UNTUNG;
                
                let rateIcon = "⚫";
                if (p.stock >= 50) rateIcon = "🟢";
                else if (p.stock >= 20) rateIcon = "🟡";
                else if (p.stock >= 5) rateIcon = "🟠";
                else if (p.stock >= 1) rateIcon = "🔴";
                
                return {
                    ...p,
                    price: hargaFinal,
                    price_format: `Rp${hargaFinal.toLocaleString("id-ID")}`,
                    rateIcon
                };
            })
            .sort((a, b) => a.price - b.price);

        if (providers.length === 0) {
            return m.reply(`⚠️ Tidak ada stok untuk negara *${negara.name}*.`);
        }

        let serviceName = "Layanan";
        if (global.cachedServicesNokos) {
            const s = global.cachedServicesNokos.find(a => a.service_code == serviceId);
            if (s) serviceName = s.service_name;
        }

        const rows = providers.map(p => ({
            title: `${p.price_format} | Stok: ${p.stock}`,
            description: `${p.rateIcon} Provider ${p.provider_id}`,
            id: `.pilih_operator_nokos ${numberId} ${p.provider_id} ${serviceId} ${isoCode}`
        }));

        rows.push({
            title: "⬅️ Kembali",
            description: "Pilih negara lagi",
            id: `.pilih_negara_nokos ${serviceId}`
        });

        let msg = await generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { 
                            text: `💰 *Pilih Harga*\n\nNegara: *${negara.name}*\nLayanan: *${serviceName}*\nTotal stok: *${negara.stock_total}*\n\n_Harga termurah ke termahal_`
                        },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: "Pilih Harga",
                                    sections: [{ title: "Daftar Harga", rows }]
                                })
                            }]
                        }
                    }
                }
            }
        }, { userJid: m.sender, quoted: m });

        await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch (err) {
        console.error(err);
        m.reply("❌ Gagal memuat harga.");
    }
}
break;

//###############################//
// 📡 STEP 4: PILIH OPERATOR
//###############################//
case "pilih_operator_nokos": {
    const isPrivate = !m.isGroup;
    const nokosSettings = global.db.settings.nokos;
    
    if (isPrivate && !nokosSettings.enablePrivate) {
        return m.reply("❌ Fitur Nokos dimatikan untuk chat pribadi.");
    }
    
    if (m.isGroup && !nokosSettings.enableGroup) {
        return m.reply("❌ Fitur Nokos dimatikan untuk group.");
    }
    const numberId = args[0];
    const providerId = args[1];
    const serviceId = args[2];
    const isoCode = args[3];

    if (!numberId || !providerId || !serviceId || !isoCode) {
        return m.reply("❌ Data tidak lengkap!");
    }

    const axios = require("axios");
    const API_KEY = global.apiRumahOTP;
    const UNTUNG = global.UNTUNG_NOKOS || 0;

    await m.reply("⏳ Memuat operator...");

    try {
        let negara = null;
        if (global.cachedCountriesNokos && global.cachedCountriesNokos[serviceId]) {
            negara = global.cachedCountriesNokos[serviceId].find(
                c => c.iso_code.toLowerCase() === isoCode.toLowerCase()
            );
        }

        if (!negara) {
            return m.reply("❌ Data negara tidak ditemukan.");
        }

        const providerData = negara.pricelist.find(
            p => String(p.provider_id) === String(providerId)
        );

        if (!providerData) {
            return m.reply("❌ Provider tidak ditemukan.");
        }

        const ops = await axios.get(
            `https://www.rumahotp.com/api/v2/operators?country=${encodeURIComponent(negara.name)}&provider_id=${providerId}`,
            { headers: { "x-apikey": API_KEY } }
        );

        const operators = ops.data?.data || [];
        
        if (operators.length === 0) {
            return m.reply("❌ Tidak ada operator tersedia.");
        }

        let serviceName = "Layanan";
        if (global.cachedServicesNokos) {
            const s = global.cachedServicesNokos.find(a => a.service_code == serviceId);
            if (s) serviceName = s.service_name;
        }

        const hargaBase = Number(providerData.price) || 0;
        const hargaFinal = hargaBase + UNTUNG;
        const priceFormat = `Rp${hargaFinal.toLocaleString("id-ID")}`;

        const rows = operators.map(op => ({
            title: `📶 ${op.name}`,
            description: `${priceFormat} | Stok: ${providerData.stock}`,
            id: `.konfirmasi_order_nokos ${numberId} ${providerId} ${serviceId} ${op.id} ${isoCode}`
        }));

        rows.push({
            title: "⬅️ Kembali",
            description: "Pilih harga lagi",
            id: `.pilih_harga_nokos ${serviceId} ${isoCode} ${numberId}`
        });

        let msg = await generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { 
                            text: `📶 *Pilih Operator*\n\nLayanan: *${serviceName}*\nNegara: *${negara.name}*\nHarga: *${priceFormat}*`
                        },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: "Pilih Operator",
                                    sections: [{ title: "Daftar Operator", rows }]
                                })
                            }]
                        }
                    }
                }
            }
        }, { userJid: m.sender, quoted: m });

        await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch (err) {
        console.error(err);
        m.reply("❌ Gagal memuat operator.");
    }
}
break;

//###############################//
// ✅ STEP 5: KONFIRMASI ORDER
//###############################//
case "konfirmasi_order_nokos": {
const isPrivate = !m.isGroup;
    const nokosSettings = global.db.settings.nokos;
    
    if (isPrivate && !nokosSettings.enablePrivate) {
        return m.reply("❌ Fitur Nokos dimatikan untuk chat pribadi.");
    }
    
    if (m.isGroup && !nokosSettings.enableGroup) {
        return m.reply("❌ Fitur Nokos dimatikan untuk group.");
    }
    const numberId = args[0];
    const providerId = args[1];
    const serviceId = args[2];
    const operatorId = args[3];
    const isoCode = args[4];

    if (!numberId || !providerId || !serviceId || !operatorId || !isoCode) {
        return m.reply("❌ Data tidak lengkap!");
    }

    const axios = require("axios");
    const API_KEY = global.apiRumahOTP;
    const UNTUNG = global.UNTUNG_NOKOS || 0;

    try {
        let serviceName = "Layanan";
        if (global.cachedServicesNokos) {
            const s = global.cachedServicesNokos.find(a => a.service_code == serviceId);
            if (s) serviceName = s.service_name;
        }

        let negara = null;
        if (global.cachedCountriesNokos && global.cachedCountriesNokos[serviceId]) {
            negara = global.cachedCountriesNokos[serviceId].find(
                c => c.iso_code.toLowerCase() === isoCode.toLowerCase()
            );
        }

        if (!negara) {
            return m.reply("❌ Data negara tidak ditemukan.");
        }

        const providerData = negara.pricelist.find(
            p => String(p.provider_id) === String(providerId)
        );

        if (!providerData) {
            return m.reply("❌ Provider tidak ditemukan.");
        }

        const hargaFinal = (Number(providerData.price) || 0) + UNTUNG;
        const priceFormat = `Rp${hargaFinal.toLocaleString("id-ID")}`;

        const ops = await axios.get(
            `https://www.rumahotp.com/api/v2/operators?country=${encodeURIComponent(negara.name)}&provider_id=${providerId}`,
            { headers: { "x-apikey": API_KEY } }
        );

        const operator = (ops.data?.data || []).find(
            o => String(o.id) === String(operatorId)
        );

        if (!operator) {
            return m.reply("❌ Operator tidak ditemukan.");
        }

        if (!global.lastNokosData) global.lastNokosData = {};
        global.lastNokosData[m.sender] = {
            numberId,
            providerId,
            serviceId,
            operatorId,
            isoCode,
            serviceName,
            negaraName: negara.name,
            operatorName: operator.name,
            hargaFinal,
            priceFormat,
            providerStock: providerData.stock
        };

        const caption = `
📱 *KONFIRMASI PESANAN*

╭─📦 *Detail Order*
│ 🌐 Layanan: ${serviceName}
│ 🌍 Negara: ${negara.name}
│ 📶 Operator: ${operator.name}
│ 💰 Harga: ${priceFormat}
│ 📦 Stok: ${providerData.stock}
╰────────────

⚠️ *Pastikan data sudah benar sebelum melanjutkan!*
`;

        let msg = await generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: caption },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "✅ Pesan Sekarang",
                                        id: ".proses_order_nokos"
                                    })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "⬅️ Kembali",
                                        id: `.pilih_operator_nokos ${numberId} ${providerId} ${serviceId} ${isoCode}`
                                    })
                                }
                            ]
                        }
                    }
                }
            }
        }, { userJid: m.sender, quoted: m });

        await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch (err) {
        console.error(err);
        m.reply("❌ Gagal memuat konfirmasi.");
    }
}
break;

//###############################//
// 🛒 STEP 6: PROSES ORDER + REAL-TIME CHECK
//###############################//
case "proses_order_nokos": {
    const isPrivate = !m.isGroup;
    const nokosSettings = global.db.settings.nokos;
    
    if (isPrivate && !nokosSettings.enablePrivate) {
        return m.reply("❌ Fitur Nokos dimatikan untuk chat pribadi.");
    }
    
    if (m.isGroup && !nokosSettings.enableGroup) {
        return m.reply("❌ Fitur Nokos dimatikan untuk group.");
    }

    const data = global.lastNokosData?.[m.sender];
    
    if (!data) {
        return m.reply("❌ Data order tidak ditemukan. Silakan mulai dari awal dengan ketik *.nokos*");
    }

    const fs = require("fs");
    const axios = require("axios");
    const API_KEY = global.apiRumahOTP;
    
    const dbDir = "./database";
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    
    const saldoPath = "./database/saldoOtp.json";
    const nokosPath = "./database/nokosData.json";
    
    if (!fs.existsSync(saldoPath)) fs.writeFileSync(saldoPath, JSON.stringify({}));
    if (!fs.existsSync(nokosPath)) fs.writeFileSync(nokosPath, JSON.stringify([]));

    const userId = m.sender.split("@")[0];
    const userName = m.pushName || "User";

    await m.reply("⏳ Memproses pesanan...");

    try {
        let saldoData = JSON.parse(fs.readFileSync(saldoPath));
        const userSaldo = saldoData[userId] || 0;

        if (userSaldo < data.hargaFinal) {
            return m.reply(
                `❌ *SALDO TIDAK CUKUP!*\n\n` +
                `💰 Saldo kamu: Rp${userSaldo.toLocaleString("id-ID")}\n` +
                `💳 Harga: ${data.priceFormat}\n` +
                `📉 Kurang: Rp${(data.hargaFinal - userSaldo).toLocaleString("id-ID")}\n\n` +
                `Silakan topup:\n.topup_nokos ${data.hargaFinal - userSaldo + 1000}`
            );
        }

        saldoData[userId] = userSaldo - data.hargaFinal;
        fs.writeFileSync(saldoPath, JSON.stringify(saldoData, null, 2));

        await m.reply("✅ Saldo cukup! Memproses pemesanan nomor...");

        const resOrder = await axios.get(
            `https://www.rumahotp.com/api/v2/orders?number_id=${data.numberId}&provider_id=${data.providerId}&operator_id=${data.operatorId}`,
            { headers: { "x-apikey": API_KEY, Accept: "application/json" } }
        );

        const dataOrder = resOrder.data?.data;
        
        if (!dataOrder || !resOrder.data?.success) {
            saldoData[userId] = userSaldo;
            fs.writeFileSync(saldoPath, JSON.stringify(saldoData, null, 2));
            return m.reply("❌ Order gagal, saldo dikembalikan otomatis.");
        }

        const caption = `
✅ *PESANAN BERHASIL DIBUAT*

╭─📱 *Detail Pesanan*
│ 🌐 Layanan: ${dataOrder.service}
│ 🌍 Negara: ${dataOrder.country}
│ 📶 Operator: ${dataOrder.operator}
│ 
│ 🆔 Order ID: \`${dataOrder.order_id}\`
│ 📞 Nomor: \`${dataOrder.phone_number}\`
│ 💰 Harga: ${data.priceFormat}
│ 
│ 📊 Status: Menunggu OTP
│ 📩 SMS Code: -
│ ⏳ Expired: ${dataOrder.expires_in_minute} menit
╰────────────

💳 Saldo dikurangi: ${data.priceFormat}
💰 Sisa Saldo: Rp${saldoData[userId].toLocaleString("id-ID")}

🚀 Bot cek SMS otomatis setiap 2 detik!
⚡ Notifikasi langsung jika OTP masuk!
`;

        // ✅ BUTTON: Tambah copy nomor telepon
        let msg = await generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: caption },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    // Copy nomor telepon yang dipesan
                                    name: "cta_copy",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "📞 Copy Nomor",
                                        copy_code: dataOrder.phone_number
                                    })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "📩 Cek SMS Manual",
                                        id: `.ceksms_nokos ${dataOrder.order_id}`
                                    })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "❌ Batalkan",
                                        id: `.cancel_order_nokos ${dataOrder.order_id}`
                                    })
                                }
                            ]
                        }
                    }
                }
            }
        }, { userJid: m.sender, quoted: m });

        await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

        if (!global.activeOrdersNokos) global.activeOrdersNokos = {};
        global.activeOrdersNokos[dataOrder.order_id] = {
            userId,
            userName,
            hargaTotal: data.hargaFinal,
            createdAt: Date.now(),
            operator: dataOrder.operator,
            service: dataOrder.service,
            country: dataOrder.country,
            phoneNumber: dataOrder.phone_number,
            expiresIn: dataOrder.expires_in_minute,
            chatId: m.chat
        };

        const checkIntervalTime = nokosSettings.autoCheckInterval || 2000;
        let checkCount = 0;
        const maxChecks = (dataOrder.expires_in_minute * 60 * 1000) / checkIntervalTime;
        let notifSent = false;

        const checkInterval = setInterval(async () => {
            checkCount++;
            
            try {
                const resCheck = await axios.get(
                    `https://www.rumahotp.com/api/v1/orders/get_status?order_id=${dataOrder.order_id}`,
                    { headers: { "x-apikey": API_KEY } }
                );

                const d = resCheck.data?.data;
                
                if (!d || !global.activeOrdersNokos[dataOrder.order_id]) {
                    clearInterval(checkInterval);
                    return;
                }

                const otp = d.otp_code && d.otp_code !== "-" ? d.otp_code : null;

                if (otp && !notifSent) {
                    notifSent = true;
                    clearInterval(checkInterval);
                    
                    const now = new Date();
                    const tanggal = now.toLocaleString("id-ID", {
                        timeZone: "Asia/Jakarta",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    });

                    const trxData = {
                        customerName: userName,
                        customerId: userId,
                        service: d.service,
                        country: d.country,
                        operator: dataOrder.operator,
                        number: d.phone_number,
                        otp: otp,
                        price: `Rp${data.hargaFinal.toLocaleString("id-ID")}`,
                        orderId: d.order_id,
                        date: tanggal,
                        chatType: m.isGroup ? "group" : "private"
                    };

                    let db = JSON.parse(fs.readFileSync(nokosPath, "utf-8"));
                    db.push(trxData);
                    fs.writeFileSync(nokosPath, JSON.stringify(db, null, 2));

                    delete global.activeOrdersNokos[dataOrder.order_id];

                    const notifText = `
🎉 *OTP BERHASIL DITERIMA!*

╭─📱 *Detail Lengkap*
│ 🌐 Layanan: ${trxData.service}
│ 🌍 Negara: ${trxData.country}
│ 📶 Operator: ${trxData.operator}
│ 
│ 🆔 Order ID: \`${trxData.orderId}\`
│ 💰 Harga: ${trxData.price}
│ 
│ 📅 Tanggal: ${trxData.date}
│ 🟢 Status: Selesai
╰────────────

⚡ *Auto Check dalam ${checkCount * (checkIntervalTime/1000)} detik!*
✅ SMS masuk otomatis
✅ Refund otomatis jika gagal
`;

                    // ✅ BUTTON: Ganti sendMessage biasa → interactiveMessage dengan copy OTP & copy nomor
                    let msgOtp = await generateWAMessageFromContent(m.chat, {
                        viewOnceMessage: {
                            message: {
                                interactiveMessage: {
                                    body: { text: notifText },
                                    nativeFlowMessage: {
                                        buttons: [
                                            {
                                                // Copy kode OTP
                                                name: "cta_copy",
                                                buttonParamsJson: JSON.stringify({
                                                    display_text: "🔐 Copy OTP",
                                                    copy_code: trxData.otp
                                                })
                                            },
                                            {
                                                // Copy nomor telepon
                                                name: "cta_copy",
                                                buttonParamsJson: JSON.stringify({
                                                    display_text: "📞 Copy Nomor",
                                                    copy_code: trxData.number
                                                })
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }, { userJid: m.sender });

                    await sock.relayMessage(m.chat, msgOtp.message, { messageId: msgOtp.key.id });

                    setTimeout(async () => {
                        let msgRating = await generateWAMessageFromContent(m.chat, {
                            viewOnceMessage: {
                                message: {
                                    interactiveMessage: {
                                        body: { text: "⭐ *Beri Rating Layanan*\n\nBagaimana pengalaman kamu?" },
                                        nativeFlowMessage: {
                                            buttons: [{
                                                name: "single_select",
                                                buttonParamsJson: JSON.stringify({
                                                    title: "Pilih Rating",
                                                    sections: [{
                                                        title: "Rating",
                                                        rows: [
                                                            { title: "⭐ 1 - Sangat buruk", id: `.rate_nokos ${dataOrder.order_id} 1` },
                                                            { title: "⭐⭐ 2 - Buruk", id: `.rate_nokos ${dataOrder.order_id} 2` },
                                                            { title: "⭐⭐⭐ 3 - Cukup", id: `.rate_nokos ${dataOrder.order_id} 3` },
                                                            { title: "⭐⭐⭐⭐ 4 - Bagus", id: `.rate_nokos ${dataOrder.order_id} 4` },
                                                            { title: "⭐⭐⭐⭐⭐ 5 - Sangat bagus", id: `.rate_nokos ${dataOrder.order_id} 5` }
                                                        ]
                                                    }]
                                                })
                                            }]
                                        }
                                    }
                                }
                            }
                        }, { userJid: m.sender, quoted: m });

                        await sock.relayMessage(m.chat, msgRating.message, { messageId: msgRating.key.id });
                    }, 2000);

                    if (global.owner) {
                        await sock.sendMessage(global.owner + "@s.whatsapp.net", {
                            text: `📢 *Transaksi Baru Nokos*\n\n${notifText}\n\n👤 Pembeli: ${userName}\n🆔 ID: \`${userId}\``
                        });
                    }
                }

                if (checkCount >= maxChecks) {
                    clearInterval(checkInterval);
                }

            } catch (err) {
                console.error("Check interval error:", err.message);
            }
        }, checkIntervalTime);

        setTimeout(async () => {
            const orderInfo = global.activeOrdersNokos?.[dataOrder.order_id];
            if (!orderInfo) return;

            try {
                const resCheck = await axios.get(
                    `https://www.rumahotp.com/api/v1/orders/get_status?order_id=${dataOrder.order_id}`,
                    { headers: { "x-apikey": API_KEY } }
                );

                const d = resCheck.data?.data;
                const otp = d?.otp_code && d.otp_code !== "-" ? d.otp_code : null;
                
                if (otp) return;

                await axios.get(
                    `https://www.rumahotp.com/api/v1/orders/set_status?order_id=${dataOrder.order_id}&status=cancel`,
                    { headers: { "x-apikey": API_KEY } }
                );

                const saldoData2 = JSON.parse(fs.readFileSync(saldoPath, "utf-8"));
                saldoData2[userId] = (saldoData2[userId] || 0) + orderInfo.hargaTotal;
                fs.writeFileSync(saldoPath, JSON.stringify(saldoData2, null, 2));

                await sock.sendMessage(
                    orderInfo.chatId,
                    {
                        text:
                            `⛔ *AUTO REFUND - ORDER EXPIRED*\n\n` +
                            `🆔 Order ID: \`${dataOrder.order_id}\`\n` +
                            `📱 Layanan: ${orderInfo.service}\n` +
                            `🌍 Negara: ${orderInfo.country}\n\n` +
                            `💸 Refund: Rp${orderInfo.hargaTotal.toLocaleString("id-ID")}\n` +
                            `💰 Saldo sekarang: Rp${saldoData2[userId].toLocaleString("id-ID")}\n\n` +
                            `✅ Saldo sudah dikembalikan otomatis!`
                    }
                );

                delete global.activeOrdersNokos[dataOrder.order_id];
                clearInterval(checkInterval);
            } catch (err) {
                console.error("Auto cancel error:", err.message);
            }
        }, dataOrder.expires_in_minute * 60 * 1000);

    } catch (err) {
        console.error(err);
        
        try {
            const saldoData = JSON.parse(fs.readFileSync(saldoPath, "utf-8"));
            saldoData[userId] = (saldoData[userId] || 0) + data.hargaFinal;
            fs.writeFileSync(saldoPath, JSON.stringify(saldoData, null, 2));

            m.reply(
                `❌ Gagal memesan nomor: ${err.message}\n\n` +
                `✅ Saldo dikembalikan: Rp${saldoData[userId].toLocaleString("id-ID")}`
            );
        } catch (refundErr) {
            m.reply(`❌ Terjadi kesalahan: ${err.message}`);
        }
    }
}
break;

//###############################//
// 📩 CEK SMS/OTP MANUAL
//###############################//
case "ceksms_nokos": {
   const isPrivate = !m.isGroup;
    const nokosSettings = global.db.settings.nokos;
    
    if (isPrivate && !nokosSettings.enablePrivate) {
        return m.reply("❌ Fitur Nokos dimatikan untuk chat pribadi.");
    }
    
    if (m.isGroup && !nokosSettings.enableGroup) {
        return m.reply("❌ Fitur Nokos dimatikan untuk group.");
    }
    const orderId = args[0];
    
    if (!orderId) {
        return m.reply("❌ Order ID tidak valid!");
    }

    const axios = require("axios");
    const API_KEY = global.apiRumahOTP;

    if (!global.activeOrdersNokos?.[orderId]) {
        return m.reply(`⚠️ Order ID \`${orderId}\` tidak ditemukan atau sudah selesai.`);
    }

    const cachedOrder = global.activeOrdersNokos[orderId];

    await m.reply("💡 Mengecek status SMS OTP...");

    try {
        const res = await axios.get(
            `https://www.rumahotp.com/api/v1/orders/get_status?order_id=${orderId}`,
            { headers: { "x-apikey": API_KEY, Accept: "application/json" } }
        );

        const d = res.data?.data;
        if (!d) return m.reply("❌ Tidak ada data dari server.");

        // Cek apakah OTP sudah masuk atau belum
        const otpMasuk = d.otp_code && d.otp_code !== "-";
        const otp = otpMasuk ? d.otp_code : "Belum masuk";

        const statusText = `
📩 *STATUS PESANAN*

╭─📱 *Detail*
│ 🌐 Layanan: ${d.service}
│ 🌍 Negara: ${d.country}
│ 📶 Operator: ${cachedOrder.operator}
│ 
│ 🆔 Order ID: \`${d.order_id}\`
│ 📞 Nomor: \`${d.phone_number}\`
│ 💰 Harga: Rp${cachedOrder.hargaTotal.toLocaleString("id-ID")}
│ 
│ 📊 Status: ${d.status}
│ 📩 SMS Code: \`${otp}\`
╰────────────

${!otpMasuk ? "⏳ SMS belum masuk, coba cek lagi sebentar lagi..." : "✅ Kode OTP sudah masuk!"}
`;

        // ✅ BUTTON: Kondisional — jika OTP sudah masuk tampilkan tombol copy, jika belum hanya cek ulang
        const buttons = [];

        if (otpMasuk) {
            // OTP sudah ada → tampilkan copy OTP dan copy nomor
            buttons.push({
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: "🔐 Copy OTP",
                    copy_code: d.otp_code
                })
            });
            buttons.push({
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: "📞 Copy Nomor",
                    copy_code: d.phone_number
                })
            });
        } else {
            // OTP belum ada → hanya tampilkan cek ulang
            buttons.push({
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "🔄 Cek Ulang",
                    id: `.ceksms_nokos ${orderId}`
                })
            });
        }

        let msg = await generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: statusText },
                        nativeFlowMessage: {
                            buttons: buttons
                        }
                    }
                }
            }
        }, { userJid: m.sender, quoted: m });

        return sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch (err) {
        console.error(err);
        m.reply("❌ Terjadi kesalahan saat cek OTP.");
    }
}
break;


//###############################//
// ⭐ RATING NOKOS
//###############################//
case "rate_nokos": {
   const isPrivate = !m.isGroup;
    const nokosSettings = global.db.settings.nokos;
    
    if (isPrivate && !nokosSettings.enablePrivate) {
        return m.reply("❌ Fitur Nokos dimatikan untuk chat pribadi.");
    }
    
    if (m.isGroup && !nokosSettings.enableGroup) {
        return m.reply("❌ Fitur Nokos dimatikan untuk group.");
    }
    const orderId = args[0];
    const rating = parseInt(args[1]);

    if (!orderId || isNaN(rating) || rating < 1 || rating > 5) {
        return m.reply("❌ Rating tidak valid!");
    }

    const fs = require("fs");
    const ratingPath = "./database/nokosRating.json";
    
    const dbDir = "./database";
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    if (!fs.existsSync(ratingPath)) fs.writeFileSync(ratingPath, JSON.stringify([]));

    const userId = m.sender.split("@")[0];
    const userName = m.pushName || "User";

    const ratingData = {
        orderId,
        userId,
        userName,
        rating,
        date: new Date().toISOString()
    };

    let ratings = JSON.parse(fs.readFileSync(ratingPath));
    ratings.push(ratingData);
    fs.writeFileSync(ratingPath, JSON.stringify(ratings, null, 2));

    const stars = "⭐".repeat(rating);
    
    await m.reply(
        `${stars}\n\n` +
        `Terima kasih atas rating kamu!\n` +
        `Rating: ${rating}/5\n\n` +
        `Feedback kamu sangat berarti untuk kami! 🙏`
    );

    // Notif ke owner
    if (global.owner) {
        await sock.sendMessage(global.owner + "@s.whatsapp.net", {
            text: `⭐ *Rating Baru*\n\nOrder ID: ${orderId}\nUser: ${userName}\nRating: ${rating}/5`
        });
    }
}
break;

//###############################//
// ❌ CANCEL ORDER
//###############################//
case "cancel_order_nokos": {
  const isPrivate = !m.isGroup;
    const nokosSettings = global.db.settings.nokos;
    
    if (isPrivate && !nokosSettings.enablePrivate) {
        return m.reply("❌ Fitur Nokos dimatikan untuk chat pribadi.");
    }
    
    if (m.isGroup && !nokosSettings.enableGroup) {
        return m.reply("❌ Fitur Nokos dimatikan untuk group.");
    }
    const orderId = args[0];
    
    if (!orderId) return m.reply("❌ Order ID tidak valid!");

    const axios = require("axios");
    const fs = require("fs");
    const API_KEY = global.apiRumahOTP;
    const saldoPath = "./database/saldoOtp.json";

    const orderInfo = global.activeOrdersNokos?.[orderId];
    if (!orderInfo) {
        return m.reply("⚠️ Order tidak ditemukan atau sudah selesai.");
    }

    const userId = m.sender.split("@")[0];

    // Cooldown 5 menit
    const cooldown = 5 * 60 * 1000;
    const cancelableAt = orderInfo.createdAt + cooldown;
    const now = Date.now();

    if (now < cancelableAt) {
        const sisaDetik = Math.ceil((cancelableAt - now) / 1000);
        const sisaMenit = Math.floor(sisaDetik / 60);
        const sisaDetikSisa = sisaDetik % 60;

        return m.reply(
            `❌ Kamu belum bisa cancel pesanan ini.\n\n` +
            `🆔 Order ID: \`${orderId}\`\n` +
            `⏰ Tunggu: ${sisaMenit}m ${sisaDetikSisa}d lagi\n\n` +
            `Cooldown 5 menit untuk menghindari spam.`
        );
    }

    await m.reply("🗑️ Membatalkan pesanan...");

    try {
        const res = await axios.get(
            `https://www.rumahotp.com/api/v1/orders/set_status?order_id=${orderId}&status=cancel`,
            { headers: { "x-apikey": API_KEY } }
        );

        if (res.data?.success) {
            // Refund saldo
            const saldoData = JSON.parse(fs.readFileSync(saldoPath, "utf-8"));
            saldoData[userId] = (saldoData[userId] || 0) + orderInfo.hargaTotal;
            fs.writeFileSync(saldoPath, JSON.stringify(saldoData, null, 2));

            await m.reply(
                `✅ *Pesanan Dibatalkan!*\n\n` +
                `🆔 Order ID: \`${orderId}\`\n` +
                `💸 Refund: Rp${orderInfo.hargaTotal.toLocaleString("id-ID")}\n` +
                `💰 Saldo sekarang: Rp${saldoData[userId].toLocaleString("id-ID")}\n\n` +
                `✅ Saldo sudah dikembalikan!`
            );

            delete global.activeOrdersNokos[orderId];
        } else {
            m.reply("⚠️ Gagal membatalkan! Mungkin sudah expired atau completed.");
        }
    } catch (err) {
        console.error(err);
        m.reply("❌ Terjadi kesalahan saat membatalkan.");
    }
}
break;

//###############################//
// 💰 TOPUP SALDO (QRIS AUTO)
//###############################//
case "topup_nokos": {
    const isPrivate = !m.isGroup;
    const nokosSettings = global.db.settings.nokos;
    
    if (isPrivate && !nokosSettings.enablePrivate) {
        return m.reply("❌ Fitur Nokos dimatikan untuk chat pribadi.");
    }
    
    if (m.isGroup && !nokosSettings.enableGroup) {
        return m.reply("❌ Fitur Nokos dimatikan untuk group.");
    }
    const fs = require("fs");
    const axios = require("axios");
    const API_KEY = global.apiRumahOTP;
    const UNTUNG = global.UNTUNG_DEPOSIT || 0;
    const BASE_URL = "https://www.rumahotp.com/api/v2/deposit/create";
    const STATUS_URL = "https://www.rumahotp.com/api/v2/deposit/get_status";
    const CANCEL_URL = "https://www.rumahotp.com/api/v1/deposit/cancel";
    const PAYMENT_ID = "qris";
    
    const dbDir = "./database";
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    
    const pendingPath = "./database/depositPending.json";
    const saldoPath = "./database/saldoOtp.json";
    const depositPath = "./database/deposit.json";

    if (!API_KEY) return m.reply("❌ API Key RumahOTP belum diset!");

    // Jika ada argumen langsung
    if (args[0]) {
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 2000) {
            return m.reply("🚫 Minimal deposit Rp 2.000!\n\nContoh: .topup_nokos 5000");
        }
        return processDeposit(amount);
    }

    // Set state untuk menunggu input
    if (!global.topupState) global.topupState = {};
    
    global.topupState[m.sender] = {
        waiting: true,
        timestamp: Date.now()
    };

    await m.reply(
        "💳 *TOP UP SALDO NOKOS*\n\n" +
        "Masukkan nominal deposit (min Rp 2.000)\n" +
        "Contoh: `5000` atau `10000`\n\n" +
        "⏱️ Timeout: 60 detik\n" +
        "Ketik *batal* untuk membatalkan"
    );

    // Set timeout
    setTimeout(() => {
        if (global.topupState[m.sender]?.waiting) {
            delete global.topupState[m.sender];
            m.reply("⏱️ Waktu habis. Ketik .topup_nokos untuk coba lagi.");
        }
    }, 60000);

    async function processDeposit(amount) {
        await m.reply("🔄 Membuat QRIS...");

        try {
            if (!fs.existsSync(pendingPath)) fs.writeFileSync(pendingPath, JSON.stringify({}));
            if (!fs.existsSync(saldoPath)) fs.writeFileSync(saldoPath, JSON.stringify({}));
            if (!fs.existsSync(depositPath)) fs.writeFileSync(depositPath, JSON.stringify([]));

            const pendingData = JSON.parse(fs.readFileSync(pendingPath));
            const userId = m.sender.split("@")[0];

            if (!pendingData[userId]) pendingData[userId] = [];
            pendingData[userId] = pendingData[userId].filter(d => Date.now() < d.expired_at_ts);

            if (pendingData[userId].length > 0) {
                return m.reply("🚫 Kamu masih punya QRIS aktif! Selesaikan dulu atau tunggu expired.");
            }

            const totalRequest = amount + UNTUNG;

            const response = await axios.get(
                `${BASE_URL}?amount=${totalRequest}&payment_id=${PAYMENT_ID}`,
                { headers: { "x-apikey": API_KEY } }
            );

            const data = response.data;
            if (!data.success) return m.reply("❌ Gagal membuat QRIS.");

            const d = data.data;
            const diterima = amount;
            const totalBaru = d.total;
            const feeAkhir = totalBaru - diterima;

            const waktuBuat = new Date(d.created_at_ts).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
            const waktuExp = new Date(d.expired_at_ts).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

            const caption = `
🧾 *PEMBAYARAN DEPOSIT*

╭─💳 *Detail Pembayaran*
│ 🆔 ID: \`${d.id}\`
│ 💰 Total Bayar: Rp${totalBaru.toLocaleString("id-ID")}
│ 💸 Fee: Rp${feeAkhir.toLocaleString("id-ID")}
│ 📥 Saldo Dapat: Rp${diterima.toLocaleString("id-ID")}
│ 
│ 🕒 Dibuat: ${waktuBuat}
│ ⏳ Expired: ${waktuExp}
╰────────────

📸 Scan QRIS di atas untuk bayar!
🔄 Auto cek pembayaran setiap 3 detik
✅ Saldo otomatis masuk setelah bayar
`;

            await sock.sendMessage(
                m.chat,
                {
                    image: { url: d.qr_image },
                    caption,
                    footer: "Powered by RumahOTP"
                },
                { quoted: m }
            );

            let msgCancel = await generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            body: { text: "Tekan tombol jika ingin membatalkan:" },
                            nativeFlowMessage: {
                                buttons: [{
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "❌ Batalkan Deposit",
                                        id: `.batal_deposit_nokos ${d.id}`
                                    })
                                }]
                            }
                        }
                    }
                }
            }, { userJid: m.sender, quoted: m });

            await sock.relayMessage(m.chat, msgCancel.message, { messageId: msgCancel.key.id });

            pendingData[userId].push({
                id: d.id,
                total: totalBaru,
                status: d.status,
                expired_at_ts: d.expired_at_ts
            });
            fs.writeFileSync(pendingPath, JSON.stringify(pendingData, null, 2));

            // Auto check status setiap 3 detik
            const checkInterval = setInterval(async () => {
                try {
                    const checkRes = await axios.get(
                        `${STATUS_URL}?deposit_id=${d.id}`,
                        { headers: { "x-apikey": API_KEY } }
                    );
                    
                    if (checkRes.data.success && checkRes.data.data.status === "success") {
                        clearInterval(checkInterval);
                        clearTimeout(autoCancelTimer);

                        const saldoData = JSON.parse(fs.readFileSync(saldoPath));
                        saldoData[userId] = (saldoData[userId] || 0) + diterima;
                        fs.writeFileSync(saldoPath, JSON.stringify(saldoData, null, 2));

                        const successMsg = `
🎉 *DEPOSIT BERHASIL!*

╭─✅ *Pembayaran Berhasil*
│ 🆔 ID: \`${d.id}\`
│ 💰 Total Bayar: Rp${totalBaru.toLocaleString("id-ID")}
│ 📥 Saldo Dapat: Rp${diterima.toLocaleString("id-ID")}
│ 
│ 💳 Saldo ditambah otomatis!
│ 💰 Total Saldo: Rp${saldoData[userId].toLocaleString("id-ID")}
╰────────────

✅ Saldo sudah bisa digunakan untuk order!
`;

                        await m.reply(successMsg);

                        const depositData = JSON.parse(fs.readFileSync(depositPath));
                        depositData.push({
                            id: d.id,
                            userId,
                            total: totalBaru,
                            diterima,
                            fee: feeAkhir,
                            status: "success",
                            tanggal: new Date().toISOString()
                        });
                        fs.writeFileSync(depositPath, JSON.stringify(depositData, null, 2));

                        const pendingData2 = JSON.parse(fs.readFileSync(pendingPath));
                        if (pendingData2[userId]) {
                            pendingData2[userId] = pendingData2[userId].filter(x => x.id !== d.id);
                            fs.writeFileSync(pendingPath, JSON.stringify(pendingData2, null, 2));
                        }
                    }
                } catch (e) {
                    console.error("Check interval error:", e.message);
                }
            }, 3000); // Check setiap 3 detik

            // Auto cancel 5 menit
            const autoCancelTimer = setTimeout(async () => {
                try {
                    clearInterval(checkInterval);
                    
                    await axios.get(
                        `${CANCEL_URL}?deposit_id=${d.id}`,
                        { headers: { "x-apikey": API_KEY } }
                    );
                    
                    await m.reply(
                        `⏱️ *DEPOSIT EXPIRED*\n\n` +
                        `🆔 ID: \`${d.id}\`\n` +
                        `💰 Nominal: Rp${totalBaru.toLocaleString("id-ID")}\n` +
                        `📛 Status: Cancelled (Auto)\n\n` +
                        `Silakan buat deposit baru jika masih ingin topup.`
                    );

                    const pendingData2 = JSON.parse(fs.readFileSync(pendingPath));
                    if (pendingData2[userId]) {
                        pendingData2[userId] = pendingData2[userId].filter(x => x.id !== d.id);
                        fs.writeFileSync(pendingPath, JSON.stringify(pendingData2, null, 2));
                    }
                } catch (e) {
                    console.error("Auto cancel error:", e.message);
                }
            }, 5 * 60 * 1000);

        } catch (err) {
            console.error(err);
            m.reply("⚠️ Terjadi kesalahan saat membuat QRIS.");
        }
    }
}
break;

//###############################//
// ❌ BATAL DEPOSIT
//###############################//
case "batal_deposit_nokos": {
    const isPrivate = !m.isGroup;
    const nokosSettings = global.db.settings.nokos;
    
    if (isPrivate && !nokosSettings.enablePrivate) {
        return m.reply("❌ Fitur Nokos dimatikan untuk chat pribadi.");
    }
    
    if (m.isGroup && !nokosSettings.enableGroup) {
        return m.reply("❌ Fitur Nokos dimatikan untuk group.");
    }
    const depositId = args[0];
    
    if (!depositId) return m.reply("❌ ID deposit tidak valid!");

    const fs = require("fs");
    const axios = require("axios");
    const API_KEY = global.apiRumahOTP;
    const CANCEL_URL = "https://www.rumahotp.com/api/v1/deposit/cancel";
    const pendingPath = "./database/depositPending.json";
    const depositPath = "./database/deposit.json";

    const userId = m.sender.split("@")[0];

    await m.reply("🗑️ Membatalkan deposit...");

    try {
        const cancelRes = await axios.get(
            `${CANCEL_URL}?deposit_id=${depositId}`,
            { headers: { "x-apikey": API_KEY } }
        );

        if (cancelRes.data.success) {
            const pendingData = JSON.parse(fs.readFileSync(pendingPath));
            
            if (pendingData[userId]) {
                pendingData[userId] = pendingData[userId].filter(x => x.id !== depositId);
                fs.writeFileSync(pendingPath, JSON.stringify(pendingData, null, 2));
            }

            await m.reply(
                `✅ *Deposit Dibatalkan!*\n\n` +
                `🆔 ID: \`${depositId}\`\n` +
                `📛 Status: Cancelled`
            );

            const depositData = JSON.parse(fs.readFileSync(depositPath));
            depositData.push({
                id: depositId,
                userId,
                total: 0,
                status: "cancelled",
                tanggal: new Date().toISOString()
            });
            fs.writeFileSync(depositPath, JSON.stringify(depositData, null, 2));
        } else {
            m.reply("⚠️ Gagal membatalkan! Mungkin sudah dibayar atau expired.");
        }
    } catch (err) {
        console.error(err);
        m.reply("❌ Terjadi kesalahan.");
    }
}
break;

//###############################//
// 💳 CEK SALDO
//###############################//
case "ceksaldo_nokos": {
    const isPrivate = !m.isGroup;
    const nokosSettings = global.db.settings.nokos;
    
    if (isPrivate && !nokosSettings.enablePrivate) {
        return m.reply("❌ Fitur Nokos dimatikan untuk chat pribadi.");
    }
    
    if (m.isGroup && !nokosSettings.enableGroup) {
        return m.reply("❌ Fitur Nokos dimatikan untuk group.");
    }
    const fs = require("fs");
    const dbDir = "./database";
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    
    const saldoFile = "./database/saldoOtp.json";
    if (!fs.existsSync(saldoFile)) fs.writeFileSync(saldoFile, JSON.stringify({}));
    
    const userId = m.sender.split("@")[0];
    const name = m.pushName || "User";

    const saldoData = JSON.parse(fs.readFileSync(saldoFile));
    const saldoUser = saldoData[userId] || 0;

    const caption = `
💳 *SALDO NOKOS*

╭─👤 *Info Akun*
│ 🆔 User ID: \`${userId}\`
│ 👤 Nama: ${name}
│ 💰 Saldo: Rp${saldoUser.toLocaleString("id-ID")}
╰────────────

${saldoUser < 2000 ? "⚠️ Saldo kurang dari Rp 2.000\n" : "✅ Saldo cukup untuk order!\n"}
Ketik *.topup_nokos* untuk isi saldo
Ketik *.nokos* untuk order nomor
`;

    await m.reply(caption);
}
break;

//###############################//
// 🛒 HISTORY ORDER
//###############################//
case "history_nokos": {
    const isPrivate = !m.isGroup;
    const nokosSettings = global.db.settings.nokos;
    
    if (isPrivate && !nokosSettings.enablePrivate) {
        return m.reply("❌ Fitur Nokos dimatikan untuk chat pribadi.");
    }
    
    if (m.isGroup && !nokosSettings.enableGroup) {
        return m.reply("❌ Fitur Nokos dimatikan untuk group.");
    }
    const fs = require("fs");
    const filePath = "./database/nokosData.json";
    const userId = m.sender.split("@")[0];

    if (!fs.existsSync(filePath)) {
        return m.reply("📭 Belum ada riwayat order.\n\nKetik *.nokos* untuk mulai order!");
    }

    const rawData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const userOrders = rawData.filter(item => item.customerId === userId);

    if (userOrders.length === 0) {
        return m.reply("📭 Kamu belum pernah order.\n\nKetik *.nokos* untuk mulai order!");
    }

    let teks = `🛒 *RIWAYAT ORDER NOKOS*\n\nTotal order: ${userOrders.length}\n\n`;

    userOrders.slice(-10).reverse().forEach((order, i) => {
        teks += `╭─ *Order ${i + 1}*\n`;
        teks += `│ 🌐 ${order.service}\n`;
        teks += `│ 🌍 ${order.country}\n`;
        teks += `│ 📞 \`${order.number}\`\n`;
        teks += `│ 🔐 OTP: ${order.otp}\n`;
        teks += `│ 💰 ${order.price}\n`;
        teks += `│ 📅 ${order.date}\n`;
        teks += `╰────────────\n\n`;
    });

    if (userOrders.length > 10) {
        teks += `_Menampilkan 10 order terakhir dari total ${userOrders.length} order_`;
    }

    await m.reply(teks);
}
break;
//###############################//
// ⚙️ SETTING NOKOS (OWNER ONLY)
//###############################//
case "setnokos":
case "nokossetting": {
    if (!isOwner) return m.reply(mess.owner);

    const settings = global.db.settings.nokos;
    
    if (!text) {
        const statusPrivate = settings.enablePrivate ? "✅ ON" : "❌ OFF";
        const statusGroup = settings.enableGroup ? "✅ ON" : "❌ OFF";
        const interval = settings.autoCheckInterval / 1000;

        return m.reply(
            `⚙️ *SETTING NOKOS*\n\n` +
            `╭─📱 *Status Fitur*\n` +
            `│ Private Chat: ${statusPrivate}\n` +
            `│ Group Chat: ${statusGroup}\n` +
            `│ Auto Check: ${interval} detik\n` +
            `╰────────────\n\n` +
            `*Cara Setting:*\n` +
            `.setnokos private on/off\n` +
            `.setnokos group on/off\n` +
            `.setnokos interval 2\n\n` +
            `*Contoh:*\n` +
            `.setnokos private on\n` +
            `.setnokos group off\n` +
            `.setnokos interval 1`
        );
    }

    const args2 = text.toLowerCase().split(" ");
    const target = args2[0];
    const value = args2[1];

    if (target === "private") {
        if (value === "on") {
            settings.enablePrivate = true;
            return m.reply("✅ Nokos untuk *Private Chat* diaktifkan!");
        } else if (value === "off") {
            settings.enablePrivate = false;
            return m.reply("❌ Nokos untuk *Private Chat* dimatikan!");
        } else {
            return m.reply("Format salah! Gunakan: .setnokos private on/off");
        }
    }

    if (target === "group") {
        if (value === "on") {
            settings.enableGroup = true;
            return m.reply("✅ Nokos untuk *Group Chat* diaktifkan!");
        } else if (value === "off") {
            settings.enableGroup = false;
            return m.reply("❌ Nokos untuk *Group Chat* dimatikan!");
        } else {
            return m.reply("Format salah! Gunakan: .setnokos group on/off");
        }
    }

    if (target === "interval") {
        const seconds = parseInt(value);
        if (isNaN(seconds) || seconds < 1 || seconds > 10) {
            return m.reply("❌ Interval harus antara 1-10 detik!\n\nContoh: .setnokos interval 2");
        }
        settings.autoCheckInterval = seconds * 1000;
        return m.reply(`✅ Auto check interval diubah menjadi *${seconds} detik*!`);
    }

    return m.reply(
        "❌ Target tidak valid!\n\n" +
        "Pilihan: private, group, interval\n\n" +
        "Contoh:\n" +
        ".setnokos private on\n" +
        ".setnokos group off\n" +
        ".setnokos interval 2"
    );
}
break;

//###############################//
// 📊 STATUS NOKOS (PUBLIC)
//###############################//
case "statusnokos":
case "infnokos": {
    const settings = global.db.settings.nokos;
    const statusPrivate = settings.enablePrivate ? "🟢 Aktif" : "🔴 Nonaktif";
    const statusGroup = settings.enableGroup ? "🟢 Aktif" : "🔴 Nonaktif";
    const interval = settings.autoCheckInterval / 1000;

    const fs = require("fs");
    const saldoPath = "./database/saldoOtp.json";
    const nokosPath = "./database/nokosData.json";
    
    let totalUsers = 0;
    let totalOrders = 0;
    
    if (fs.existsSync(saldoPath)) {
        const saldoData = JSON.parse(fs.readFileSync(saldoPath));
        totalUsers = Object.keys(saldoData).length;
    }
    
    if (fs.existsSync(nokosPath)) {
        const orders = JSON.parse(fs.readFileSync(nokosPath));
        totalOrders = orders.length;
    }

    const activeOrders = global.activeOrdersNokos ? Object.keys(global.activeOrdersNokos).length : 0;

    const caption = `
📊 *STATUS LAYANAN NOKOS*

╭─⚙️ *Konfigurasi*
│ 💬 Private Chat: ${statusPrivate}
│ 👥 Group Chat: ${statusGroup}
│ ⚡ Auto Check: ${interval} detik
╰────────────

╭─📈 *Statistik*
│ 👤 Total User: ${totalUsers}
│ 🛒 Total Order: ${totalOrders}
│ 🔄 Order Aktif: ${activeOrders}
╰────────────

${m.isGroup && !settings.enableGroup ? "⚠️ Fitur tidak aktif di group ini" : ""}
${!m.isGroup && !settings.enablePrivate ? "⚠️ Fitur tidak aktif di private chat" : ""}

Ketik *.nokos* untuk mulai order!
`;

    await m.reply(caption);
}
break;
default:
if (m.text.toLowerCase().startsWith("xx")) {
    if (m.sender.split("@")[0] !== global.owner) return 

    try {
        const result = await eval(`(async () => { ${text} })()`);
        const output = typeof result !== "string" ? util.inspect(result) : result;
        return sock.sendMessage(m.chat, { text: util.format(output) }, { quoted: m });
    } catch (err) {
        return sock.sendMessage(m.chat, { text: util.format(err) }, { quoted: m });
    }
}

//###############################//

if (m.text.toLowerCase().startsWith("x")) {
    if (m.sender.split("@")[0] !== global.owner) return 

    try {
        let result = await eval(text);
        if (typeof result !== "string") result = util.inspect(result);
        return sock.sendMessage(m.chat, { text: util.format(result) }, { quoted: m });
    } catch (err) {
        return sock.sendMessage(m.chat, { text: util.format(err) }, { quoted: m });
    }
}

//###############################//

if (m.text.startsWith('$')) {
    if (!isOwner) return;
    
    exec(m.text.slice(2), (err, stdout) => {
        if (err) {
            return sock.sendMessage(m.chat, { text: err.toString() }, { quoted: m });
        }
        if (stdout) {
            return sock.sendMessage(m.chat, { text: util.format(stdout) }, { quoted: m });
        }
    });
}

}

} catch (err) {
console.log(err)
await sock.sendMessage(sock.user.id.split(":")[0]+"@s.whatsapp.net", {text: err.toString()}, {quoted: m ? m : null })
}}

//###############################//

process.on("uncaughtException", (err) => {
console.error("Caught exception:", err);
});

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.blue(">> Update File:"), chalk.black.bgWhite(__filename));
    delete require.cache[file];
    require(file);
});