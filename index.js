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

            const dataPath = './data/data.json';
            const pesan = body.trim().toLowerCase();
            if (fs.existsSync(dataPath)) {
                const data = JSON.parse(fs.readFileSync(dataPath));
                const kategoriList = Object.keys(data);

                // User ketik nama kategori (tanpa prefix)
                const kategoriKey = kategoriList.find(k => k.toLowerCase() === pesan);
                if (kategoriKey) {
                    const isi = data[kategoriKey];
                    return sock.sendMessage(from, { text: isi });
                }

                // User ketik "list"
                if (pesan === 'list') {
                    if (kategoriList.length === 0) {
                        return sock.sendMessage(from, { text: '❌ Belum ada daftar produk tersedia.' });
                    } else {
                        const pushName = msg.pushName || "User";
                        const waktuList = moment().tz("Asia/Jakarta").locale('id').format("dddd, D MMMM YYYY HH:mm:ss");

                        const teks =
`*❏「 AZKASHOP INDONESIA 」❏*
╭──────────────────╮
│ *Halo*, ${pushName}
│ *${waktuList}*
│────────୨ৎ─────────
│𝐾𝑒𝑡𝑖𝑘 𝑙𝑎𝑦𝑎𝑛𝑎𝑛 𝑑𝑖𝑏𝑎𝑤𝑎ℎ 𝑢𝑛𝑡𝑢𝑘,
│𝑚𝑒𝑙𝑖ℎ𝑎𝑡 𝐷𝑎𝑓𝑡𝑎𝑟 𝐻𝑎𝑟𝑔𝑎
${kategoriList.map(k => `│あ ${k}`).join('\n')}
│
╰──────────────────╯
> _Ketik nama layanan untuk melihat detailnya._`;

                        return sock.sendMessage(from, { text: teks });
                    }
                }
            }

            // Respon tanpa prefix: keyword khusus
            if (pesan === 'payment') {
                const teks = `*〘 METODE PEMBAYARAN 〙*\n\n• Gopay : 08xxxxxxx\n• Dana : 08xxxxxxx\n• BCA : 1234567890 (a.n Nama)\n• Qris : (lihat gambar)\n\n*Silakan pilih metode dan konfirmasi setelah pembayaran.*`;
                return sock.sendMessage(from, {
                    image: { url: 'https://files.catbox.moe/yr3khv.png' },
                    caption: teks
                });
            }

            // HANDLE COMMAND DENGAN PREFIX
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
