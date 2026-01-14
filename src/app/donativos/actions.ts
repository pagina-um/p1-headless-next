"use server";

import { CheckoutManifest } from "@easypaypt/checkout-sdk";

interface DonationData {
  amount: number;
  type: "single" | "subscription";
  name: string;
  email: string;
  phone: string;
  durationYears?: number;
}

export async function createDonationCheckout(
  donationData: DonationData
): Promise<CheckoutManifest> {
  const accountId = process.env.EASYPAY_CLIENT_ID;
  const apiKey = process.env.EASYPAY_API_KEY;
  const apiUrl =
    process.env.EASYPAY_API_URL || "https://api.test.easypay.pt/2.0";

  if (!accountId || !apiKey) {
    throw new Error("Easypay credentials not configured");
  }

  // Set expiration time to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  let payment: any = {
    methods: ["cc", "mb", "mbw", "dd", "vi", "ap", "gp"],
    type: "sale",
    capture: {
      transaction_key: `donation-${Date.now()}`,
      descriptive: `Contribuição - Página UM`,
    },
    currency: "EUR",
    expiration_time: tomorrow.toISOString().slice(0, 16).replace("T", " "),
  };

  // For subscriptions, add subscription-specific fields
  if (donationData.type === "subscription") {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1);

    // Set expiration based on user-selected duration (Checkout SDK requires a termination condition)
    const durationYears = donationData.durationYears || 2;
    const expirationTime = new Date();
    expirationTime.setFullYear(expirationTime.getFullYear() + durationYears);

    payment.start_time = startTime.toISOString().slice(0, 16).replace("T", " ");
    payment.expiration_time = expirationTime.toISOString().slice(0, 16).replace("T", " ");
    payment.frequency = "1M"; // Monthly subscription
    payment.capture_now = true; // Charge immediately, then start recurring from start_time
    payment.methods = ["cc", "dd"]; // Only credit card and direct debit for subscriptions
  }

  let order: any = {};

  // Add order details for single donations and subscriptions
  if (donationData.type === "single" || donationData.type === "subscription") {
    order = {
      value: donationData.amount,
      key: `donation-${Date.now()}`,
      items: [
        {
          description:
            donationData.type === "subscription"
              ? `Contribuição Mensal - Página UM`
              : `Contribuição - Página UM`,
          quantity: 1,
          key: `contribution-${donationData.type}`,
          value: donationData.amount,
        },
      ],
    };
  }

  const payload = {
    type: [donationData.type],
    payment: payment,
    order: order,
    config: {
      logo_url: "https://paginaum.pt/icon.png",
      background_color: "#ffffff",
      accent_color: "#e10012",
    },
    customer: {
      name: donationData.name,
      email: donationData.email,
      phone: donationData.phone || "000000000",
      phone_indicative: "+351",
      key: `customer-${Date.now()}`,
      language: "PT",
    },
  };

  try {
    const response = await fetch(`${apiUrl}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        AccountId: accountId,
        ApiKey: apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Easypay API Error:", response.status, errorText);
      throw new Error(`Failed to create checkout session: ${response.status}`);
    }

    const manifest: CheckoutManifest = await response.json();

    // Log successful creation (remove in production)
    console.log("Checkout session created:", manifest.id);

    return manifest;
  } catch (error) {
    console.error("Error creating Easypay checkout:", error);
    throw new Error("Failed to create payment session");
  }
}
