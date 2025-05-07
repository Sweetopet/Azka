const fs = require('fs');
const path = './data/goodbye.json';

module.exports = async (sock, msg, args, prefix) => {
    try {
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');

        if (!isGroup) {
            return sock.sendMessage(from, { text: '❌ Command ini hanya dapat digunakan di dalam grup.' });
        }

        const metadata = await sock.groupMetadata(from);
        const sender = msg.key.participant || msg.key.remoteJid;
        const isAdmin = metadata.participants.find(p => p.id === sender)?.admin;

        if (!isAdmin) {
            return sock.sendMessage(from, { text: '❌ Hanya *admin grup* yang dapat mengaktifkan fitur goodbye.' });
        }

        let data = {};
        if (fs.existsSync(path)) {
            data = JSON.parse(fs.readFileSync(path));
        }

        if (data[from]) {
            return sock.sendMessage(from, { text: 'ℹ️ Fitur Goodbye sudah *aktif* di grup ini.' });
        }

        data[from] = true;
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
        await sock.sendMessage(from, { text: '✅ Fitur Goodbye berhasil *diaktifkan* di grup ini.' });

    } catch (err) {
        console.error('Error di goodbye-enable:', err);
    }
};
