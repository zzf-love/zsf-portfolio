"use client";

import { useState, useEffect } from "react";
import { MediaItem } from "@/types";

const PLATFORMS = ["小红书", "微博", "Bilibili", "抖音"];
const TYPES = [
  { value: "screenshot", label: "截图" },
  { value: "video", label: "视频" },
];

export default function MediaManager() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    type: "screenshot",
    platform: "小红书",
    url: "",
    embedUrl: "",
    caption: "",
  });

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      setMedia(data.media || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleAdd = async () => {
    if (!form.url.trim()) {
      alert("请填写链接地址");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("添加失败");
      setForm({ type: "screenshot", platform: "小红书", url: "", embedUrl: "", caption: "" });
      setShowAddForm(false);
      await fetchMedia();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, caption: string) => {
    if (!confirm(`确认删除「${caption || id}」？`)) return;
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      await fetchMedia();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleToggleVisible = async (item: MediaItem) => {
    try {
      await fetch(`/api/media/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !item.visible }),
      });
      await fetchMedia();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "11px",
              color: "var(--text-muted)",
              letterSpacing: "1px",
            }}
          >
            共 {media.length} 条内容
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="admin-btn primary"
          style={{ fontSize: "11px" }}
        >
          {showAddForm ? "取消" : "+ 添加内容"}
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--accent-border)",
            borderRadius: "8px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div
            style={{
              fontFamily: "Bebas Neue, cursive",
              fontSize: "18px",
              letterSpacing: "2px",
              color: "var(--text-primary)",
            }}
          >
            添加社交媒体内容
          </div>

          {/* Type + Platform */}
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "9px",
                  letterSpacing: "1.5px",
                  color: "var(--text-muted)",
                  display: "block",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                }}
              >
                类型
              </label>
              <select
                className="admin-input"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                style={{ color: "var(--text-primary)", background: "var(--card-bg)" }}
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "9px",
                  letterSpacing: "1.5px",
                  color: "var(--text-muted)",
                  display: "block",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                }}
              >
                平台
              </label>
              <select
                className="admin-input"
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                style={{ color: "var(--text-primary)", background: "var(--card-bg)" }}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* URL */}
          <div>
            <label
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "9px",
                letterSpacing: "1.5px",
                color: "var(--text-muted)",
                display: "block",
                marginBottom: "6px",
                textTransform: "uppercase",
              }}
            >
              链接地址
            </label>
            <input
              className="admin-input"
              placeholder="https://..."
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </div>

          {/* Embed URL (video only) */}
          {form.type === "video" && (
            <div>
              <label
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "9px",
                  letterSpacing: "1.5px",
                  color: "var(--text-muted)",
                  display: "block",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                }}
              >
                嵌入地址（embed URL）
              </label>
              <input
                className="admin-input"
                placeholder="https://player.bilibili.com/player.html?..."
                value={form.embedUrl}
                onChange={(e) => setForm({ ...form, embedUrl: e.target.value })}
              />
            </div>
          )}

          {/* Caption */}
          <div>
            <label
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "9px",
                letterSpacing: "1.5px",
                color: "var(--text-muted)",
                display: "block",
                marginBottom: "6px",
                textTransform: "uppercase",
              }}
            >
              说明文字
            </label>
            <input
              className="admin-input"
              placeholder="简短描述..."
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button onClick={() => setShowAddForm(false)} className="admin-btn">
              取消
            </button>
            <button onClick={handleAdd} disabled={saving} className="admin-btn primary">
              {saving ? "添加中..." : "确认添加"}
            </button>
          </div>
        </div>
      )}

      {/* Media list */}
      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "40px",
            color: "var(--text-muted)",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "12px",
          }}
        >
          <div className="loading-spinner" /> 载入中...
        </div>
      ) : media.length === 0 ? (
        <div
          style={{
            padding: "60px",
            textAlign: "center",
            color: "var(--text-muted)",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "12px",
            letterSpacing: "1px",
          }}
        >
          暂无社交媒体内容，点击上方「添加内容」开始添加
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {media.map((item, index) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                opacity: item.visible ? 1 : 0.5,
              }}
            >
              {/* Sort order */}
              <span
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  width: "24px",
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </span>

              {/* Platform badge */}
              <span
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "9px",
                  letterSpacing: "1px",
                  color: "var(--accent)",
                  border: "1px solid var(--accent-border)",
                  padding: "2px 8px",
                  borderRadius: "3px",
                  background: "var(--accent-dim)",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {item.platform}
              </span>

              {/* Type */}
              <span
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "9px",
                  color: "var(--text-muted)",
                  flexShrink: 0,
                }}
              >
                {item.type === "video" ? "视频" : "截图"}
              </span>

              {/* Caption */}
              <span
                style={{
                  flex: 1,
                  fontFamily: "Syne, sans-serif",
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.caption || item.url}
              </span>

              {/* Actions */}
              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-btn"
                  style={{ fontSize: "10px", padding: "4px 10px" }}
                >
                  查看
                </a>
                <button
                  onClick={() => handleToggleVisible(item)}
                  className="admin-btn"
                  style={{
                    fontSize: "10px",
                    padding: "4px 10px",
                    color: item.visible ? "var(--accent)" : "var(--text-muted)",
                  }}
                >
                  {item.visible ? "显示" : "隐藏"}
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.caption)}
                  className="admin-btn danger"
                  style={{ fontSize: "10px", padding: "4px 10px" }}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
