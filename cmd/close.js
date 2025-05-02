const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Jakarta');

module.exports = async (sock, msg) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants;
    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const isBotAdmin = participants.find(p => p.id === botNumber)?.admin;
    const isUserAdmin = participants.find(p => p.id === sender)?.admin;

    if (!isUserAdmin) return sock.sendMessage(from, { text: '❌ Perintah ini hanya untuk *admin grup*.' });
    if (!isBotAdmin) return sock.sendMessage(from, { text: '❌ Bot perlu menjadi admin untuk menutup grup.' });

    try {
        await sock.groupSettingUpdate(from, 'announcement');
        const time = moment().format('⏰ HH:mm:ss');
        const date = moment().format('📆 MMM DD, YYYY');
        const mentionText = `@${sender.split('@')[0]}`;
        const pesan = `O━• *Group Close* •━O

📜 *Group Telah Di Tutup Oleh Admin* ${mentionText}

\`\`\`🔒 Group Close
${date}
${time}\`\`\`

━O━O━••••••••••••━O━O━`;

        await sock.sendMessage(from, {
            text: pesan,
            mentions: [sender]
        });
    } catch (err) {
        await sock.sendMessage(from, { text: '❌ Gagal menutup grup. Mungkin bot tidak memiliki izin yang cukup.' });
    }
};
