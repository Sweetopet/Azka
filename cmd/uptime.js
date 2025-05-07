const moment = require('moment-timezone');

module.exports = async (sock, msg, args) => {
    const from = msg.key.remoteJid;

    // Hitung uptime bot
    const uptimeInSeconds = process.uptime();
    const days = Math.floor(uptimeInSeconds / 86400);
    const hours = Math.floor((uptimeInSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeInSeconds % 60);

    // Waktu sekarang di Asia/Jakarta
    const jamSekarang = moment().tz('Asia/Jakarta').format('HH:mm:ss');

    // Status uptime
    let status;
    if (days >= 1) status = 'Sangat Stabil';
    else if (hours >= 1) status = 'Stabil';
    else status = 'Baru Online';

    // Buat pesan estetik
    const message = `╭━━〔 *UPTIME STATUS* 〕
┃ ⏰ *Jam :* ${jamSekarang}
┃ ⏳ *Up :* ${days} Hari ${hours} Jam ${minutes} Menit ${seconds} Detik
┃ ⚡ *Status :* ${status}
╰━━━━━━━━━━━━━━━━⬣`;

    await sock.sendMessage(from, { text: message });
};
