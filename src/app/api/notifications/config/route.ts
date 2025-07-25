import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const vapidKeys = {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
    privateKey: process.env.VAPID_PRIVATE_KEY ? "Present" : "Missing",
    subject: process.env.VAPID_SUBJECT || "mailto:admin@example.com",
  };

  return NextResponse.json({
    publicKey: vapidKeys.publicKey
      ? `${vapidKeys.publicKey.substring(0, 10)}...`
      : "Missing",
    privateKey: vapidKeys.privateKey,
    subject: vapidKeys.subject,
    allEnvVars: Object.keys(process.env).filter((key) => key.includes("VAPID")),
  });
}
