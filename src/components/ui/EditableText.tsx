"use client";

import { CustomPostFields, OverridableField } from "@/types";
import { useState, useEffect, useRef } from "react";
import { useGrid } from "./GridContext";

export function EditableText({
  originalText,
  fieldName,
  blockUid,
}: {
  originalText: string;
  fieldName: OverridableField;
  blockUid: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(originalText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { handleOverrideStoryBlockField } = useGrid();

  // Auto-adjust height and focus when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      // Reset height to auto to get correct scrollHeight
      textarea.style.height = "auto";
      // Set height to scrollHeight to fit content
      textarea.style.height = textarea.scrollHeight + "px";
      textarea.focus();
    }
  }, [isEditing, text]);

  return (
    <button
      className="focus:outline-none cursor-text text-left w-full"
      onClick={() => {
        if (!isEditing) {
          setIsEditing(true);
        }
      }}
    >
      {!isEditing ? (
        text
      ) : (
        <textarea
          ref={textareaRef}
          className="bg-transparent resize-none w-full focus:outline-none overflow-hidden"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          onBlur={() => {
            handleOverrideStoryBlockField(blockUid, fieldName, text);
            setIsEditing(false);
          }}
          // Prevent enter from creating new lines
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setIsEditing(false);
            }
          }}
        />
      )}
    </button>
  );
}
