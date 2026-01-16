import {
  getSingleDonationTemplate,
  getSubscriptionWelcomeTemplate,
  getRecurringPaymentTemplate,
} from "./email-templates";

const POSTMARK_API_URL = "https://api.postmarkapp.com/email";
const FROM_EMAIL = process.env.EMAIL_FROM_ADDRESS || "geral@paginaum.pt";
const FROM_NAME = process.env.EMAIL_FROM_NAME || "Página UM";

interface DonationEmailParams {
  to: string;
  donorName: string;
  amount: number;
  donationType: "single" | "subscription";
}

interface RecurringEmailParams {
  to: string;
  donorName: string;
  amount: number;
}

async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string,
  textBody: string
): Promise<void> {
  const serverToken = process.env.POSTMARK_SERVER_TOKEN;

  if (!serverToken) {
    throw new Error("Missing POSTMARK_SERVER_TOKEN environment variable");
  }

  const response = await fetch(POSTMARK_API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": serverToken,
    },
    body: JSON.stringify({
      From: `${FROM_NAME} <${FROM_EMAIL}>`,
      To: to,
      Subject: subject,
      HtmlBody: htmlBody,
      TextBody: textBody,
      MessageStream: "outbound",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Postmark API error:", errorData);
    throw new Error(`Postmark API error: ${response.status}`);
  }

  console.log(`Email sent successfully to ${to}`);
}

export async function sendDonationThankYouEmail(
  params: DonationEmailParams
): Promise<void> {
  const { to, donorName, amount, donationType } = params;

  const template =
    donationType === "subscription"
      ? getSubscriptionWelcomeTemplate(donorName, amount)
      : getSingleDonationTemplate(donorName, amount);

  await sendEmail(to, template.subject, template.htmlBody, template.textBody);
}

export async function sendRecurringPaymentEmail(
  params: RecurringEmailParams
): Promise<void> {
  const { to, donorName, amount } = params;

  const template = getRecurringPaymentTemplate(donorName, amount);

  await sendEmail(to, template.subject, template.htmlBody, template.textBody);
}
