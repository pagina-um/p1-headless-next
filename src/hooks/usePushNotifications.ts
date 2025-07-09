import { useState, useEffect, useCallback } from "react";
import {
  pushNotificationService,
  NotificationPayload,
  PushSubscription,
} from "@/services/push-notifications";

interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission | null;
  subscription: PushSubscription | null;
  isSubscribed: boolean;
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  sendNotification: (payload: NotificationPayload) => Promise<boolean>;
  toggleSubscription: () => Promise<boolean>; // Add this new method
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null
  );
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the service and check current state
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        const initialized = await pushNotificationService.initialize();
        setIsSupported(initialized);

        if (initialized) {
          // Check current permission
          setPermission(Notification.permission);

          // Check if already subscribed
          const currentSubscription =
            await pushNotificationService.getSubscription();
          setSubscription(currentSubscription);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to initialize notifications"
        );
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    setLoading(true);
    setError(null);

    try {
      const newPermission = await pushNotificationService.requestPermission();
      setPermission(newPermission);
      return newPermission === "granted";
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to request permission";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || permission !== "granted") return false;

    setLoading(true);
    setError(null);

    try {
      const newSubscription = await pushNotificationService.subscribe();
      if (newSubscription) {
        setSubscription(newSubscription);

        // Store subscription on server
        const stored =
          await pushNotificationService.storeSubscription(newSubscription);
        if (!stored) {
          console.warn("Failed to store subscription on server");
        }

        return true;
      }
      return false;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to subscribe";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported, permission]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) return false;

    setLoading(true);
    setError(null);

    try {
      const unsubscribed = await pushNotificationService.unsubscribe();
      if (unsubscribed) {
        // Remove subscription from server
        await pushNotificationService.removeSubscription(subscription);
        setSubscription(null);
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to unsubscribe";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [subscription]);

  const sendNotification = useCallback(
    async (payload: NotificationPayload): Promise<boolean> => {
      if (!isSupported) return false;

      setLoading(true);
      setError(null);

      try {
        const sent = await pushNotificationService.sendNotification(payload);
        return sent;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send notification";
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [isSupported]
  );

  // iOS-friendly toggle method that handles the two-step process
  const toggleSubscription = useCallback(async (): Promise<boolean> => {
    if (!!subscription) {
      // Already subscribed, so unsubscribe
      return await unsubscribe();
    } else {
      if (permission === "default") {
        // First step: request permission
        const granted = await requestPermission();
        if (!granted) return false;

        // On iOS, the permission dialog prevents immediate subscription
        // We need to wait for the next user interaction
        return false; // Return false to indicate subscription is not complete yet
      } else if (permission === "granted") {
        // Second step: actually subscribe
        return await subscribe();
      }
    }
    return false;
  }, [subscription, permission, requestPermission, subscribe, unsubscribe]);

  return {
    isSupported,
    permission,
    subscription,
    isSubscribed: !!subscription,
    loading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    sendNotification,
    toggleSubscription,
  };
}
