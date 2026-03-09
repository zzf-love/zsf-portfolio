"use client";

import { useState } from "react";
import { ImageItem } from "@/types";

/** 将 Cloudinary URL 插入转换参数，生成小缩略图 */
function thumbUrl(url: string, w = 200, h = 150): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/c_fill,w_${w},h_${h},q_auto,f_auto/`);
}
import { FOLDER_LABELS } from "@/lib/categories";
import StarRating from "./StarRating";
import TagEditor from "./TagEditor";

interface ImageCardProps {
  image: ImageItem;
  onUpdate: (id: string, data: Partial<ImageItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const LABEL_STYLE = {
  fontFamily: "JetBrains Mono, monospace",
  fontSize: "9px",
  letterSpacing: "1.5px",
  color: "var(--text-muted)",
  display: "block",
  marginBottom: "6px",
  textTransform: "uppercase" as const,
};

export default function ImageCard({ image, onUpdate, onDelete }: ImageCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const [title, setTitle] = useState(image.title);
  const [description, setDescription] = useState(image.description);
  const [stars, setStars] = useState(image.stars);
  const [tags, setTags] = useState<string[]>(
    Array.isArray(image.tags) ? image.tags : []
  );
  const [visible, setVisible] = useState(image.visible);

  // AI description
  const [localAiDesc, setLocalAiDesc] = useState(image.aiDesc || "");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState("");

  const isDirty =
    title !== image.title ||
    description !== image.description ||
    stars !== image.stars ||
    JSON.stringify(tags) !== JSON.stringify(image.tags) ||
    visible !== image.visible;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(image.id, { title, description, stars, tags, visible });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`确认删除「${image.title || image.filename}」？此操作不可撤销。`)) return;
    setDeleting(true);
    try {
      await onDelete(image.id);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleVisible = async () => {
    const newVisible = !visible;
    setVisible(newVisible);
    await onUpdate(image.id, { visible: newVisible });
  };

  const handleGenerateAI = async () => {
    setAiGenerating(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageId: image.id,
          title: title || image.title,
          tags,
          folder: image.folder,
          description: description || image.description,
        }),
      });
      if (!res.ok) throw new Error("生成失败");
      const data = await res.json();
      setLocalAiDesc(data.description || "");
    } catch {
      setAiError("生成失败，请检查网络和 ANTHROPIC_API_KEY 配置");
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <>
      {/* Full-size preview modal */}
      {previewing && (
        <div
          onClick={() => setPreviewing(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.url}
            alt={image.title || image.filename}
            style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", display: "block" }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setPreviewing(false)}
            style={{
              position: "absolute",
              top: "20px",
              right: "24px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "16px",
              cursor: "pointer",
              padding: "6px 12px",
              borderRadius: "4px",
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div
        style={{
          background: "var(--card-bg)",
          border: `1px solid ${isDirty ? "var(--accent-border)" : "var(--border)"}`,
          borderRadius: "8px",
          overflow: "hidden",
          transition: "border-color 0.2s ease",
        }}
      >
        {/* Thumbnail + Quick Controls */}
        <div style={{ display: "flex", gap: "0" }}>
          {/* Thumbnail */}
          <div
            style={{
              width: "120px",
              flexShrink: 0,
              position: "relative",
              background: "#050506",
              cursor: "pointer",
            }}
            onClick={() => setPreviewing(true)}
            title="点击查看大图"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbUrl(image.url)}
              alt={image.title || image.filename}
              width={120}
              height={90}
              style={{ width: "120px", height: "90px", objectFit: "cover", display: "block" }}
              onError={(e) => {
                const t = e.currentTarget;
                if (!t.src.includes("original")) t.src = image.url;
              }}
            />
            {!visible && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  pointerEvents: "none",
                }}
              >
                👁️
              </div>
            )}
          </div>

          {/* Quick info */}
          <div style={{ flex: 1, padding: "12px 16px", minWidth: 0 }}>
            <div
              style={{
                fontFamily: "Syne, sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: "4px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {image.title || image.filename}
            </div>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "10px",
                color: "var(--text-muted)",
                marginBottom: "8px",
                letterSpacing: "0.5px",
              }}
            >
              {FOLDER_LABELS[image.folder] || image.folder}
            </div>
            {/* Read-only star display */}
            <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
              {image.stars === 0 ? (
                <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "#ff5050" }}>
                  ◎ 草稿
                </span>
              ) : (
                <>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: "13px",
                        color: s <= image.stars ? "#00ffaa" : "var(--border-hover, #333)",
                      }}
                    >
                      ★
                    </span>
                  ))}
                  {localAiDesc && (
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "9px", color: "#00ffaa", marginLeft: "6px", letterSpacing: "0.5px" }}>
                      ✦ AI
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              alignItems: "flex-end",
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="admin-btn"
              style={{ fontSize: "10px", padding: "4px 10px" }}
            >
              {expanded ? "收起" : "编辑"}
            </button>
            <button
              type="button"
              onClick={handleToggleVisible}
              className="admin-btn"
              style={{
                fontSize: "10px",
                padding: "4px 10px",
                color:
                  image.stars === 0
                    ? "var(--text-muted)"
                    : visible
                    ? "var(--accent)"
                    : "var(--text-muted)",
              }}
              title={image.stars === 0 ? "草稿（未评级）不会出现在前台" : undefined}
            >
              {image.stars === 0 ? "草稿" : visible ? "前台可见" : "已隐藏"}
            </button>
          </div>
        </div>

        {/* Expanded Edit Panel */}
        {expanded && (
          <div
            style={{
              padding: "16px",
              borderTop: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {/* Star Rating — in expanded panel for reliable clicking */}
            <div>
              <label style={LABEL_STYLE}>评级</label>
              <StarRating value={stars} onChange={setStars} />
            </div>

            {/* Title */}
            <div>
              <label style={LABEL_STYLE}>标题</label>
              <input
                className="admin-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="作品标题..."
              />
            </div>

            {/* Description */}
            <div>
              <label style={LABEL_STYLE}>描述</label>
              <textarea
                className="admin-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="作品描述..."
                rows={3}
                style={{ resize: "vertical" }}
              />
            </div>

            {/* Tags */}
            <div>
              <label style={LABEL_STYLE}>标签</label>
              <TagEditor value={tags} onChange={setTags} />
            </div>

            {/* AI Description */}
            <div>
              <label style={LABEL_STYLE}>AI 创意解读（预先生成，供前台展示）</label>
              {localAiDesc ? (
                <div>
                  <p
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontSize: "12px",
                      color: "var(--text-secondary, #aaa)",
                      lineHeight: "1.7",
                      marginBottom: "8px",
                      padding: "10px 12px",
                      background: "rgba(0,255,170,0.04)",
                      border: "1px solid rgba(0,255,170,0.12)",
                      borderRadius: "4px",
                    }}
                  >
                    {localAiDesc}
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={aiGenerating}
                    className="admin-btn"
                    style={{ fontSize: "10px" }}
                  >
                    {aiGenerating ? "重新生成中..." : "↺ 重新生成"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={aiGenerating}
                  className="admin-btn primary"
                  style={{ fontSize: "11px" }}
                >
                  {aiGenerating ? (
                    <>
                      <span
                        className="loading-spinner"
                        style={{ width: 12, height: 12, borderWidth: 1.5, borderColor: "rgba(0,0,0,0.3)", borderTopColor: "#000" }}
                      />
                      生成中...
                    </>
                  ) : (
                    "✦ 生成 AI 描述"
                  )}
                </button>
              )}
              {aiError && (
                <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "10px", color: "#ff5050", marginTop: "6px" }}>
                  {aiError}
                </p>
              )}
            </div>

            {/* Visibility */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label style={{ ...LABEL_STYLE, display: "inline", marginBottom: 0 }}>显示状态</label>
              <button
                type="button"
                onClick={() => setVisible(!visible)}
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "10px",
                  padding: "4px 12px",
                  borderRadius: "4px",
                  border: `1px solid ${visible ? "var(--accent-border)" : "var(--border)"}`,
                  background: visible ? "var(--accent-dim)" : "transparent",
                  color: visible ? "var(--accent)" : "var(--text-muted)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {visible ? "✓ 显示" : "○ 隐藏"}
              </button>
            </div>

            {/* Save / Delete */}
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="admin-btn danger"
              >
                {deleting ? "删除中..." : "删除"}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !isDirty}
                className="admin-btn primary"
                style={{ opacity: !isDirty ? 0.5 : 1 }}
              >
                {saving ? "保存中..." : "保存更改"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
