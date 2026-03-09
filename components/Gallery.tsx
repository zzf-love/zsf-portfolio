"use client";

import { useState, useEffect, useCallback } from "react";
import { ImageItem } from "@/types";
import Lightbox from "./Lightbox";
import SkillTicker from "./SkillTicker";

interface GalleryProps {
  folder: string | null;
}

export default function Gallery({ folder }: GalleryProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState(3);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ minStars: "1" });
      if (folder) params.append("folder", folder);
      const res = await fetch(`/api/images?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setImages(data.images || []);
    } catch (err) {
      console.error("Failed to fetch images:", err);
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [folder]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = "";
  };

  return (
    <>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-eyebrow">Selected Works</div>
        <h1 className="hero-headline">
          VISUAL<br />ARCHIVE
        </h1>
        <p className="hero-sub">
          <strong>张森福</strong> · 视觉设计师<br />
          8年电商视觉 · <strong>AI 辅助设计</strong> · <strong>Blender 3D</strong><br /><br />
          点击任意作品查看详情，支持 AI 智能描述生成。
        </p>
      </div>

      {/* Skill Ticker */}
      <SkillTicker />

      {/* Top bar */}
      <div className="gallery-topbar">
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "11px",
            color: "var(--text-muted)",
            letterSpacing: "1px",
          }}
        >
          {loading ? "载入中..." : `${images.length} 件作品`}
        </div>

        <div className="column-switcher">
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "9px",
              color: "var(--text-muted)",
              letterSpacing: "1px",
              marginRight: "8px",
            }}
          >
            列数
          </span>
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              className={`col-btn ${columns === n ? "active" : ""}`}
              onClick={() => setColumns(n)}
              data-cursor-hover
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60vh",
            gap: "12px",
            color: "var(--text-muted)",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "12px",
          }}
        >
          <div className="loading-spinner" />
          载入作品中...
        </div>
      ) : images.length === 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "60vh",
            color: "var(--text-muted)",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "12px",
            letterSpacing: "1px",
          }}
        >
          暂无作品
        </div>
      ) : (
        <div className={`gallery-grid cols-${columns}`}>
          {images.map((img, index) => {
            const tags = Array.isArray(img.tags) ? img.tags : [];
            return (
              <div
                key={img.id}
                className="gallery-item"
                onClick={() => openLightbox(index)}
                data-cursor-hover
                style={{ animationDelay: `${(index % 12) * 0.04}s` }}
              >
                <div className="gallery-item-index">
                  {String(index + 1).padStart(2, "0")}
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.title || img.filename}
                  style={{ width: "100%", height: "auto", display: "block" }}
                  loading="lazy"
                />
                <div className="gallery-item-overlay">
                  {img.title && (
                    <div className="gallery-item-title">{img.title}</div>
                  )}
                  {tags.length > 0 && (
                    <div className="gallery-item-tags">
                      {tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="tag-chip">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={closeLightbox}
        />
      )}
    </>
  );
}
