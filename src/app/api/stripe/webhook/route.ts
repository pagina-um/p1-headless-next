import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  sendDonationThankYouEmail,
  sendRecurringPaymentEmail,
  sendMultibancoEmail,
} from "@/services/postmark";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("Missing Stripe signature");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`Received Stripe event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "checkout.session.async_payment_succeeded":
        await handleAsyncPaymentSucceeded(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    // Return 200 to acknowledge receipt - we don't want Stripe to retry
    // Log the error for monitoring instead
    return NextResponse.json({ received: true, error: "Handler failed" });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const donorName = session.metadata?.donor_name || "Apoiante";
  const donorEmail = session.customer_email;
  const donationType = session.metadata?.donation_type as
    | "single"
    | "subscription";
  const amountTotal = session.amount_total ? session.amount_total / 100 : 0;

  if (!donorEmail) {
    console.error("No email found in checkout session:", session.id);
    return;
  }

  // Check if this is a Multibanco payment (payment_status will be "unpaid")
  if (session.payment_status === "unpaid" && session.payment_intent) {
    await handleMultibancoPayment(session, donorName, donorEmail, amountTotal);
    return;
  }

  // For paid sessions (card, MB Way), send thank you email immediately
  console.log(
    `Processing ${donationType} donation of ${amountTotal}€ from ${donorName} (${donorEmail})`
  );

  await sendDonationThankYouEmail({
    to: donorEmail,
    donorName,
    amount: amountTotal,
    donationType: donationType || "single",
  });
}

async function handleMultibancoPayment(
  session: Stripe.Checkout.Session,
  donorName: string,
  donorEmail: string,
  amount: number
) {
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (!paymentIntentId) {
    console.error("No payment intent found for Multibanco session:", session.id);
    return;
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const multibancoDetails =
      paymentIntent.next_action?.multibanco_display_details;

    if (!multibancoDetails) {
      console.error(
        "No Multibanco details found in payment intent:",
        paymentIntentId
      );
      return;
    }

    const entity = multibancoDetails.entity || "";
    const reference = multibancoDetails.reference || "";
    const expiresAt = multibancoDetails.expires_at
      ? new Date(multibancoDetails.expires_at * 1000).toLocaleDateString(
          "pt-PT",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        )
      : "";

    console.log(
      `Processing Multibanco payment of ${amount}€ from ${donorName} (${donorEmail}) - Entity: ${entity}, Reference: ${reference}`
    );

    await sendMultibancoEmail({
      to: donorEmail,
      donorName,
      amount,
      entity,
      reference,
      expiresAt,
    });
  } catch (err) {
    console.error("Failed to retrieve Multibanco details:", err);
  }
}

async function handleAsyncPaymentSucceeded(session: Stripe.Checkout.Session) {
  // This event fires when Multibanco payment is actually completed
  const donorName = session.metadata?.donor_name || "Apoiante";
  const donorEmail = session.customer_email;
  const amountTotal = session.amount_total ? session.amount_total / 100 : 0;

  if (!donorEmail) {
    console.error("No email found in async payment session:", session.id);
    return;
  }

  console.log(
    `Multibanco payment completed: ${amountTotal}€ from ${donorName} (${donorEmail})`
  );

  await sendDonationThankYouEmail({
    to: donorEmail,
    donorName,
    amount: amountTotal,
    donationType: "single",
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Only send for recurring subscription payments (not the first one)
  // The first payment is handled by checkout.session.completed
  if (invoice.billing_reason !== "subscription_cycle") {
    console.log(
      `Skipping invoice ${invoice.id} - billing reason: ${invoice.billing_reason}`
    );
    return;
  }

  const customerEmail = invoice.customer_email;
  const amountPaid = invoice.amount_paid / 100;

  if (!customerEmail) {
    console.error("No email found in invoice:", invoice.id);
    return;
  }

  // Get customer name from Stripe
  let customerName = "Apoiante";
  if (invoice.customer && typeof invoice.customer === "string") {
    try {
      const customer = await stripe.customers.retrieve(invoice.customer);
      if (!customer.deleted && customer.name) {
        customerName = customer.name;
      }
    } catch (err) {
      console.error("Failed to retrieve customer:", err);
    }
  }

  console.log(
    `Processing recurring payment of ${amountPaid}€ from ${customerName} (${customerEmail})`
  );

  await sendRecurringPaymentEmail({
    to: customerEmail,
    donorName: customerName,
    amount: amountPaid,
  });
}
