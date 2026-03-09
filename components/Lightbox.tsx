"use client";

import { useEffect, useState, useCallback } from "react";
import { ImageItem } from "@/types";

interface LightboxProps {
  images: ImageItem[];
  initialIndex: number;
  onClose: () => void;
}

export default function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [aiDesc, setAiDesc] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const current = images[currentIndex];

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % images.length);
    setAiDesc("");
    setIsTyping(false);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
    setAiDesc("");
    setIsTyping(false);
  }, [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goNext, goPrev]);

  // 切换图片时重置 AI 描述区域（始终显示按钮，等待用户点击播放）
  useEffect(() => {
    setAiDesc("");
    setIsTyping(false);
  }, [currentIndex]);

  const handleGenerateAI = () => {
    if (!current) return;

    // 如果后台已预先生成，用打字机效果播放
    const text = current.aiDesc || "";
    if (!text) {
      setAiDesc("暂时无法生成 AI 描述，请稍后再试。");
      return;
    }

    setIsTyping(true);
    setAiDesc("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setAiDesc(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 18);
  };

  if (!current) return null;

  const tags = Array.isArray(current.tags) ? current.tags : [];

  return (
    <div
      className="lightbox-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button className="lightbox-close" onClick={onClose} data-cursor-hover>
        ✕
      </button>

      <div className="lightbox-container">
        {/* Image Panel */}
        <div className="lightbox-image-panel">
          <button className="lightbox-nav-btn prev" onClick={goPrev} data-cursor-hover>
            ←
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.url}
            alt={current.title || current.filename}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }}
          />

          <button className="lightbox-nav-btn next" onClick={goNext} data-cursor-hover>
            →
          </button>

          {/* Counter */}
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "11px",
              color: "var(--text-muted)",
              letterSpacing: "1px",
            }}
          >
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Info Panel */}
        <div className="lightbox-info-panel">
          {/* Title */}
          <div>
            <div className="lightbox-section-label">作品名称</div>
            <div className="lightbox-title">{current.title || current.filename}</div>
          </div>

          {/* Folder */}
          <div>
            <div className="lightbox-section-label">所属系列</div>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "12px",
                color: "var(--text-secondary)",
              }}
            >
              {getFolderLabel(current.folder)}
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <div className="lightbox-section-label">使用工具</div>
              <div className="gallery-item-tags">
                {tags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {current.description && (
            <div>
              <div className="lightbox-section-label">作品描述</div>
              <p className="ai-desc-text">{current.description}</p>
            </div>
          )}

          {/* AI Description */}
          <div>
            <div className="lightbox-section-label">AI 创意解读</div>
            {aiDesc ? (
              <p className={`ai-desc-text ${isTyping ? "typewriter-cursor" : ""}`}>
                {aiDesc}
              </p>
            ) : (
              <button
                className="ai-desc-btn"
                onClick={handleGenerateAI}
                disabled={isTyping}
                data-cursor-hover
              >
                {isTyping ? (
                  <>
                    <span className="loading-spinner" style={{ width: 14, height: 14 }} />
                    播放中...
                  </>
                ) : (
                  <>
                    <span>✦</span>
                    生成 AI 描述
                  </>
                )}
              </button>
            )}
          </div>

          {/* Star rating display */}
          <div>
            <div className="lightbox-section-label">评级</div>
            <div style={{ display: "flex", gap: "3px" }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  style={{
                    fontSize: "14px",
                    color: s <= current.stars ? "#00ffaa" : "var(--border-hover)",
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getFolderLabel(folder: string): string {
  const labels: Record<string, string> = {
    xcxd: "兴长信达",
    add: "爱哆哆",
    older_work: "早期作品",
    others: "个人项目",
  };
  return labels[folder] || folder;
}
