import { NextRequest, NextResponse } from "next/server";

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
    const subscription = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
        { status: 400 }
      );
    }

    // Get existing subscriptions
    const subscriptions = await getSubscriptions();

    // Check if subscription already exists
    const existingIndex = subscriptions.findIndex(
      (sub: any) => sub.endpoint === subscription.endpoint
    );

    if (existingIndex === -1) {
      // Add new subscription
      subscriptions.push(subscription);
      await updateSubscriptions(subscriptions);
    }

    console.log("Subscription processed:", subscription.endpoint);
    console.log("Total subscriptions:", subscriptions.length);

    return NextResponse.json({
      message: "Subscription saved successfully",
      total: subscriptions.length,
    });
  } catch (error) {
    console.error("Error saving subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const subscriptions = await getSubscriptions();
    return NextResponse.json({
      total: subscriptions.length,
      subscriptions: subscriptions.map((sub: any) => ({
        endpoint: sub.endpoint.substring(0, 50) + "...",
      })),
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
