"use client";
import React, { useState } from "react";
import {
  Bell,
  Send,
  Settings,
  Users,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { NotificationPayload } from "@/services/push-notifications";
import { usePushNotifications } from "@/contexts/PushNotificationsContext";

interface NotificationsManagerProps {
  selectedPost?: {
    id: string;
    title: string;
    excerpt: string;
    slug: string;
    featuredImage?: {
      node: {
        sourceUrl: string;
      };
    };
  };
}

export function NotificationsManager({
  selectedPost,
}: NotificationsManagerProps) {
  const {
    isSupported,
    permission,
    isSubscribed,
    loading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    sendNotification,
  } = usePushNotifications();

  const [isExpanded, setIsExpanded] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    body: "",
    url: "",
    image: "",
  });
  const [sendingNotification, setSendingNotification] = useState(false);
  const [lastNotificationResult, setLastNotificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Auto-fill form when a post is selected
  React.useEffect(() => {
    if (selectedPost) {
      setNotificationForm({
        title: selectedPost.title,
        body: selectedPost.excerpt || `Nova história: ${selectedPost.title}`,
        url: `/${selectedPost.slug}`,
        image: selectedPost.featuredImage?.node?.sourceUrl || "",
      });
    }
  }, [selectedPost]);

  const handlePermissionRequest = async () => {
    const granted = await requestPermission();
    if (granted) {
      await subscribe();
    }
  };

  const handleSendNotification = async () => {
    if (!notificationForm.title || !notificationForm.body) {
      setLastNotificationResult({
        success: false,
        message: "Título e descrição são obrigatórios",
      });
      return;
    }

    setSendingNotification(true);
    setLastNotificationResult(null);

    const payload: NotificationPayload = {
      title: notificationForm.title,
      body: notificationForm.body,
      url: notificationForm.url,
      icon: "/icon.png",
      image: notificationForm.image,
      data: {
        postId: selectedPost?.id,
        timestamp: Date.now(),
      },
    };

    try {
      const success = await sendNotification(payload);
      setLastNotificationResult({
        success,
        message: success
          ? "Notificação enviada com sucesso!"
          : "Erro ao enviar notificação",
      });

      if (success) {
        // Clear form after successful send
        setNotificationForm({
          title: "",
          body: "",
          url: "",
          image: "",
        });
      }
    } catch (err) {
      setLastNotificationResult({
        success: false,
        message: "Erro ao enviar notificação",
      });
    } finally {
      setSendingNotification(false);
    }
  };

  const getStatusIndicator = () => {
    if (!isSupported) {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <X className="w-4 h-4" />
          <span className="text-sm">Não suportado</span>
        </div>
      );
    }

    if (permission === "denied") {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <X className="w-4 h-4" />
          <span className="text-sm">Permissão negada</span>
        </div>
      );
    }

    if (isSubscribed) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Ativo</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-orange-600">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">Inativo</span>
      </div>
    );
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div
        className="p-4 border-b cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Notificações Push</h3>
            {getStatusIndicator()}
          </div>
          <div className="flex items-center gap-2">
            {selectedPost && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                História selecionada
              </span>
            )}
            <Users className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Status and Setup */}
          <div className="space-y-2">
            <h4 className="font-medium">Estado das Notificações</h4>
            {!isSupported && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  As notificações push não são suportadas neste navegador.
                </p>
              </div>
            )}

            {isSupported && permission !== "granted" && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                <p className="text-sm text-orange-800 mb-2">
                  É necessário permitir notificações para enviar alertas aos
                  utilizadores.
                </p>
                <button
                  onClick={handlePermissionRequest}
                  disabled={loading}
                  className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 disabled:opacity-50"
                >
                  {loading ? "A processar..." : "Permitir Notificações"}
                </button>
              </div>
            )}

            {isSupported && permission === "granted" && !isSubscribed && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800 mb-2">
                  Subscreva para receber e testar notificações.
                </p>
                <button
                  onClick={subscribe}
                  disabled={loading}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "A subscrever..." : "Subscrever"}
                </button>
              </div>
            )}

            {isSubscribed && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  ✓ Notificações ativas. Pode enviar notificações aos
                  utilizadores.
                </p>
                <button
                  onClick={unsubscribe}
                  disabled={loading}
                  className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  Cancelar Subscrição
                </button>
              </div>
            )}
          </div>

          {/* Send Notification Form */}
          {isSubscribed && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium flex items-center gap-2">
                <Send className="w-4 h-4" />
                Enviar Notificação
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={notificationForm.title}
                    onChange={(e) =>
                      setNotificationForm({
                        ...notificationForm,
                        title: e.target.value,
                      })
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="Título da notificação"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Descrição *
                  </label>
                  <textarea
                    value={notificationForm.body}
                    onChange={(e) =>
                      setNotificationForm({
                        ...notificationForm,
                        body: e.target.value,
                      })
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="Descrição da notificação"
                    rows={3}
                    maxLength={150}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    URL (opcional)
                  </label>
                  <input
                    type="text"
                    value={notificationForm.url}
                    onChange={(e) =>
                      setNotificationForm({
                        ...notificationForm,
                        url: e.target.value,
                      })
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="/caminho-da-historia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Imagem (opcional)
                  </label>
                  <input
                    type="url"
                    value={notificationForm.image}
                    onChange={(e) =>
                      setNotificationForm({
                        ...notificationForm,
                        image: e.target.value,
                      })
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                <button
                  onClick={handleSendNotification}
                  disabled={
                    sendingNotification ||
                    !notificationForm.title ||
                    !notificationForm.body
                  }
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sendingNotification ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      A enviar...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Notificação
                    </>
                  )}
                </button>
              </div>

              {/* Result Message */}
              {lastNotificationResult && (
                <div
                  className={`p-3 rounded-md ${
                    lastNotificationResult.success
                      ? "bg-green-50 border border-green-200 text-green-800"
                      : "bg-red-50 border border-red-200 text-red-800"
                  }`}
                >
                  <p className="text-sm">{lastNotificationResult.message}</p>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
