#!/usr/bin/env node

const webpush = require("web-push");

console.log("Generating VAPID keys for push notifications...\n");

const vapidKeys = webpush.generateVAPIDKeys();

console.log("Public Key (add to NEXT_PUBLIC_VAPID_PUBLIC_KEY):");
console.log(vapidKeys.publicKey);
console.log("\nPrivate Key (add to VAPID_PRIVATE_KEY):");
console.log(vapidKeys.privateKey);
console.log("\nSubject (add to VAPID_SUBJECT):");
console.log("mailto:your-email@example.com");

console.log("\n📝 Add these to your .env.local file:");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log("VAPID_SUBJECT=mailto:your-email@example.com");

console.log(
  "\n⚠️  Keep the private key secure and never expose it to the client!"
);
