const fs = require('fs');
const path = './data/data.json';

module.exports = async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');

    if (!isGroup) {
        return sock.sendMessage(from, { text: '❌ Command ini hanya bisa digunakan di grup.' });
    }

    const metadata = await sock.groupMetadata(from);
    const isAdmin = metadata.participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));

    if (!isAdmin) {
        return sock.sendMessage(from, { text: '❌ Hanya admin grup yang bisa mengedit list.' });
    }

    const input = args.join(' ').split('@');
    if (input.length < 2) {
        return sock.sendMessage(from, { text: '❌ Format salah!\nContoh: *.editlist Canva@isi baru list*' });
    }

    const kategori = input[0].trim();
    const teksBaru = input.slice(1).join('@').trim();

    if (!fs.existsSync(path)) {
        return sock.sendMessage(from, { text: '❌ Data list tidak ditemukan.' });
    }

    const data = JSON.parse(fs.readFileSync(path));

    if (!data[kategori]) {
        return sock.sendMessage(from, { text: `❌ Kategori *${kategori}* tidak ditemukan.` });
    }

    data[kategori] = teksBaru;
    fs.writeFileSync(path, JSON.stringify(data, null, 2));

    await sock.sendMessage(from, {
        text: `✅ Kategori *${kategori}* berhasil diperbarui.`
    });
};
