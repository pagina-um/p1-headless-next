import React from "react";
import { X, Bell, BellOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { NavigationLinks } from "./NavigationLinks";
import { usePushNotifications } from "../../hooks/usePushNotifications";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    loading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const handleNotificationToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      if (permission === "default") {
        const granted = await requestPermission();
        if (granted) {
          await subscribe();
        }
      } else if (permission === "granted") {
        await subscribe();
      }
    }
  };

  const getNotificationStatus = () => {
    if (!isSupported) {
      return {
        icon: X,
        text: "Não suportado",
        color: "text-red-600",
        disabled: true,
      };
    }

    if (permission === "denied") {
      return {
        icon: X,
        text: "Permissão negada",
        color: "text-red-600",
        disabled: true,
      };
    }

    if (loading) {
      return {
        icon: Loader2,
        text: "A processar...",
        color: "text-blue-600",
        disabled: true,
      };
    }

    if (isSubscribed) {
      return {
        icon: Bell,
        text: "Notificações ativas",
        color: "text-green-600",
        disabled: false,
      };
    }

    return {
      icon: BellOff,
      text: "Ativar notificações",
      color: "text-gray-600",
      disabled: false,
    };
  };

  const notificationStatus = getNotificationStatus();
  const StatusIcon = notificationStatus.icon;
  return (
    <div
      className={`
        fixed inset-0 bg-white z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}
    >
      <div className="flex justify-end p-4">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <nav className="px-6 py-4">
        <NavigationLinks orientation="vertical" onItemClick={onClose} />
        
        {/* Notification Toggle Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleNotificationToggle}
            disabled={notificationStatus.disabled}
            className={`w-full flex items-center gap-3 p-4 rounded-lg transition-colors ${
              notificationStatus.disabled
                ? "opacity-50 cursor-not-allowed bg-gray-50"
                : "hover:bg-gray-50 active:bg-gray-100"
            }`}
          >
            <StatusIcon 
              className={`w-5 h-5 ${notificationStatus.color} ${
                loading ? "animate-spin" : ""
              }`} 
            />
            <div className="flex-1 text-left">
              <span className={`text-sm font-medium ${notificationStatus.color}`}>
                {notificationStatus.text}
              </span>
              {isSupported && permission !== "denied" && (
                <p className="text-xs text-gray-500 mt-1">
                  {isSubscribed
                    ? "Toque para desativar notificações"
                    : "Receba notificações de novas histórias"}
                </p>
              )}
              {permission === "denied" && (
                <p className="text-xs text-red-500 mt-1">
                  Ative nas definições do navegador
                </p>
              )}
            </div>
            {isSupported && permission !== "denied" && (
              <div className="flex items-center">
                {isSubscribed ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                )}
              </div>
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-xs text-red-800">{error}</p>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
