// Push Notification Service
export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  image?: string;
  tag?: string;
  data?: any;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotificationService {
  private vapidPublicKey: string;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    // You'll need to generate VAPID keys for production
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
  }

  /**
   * Initialize the push notification service
   */
  async initialize(): Promise<boolean> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notifications are not supported");
      return false;
    }

    try {
      // Register service worker
      this.serviceWorkerRegistration =
        await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered successfully");

      return true;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return false;
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      throw new Error("This browser does not support notifications");
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  /**
   * Check if notifications are supported and permission is granted
   */
  isSupported(): boolean {
    return (
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window &&
      Notification.permission === "granted"
    );
  }

  /**
   * Subscribe user to push notifications
   */
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.serviceWorkerRegistration || !this.vapidPublicKey) {
      throw new Error("Service Worker not registered or VAPID key missing");
    }

    try {
      const subscription =
        await this.serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
        });

      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey("p256dh")!),
          auth: this.arrayBufferToBase64(subscription.getKey("auth")!),
        },
      };
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.serviceWorkerRegistration) {
      return false;
    }

    try {
      const subscription =
        await this.serviceWorkerRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      return false;
    }
  }

  /**
   * Get current subscription
   */
  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.serviceWorkerRegistration) {
      return null;
    }

    try {
      const subscription =
        await this.serviceWorkerRegistration.pushManager.getSubscription();
      if (subscription) {
        return {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: this.arrayBufferToBase64(subscription.getKey("p256dh")!),
            auth: this.arrayBufferToBase64(subscription.getKey("auth")!),
          },
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to get subscription:", error);
      return null;
    }
  }

  /**
   * Send notification to server for processing
   */
  async sendNotification(
    payload: NotificationPayload,
    subscriptions?: PushSubscription[]
  ): Promise<boolean> {
    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload,
          subscriptions,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to send notification:", error);
      return false;
    }
  }

  /**
   * Store subscription on server
   */
  async storeSubscription(subscription: PushSubscription): Promise<boolean> {
    try {
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to store subscription:", error);
      return false;
    }
  }

  /**
   * Remove subscription from server
   */
  async removeSubscription(subscription: PushSubscription): Promise<boolean> {
    try {
      const response = await fetch("/api/notifications/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to remove subscription:", error);
      return false;
    }
  }

  // Utility methods
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

export const pushNotificationService = new PushNotificationService();
