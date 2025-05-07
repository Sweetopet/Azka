const moment = require('moment-timezone');

module.exports = async (sock, msg, args) => {
    const from = msg.key.remoteJid;

    // Jam sekarang di Asia/Jakarta
    const jamSekarang = moment().tz('Asia/Jakarta').format('HH:mm:ss');

    // Hitung response time / ping
    const timestamp = msg.messageTimestamp * 1000;
    const ping = Date.now() - timestamp;

    // Status berdasarkan ping
    let status;
    if (ping < 300) status = 'Bagus';
    else if (ping < 700) status = 'Cukup';
    else status = 'Lambat';

    // Buat pesan estetik
    const message = `╭━━〔 *PING STATUS* 〕
┃ ⏰ *Jam :* ${jamSekarang}
┃ 🏓 *Ping :* ${ping} ms
┃ 📶 *Status :* ${status}
╰━━━━━━━━━━━━━━━━⬣`;

    await sock.sendMessage(from, { text: message });
};
