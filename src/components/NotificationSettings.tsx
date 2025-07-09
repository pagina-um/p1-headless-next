"use client";
import React, { useState } from "react";
import { Bell, BellOff, Settings } from "lucide-react";
import { usePushNotifications } from "@/contexts/PushNotificationsContext";

export function NotificationSettings() {
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

  const [showSettings, setShowSettings] = useState(false);

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      if (permission !== "granted") {
        const granted = await requestPermission();
        if (granted) {
          await subscribe();
        }
      } else {
        await subscribe();
      }
    }
  };

  if (!isSupported) {
    return null; // Don't show anything if not supported
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
        title="Configurações de notificações"
      >
        {isSubscribed ? (
          <Bell className="w-4 h-4" />
        ) : (
          <BellOff className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">Notificações</span>
      </button>

      {showSettings && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4" />
            <h3 className="font-medium">Notificações Push</h3>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Receba notificações quando houver novos artigos importantes.
            </p>

            <div className="flex items-center justify-between">
              <span className="text-sm">Estado das notificações:</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  isSubscribed
                    ? "bg-green-100 text-green-800"
                    : permission === "denied"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {isSubscribed
                  ? "Ativas"
                  : permission === "denied"
                    ? "Bloqueadas"
                    : "Inativas"}
              </span>
            </div>

            {permission === "denied" && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                As notificações foram bloqueadas. Para ativá-las, clique no
                ícone do cadeado na barra de endereços e permita notificações.
              </div>
            )}

            {permission !== "denied" && (
              <button
                onClick={handleToggleNotifications}
                disabled={loading}
                className={`w-full py-2 px-4 rounded text-sm font-medium transition-colors ${
                  isSubscribed
                    ? "bg-red-100 text-red-800 hover:bg-red-200"
                    : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                } disabled:opacity-50`}
              >
                {loading
                  ? "A processar..."
                  : isSubscribed
                    ? "Desativar notificações"
                    : "Ativar notificações"}
              </button>
            )}

            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                {error}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      )}

      {showSettings && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
