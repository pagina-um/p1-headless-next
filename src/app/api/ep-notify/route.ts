// App router uses Web Request / Response. Export named HTTP method handlers.
import { ServerClient } from "postmark";

function jsonResponse(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function POST(req: Request) {
  const apiUrl =
    process.env.EASYPAY_API_URL || "https://api.test.easypay.pt/2.0";
  console.log(`[ep-notify] Using EasyPay API: ${apiUrl}`);

  try {
    const payload = await req.json();
    console.log("[ep-notify] Received webhook payload:", JSON.stringify(payload, null, 2));

    // Check for successful capture
    if (payload?.type === "capture" && payload?.status === "success") {
      const transactionType = String(payload.key || "").split("-")[0] as
        | "single"
        | "subscription";
      console.log(`[ep-notify] Transaction type detected: ${transactionType}`);

      try {
        const transactionDetails = await queryEasyPayForTransactionDetails(
          payload.id,
          transactionType
        );
        console.log("[ep-notify] Transaction details:", JSON.stringify(transactionDetails, null, 2));

        if (
          transactionDetails?.customer?.email &&
          transactionDetails.payment_status !== "failed"
        ) {
          await sendPostmarkEmail({
            customerEmail: transactionDetails.customer.email,
            customerName: transactionDetails.customer.name || "Apoiante",
            donationType: transactionType,
            amount: transactionDetails.value,
            currency: transactionDetails.currency || "EUR",
          });
          return jsonResponse({ message: "Email sent successfully" }, 200);
        } else {
          console.log("[ep-notify] No customer email found or payment failed");
          return jsonResponse({ error: "Customer email not found" }, 400);
        }
      } catch (error) {
        console.error("[ep-notify] Error processing webhook:", error);
        return jsonResponse({ error: "Internal server error" }, 500);
      }
    }

    console.log("[ep-notify] No action taken for this webhook type");
    return jsonResponse({ message: "No action taken" }, 200);
  } catch (err) {
    console.error("[ep-notify] Invalid JSON payload:", err);
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

async function queryEasyPayForTransactionDetails(
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
    return data;
  }
  console.error("EasyPay API error:", await response.text());
  return null;
}

interface EmailParams {
  customerEmail: string;
  customerName: string;
  donationType: "single" | "subscription";
  amount: number;
  currency: string;
}

async function sendPostmarkEmail({
  customerEmail,
  customerName,
  donationType,
  amount,
  currency,
}: EmailParams) {
  const token = process.env.POSTMARK_SERVER_TOKEN;

  if (!token) {
    console.error("POSTMARK_SERVER_TOKEN is not configured");
    throw new Error("Email service not configured");
  }

  const client = new ServerClient(token);
  const formattedAmount = `${amount.toFixed(2)} ${currency}`;

  const isSubscription = donationType === "subscription";

  const subject = isSubscription
    ? "Obrigado por se tornar apoiante mensal!"
    : "Obrigado pela sua contribuição!";

  const textBody = isSubscription
    ? `Olá ${customerName},\n\nObrigado por se tornar apoiante mensal da Página UM com ${formattedAmount}/mês.\n\nO seu apoio recorrente é fundamental para mantermos um jornalismo independente e de qualidade. Pode cancelar a qualquer momento.\n\nObrigado por acreditar no nosso trabalho!\n\nA equipa da Página UM`
    : `Olá ${customerName},\n\nObrigado pela sua contribuição de ${formattedAmount} para a Página UM.\n\nO seu apoio é fundamental para mantermos um jornalismo independente e de qualidade.\n\nObrigado por acreditar no nosso trabalho!\n\nA equipa da Página UM`;

  const htmlBody = isSubscription
    ? `<html><body>
        <h1>Obrigado por se tornar apoiante mensal!</h1>
        <p>Olá ${customerName},</p>
        <p>Obrigado por se tornar apoiante mensal da <strong>Página UM</strong> com <strong>${formattedAmount}/mês</strong>.</p>
        <p>O seu apoio recorrente é fundamental para mantermos um jornalismo independente e de qualidade. Pode cancelar a qualquer momento.</p>
        <p>Obrigado por acreditar no nosso trabalho!</p>
        <p><em>A equipa da Página UM</em></p>
      </body></html>`
    : `<html><body>
        <h1>Obrigado pela sua contribuição!</h1>
        <p>Olá ${customerName},</p>
        <p>Obrigado pela sua contribuição de <strong>${formattedAmount}</strong> para a <strong>Página UM</strong>.</p>
        <p>O seu apoio é fundamental para mantermos um jornalismo independente e de qualidade.</p>
        <p>Obrigado por acreditar no nosso trabalho!</p>
        <p><em>A equipa da Página UM</em></p>
      </body></html>`;

  const message = {
    From: "donativos@paginaum.pt",
    To: customerEmail,
    Subject: subject,
    TextBody: textBody,
    HtmlBody: htmlBody,
    MessageStream: "outbound",
  };

  try {
    await client.sendEmail(message as any);
    console.log(`Email sent successfully to ${customerEmail}`);
  } catch (err) {
    console.error("Postmark client error:", err);
    throw new Error("Failed to send email");
  }
}
