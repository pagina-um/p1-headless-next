"use client";
import React, { Suspense, useEffect, useState } from "react";
import {
  Save,
  Loader,
  Trash,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeIcon,
  Send,
  Sparkles,
} from "lucide-react";
import type { Block } from "@/types";
import { toJpeg } from "html-to-image";
import { EditableGrid } from "../grid/EditableGrid";
import { Toast } from "../ui/Toast";
import { BlocksTabs } from "./BlocksTabs";
import { StoriesList } from "./StoriesList";
import { GRID_COLUMNS } from "@/constants/blocks";
import { useGrid } from "@/components/ui/GridContext";
import { RotateCcw } from "lucide-react";
import Link from "next/link";

interface AdminPanelProps {
  previewPath?: string;
  sectionLabel?: string;
  /** Only the main admin has the credentials for /admin/x and /admin/facebook. */
  showPromotions?: boolean;
  /** Minted server-side; lets the panel call /api/grid-redesign. */
  adminToken?: string;
}

export function AdminPanel({
  previewPath = "/admin/preview",
  sectionLabel,
  showPromotions = false,
  adminToken,
}: AdminPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRedesigning, setIsRedesigning] = useState(false);
  const [aiWarnings, setAiWarnings] = useState<string[]>([]);
  // Snapshot of the blocks as they were before the AI proposal was applied.
  // handleResetChanges would throw away the editor's unsaved manual edits too,
  // so "undo the AI" needs its own restore point.
  const [preAiBlocks, setPreAiBlocks] = useState<Block[] | null>(null);

  const {
    handleCreateCategoryBlock,
    gridState,
    handleCreateStaticBlock,
    handleCreateStoryBlock,
    handleSave,
    setShowToast,
    showToast,
    isSaving,
    handleClearLayout,
    handleResetChanges,
    hasUnsavedChanges,
    handleApplyExternalLayout,
  } = useGrid();

  const clearAiState = () => {
    setPreAiBlocks(null);
    setAiWarnings([]);
  };

  const handleSaveWithConfirmation = async () => {
    if (window.confirm("Tem certeza que deseja guardar o layout?")) {
      await handleSave();
      clearAiState();
    }
  };

  const handleClearWithConfirmation = () => {
    if (
      window.confirm(
        "Tem certeza que deseja apagar o layout? Esta ação não pode ser desfeita."
      )
    ) {
      handleClearLayout();
    }
  };

  const handleResetWithAiCleanup = () => {
    handleResetChanges();
    clearAiState();
  };

  // A screenshot of the current grid gives the AI's art-direction pass real
  // visual context. Best-effort: on any failure the redesign runs without it.
  const captureGridScreenshot = async (): Promise<string | undefined> => {
    try {
      const node = document.querySelector<HTMLElement>(".react-grid-layout");
      if (!node || node.offsetWidth === 0) return undefined;
      return await toJpeg(node, {
        quality: 0.6,
        pixelRatio: Math.min(1, 900 / node.offsetWidth),
        backgroundColor: "#ffffff",
      });
    } catch (error) {
      console.warn("[admin] screenshot capture failed", error);
      return undefined;
    }
  };

  const handleAiRedesign = async () => {
    if (!adminToken || !gridState || gridState.blocks.length === 0) return;
    if (
      !window.confirm(
        "Pedir à IA um redesenho da página? A ordem e a hierarquia das " +
          "peças mantêm-se; nada é publicado sem guardar."
      )
    ) {
      return;
    }

    const snapshot: Block[] = JSON.parse(JSON.stringify(gridState.blocks));
    setIsRedesigning(true);
    setAiWarnings([]);
    try {
      const screenshot = await captureGridScreenshot();
      const response = await fetch("/api/grid-redesign", {
        method: "POST",
        headers: { "x-admin-token": adminToken },
        body: JSON.stringify({ gridState, screenshot }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || `erro ${response.status}`);
      }
      setPreAiBlocks(snapshot);
      handleApplyExternalLayout(result.gridState.blocks);
      setAiWarnings(result.warnings ?? []);
    } catch (error) {
      window.alert(
        `O redesenho falhou: ${
          error instanceof Error ? error.message : "erro desconhecido"
        }`
      );
    } finally {
      setIsRedesigning(false);
    }
  };

  const handleUndoAiRedesign = () => {
    if (!preAiBlocks) return;
    handleApplyExternalLayout(preAiBlocks);
    clearAiState();
  };

  return (
    <div className="space-y-6 relative">
      <div className="bg-white shadow-lg p-6 ">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <button onClick={() => setIsExpanded(!isExpanded)}>
              {!isExpanded ? (
                <ChevronDown className="w-6 h-6" />
              ) : (
                <ChevronUp className="w-6 h-6" />
              )}
            </button>
            Adicionar conteúdo
            {sectionLabel && (
              <span className="ml-2 px-2.5 py-0.5 text-sm font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                {sectionLabel}
              </span>
            )}
          </h1>
          <div className="flex gap-4">
            <button
              disabled={isSaving}
              className="bg-red-600 text-white px-4 py-2 flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={handleClearWithConfirmation}
            >
              {!isSaving ? (
                <Trash className="w-4 h-4" />
              ) : (
                <Loader className="w-4 h-4 animate-spin" />
              )}
              Apagar Layout
            </button>
            <button
              disabled={isSaving || !hasUnsavedChanges}
              className="bg-gray-600 text-white px-4 py-2 flex items-center gap-2 hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={handleResetWithAiCleanup}
            >
              <RotateCcw className="w-4 h-4" />
              Anular Alterações
            </button>
            {adminToken && (
              <button
                disabled={
                  isSaving || isRedesigning || !gridState?.blocks?.length
                }
                className="bg-purple-700 text-white px-4 py-2 flex items-center gap-2 hover:bg-purple-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={handleAiRedesign}
              >
                {isRedesigning ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {isRedesigning ? "A redesenhar…" : "Redesenhar com IA"}
              </button>
            )}
            {showPromotions && (
              <>
                <Link
                  href="/admin/x"
                  className="bg-gray-900 h-10 text-white px-4 py-2 flex items-center gap-2 hover:bg-gray-700 transition-colors"
                >
                  <Send className="w-4 h-4" /> Promover no X
                </Link>
                <Link
                  href="/admin/facebook"
                  className="bg-gray-900 h-10 text-white px-4 py-2 flex items-center gap-2 hover:bg-gray-700 transition-colors"
                >
                  <Send className="w-4 h-4" /> Promover no Facebook
                </Link>
              </>
            )}
            <Link
              href={previewPath}
              className="bg-gray-600 w-40 h-10 text-white px-4 py-2 flex items-center gap-2 hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4" /> Pré-visualizar
            </Link>
            <button
              disabled={isSaving || !hasUnsavedChanges}
              className="bg-blue-600 text-white px-4 py-2 flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={handleSaveWithConfirmation}
            >
              {!isSaving ? (
                <Save className="w-4 h-4" />
              ) : (
                <Loader className="w-4 h-4 animate-spin" />
              )}
              Guardar Layout
            </button>
          </div>
        </div>

        {isRedesigning && (
          <p className="mt-4 text-sm text-gray-600">
            A IA está a redesenhar a página — pode demorar até 2 minutos. O
            layout atual mantém-se até a proposta chegar.
          </p>
        )}

        {preAiBlocks && !isRedesigning && (
          <div className="mt-4 border border-purple-300 bg-purple-50 p-4 text-sm space-y-2">
            <p className="font-medium text-purple-900">
              Redesenho aplicado (ainda não guardado). Use “Pré-visualizar”
              para ver o resultado, ajuste os blocos se quiser, e “Guardar
              Layout” para publicar.
            </p>
            {aiWarnings.length > 0 && (
              <ul className="list-disc pl-5 text-purple-800">
                {aiWarnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            )}
            <button
              className="bg-white border border-purple-400 text-purple-900 px-3 py-1.5 flex items-center gap-2 hover:bg-purple-100 transition-colors"
              onClick={handleUndoAiRedesign}
            >
              <RotateCcw className="w-4 h-4" /> Repor versão anterior
            </button>
          </div>
        )}

        <div
          className="absolute z-10 bg-white shadow-lg p-6 w-full top-20 left-0"
          style={{ display: isExpanded ? "block" : "none" }}
        >
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-6">
              <BlocksTabs
                onCreateCategoryBlock={handleCreateCategoryBlock}
                onCreateStaticBlock={handleCreateStaticBlock}
              />
            </div>

            <StoriesList onSelectPost={handleCreateStoryBlock} />
          </div>
        </div>
      </div>

      <Suspense fallback={<Loader className="w-8 h-8 animate-spin mx-auto" />}>
        {gridState && <EditableGrid columns={GRID_COLUMNS} />}
      </Suspense>

      <Toast
        show={showToast}
        message="Layout guardado com sucesso!"
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
