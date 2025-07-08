"use client";
import React, { useState, useEffect } from "react";
import {
  Bell,
  Send,
  Users,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
} from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { NotificationPayload } from "@/services/push-notifications";
import { WPPostsList } from "./WPPostsList";
import { useQuery } from "@urql/next";
import { GET_LATEST_POSTS } from "@/services/wp-graphql";
import Link from "next/link";

export function NotificationsPage() {
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

  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loadingSubscribers, setLoadingSubscribers] = useState(true);
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
    details?: any;
  } | null>(null);

  // Fetch latest posts
  const [postsResult] = useQuery({
    query: GET_LATEST_POSTS,
    requestPolicy: "network-only",
  });

  // Auto-fill form when a post is selected
  useEffect(() => {
    if (selectedPost) {
      // Prioritize custom post fields for description
      const getNotificationBody = () => {
        // Try chamadaDestaque first, then chamadaManchete, then excerpt, then fallback
        if (selectedPost.postFields?.chamadaDestaque) {
          return selectedPost.postFields.chamadaDestaque.replace(
            /<[^>]*>/g,
            ""
          );
        }
        if (selectedPost.postFields?.chamadaManchete) {
          return selectedPost.postFields.chamadaManchete.replace(
            /<[^>]*>/g,
            ""
          );
        }
        if (selectedPost.excerpt) {
          return selectedPost.excerpt.replace(/<[^>]*>/g, "");
        }
        return `Nova história: ${selectedPost.title?.replace(/<[^>]*>/g, "")}`;
      };

      setNotificationForm({
        title: selectedPost.title?.replace(/<[^>]*>/g, "") || "",
        body: getNotificationBody(),
        url: `/${selectedPost.slug}`,
        image: selectedPost.featuredImage?.node?.sourceUrl || "",
      });
    }
  }, [selectedPost]);

  // Fetch subscriber count
  const fetchSubscriberCount = async () => {
    setLoadingSubscribers(true);
    try {
      const response = await fetch("/api/notifications/subscribe");
      if (response.ok) {
        const data = await response.json();
        setSubscriberCount(data.total);
      }
    } catch (error) {
      console.error("Error fetching subscriber count:", error);
    } finally {
      setLoadingSubscribers(false);
    }
  };

  useEffect(() => {
    fetchSubscriberCount();
  }, []);

  const handlePermissionRequest = async () => {
    const granted = await requestPermission();
    if (granted) {
      await subscribe();
    }
  };

  const handlePostSelect = (databaseId: number, postId: string, post?: any) => {
    if (post) {
      setSelectedPost(post);
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
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload }),
      });

      const result = await response.json();

      setLastNotificationResult({
        success: response.ok,
        message: response.ok
          ? `Notificação enviada com sucesso para ${result.successful} utilizadores!`
          : result.error || "Erro ao enviar notificação",
        details: result,
      });

      if (response.ok) {
        // Clear form after successful send
        setNotificationForm({
          title: "",
          body: "",
          url: "",
          image: "",
        });
        setSelectedPost(null);
        // Refresh subscriber count in case some were cleaned up
        fetchSubscriberCount();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Admin</span>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Bell className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Notificações Push
          </h1>
          <p className="text-gray-600">
            Envie notificações para os utilizadores subscritos
          </p>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Utilizadores Subscritos:</span>
            </div>
            <div className="flex items-center gap-2">
              {loadingSubscribers ? (
                <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
              ) : (
                <span className="text-2xl font-bold text-blue-600">
                  {subscriberCount}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Estado das suas notificações:
              </span>
              {getStatusIndicator()}
            </div>
            <button
              onClick={fetchSubscriberCount}
              disabled={loadingSubscribers}
              className="flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-gray-50 transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingSubscribers ? "animate-spin" : ""}`}
              />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Story Selection */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Selecionar História</h2>
            <p className="text-sm text-gray-600 mt-1">
              Escolha uma história para notificar os utilizadores
            </p>
            {selectedPost && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex gap-3">
                  {selectedPost.featuredImage?.node?.sourceUrl && (
                    <img
                      src={selectedPost.featuredImage.node.sourceUrl}
                      alt={
                        selectedPost.featuredImage.node.altText ||
                        "Featured image"
                      }
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-blue-900 line-clamp-2">
                      {selectedPost.title?.replace(/<[^>]*>/g, "")}
                    </h3>
                    <p className="text-xs text-blue-700 mt-1">
                      História selecionada para notificação
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="max-h-[500px] overflow-y-auto">
              <WPPostsList
                posts={(postsResult.data?.posts as any) || []}
                onSelectPost={handlePostSelect}
                selectedPostId={selectedPost?.id}
              />
            </div>
          </div>
        </div>

        {/* Notification Form */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Send className="w-5 h-5" />
              Enviar Notificação
            </h2>
            {selectedPost && (
              <p className="text-sm text-gray-600 mt-1">
                História selecionada:{" "}
                <span className="font-medium">
                  {selectedPost.title?.replace(/<[^>]*>/g, "")}
                </span>
              </p>
            )}
          </div>

          <div className="p-6 space-y-4">
            {/* Admin Notification Setup */}
            {!isSubscribed && isSupported && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-md">
                <p className="text-sm text-orange-800 mb-3">
                  Para testar as notificações, ative-as primeiro no seu
                  navegador.
                </p>
                <button
                  onClick={handlePermissionRequest}
                  disabled={loading}
                  className="bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700 disabled:opacity-50"
                >
                  {loading ? "A processar..." : "Ativar Notificações"}
                </button>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
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
                <p className="text-xs text-gray-500 mt-1">
                  {notificationForm.title.length}/50 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
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
                  rows={4}
                  maxLength={150}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {notificationForm.body.length}/150 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
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
                <label className="block text-sm font-medium mb-2">
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
                {selectedPost?.featuredImage?.node?.sourceUrl && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Imagem principal da história selecionada automaticamente
                  </p>
                )}
                {notificationForm.image && (
                  <div className="mt-2">
                    <img
                      src={notificationForm.image}
                      alt="Preview da notificação"
                      className="w-20 h-20 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleSendNotification}
                disabled={
                  sendingNotification ||
                  !notificationForm.title ||
                  !notificationForm.body ||
                  subscriberCount === 0
                }
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sendingNotification ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />A enviar...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar para {subscriberCount} utilizadores
                  </>
                )}
              </button>

              {subscriberCount === 0 && (
                <p className="text-sm text-gray-500 text-center">
                  Não há utilizadores subscritos para receber notificações
                </p>
              )}
            </div>

            {/* Result Message */}
            {lastNotificationResult && (
              <div
                className={`p-4 rounded-md ${
                  lastNotificationResult.success
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                <p className="text-sm font-medium">
                  {lastNotificationResult.message}
                </p>
                {lastNotificationResult.details && (
                  <p className="text-xs mt-1">
                    Enviadas: {lastNotificationResult.details.successful} |
                    Falharam: {lastNotificationResult.details.failed}
                  </p>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
