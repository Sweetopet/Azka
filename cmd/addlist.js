const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data/data.json');

module.exports = async (sock, msg, args, prefix) => {
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!isGroup) return sock.sendMessage(from, { text: '❌ Hanya bisa digunakan di dalam grup.' });

    const groupMetadata = await sock.groupMetadata(from);
    const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;

    if (!isAdmin) return sock.sendMessage(from, { text: '❌ Hanya admin grup yang bisa menggunakan perintah ini.' });

    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const commandBody = body.slice(prefix.length + 'addlist'.length).trim();

    if (!commandBody.includes('@')) {
        return sock.sendMessage(from, { text: '❌ Format tidak lengkap!\nContoh: *.addlist Canva@1 Bulan - 1.200*' });
    }

    const [kategoriRaw, ...isiListArr] = commandBody.split('@');
    const kategori = kategoriRaw.trim();
    const isiList = isiListArr.join('@').trim();

    if (!kategori || !isiList) {
        return sock.sendMessage(from, { text: '❌ Format tidak lengkap!\nContoh: *.addlist Canva@1 Bulan - 1.200*' });
    }

    let data = {};
    if (fs.existsSync(dataPath)) {
        data = JSON.parse(fs.readFileSync(dataPath));
    }

    data[kategori] = isiList;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

    await sock.sendMessage(from, { text: `✅ Daftar untuk kategori *${kategori}* berhasil ditambahkan!` });
};
