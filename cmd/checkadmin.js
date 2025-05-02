// cmd/checkadmin.js (versi fix)
module.exports = async (sock, msg) => {
    try {
        const from = msg.key.remoteJid;
        const groupMetadata = await sock.groupMetadata(from);
        const participants = groupMetadata.participants;

        // Gunakan ID bot dari msg.key.id jika user.id tidak cocok
        const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';

        const botData = participants.find(p => p.id === botJid);

        let status = '';

        if (!botData) {
            status = 'Bot tidak ditemukan dalam daftar peserta grup.';
        } else if (!botData.admin) {
            status = 'Bot ditemukan tapi bukan admin grup.';
        } else {
            status = `Bot adalah admin grup dengan status: *${botData.admin}*`;
        }

        await sock.sendMessage(from, { text: status });

    } catch (err) {
        console.error('Error check admin:', err);
        await sock.sendMessage(msg.key.remoteJid, { text: 'Terjadi kesalahan saat mengecek status admin bot.' });
    }
};

