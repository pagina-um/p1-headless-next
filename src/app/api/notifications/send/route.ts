import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

// Configure VAPID keys (you'll need to generate these)
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  privateKey: process.env.VAPID_PRIVATE_KEY || "",
  subject: process.env.VAPID_SUBJECT || "mailto:admin@example.com",
};

// Validate VAPID keys are present
if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  console.error("VAPID keys not configured properly:", {
    publicKey: vapidKeys.publicKey ? "Present" : "Missing",
    privateKey: vapidKeys.privateKey ? "Present" : "Missing",
    subject: vapidKeys.subject,
  });
}

webpush.setVapidDetails(
  vapidKeys.subject,
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Redis configuration
const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;
const SUBSCRIPTIONS_KEY = "push-subscriptions";

async function getSubscriptions(): Promise<any[]> {
  try {
    if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
      return [];
    }

    const response = await fetch(
      `${KV_REST_API_URL}/get/${SUBSCRIPTIONS_KEY}`,
      {
        headers: {
          Authorization: `Bearer ${KV_REST_API_TOKEN}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.result ? JSON.parse(data.result) : [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return [];
  }
}

async function updateSubscriptions(subscriptions: any[]): Promise<boolean> {
  try {
    if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
      return false;
    }

    const response = await fetch(
      `${KV_REST_API_URL}/set/${SUBSCRIPTIONS_KEY}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${KV_REST_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscriptions),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Error updating subscriptions:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check VAPID configuration before proceeding
    if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
      return NextResponse.json(
        { error: "VAPID keys not configured properly" },
        { status: 500 }
      );
    }

    const { payload, subscriptions: targetSubscriptions } =
      await request.json();

    if (!payload || !payload.title || !payload.body) {
      return NextResponse.json(
        { error: "Invalid payload: title and body are required" },
        { status: 400 }
      );
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/icon.png",
      badge: payload.badge || "/icon.png",
      image: payload.image, // Add the image field for rich notifications
      data: {
        url: payload.url || "/",
        ...payload.data,
      },
      actions: [
        {
          action: "view",
          title: "Ver história",
        },
        {
          action: "dismiss",
          title: "Dispensar",
        },
      ],
    });

    // Use provided subscriptions or all stored subscriptions
    const allSubscriptions = await getSubscriptions();
    const subsToSendTo = targetSubscriptions || allSubscriptions;

    if (subsToSendTo.length === 0) {
      return NextResponse.json({
        message: "No subscriptions found",
        successful: 0,
        failed: 0,
        total: 0,
      });
    }

    const validSubscriptions: any[] = [];
    const sendPromises = subsToSendTo.map(async (subscription: any) => {
      try {
        await webpush.sendNotification(subscription, notificationPayload);
        validSubscriptions.push(subscription);
        return { success: true, subscription };
      } catch (error: any) {
        console.error("Error sending notification:", error);
        // Don't add invalid subscriptions to validSubscriptions
        return { success: false, subscription, error };
      }
    });

    const results = await Promise.all(sendPromises);
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    // Update subscriptions in Redis, removing invalid ones
    if (failed > 0 && !targetSubscriptions) {
      await updateSubscriptions(validSubscriptions);
    }

    return NextResponse.json({
      message: "Notifications sent",
      successful,
      failed,
      total: subsToSendTo.length,
    });
  } catch (error) {
    console.error("Error in send notification API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
