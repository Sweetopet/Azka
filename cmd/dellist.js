const fs = require('fs');
const path = './data/data.json';

module.exports = async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');

    // Cek apakah digunakan di grup
    if (!isGroup) {
        return sock.sendMessage(from, { text: '❌ Command ini hanya bisa digunakan di grup.' });
    }

    // Ambil data metadata grup dan cek admin
    const metadata = await sock.groupMetadata(from);
    const isAdmin = metadata.participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));

    if (!isAdmin) {
        return sock.sendMessage(from, { text: '❌ Hanya admin grup yang bisa menghapus list.' });
    }

    if (args.length === 0) {
        return sock.sendMessage(from, { text: '❌ Contoh penggunaan: *.dellist Canva*' });
    }

    const kategori = args.join(' ').trim();

    // Cek dan hapus kategori dari data.json
    if (!fs.existsSync(path)) {
        return sock.sendMessage(from, { text: '❌ Belum ada data untuk dihapus.' });
    }

    const data = JSON.parse(fs.readFileSync(path));

    if (!data[kategori]) {
        return sock.sendMessage(from, { text: `❌ Kategori *${kategori}* tidak ditemukan.` });
    }

    delete data[kategori];
    fs.writeFileSync(path, JSON.stringify(data, null, 2));

    return sock.sendMessage(from, { text: `✅ Kategori *${kategori}* berhasil dihapus.` });
};
