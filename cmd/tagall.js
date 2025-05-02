// cmd/tagall.js
module.exports = async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!from.endsWith('@g.us')) {
        await sock.sendMessage(from, { text: '❌ Command ini hanya bisa digunakan di grup.' });
        return;
    }

    const groupMetadata = await sock.groupMetadata(from);
    const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;

    if (!isAdmin) {
        await sock.sendMessage(from, { text: '❌ Hanya admin yang bisa menggunakan command ini.' });
        return;
    }

    const participants = groupMetadata.participants;
    const mentions = participants.map(p => p.id);
    const nomorSemua = participants.map(p => `• @${p.id.replace(/@.+/, '')}`).join('\n');

    const waktu = new Date();
    const jam = waktu.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const customPesan = args.join(' '); // Pesan setelah .tagall
    let teks = '';

    if (customPesan.length > 0) {
        teks = `•━━〔 *NOTIFY* 〕━━•\n\n${nomorSemua}\n\n✅ *Pesan :* ${customPesan}\n\n⏰ *Jam:* ${jam}`;
    } else {
        teks = `•━━〔 *NOTIFY* 〕━━•\n\n${nomorSemua}\n\n⏰ *Jam:* ${jam}`;
    }

    await sock.sendMessage(from, {
        text: teks,
        mentions
    });
};
