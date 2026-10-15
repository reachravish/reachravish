const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('./config');

const client = new Client({
  // Keeps you logged in between runs (session saved in .wwebjs_auth/).
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

const digits = (s) => (s || '').replace(/\D/g, '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const randomDelay = () =>
  config.minDelayMs + Math.random() * (config.maxDelayMs - config.minDelayMs);

async function isAllowedSender(msg) {
  if (config.senders.length === 0) return true;
  const allowed = config.senders.map(digits);
  // msg.author can be a phone-based id or an opaque "@lid" id, so also check the contact's number.
  const contact = await msg.getContact();
  const candidates = [digits(msg.author), digits(contact.number)];
  return candidates.some((c) => c && allowed.includes(c));
}

client.on('qr', (qr) => {
  console.log('Scan this QR in WhatsApp > Settings > Linked devices > Link a device:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log(`Ready. Watching group "${config.groupName}" for ${config.pattern}`);
});

client.on('auth_failure', (m) => console.error('Auth failure:', m));
client.on('disconnected', (reason) => console.error('Disconnected:', reason));

client.on('message', async (msg) => {
  try {
    if (!config.pattern.test(msg.body)) return;

    const chat = await msg.getChat();
    if (!chat.isGroup || chat.name !== config.groupName) return;

    const contact = await msg.getContact();
    const who = contact.pushname || contact.number || msg.author;

    if (!(await isAllowedSender(msg))) {
      console.log(`Skipping "${msg.body}" from ${who} (${msg.author}) - not in senders list`);
      return;
    }

    await sleep(randomDelay());
    await msg.react(config.reaction);
    console.log(`${new Date().toLocaleString()}  Reacted ${config.reaction} to ${who}: "${msg.body}"`);
  } catch (err) {
    console.error('Error handling message:', err);
  }
});

client.initialize();
