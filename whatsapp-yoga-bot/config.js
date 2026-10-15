module.exports = {
  // Exact name of the WhatsApp group to watch.
  groupName: 'Yoga Group',

  // Phone numbers (country code + number, digits only) whose messages get a reaction.
  // Leave empty to react to anyone in the group who posts "yoga done".
  senders: [
    // '919876543210',
    // '919812345678',
  ],

  // Messages matching this get a reaction: "yoga done", "Yoga Done!", "yoga done ✅", ...
  pattern: /\byoga\s*done\b/i,

  reaction: '👍',

  // Wait a few seconds before reacting so it doesn't look instant.
  minDelayMs: 3000,
  maxDelayMs: 15000,
};
