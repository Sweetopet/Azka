module.exports = async (sock, msg, args) => {
    const from = msg.key.remoteJid;

    // Hitung uptime bot
    const uptimeInSeconds = process.uptime();
    const hours = Math.floor(uptimeInSeconds / 3600);
    const minutes = Math.floor((uptimeInSeconds % 3600) % 3600 / 60);
    const seconds = Math.floor(uptimeInSeconds % 60);

    // Waktu sekarang
    const now = new Date();
    const jamSekarang = now.toLocaleTimeString('id-ID', { hour12: false });

    // Status uptime
    let status;
    if (hours >= 24) status = 'Sangat Stabil';
    else if (hours >= 1) status = 'Stabil';
    else status = 'Baru Online';

    // Buat pesan estetik
    const message = `╭━━〔 *UPTIME STATUS* 〕
┃ ⏰ *jam :* ${jamSekarang}
┃ ⏳ *Up :* ${hours} Jam ${minutes} Menit ${seconds} Detik
┃ ⚡ *Status :* ${status}
╰━━━━━━━━━━━━━━━━⬣`;

    await sock.sendMessage(from, { text: message });
};
