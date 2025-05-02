const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Jakarta');

module.exports = async (sock, msg) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');

    if (!isGroup) return sock.sendMessage(from, { text: '❌ Command ini hanya untuk grup.' });

    const metadata = await sock.groupMetadata(from);
    const isAdmin = metadata.participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
    if (!isAdmin) return sock.sendMessage(from, { text: '❌ Hanya admin grup yang bisa menggunakan command ini.' });

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedSender = msg.message.extendedTextMessage?.contextInfo?.participant;

    if (!quoted || !quotedSender) return sock.sendMessage(from, { text: '❌ Harus reply gambar/teks.' });

    const displayName = quotedSender.split('@')[0];
    const jam = moment().format('HH:mm:ss');
    const tanggal = moment().format('MMM DD, YYYY');

    const response = `*❏「 TERANSAKSI 𝗦𝗘𝗟𝗘𝗦𝗔𝗜 」❏*\n\n` +
                     ` 🔍 *Nama:* @${displayName}\n` +
                     ` ✨ *Status:* ✅ Berhasil\n` +
                     ` 🕖 *Jam:* ${jam}\n` +
                     ` 📆 *Tanggal:* ${tanggal}\n\n` +
                     `Terima kasih @${displayName}, ditunggu orderan selanjutnya ya!\n`;

    await sock.sendMessage(from, {
        text: response,
        mentions: [quotedSender]
    });
};
