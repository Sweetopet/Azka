const moment = require('moment-timezone');
require('moment/locale/id');

module.exports = async (sock, msg, args, prefix) => {
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const sender = msg.key.participant || msg.key.remoteJid;
    const pushName = msg.pushName || "User";
    const waktu = moment().tz("Asia/Jakarta").locale('id').format("dddd, D MMMM YYYY HH:mm:ss");

    let isAdmin = false;

    if (isGroup) {
        const metadata = await sock.groupMetadata(from);
        const participant = metadata.participants.find(p => p.id === sender);
        isAdmin = participant?.admin !== undefined;
    }

    const publicCommands = [
        `${prefix}menu`,
        `${prefix}ping`,
        `${prefix}uptime`,
        `${prefix}info`,
        `${prefix}checkadmin`,
    ];
    const adminCommands = [
        `${prefix}p`,
        `${prefix}d`,
        `${prefix}open`,
        `${prefix}close`,
        `${prefix}addlist`,
        `${prefix}dellist`,
        `${prefix}editlist`,
        `${prefix}wlc-enable`,
        `${prefix}wlc-disable`,
        `${prefix}goodbye-enable`,
        `${prefix}goodbye-disable`,
    ];

    let teks = `🫶 Hello *${pushName}*\nɪ ᴀᴍ ᴀᴜᴛᴏᴍᴀᴛᴇᴅ ꜱyꜱᴛᴇᴍ\n(ᴡᴀ ʙᴏᴛ) ᴛʜᴀᴛ ᴄᴀɴ ʜᴇʟᴩ ᴛᴏ ᴅᴏ\nꜱᴏᴍᴇᴛʜɪɴɢ, ꜱᴇᴀʀᴄʜ ᴀɴᴅ ɢᴇᴛ ᴅᴀᴛᴀ / ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ ᴏɴʟy ᴛʜʀᴏᴜɢʜ ᴡʜᴀᴛꜱᴀᴩᴩ\n\n⚠️ ʙᴏᴛ ɪɴɪ ᴍᴀꜱɪʜ ᴛᴀʜᴀᴩ\nʙᴇᴛᴀ ᴀᴩᴀʙɪʟᴀ ᴀᴅᴀ ʙᴜɢ/\nᴇʀᴏʀ ʜᴀʀᴀᴩ ʟᴀᴩᴏʀ ᴋᴇ ᴏᴡɴᴇʀ\n\n⏰ ${waktu}\n\n`;
    teks += '*╭───❏「 CMD PUBLIC 」❏*\n';
    publicCommands.forEach(cmd => {
        teks += `│  ${cmd}\n`;
    });
    teks += '*╰────────────────╯*\n';

    if (isAdmin) {
        teks += '\n*╭───❏「 CMD GROUP 」❏*\n';
        adminCommands.forEach(cmd => {
            teks += `│  ${cmd}\n`;
        });
        teks += '*╰────────────────╯*\n\n🐞𝙶𝚘 𝚝𝚘 𝚛𝚎𝚙𝚘𝚛𝚝 𝚋𝚞𝚐\nwa.me/6383892801524';
    }

    await sock.sendMessage(from, { text: teks });
};
