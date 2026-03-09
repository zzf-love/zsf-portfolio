"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ImageItem } from "@/types";
import { FOLDER_LABELS, FOLDERS } from "@/lib/categories";
import ImageCard from "@/components/admin/ImageCard";
import UploadZone from "@/components/admin/UploadZone";
import MediaManager from "@/components/admin/MediaManager";

const Cursor = dynamic(() => import("@/components/Cursor"), { ssr: false });
const GrainOverlay = dynamic(() => import("@/components/GrainOverlay"), { ssr: false });

type Tab = "images" | "upload" | "media";
type ViewMode = "list" | "grid";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("images");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterFolder, setFilterFolder] = useState<string>("all");
  const [filterStars, setFilterStars] = useState<string>("all");
  const [stats, setStats] = useState({
    total: 0,
    visible: 0,
    byFolder: {} as Record<string, number>,
  });

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/images?showHidden=true");
      const data = await res.json();
      const imgs: ImageItem[] = data.images || [];
      setImages(imgs);

      // Compute stats
      const byFolder: Record<string, number> = {};
      imgs.forEach((img) => {
        byFolder[img.folder] = (byFolder[img.folder] || 0) + 1;
      });
      setStats({
        total: imgs.length,
        visible: imgs.filter((i) => i.visible && i.stars > 0).length,
        byFolder,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleUpdate = async (id: string, data: Partial<ImageItem>) => {
    const res = await fetch(`/api/images/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("更新失败");
    await fetchImages();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/images/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("删除失败");
    await fetchImages();
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg("正在同步...");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncMsg(data.message);
        await fetchImages();
      } else {
        setSyncMsg(data.error ?? "同步失败");
      }
    } catch {
      setSyncMsg("网络错误");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(""), 5000);
    }
  };

  // Filter images
  const filteredImages = images.filter((img) => {
    if (filterFolder !== "all" && img.folder !== filterFolder) return false;
    if (filterStars !== "all") {
      if (filterStars === "draft" && img.stars !== 0) return false;
      if (filterStars !== "draft" && img.stars !== parseInt(filterStars)) return false;
    }
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--void)", padding: "0" }}>
      <Cursor />
      <GrainOverlay />
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 40px",
          background: "var(--sidebar-bg)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link
            href="/"
            style={{
              fontFamily: "Bebas Neue, cursive",
              fontSize: "22px",
              letterSpacing: "3px",
              color: "var(--text-primary)",
              textDecoration: "none",
            }}
          >
            ZHANG SENFU
          </Link>
          <span
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "10px",
              color: "var(--text-muted)",
              letterSpacing: "2px",
            }}
          >
            / 管理后台
          </span>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {syncMsg && (
            <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: "var(--etch)", letterSpacing: "1px" }}>
              {syncMsg}
            </span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="admin-btn"
            style={{ fontSize: "11px", borderColor: syncing ? undefined : "rgba(0,255,170,0.3)", color: syncing ? undefined : "var(--etch)" }}
          >
            {syncing ? "同步中..." : "↓ 从 Cloudinary 同步"}
          </button>
          <Link href="/" className="admin-btn" style={{ fontSize: "11px" }}>
            ← 查看前台
          </Link>
          <button onClick={handleLogout} className="admin-btn danger" style={{ fontSize: "11px" }}>
            退出登录
          </button>
        </div>
      </div>

      <div style={{ padding: "40px" }}>
        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">图片总数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.visible}</div>
            <div className="stat-label">展示中</div>
          </div>
          {FOLDERS.map((folder) => (
            <div key={folder} className="stat-card">
              <div className="stat-value">{stats.byFolder[folder] || 0}</div>
              <div className="stat-label">{FOLDER_LABELS[folder]}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "32px" }}>
          {[
            { id: "images" as Tab, label: "图片管理" },
            { id: "upload" as Tab, label: "上传图片" },
            { id: "media" as Tab, label: "社交媒体" },
          ].map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Images Tab ── */}
        {tab === "images" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Filters */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                padding: "16px",
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            >
              <span
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "10px",
                  color: "var(--text-muted)",
                  letterSpacing: "1px",
                }}
              >
                过滤：
              </span>

              {/* Folder filter */}
              <div style={{ display: "flex", gap: "4px" }}>
                {[{ value: "all", label: "全部" }, ...FOLDERS.map((f) => ({ value: f, label: FOLDER_LABELS[f] }))].map(
                  (opt) => (
                    <button
                      key={opt.value}
                      className={`tab-btn ${filterFolder === opt.value ? "active" : ""}`}
                      style={{ fontSize: "10px", padding: "4px 10px" }}
                      onClick={() => setFilterFolder(opt.value)}
                    >
                      {opt.label}
                    </button>
                  )
                )}
              </div>

              <div
                style={{
                  width: "1px",
                  height: "20px",
                  background: "var(--border)",
                }}
              />

              {/* Stars filter */}
              <div style={{ display: "flex", gap: "4px" }}>
                {[
                  { value: "all", label: "全部星级" },
                  { value: "draft", label: "草稿" },
                  { value: "1", label: "1星" },
                  { value: "2", label: "2星" },
                  { value: "3", label: "3星" },
                  { value: "4", label: "4星" },
                  { value: "5", label: "5星" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    className={`tab-btn ${filterStars === opt.value ? "active" : ""}`}
                    style={{ fontSize: "10px", padding: "4px 10px" }}
                    onClick={() => setFilterStars(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
                <button
                  className={`tab-btn ${viewMode === "list" ? "active" : ""}`}
                  style={{ fontSize: "10px", padding: "4px 10px" }}
                  onClick={() => setViewMode("list")}
                >
                  列表
                </button>
                <button
                  className={`tab-btn ${viewMode === "grid" ? "active" : ""}`}
                  style={{ fontSize: "10px", padding: "4px 10px" }}
                  onClick={() => setViewMode("grid")}
                >
                  网格
                </button>
              </div>

              <span
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "10px",
                  color: "var(--text-muted)",
                }}
              >
                {filteredImages.length} 张
              </span>
            </div>

            {/* Image list */}
            {loading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "60px 0",
                  justifyContent: "center",
                  color: "var(--text-muted)",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "12px",
                }}
              >
                <div className="loading-spinner" /> 载入中...
              </div>
            ) : filteredImages.length === 0 ? (
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
                暂无符合条件的图片
              </div>
            ) : viewMode === "list" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {filteredImages.map((img) => (
                  <ImageCard
                    key={img.id}
                    image={img}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "12px",
                }}
              >
                {filteredImages.map((img) => (
                  <ImageCard
                    key={img.id}
                    image={img}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Upload Tab ── */}
        {tab === "upload" && (
          <div>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
                color: "var(--text-muted)",
                letterSpacing: "1px",
                marginBottom: "24px",
              }}
            >
              上传图片到 Cloudinary，并自动录入数据库（默认为草稿状态，需要手动设置星级才会展示）
            </div>
            <UploadZone
              onUploadComplete={() => {
                fetchImages();
                setTab("images");
              }}
            />
          </div>
        )}

        {/* ── Media Tab ── */}
        {tab === "media" && <MediaManager />}
      </div>
    </div>
  );
}
