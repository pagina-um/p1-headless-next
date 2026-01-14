# Email Notification Testing - Resume Instructions

## Current State
- Branch: `email-notif` (merged with latest main)
- Postmark package installed
- Webhook handler ready at `/api/ep-notify`
- Email templates configured (Portuguese, different for single vs subscription)

## What's Done
1. ✅ Webhook endpoint (`/api/ep-notify`) receives EasyPay capture notifications
2. ✅ Queries EasyPay API for customer details (email, name, amount)
3. ✅ Sends thank-you email via Postmark
4. ✅ Different email content for single donations vs subscriptions
5. ✅ Logging with `[ep-notify]` prefix

## To Test Locally

### 1. Start the servers
```bash
npm run dev
ngrok http 3000
```

### 2. Get the ngrok URL
```bash
curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['tunnels'][0]['public_url'])"
```

### 3. Configure EasyPay Test Dashboard
Go to: Configurações → Notificações
Set these URLs to your ngrok URL + `/api/ep-notify`:
- Generic - URL
- Payment - URL

### 4. Make a test donation
- Go to http://localhost:3000/donativos
- Complete a donation (single or subscription)
- Watch the terminal for `[ep-notify]` logs
- Check if email is received

## Environment Variables Needed
- `EASYPAY_CLIENT_ID` - EasyPay account ID
- `EASYPAY_API_KEY` - EasyPay API key
- `EASYPAY_API_URL` - `https://api.test.easypay.pt/2.0` for test
- `POSTMARK_SERVER_TOKEN` - Postmark API token

## Known Issues
- EasyPay test environment sometimes returns 500 errors (their side)
- Use test card: `4111111111111111`, any future expiry, any CVV

## After Testing
1. Commit changes on `email-notif` branch
2. Create PR to merge into main
3. Update production EasyPay dashboard with production webhook URL

## Files Modified
- `src/app/api/ep-notify/route.ts` - Webhook handler
- `package.json` - Added postmark dependency
