# Testing Email Notifications for Donations

This document describes how to test the EasyPay webhook email notification system locally.

## Prerequisites

- Node.js installed
- ngrok installed (`brew install ngrok` or download from [ngrok.com](https://ngrok.com))
- Access to EasyPay test backoffice
- Postmark account with test/sandbox token

## Environment Variables

Ensure these are set in `.env.local`:

```env
EASYPAY_CLIENT_ID=<your-test-account-id>
EASYPAY_API_KEY=<your-test-api-key>
EASYPAY_API_URL=https://api.test.easypay.pt/2.0
POSTMARK_SERVER_TOKEN=<your-postmark-token>
```

## Setup

### 1. Start Local Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 2. Start ngrok Tunnel

In a new terminal:

```bash
ngrok http 3000
```

Copy the HTTPS URL provided (e.g., `https://abc123.ngrok-free.app`)

### 3. Configure EasyPay Webhook

1. Log into [EasyPay Test Backoffice](https://backoffice.test.easypay.pt)
2. Go to **Web Services** → **URL Configuration**
3. Set **Generic Notification URL** to: `https://<your-ngrok-url>/api/ep-notify`
4. Save changes

## Testing Payment Methods

### Credit Card (Immediate)

1. Go to `http://localhost:3000/donativos`
2. Select amount and fill in details
3. Choose Credit Card payment
4. Use test card: `4111 1111 1111 1111` (any future expiry, any CVV)
5. Complete payment
6. Check terminal logs for webhook receipt
7. Check Postmark activity for sent email

### MB WAY (Immediate after confirmation)

1. Go to `http://localhost:3000/donativos`
2. Select amount and fill in details
3. Choose MB WAY payment
4. Use test phone number as configured in EasyPay sandbox
5. Confirm in the simulated MB WAY flow
6. Check terminal logs for webhook receipt

### Multibanco (Asynchronous)

1. Go to `http://localhost:3000/donativos`
2. Select amount and fill in details
3. Choose Multibanco payment
4. Note the Entity and Reference numbers shown
5. In EasyPay backoffice, simulate the payment:
   - Go to **Payments** → find the pending payment
   - Use the "Simulate Payment" option
6. Check terminal logs for webhook receipt (may take a few seconds)

## Expected Log Output

When a webhook is received, you should see logs like:

```
[ep-notify] Using EasyPay API: https://api.test.easypay.pt/2.0
[ep-notify] Received webhook payload: {
  "id": "...",
  "key": "single-1234567890",
  "type": "capture",
  "status": "success",
  ...
}
[ep-notify] Transaction type detected: single
[ep-notify] Transaction details: { ... }
Email sent successfully to customer@example.com
```

## Email Content

### One-time Donation
- **Subject**: "Obrigado pela sua contribuição!"
- **Content**: Thanks the donor, mentions the amount

### Monthly Subscription
- **Subject**: "Obrigado por se tornar apoiante mensal!"
- **Content**: Thanks the subscriber, mentions monthly amount, notes they can cancel anytime

## Troubleshooting

### Webhook not received
- Verify ngrok is running and URL is correct in EasyPay backoffice
- Check ngrok web interface at `http://localhost:4040` for incoming requests
- Ensure EasyPay webhook URL doesn't have trailing slash

### Email not sent
- Check `POSTMARK_SERVER_TOKEN` is set correctly
- Verify sender domain `donativos@paginaum.pt` is verified in Postmark
- Check Postmark activity log for errors

### Transaction details fetch fails
- Verify `EASYPAY_CLIENT_ID` and `EASYPAY_API_KEY` are correct
- Check the transaction type detection (key should start with `single-` or `subscription-`)

## Webhook Payload Reference

EasyPay sends a Generic Notification with this structure:

```json
{
  "id": "transaction-uuid",
  "key": "single-1234567890",
  "type": "capture",
  "status": "success",
  "messages": ["Sucesso: Operação concluída com sucesso"],
  "date": "2025-01-14 12:00:00"
}
```

The `key` field contains the transaction type prefix we set during checkout creation.
