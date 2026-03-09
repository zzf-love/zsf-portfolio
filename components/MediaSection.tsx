"use client";

import { useState, useEffect } from "react";
import { MediaItem } from "@/types";

const PLATFORM_COLORS: Record<string, string> = {
  小红书: "#ff2442",
  微博: "#e6162d",
  Bilibili: "#00aeec",
  抖音: "#000000",
};

export default function MediaSection() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/media")
      .then((r) => r.json())
      .then((data) => setMedia(data.media || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
          gap: "12px",
          color: "var(--text-muted)",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "12px",
        }}
      >
        <div className="loading-spinner" />
        载入中...
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
          color: "var(--text-muted)",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "12px",
          letterSpacing: "1px",
        }}
      >
        暂无社交媒体内容
      </div>
    );
  }

  return (
    <div style={{ padding: "32px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {media.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function MediaCard({ item }: { item: MediaItem }) {
  const platformColor = PLATFORM_COLORS[item.platform] || "var(--accent)";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        overflow: "hidden",
        textDecoration: "none",
        transition: "var(--transition)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
      }}
      data-cursor-hover
    >
      {/* Embed / Preview Area */}
      {item.type === "video" && item.embedUrl ? (
        <div style={{ position: "relative", paddingBottom: "56.25%", background: "#000" }}>
          <iframe
            src={item.embedUrl}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
            allowFullScreen
            title={item.caption}
          />
        </div>
      ) : (
        <div
          style={{
            height: "160px",
            background: "linear-gradient(135deg, var(--border), var(--card-bg))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
          }}
        >
          {item.type === "video" ? "▶" : "🖼"}
        </div>
      )}

      {/* Info */}
      <div style={{ padding: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "9px",
              letterSpacing: "1px",
              color: platformColor,
              border: `1px solid ${platformColor}40`,
              padding: "2px 8px",
              borderRadius: "3px",
              background: `${platformColor}10`,
            }}
          >
            {item.platform}
          </span>
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "9px",
              color: "var(--text-muted)",
              letterSpacing: "0.5px",
            }}
          >
            {item.type === "video" ? "视频" : "截图"}
          </span>
        </div>

        {item.caption && (
          <p
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "13px",
              color: "var(--text-secondary)",
              lineHeight: "1.5",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.caption}
          </p>
        )}
      </div>
    </a>
  );
}
