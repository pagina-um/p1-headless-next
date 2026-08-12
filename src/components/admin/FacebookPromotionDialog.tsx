"use client";

import { useCallback, useEffect, useState } from "react";
import { ImageOff, Loader, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FB_MAIN_MAX_CHARS } from "@/constants/fbPromo";
import type { PromoPost } from "./XPromotionList";

type Phase = "drafting" | "ready" | "posting" | "posted";

interface Draft {
  title: string;
  text: string;
  linkUrl: string;
  cardImage: string | null;
  configured: boolean;
  warning?: string;
}

/**
 * Review and publish one story's Facebook post: edit the AI-written text and
 * send it. The article link travels with the post — Facebook renders it as a
 * preview card from the article's Open Graph tags, so there is no image picker
 * here; the card below only shows what that preview will look like.
 */
export function FacebookPromotionDialog({
  post,
  adminToken,
  onClose,
  onPublished,
}: {
  post: PromoPost;
  adminToken: string;
  onClose: () => void;
  onPublished: (postUrl: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>("drafting");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [text, setText] = useState("");
  const [postUrl, setPostUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setPhase("drafting");
    setError(null);
    try {
      const res = await fetch("/api/fb-promo/draft", {
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

  async function publish() {
    setPhase("posting");
    setError(null);
    try {
      const res = await fetch("/api/fb-promo/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ postId: post.databaseId, text }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `erro ${res.status}`);
      setPostUrl(json.url);
      onPublished(json.url);
      setPhase("posted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "publicação falhou");
      setPhase("ready");
    }
  }

  const canPublish =
    phase === "ready" &&
    Boolean(text.trim()) &&
    text.length <= FB_MAIN_MAX_CHARS &&
    (draft?.configured ?? false);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Promover no Facebook</DialogTitle>
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
            <Field
              label="Publicação"
              value={text}
              onChange={setText}
              max={FB_MAIN_MAX_CHARS}
              rows={5}
              disabled={phase !== "ready"}
              hint="Sem link — o cartão com a peça é anexado automaticamente por baixo do texto."
            />

            {/* What Facebook will append: a preview of the link card, built
                from the article's Open Graph tags. Not editable here. */}
            <div className="border border-gray-200">
              {draft?.cardImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={draft.cardImage}
                  alt=""
                  className="w-full max-h-56 object-cover"
                />
              ) : (
                <p className="text-xs text-gray-500 flex items-center gap-2 p-3">
                  <ImageOff className="w-4 h-4" />
                  A peça não tem imagem principal — o cartão sai sem imagem.
                </p>
              )}
              <div className="bg-gray-50 p-3">
                <p className="text-[10px] uppercase tracking-wide text-gray-500">
                  paginaum.pt
                </p>
                <p className="text-sm font-medium line-clamp-2">
                  {draft?.title ?? stripTags(post.title ?? "")}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Pré-visualização aproximada do cartão do link ({draft?.linkUrl}).
            </p>

            {!draft?.configured && (
              <p className="text-sm text-red-600">
                As chaves do Facebook não estão configuradas — defina FB_PAGE_ID
                e FB_PAGE_ACCESS_TOKEN.
              </p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {postUrl && (
              <p className="text-sm">
                Publicado:{" "}
                <a
                  href={postUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {postUrl}
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
              Publicar no Facebook
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

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}
