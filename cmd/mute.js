module.exports = async (sock, msg) => {
    const { from, sender } = msg;
    const isGroup = from.endsWith('@g.us');

    if (!isGroup) {
        return sock.sendMessage(from, { text: 'Perintah ini hanya bisa digunakan di grup.' });
    }

    const member = msg.message.extendedTextMessage ? msg.message.extendedTextMessage.text : '';
    if (!member) {
        return sock.sendMessage(from, { text: 'Silakan sebutkan anggota yang akan dibisukan (gunakan @mention).' });
    }

    if (!msg.key.fromMe && !msg.key.participant.includes(sender)) {
        return sock.sendMessage(from, { text: 'Hanya admin grup yang bisa menggunakan perintah ini.' });
    }

    try {
        // Implementasikan mute jika Baileys mendukung
        await sock.groupParticipantsUpdate(from, [member], 'mute');
        sock.sendMessage(from, { text: `${member} telah dibisukan.` });
    } catch (error) {
        sock.sendMessage(from, { text: 'Terjadi kesalahan saat membisukan anggota.' });
    }
};
