"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ImageOff,
  Loader,
  Send,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DEFAULT_REPLY_TEXT,
  MAIN_MAX_CHARS,
  REPLY_MAX_CHARS,
  X_URL_LENGTH,
} from "@/constants/xPromo";
import type { PostImage } from "@/utils/postImages";
import type { PromoPost } from "./XPromotionList";

type Phase = "drafting" | "ready" | "posting" | "posted";

interface Draft {
  title: string;
  text: string;
  replyText: string;
  images: PostImage[];
  linkUrl: string;
  configured: boolean;
  warning?: string;
}

/**
 * Review and publish one story's X post: pick a picture from the article,
 * edit the AI-written text under a hard character limit, and send it. The
 * link is never in the main post — it goes out in the first reply.
 */
export function XPromotionDialog({
  post,
  adminToken,
  onClose,
  onPublished,
}: {
  post: PromoPost;
  adminToken: string;
  onClose: () => void;
  onPublished: (tweetUrl: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>("drafting");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [text, setText] = useState("");
  const [replyText, setReplyText] = useState(DEFAULT_REPLY_TEXT);
  const [imageIndex, setImageIndex] = useState(0);
  const [useImage, setUseImage] = useState(true);
  const [tweetUrl, setTweetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setPhase("drafting");
    setError(null);
    try {
      const res = await fetch("/api/x-promo/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ postId: post.databaseId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `erro ${res.status}`);
      setDraft(json);
      setText(json.text ?? "");
      setReplyText(json.replyText ?? DEFAULT_REPLY_TEXT);
      setImageIndex(0);
      setUseImage((json.images?.length ?? 0) > 0);
      if (json.warning) setError(json.warning);
      setPhase("ready");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "não foi possível preparar a publicação"
      );
      setPhase("ready");
    }
  }, [adminToken, post.databaseId]);

  useEffect(() => {
    generate();
  }, [generate]);

  const images = draft?.images ?? [];
  const currentImage = images[imageIndex];

  async function publish() {
    setPhase("posting");
    setError(null);
    try {
      const res = await fetch("/api/x-promo/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({
          postId: post.databaseId,
          text,
          replyText,
          imageUrl: useImage ? currentImage?.url ?? null : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `erro ${res.status}`);
      setTweetUrl(json.url);
      onPublished(json.url);
      if (json.replyFailed) {
        setError(
          "A publicação saiu, mas a resposta com o link falhou — responda manualmente com o link da peça."
        );
      }
      setPhase("posted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "publicação falhou");
      setPhase("ready");
    }
  }

  const replyLength = replyText.trim().length + 1 + X_URL_LENGTH;
  const canPublish =
    phase === "ready" &&
    Boolean(text.trim()) &&
    text.length <= MAIN_MAX_CHARS &&
    (draft?.configured ?? false);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Promover no X</DialogTitle>
          <DialogDescription className="line-clamp-2 text-left">
            {draft?.title ?? stripTags(post.title ?? "")}
          </DialogDescription>
        </DialogHeader>

        {phase === "drafting" ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
            <Loader className="w-4 h-4 animate-spin" />A redigir a publicação…
          </div>
        ) : (
          <div className="space-y-4">
            {/* Picture picker — the featured image comes first, then every
                photo used inside the article. */}
            {images.length > 0 ? (
              <div className="space-y-2">
                <div className="relative bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentImage?.url}
                    alt={currentImage?.alt ?? ""}
                    className={`w-full max-h-72 object-cover border border-gray-200 ${
                      useImage ? "" : "opacity-30"
                    }`}
                  />
                  {images.length > 1 && (
                    <>
                      <ImageNavButton
                        side="left"
                        onClick={() =>
                          setImageIndex(
                            (i) => (i - 1 + images.length) % images.length
                          )
                        }
                      />
                      <ImageNavButton
                        side="right"
                        onClick={() =>
                          setImageIndex((i) => (i + 1) % images.length)
                        }
                      />
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {imageIndex + 1} / {images.length}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500 truncate">
                    {currentImage?.featured
                      ? "Imagem principal da peça"
                      : "Imagem do corpo do artigo"}
                  </p>
                  <label className="text-xs text-gray-600 flex items-center gap-1.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={useImage}
                      onChange={(e) => setUseImage(e.target.checked)}
                      disabled={phase !== "ready"}
                    />
                    Publicar com imagem
                  </label>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 flex items-center gap-2 bg-gray-50 p-3">
                <ImageOff className="w-4 h-4" />
                Esta peça não tem imagens — a publicação sai só com texto.
              </p>
            )}

            <Field
              label="Publicação"
              value={text}
              onChange={setText}
              max={MAIN_MAX_CHARS}
              rows={4}
              disabled={phase !== "ready"}
              hint="Sem link e sem hashtags — é o que rende mais alcance no X."
            />

            <Field
              label="1.ª resposta (leva o link)"
              value={replyText}
              onChange={setReplyText}
              max={REPLY_MAX_CHARS}
              rows={2}
              disabled={phase !== "ready"}
              hint={`Sai como: «${replyText.trim()} ${draft?.linkUrl ?? ""}» (${replyLength} caracteres para o X)`}
            />

            {!draft?.configured && (
              <p className="text-sm text-red-600">
                As chaves do X não estão configuradas — defina X_API_KEY,
                X_API_SECRET, X_ACCESS_TOKEN e X_ACCESS_SECRET.
              </p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {tweetUrl && (
              <p className="text-sm">
                Publicado:{" "}
                <a
                  href={tweetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {tweetUrl}
                </a>
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          {phase === "ready" && (
            <button
              onClick={generate}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Gerar outra vez
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50"
          >
            {phase === "posted" ? "Fechar" : "Cancelar"}
          </button>
          {phase !== "posted" && (
            <button
              onClick={publish}
              disabled={!canPublish}
              className="bg-gray-900 text-white px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {phase === "posting" ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Publicar no X
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  max,
  rows,
  disabled,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  max: number;
  rows: number;
  disabled: boolean;
  hint: string;
}) {
  const remaining = max - value.length;
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </label>
        <span
          className={`text-xs tabular-nums ${
            remaining <= 20 ? "text-amber-600" : "text-gray-400"
          }`}
        >
          {value.length}/{max}
        </span>
      </div>
      <textarea
        value={value}
        // The counter is a nicety; maxLength is what actually enforces the
        // limit, and the API rejects anything longer anyway.
        maxLength={max}
        rows={rows}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 p-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-500"
      />
      <p className="text-xs text-gray-400 line-clamp-2">{hint}</p>
    </div>
  );
}

function ImageNavButton({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Imagem anterior" : "Imagem seguinte"}
      className={`absolute top-1/2 -translate-y-1/2 ${
        side === "left" ? "left-2" : "right-2"
      } bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}
