// === Import Awal ===
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    makeInMemoryStore
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const chalk = require('chalk');
const config = require('./config');
const fs = require('fs');
const moment = require('moment-timezone');
require('moment/locale/id');

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state
    });

    store.bind(sock.ev);
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            console.log(chalk.redBright('Connection closed. Reconnecting...'));
            if (reason !== DisconnectReason.loggedOut) {
                startBot();
            } else {
                console.log(chalk.red('You are logged out.'));
            }
        } else if (connection === 'open') {
            console.log(chalk.bgBlueBright.white.bold('\n Azka Bot sudah online! \n'));
        }
    });

   sock.ev.on('group-participants.update', async (update) => {
    const { id, participants, action } = update;
    const metadata = await sock.groupMetadata(id).catch(() => null);
    if (!metadata) return;

    const welcomeData = JSON.parse(fs.readFileSync('./data/welcome.json', 'utf-8'));
    const goodbyeData = JSON.parse(fs.readFileSync('./data/goodbye.json', 'utf-8'));
    const isWelcomeOn = welcomeData[id];
    const isGoodbyeOn = goodbyeData[id];

    for (const participant of participants) {
        try {
            const groupName = metadata.subject;
            const waktu = moment().tz('Asia/Jakarta').format('HH:mm:ss');
            const tanggal = moment().tz('Asia/Jakarta').format('D MMMM YYYY');
            const tagUser = `@${participant.split('@')[0]}`;

            if (action === 'add' && isWelcomeOn) {
                const teks =
`*ꞌꞋ ࣪𓂃 ִֶָ 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𓂃 ִֶָ ࣪ꞌꞋ*

✨ *Nama:* ${tagUser}
👥 *Grup:* ${groupName}
🗓️ *Tanggal:* ${tanggal}
🕖 *Jam:* ${waktu}

📌 _Ketik_ *List* untuk melihat menu pricelist
📌 _Ketik_ *Payment* untuk info pembayaran

⚠️ *NOTE*\n_Keluar dari grup berarti garansi hangus ya_`;

                await sock.sendMessage(id, {
                    image: { url: 'https://files.catbox.moe/0fecnu.jpeg' },
                    caption: teks,
                    mentions: [participant]
                });
            }

            if (action === 'remove' && isGoodbyeOn) {
                const teks =
`*ꞌꞋ ࣪𓂃 ִֶָ 𝗚𝗢𝗢𝗗𝗕𝗬𝗘 𓂃 ִֶָ ࣪ꞌꞋ*

✨ *Nama:* ${tagUser}
👥 *Grup:* ${groupName}
🗓️ *Tanggal:* ${tanggal}
🕖 *Jam:* ${waktu}

_Yahh garansi nya hilang dong ☺️_`;

                await sock.sendMessage(id, {
                    image: { url: 'https://files.catbox.moe/xpf3k2.jpeg' },
                    caption: teks,
                    mentions: [participant]
                });
            }
        } catch (e) {
            console.log('Error di group-participants.update:', e);
        }
    }
});

    // === Handler Pesan Masuk ===
    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const from = msg.key.remoteJid;
            const type = Object.keys(msg.message)[0];
            const body = type === 'conversation'
                ? msg.message.conversation
                : type === 'extendedTextMessage'
                    ? msg.message.extendedTextMessage.text
                    : '';
            if (!body) return;

            const sender = msg.key.participant || msg.key.remoteJid;
            const waktu = moment().tz('Asia/Jakarta').format('HH:mm:ss | dddd, D MMMM YYYY');
            const isGroup = from.endsWith('@g.us');

            console.log(chalk.yellow('==============================='));
            if (isGroup) {
                const metadata = await sock.groupMetadata(from).catch(() => ({}));
                const groupName = metadata.subject || 'Grup Tidak Diketahui';
                console.log(chalk.magenta.bold('[GROUP]'));
                console.log(chalk.green(`Grup: ${groupName} (${from})`));
                console.log(chalk.cyan(`Pengirim: ${sender.replace('@s.whatsapp.net', '')}`));
            } else {
                console.log(chalk.blue.bold('[PRIVATE]'));
                console.log(chalk.green(`Dari: ${sender.replace('@s.whatsapp.net', '')}`));
            }
            console.log(chalk.cyan(`Waktu: ${waktu}`));
            console.log(chalk.white(`Pesan: "${body}"`));
            console.log(chalk.yellow('===============================\n'));

            // Cek dan balas data list
            const dataPath = './data/data.json';
            const pesan = body.trim().toLowerCase();
            if (fs.existsSync(dataPath)) {
                const data = JSON.parse(fs.readFileSync(dataPath));
                const kategoriList = Object.keys(data);

                const kategoriKey = kategoriList.find(k => k.toLowerCase() === pesan);
                if (kategoriKey) {
                    const isi = data[kategoriKey];
                    return sock.sendMessage(from, { text: isi });
                }

                if (pesan === 'list') {
                    if (kategoriList.length === 0) {
                        return sock.sendMessage(from, { text: '❌ Belum ada daftar produk tersedia.' });
                    } else {
                        const pushName = msg.pushName || "User";
                        const waktuList = moment().tz("Asia/Jakarta").locale('id').format("dddd, D MMMM YYYY HH:mm:ss");

                        const teks =
`*❏「 APP PREMIUM V2.0 」❏*
╭──────────────────╮
│ *Halo*, ${pushName}
│ *${waktuList}*
│────────୨ৎ─────────
│𝐾𝑒𝑡𝑖𝑘 𝑙𝑎𝑦𝑎𝑛𝑎𝑛 𝑑𝑖𝑏𝑎𝑤𝑎ℎ 𝑢𝑛𝑡𝑢𝑘,
│𝑚𝑒𝑙𝑖ℎ𝑎𝑡 𝐷𝑎𝑓𝑡𝑎𝑟 𝐻𝑎𝑟𝑔𝑎
│────────୨ৎ─────────
${kategoriList.map(k => `│あ ${k}`).join('\n')}
│
╰──────────────────╯
> _Ketik nama layanan menggunakan huruf besar untuk melihat detailnya._`;

                        return sock.sendMessage(from, { text: teks });
                    }
                }
            }

            if (pesan === 'payment') {
                const teks = `*〘 METODE PEMBAYARAN 〙*\n\n• Gopay : 083892801524\nA/n : Andry Elva Rizal Lubis\n\n• Dana : 087804572203\nA/n : Yessy Anggraeni\n\n• SEABANK : 901951956400\nA/n : Andry Elva Rizal Lubis\n\n*𝐒𝐄𝐑𝐓𝐀𝐊𝐀𝐍 𝐁𝐔𝐊𝐓𝐈 𝐓𝐅 𝐀𝐆𝐀𝐑 𝐒𝐄𝐆𝐄𝐑𝐀 𝐃𝐈 𝐏𝐑𝐎𝐒𝐄𝐒 𝐎𝐋𝐄𝐇 𝐎𝐖𝐍𝐄𝐑 !!*\n\n*Silakan pilih metode dan konfirmasi setelah pembayaran.*`;
                return sock.sendMessage(from, {
                    image: { url: 'https://files.catbox.moe/vm14ko.jpeg' },
                    caption: teks
                });
            }

            // === Handler Command Prefix ===
            const prefixes = config.prefix;
            const prefixUsed = prefixes.find(p => body.startsWith(p));
            if (!prefixUsed) return;

            const args = body.slice(prefixUsed.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();
            const commandPath = `./cmd/${command}.js`;

            if (fs.existsSync(commandPath)) {
                const executeCommand = require(commandPath);
                await executeCommand(sock, msg, args, prefixUsed);
            } else {
                await sock.sendMessage(from, { text: `❌ Command *${command}* tidak ditemukan.` });
            }

        } catch (err) {
            console.log(chalk.red('Error di messages.upsert:'), err);
        }
    });

    sock.store = store;
}

startBot();
