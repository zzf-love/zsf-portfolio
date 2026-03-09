"use client";

import { useState } from "react";
import { PRESET_TAGS } from "@/lib/categories";

interface TagEditorProps {
  value: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
}

export default function TagEditor({ value, onChange, disabled }: TagEditorProps) {
  const [customInput, setCustomInput] = useState("");

  const toggleTag = (tag: string) => {
    if (disabled) return;
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else {
      onChange([...value, tag]);
    }
  };

  const addCustom = () => {
    const tag = customInput.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setCustomInput("");
  };

  return (
    <div>
      {/* Preset Tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
        {PRESET_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            disabled={disabled}
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "10px",
              letterSpacing: "0.5px",
              padding: "4px 10px",
              borderRadius: "4px",
              border: value.includes(tag)
                ? "1px solid var(--accent-border)"
                : "1px solid var(--border)",
              background: value.includes(tag) ? "var(--accent-dim)" : "transparent",
              color: value.includes(tag) ? "var(--accent)" : "var(--text-muted)",
              cursor: disabled ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Custom tag input */}
      {!disabled && (
        <div style={{ display: "flex", gap: "6px" }}>
          <input
            className="admin-input"
            style={{ flex: 1, fontSize: "12px", padding: "6px 10px" }}
            placeholder="自定义标签..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
          />
          <button
            type="button"
            onClick={addCustom}
            className="admin-btn"
            style={{ flexShrink: 0, fontSize: "11px" }}
          >
            添加
          </button>
        </div>
      )}
    </div>
  );
}
