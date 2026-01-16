"use server";

import Stripe from "stripe";

interface DonationData {
  amount: number;
  type: "single" | "subscription";
  name: string;
  email: string;
  phone: string;
  durationYears?: number;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createDonationCheckout(
  donationData: DonationData
): Promise<{ url: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const successUrl = `${baseUrl}/donativos/sucesso?amount=${donationData.amount}&type=${donationData.type}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/donativos`;

  try {
    if (donationData.type === "subscription") {
      // Create a subscription checkout session
      // Note: MB Way and Multibanco don't support recurring payments
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: donationData.email,
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "Contribuição Mensal - Página UM",
                description: "Subscrição mensal para apoiar o jornalismo independente",
              },
              unit_amount: Math.round(donationData.amount * 100), // Stripe uses cents
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          donor_name: donationData.name,
          donor_phone: donationData.phone || "",
          donation_type: "subscription",
        },
      });

      if (!session.url) {
        throw new Error("Failed to create checkout session URL");
      }

      return { url: session.url };
    } else {
      // Create a one-time payment checkout session
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card", "multibanco", "mb_way"],
        customer_email: donationData.email,
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "Contribuição - Página UM",
                description: "Contribuição para apoiar o jornalismo independente",
              },
              unit_amount: Math.round(donationData.amount * 100), // Stripe uses cents
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          donor_name: donationData.name,
          donor_phone: donationData.phone || "",
          donation_type: "single",
        },
      });

      if (!session.url) {
        throw new Error("Failed to create checkout session URL");
      }

      return { url: session.url };
    }
  } catch (error) {
    console.error("Error creating Stripe checkout:", error);
    throw new Error("Failed to create payment session");
  }
}
