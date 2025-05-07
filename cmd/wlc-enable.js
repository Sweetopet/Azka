const fs = require('fs');
const path = require('path');

module.exports = async (sock, m, text) => {
    try {
        const jid = m?.key?.remoteJid;
        if (!jid) return;

        // Cek apakah pengirim admin
        const metadata = await sock.groupMetadata(jid);
        const sender = m.key.participant || m.key.remoteJid;
        const isAdmin = metadata.participants.find(p => p.id === sender)?.admin;

        if (!isAdmin) {
            await sock.sendMessage(jid, { text: '❌ Hanya *admin grup* yang dapat mengaktifkan fitur welcome.' });
            return;
        }

        const welcomePath = path.join(__dirname, '../data/welcome.json');
        if (!fs.existsSync(welcomePath)) {
            fs.writeFileSync(welcomePath, JSON.stringify({}, null, 2));
        }

        let data = JSON.parse(fs.readFileSync(welcomePath));

        if (data[jid]) {
            await sock.sendMessage(jid, { text: 'ℹ️ Fitur Welcome sudah *aktif* di grup ini.' });
        } else {
            data[jid] = true;
            fs.writeFileSync(welcomePath, JSON.stringify(data, null, 2));
            await sock.sendMessage(jid, { text: '✅ Fitur Welcome telah *diaktifkan* di grup ini.' });
        }

    } catch (err) {
        console.error('Error di wlc-enable:', err);
    }
};
