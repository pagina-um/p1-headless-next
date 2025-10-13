// Service Worker for Push Notifications
const CACHE_NAME = "push-notifications-v1";

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker installing");
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating");
  event.waitUntil(self.clients.claim());
});

// Push event handler
self.addEventListener("push", (event) => {
  console.log("Push received", event);

  let notificationData = {};

  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      notificationData = {
        title: "Nova notificação",
        body: event.data.text(),
        icon: "/icon.png",
        badge: "/icon.png",
      };
    }
  }

  const options = {
    title: notificationData.title || "Nova notificação",
    body: notificationData.body || "Tem uma nova história disponível",
    icon: notificationData.icon || "/icon.png",
    badge: notificationData.badge || "/icon.png",
    image: notificationData.image, // Add support for rich images
    data: notificationData.data || {},
    actions: notificationData.actions || [
      {
        action: "view",
        title: "Ver história",
      },
      {
        action: "dismiss",
        title: "Dispensar",
      },
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(options.title, options));
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked", event);

  event.notification.close();

  if (event.action === "view" || !event.action) {
    const urlToOpen = event.notification.data.url || "/";

    event.waitUntil(
      self.clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((clientList) => {
          // Check if there's already a window/tab open with the target URL
          for (const client of clientList) {
            if (client.url === urlToOpen && "focus" in client) {
              return client.focus();
            }
          }

          // If not, open a new window/tab
          if (self.clients.openWindow) {
            return self.clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Background sync for offline functionality
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    console.log("Background sync triggered");
    // Handle background sync logic here
  }
});
