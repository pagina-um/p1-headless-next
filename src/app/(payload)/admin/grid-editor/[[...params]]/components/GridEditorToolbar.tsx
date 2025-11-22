"use client";

import { useGrid } from "@/components/ui/GridContext";
import { Save, Trash, RotateCcw, ArrowLeft, Loader } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface GridEditorToolbarProps {
  layoutId: string | null;
}

export function GridEditorToolbar({ layoutId }: GridEditorToolbarProps) {
  const { gridState, hasUnsavedChanges, handleSave, handleClearLayout, handleResetChanges } =
    useGrid();
  const [layoutName, setLayoutName] = useState(
    layoutId ? `Layout ${layoutId}` : "New Grid Layout"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  async function handleSaveClick() {
    if (!gridState) return;

    setIsSaving(true);
    setSaveMessage("");

    try {
      const response = await fetch("/api/grid-layouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gridState,
          name: layoutName,
          ...(layoutId && { id: layoutId }),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSaveMessage("✓ Saved successfully!");
        await handleSave(); // Update GridContext state
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        console.error("Save failed:", data);
        setSaveMessage(`✗ Failed to save${data.error ? `: ${data.error}` : ""}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      setSaveMessage("✗ Error saving");
    } finally {
      setIsSaving(false);
    }
  }

  function handleClearClick() {
    if (
      confirm(
        "Are you sure you want to clear the entire layout? This cannot be undone."
      )
    ) {
      handleClearLayout();
    }
  }

  return (
    <div className="grid-editor-toolbar bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/collections/pages"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Pages</span>
          </Link>

          <div className="h-6 w-px bg-gray-300" />

          <input
            type="text"
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            className="text-xl font-semibold border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
            placeholder="Layout name..."
          />
        </div>

        <div className="flex items-center gap-3">
          {saveMessage && (
            <span
              className={`text-sm ${
                saveMessage.includes("✓")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {saveMessage}
            </span>
          )}

          <button
            onClick={handleResetChanges}
            disabled={!hasUnsavedChanges}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Reset to last saved state"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleClearClick}
            className="flex items-center gap-2 px-4 py-2 text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
            title="Clear all blocks"
          >
            <Trash className="w-4 h-4" />
            <span>Clear</span>
          </button>

          <button
            onClick={handleSaveClick}
            disabled={isSaving || !hasUnsavedChanges}
            className="flex items-center gap-2 px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Layout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
