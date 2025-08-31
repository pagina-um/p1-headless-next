// App router uses Web Request / Response. Export named HTTP method handlers.
import { ServerClient } from "postmark";

function jsonResponse(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log("Received webhook payload:", payload);
    // Check for successful capture
    if (payload?.type === "capture" && payload?.status === "success") {
      const transactionType = String(payload.key || "").split("-")[0] as
        | "single"
        | "subscription";
      try {
        const customerEmail = await queryEasyPayForEmail(
          payload.id,
          transactionType
        );
        if (customerEmail) {
          await sendPostmarkEmail(customerEmail);
          return jsonResponse({ message: "Email sent successfully" }, 200);
        } else {
          return jsonResponse({ error: "Customer email not found" }, 400);
        }
      } catch (error) {
        console.error("Error processing webhook:", error);
        return jsonResponse({ error: "Internal server error" }, 500);
      }
    }

    return jsonResponse({ message: "No action taken" }, 200);
  } catch (err) {
    console.error("Invalid JSON payload:", err);
    return jsonResponse({ error: "Invalid JSON payload" }, 400);
  }
}

// Return 405 for other HTTP methods to satisfy framework/lint rules.
export async function GET() {
  return jsonResponse({ error: "Method not allowed" }, 405);
}
export async function PUT() {
  return jsonResponse({ error: "Method not allowed" }, 405);
}
export async function DELETE() {
  return jsonResponse({ error: "Method not allowed" }, 405);
}
export async function PATCH() {
  return jsonResponse({ error: "Method not allowed" }, 405);
}
export async function OPTIONS() {
  return jsonResponse({ error: "Method not allowed" }, 405);
}
export async function HEAD() {
  return jsonResponse(null, 405);
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
  const headers: Record<string, string> = {
    AccountId: accountId ?? "",
    ApiKey: apiKey ?? "",
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
  const token =
    process.env.POSTMARK_SERVER_TOKEN ?? "be9594ea-2280-455f-b9e8-1d831e808ad4";
  const client = new ServerClient(token);

  const message = {
    From: "teste@paginaum.pt",
    To: "tech@paginaum.pt",
    Subject: "Thank You for Your Donation!",
    TextBody:
      "Thank you for your generous donation! We appreciate your support.",
    HtmlBody:
      "<html><body><h1>Thank You!</h1><p>Your donation has been successfully processed. We truly appreciate your support!</p></body></html>",
    MessageStream: "outbound",
  };

  try {
    await client.sendEmail(message as any);
  } catch (err) {
    console.error("Postmark client error:", err);
    throw new Error("Failed to send email");
  }
}
