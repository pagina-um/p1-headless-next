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
      transaction_key: `${donationData.type}-${Date.now()}`,
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
      key: `${donationData.type}-${Date.now()}`,
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

/* 

example transaction details - single MBW


{
  id: '96eea832-0a0a-4f35-be17-c87ff5e180d8',
  type: 'sale',
  key: '',
  expiration_time: '2025-09-02T22:08:00Z',
  customer: {
    id: '6798d954-484d-4b55-9504-09299e1d7715',
    name: 'teste',
    email: 'teste@teste.com',
    phone: '918190321',
    phone_indicative: '+351',
    key: 'customer-1756764535032',
    language: 'PT'
  },
  method: { type: 'MBW', status: 'active' },
  currency: 'EUR',
  value: 1,
  transactions: [
    {
      id: '66dd19aa-a27d-4c9e-9c24-65c4a96ad2e6',
      key: '',
      created_at: '2025-09-01T22:12:09Z',
      date: '2025-09-01T22:12:10Z',
      values: [Object],
      transfer_date: '2025-09-04T00:00:00Z',
      transfer_batch: '',
      method: 'mbw',
      document_number: 'PGINAU0205220504839720250901221210',
      descriptive: 'Contribuição - Página UM'
    }
  ],
  captures: [
    {
      id: '66dd19aa-a27d-4c9e-9c24-65c4a96ad2e6',
      status: 'success',
      transaction_key: 'single-1756764535032',
      capture_date: '2025-09-01',
      account: [Object],
      descriptive: 'Contribuição - Página UM',
      value: 1,
      force_3ds: false
    }
  ],
  created_at: '2025-09-01 22:08:58',
  payment_status: 'paid',
  paid_at: '2025-09-01 22:12:10'
}*/
