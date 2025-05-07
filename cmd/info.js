module.exports = async (sock, msg, args) => {
    const from = msg.key.remoteJid;

    try {
        // Mengecek apakah pesan datang dari grup
        if (!from.endsWith('@g.us')) {
            await sock.sendMessage(from, { text: '❌ Perintah ini hanya bisa digunakan di dalam grup.' });
            return;
        }

        // Mengambil metadata grup
        const metadata = await sock.groupMetadata(from);

        // Menyusun informasi grup
        const groupName = metadata.subject || 'Grup Tidak Diketahui';
        const groupDescription = metadata.desc || 'Deskripsi tidak tersedia.';
        const participantCount = metadata.participants.length;

        // Membuat pesan dengan format estetik
        const infoText = `
╭━━〔 *Informasi Grup* 〕
┃ 📛 *Nama Grup* : ${groupName}
┃ 👥 *Jumlah Anggota* : ${participantCount}
┃ 📝 *Deskripsi* : \n${groupDescription}
`;

        // Mengirimkan pesan informasi grup
        await sock.sendMessage(from, { text: infoText });
    } catch (error) {
        console.error('Error saat mengambil informasi grup:', error);
        await sock.sendMessage(from, { text: '⚠️ Terjadi kesalahan saat mengambil informasi grup.' });
    }
};
