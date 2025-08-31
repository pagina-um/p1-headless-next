import { NextApiRequest, NextApiResponse } from "next";

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = req.body;

  // Check for successful capture
  if (payload.type === "capture" && payload.status === "success") {
    try {
      const transactionType = payload.key.split("-")[0] as
        | "single"
        | "subscription";
      const customerEmail = await queryEasyPayForEmail(
        payload.id,
        transactionType
      );
      if (customerEmail) {
        await sendPostmarkEmail(customerEmail);
        return res.status(200).json({ message: "Email sent successfully" });
      } else {
        return res.status(400).json({ error: "Customer email not found" });
      }
    } catch (error) {
      console.error("Error processing webhook:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(200).json({ message: "No action taken" });
}

async function queryEasyPayForEmail(
  transactionId: string,
  transactionType: "single" | "subscription"
) {
  const accountId = process.env.EASYPAY_CLIENT_ID;
  const apiKey = process.env.EASYPAY_API_KEY;
  const apiUrl =
    process.env.EASYPAY_API_URL || "https://api.test.easypay.pt/2.0";

  const url = `${apiUrl}/${transactionType}/${transactionId}`;
  const headers = {
    AccountId: process.env.EASYPAY_ACCOUNT_ID,
    ApiKey: process.env.EASYPAY_API_KEY,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, { headers });
  if (response.ok) {
    const data = await response.json();
    return data.customer?.email || null;
  }
  console.error("EasyPay API error:", await response.text());
  return null;
}

async function sendPostmarkEmail(customerEmail: string) {
  const url = "https://api.postmarkapp.com/email";
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Postmark-Server-Token": process.env.POSTMARK_SERVER_TOKEN,
  };
  const body = {
    From: "support@yourdomain.com", // Replace with your verified sender
    To: customerEmail,
    Subject: "Thank You for Your Donation!",
    TextBody:
      "Thank you for your generous donation! We appreciate your support.",
    HtmlBody:
      "<html><body><h1>Thank You!</h1><p>Your donation has been successfully processed. We truly appreciate your support!</p></body></html>",
    MessageStream: "outbound",
  };

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.error("Postmark API error:", await response.text());
    throw new Error("Failed to send email");
  }
}
