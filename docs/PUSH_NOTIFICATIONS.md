# Web Push Notifications

This project includes a comprehensive web push notifications system that allows administrators to send push notifications to subscribed users.

## Features

- ✅ Service Worker for handling push notifications
- ✅ VAPID key authentication
- ✅ Admin panel integration for sending notifications
- ✅ User subscription management
- ✅ Notification settings in the header
- ✅ Auto-fill notifications from selected stories
- ✅ Background notification handling
- ✅ PWA manifest for better mobile experience

## Setup

1. **Generate VAPID keys:**

   ```bash
   npm run generate-vapid-keys
   ```

2. **Add environment variables to `.env.local`:**

   ```env
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here
   VAPID_PRIVATE_KEY=your_vapid_private_key_here
   VAPID_SUBJECT=mailto:your-email@example.com
   ```

3. **Deploy the app** - The service worker will be automatically registered.

## How to Use

### For Administrators:

1. Go to `/admin`
2. Click the "Notificações" button in the admin panel header
3. You'll be taken to `/admin/notifications` where you can:
   - See the current subscriber count
   - Select a story from the latest posts
   - Customize the notification content
   - Send notifications to all subscribers
4. Enable notifications for your browser (if not already enabled) to test
5. Select a story from the stories list (it will highlight when selected)
6. The notification form will auto-fill with the story details
7. Customize the notification title, description, URL, and image
8. Click "Enviar para X utilizadores" to send to all subscribed users

### For Users:

1. Look for the bell icon in the header navigation
2. Click on it to open notification settings
3. Click "Ativar notificações" to subscribe
4. Grant permission when prompted by the browser
5. You'll now receive push notifications for important stories

## API Endpoints

- `POST /api/notifications/send` - Send notifications to subscribers
- `POST /api/notifications/subscribe` - Subscribe to notifications
- `POST /api/notifications/unsubscribe` - Unsubscribe from notifications

## Components

- `NotificationsManager` - Admin panel component for managing notifications
- `NotificationSettings` - User-facing notification settings component
- `usePushNotifications` - React hook for notification functionality
- `pushNotificationService` - Service for handling push notification logic

## Storage

Currently uses in-memory storage for subscriptions. For production, consider using:

- Redis for fast access
- Database (PostgreSQL, MongoDB) for persistence
- A combination of both for optimal performance

## Browser Support

Push notifications are supported in all modern browsers:

- Chrome 42+
- Firefox 44+
- Safari 16+ (with some limitations)
- Edge 17+

## Security Notes

- VAPID private keys should never be exposed to the client
- Use HTTPS in production (required for service workers)
- Store subscriptions securely
- Implement rate limiting for notification sending

## Troubleshooting

### Service Worker not registering:

- Check browser console for errors
- Ensure HTTPS is enabled
- Verify `/sw.js` is accessible

### Notifications not appearing:

- Check browser notification permissions
- Verify VAPID keys are correct
- Check service worker is active
- Ensure notification payload is valid

### Subscription fails:

- Check VAPID public key is set correctly
- Verify browser supports push notifications
- Check network connectivity
