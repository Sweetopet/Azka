module.exports = async (sock, msg, args) => {
    const from = msg.key.remoteJid;

    // Hitung waktu sekarang
    const now = new Date();
    const jamSekarang = now.toLocaleTimeString('id-ID', { hour12: false });

    // Hitung response time / ping
    const timestamp = msg.messageTimestamp * 1000;
    const ping = new Date().getTime() - timestamp;

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
