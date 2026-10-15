# WhatsApp yoga bot

Reacts 👍 when someone posts "yoga done" in a WhatsApp group.

It runs as a linked device on your own WhatsApp account through
[whatsapp-web.js](https://wwebjs.dev). Unofficial automation is against WhatsApp's
terms, so keep it to this kind of low-volume use.

## Setup

1. Install Node.js 18 or newer.
2. Edit `config.js`: set `groupName` to the group's exact name. Optionally list the
   two people's numbers in `senders` (digits with country code, e.g. `919876543210`).
3. Install and start it:
   ```
   npm install
   npm start
   ```
4. Scan the QR code from your phone: WhatsApp > Settings > Linked devices > Link a device.
   The login is saved in `.wwebjs_auth/`, so you only scan once.

The computer has to stay on with the script running. Your phone does not need to stay online.

## Keep it running

With [pm2](https://pm2.keymetrics.io):
```
npm install -g pm2
pm2 start index.js --name yoga-bot
pm2 save
pm2 startup
```
