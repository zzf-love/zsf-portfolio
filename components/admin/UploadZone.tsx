"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { FOLDERS, FOLDER_LABELS } from "@/lib/categories";

interface UploadZoneProps {
  onUploadComplete: () => void;
}

interface UploadFile {
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export default function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [folder, setFolder] = useState<string>("others");
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const addFiles = (newFiles: FileList | File[]) => {
    const imageFiles = Array.from(newFiles).filter((f) =>
      f.type.startsWith("image/")
    );
    const entries: UploadFile[] = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...entries]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadAll = async () => {
    if (files.length === 0 || uploading) return;
    setUploading(true);

    const pendingIndices = files
      .map((f, i) => (f.status === "pending" ? i : -1))
      .filter((i) => i !== -1);

    for (const idx of pendingIndices) {
      setFiles((prev) =>
        prev.map((f, i) => (i === idx ? { ...f, status: "uploading" } : f))
      );

      try {
        const formData = new FormData();
        formData.append("file", files[idx].file);
        formData.append("folder", folder);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "上传失败");
        }

        setFiles((prev) =>
          prev.map((f, i) => (i === idx ? { ...f, status: "done" } : f))
        );
      } catch (err) {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === idx
              ? { ...f, status: "error", error: (err as Error).message }
              : f
          )
        );
      }
    }

    setUploading(false);
    onUploadComplete();
  };

  const clearDone = () => {
    setFiles((prev) => {
      prev.filter((f) => f.status === "done").forEach((f) => URL.revokeObjectURL(f.preview));
      return prev.filter((f) => f.status !== "done");
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Folder selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <label
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "11px",
            color: "var(--text-muted)",
            letterSpacing: "1px",
          }}
        >
          上传到：
        </label>
        <div style={{ display: "flex", gap: "6px" }}>
          {FOLDERS.map((f) => (
            <button
              key={f}
              onClick={() => setFolder(f)}
              className={`tab-btn ${folder === f ? "active" : ""}`}
              style={{ fontSize: "11px", padding: "5px 14px" }}
            >
              {FOLDER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? "var(--accent)" : "var(--border)"}`,
          borderRadius: "10px",
          padding: "48px",
          textAlign: "center",
          cursor: "pointer",
          background: isDragging ? "var(--accent-dim)" : "transparent",
          transition: "all 0.2s ease",
        }}
      >
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>📁</div>
        <div
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "14px",
            color: "var(--text-secondary)",
            marginBottom: "8px",
          }}
        >
          拖拽图片到此处，或点击选择文件
        </div>
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "10px",
            color: "var(--text-muted)",
            letterSpacing: "0.5px",
          }}
        >
          支持 JPG, PNG, WebP, AVIF · 单文件最大 10MB
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "4px",
            }}
          >
            <span
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
                color: "var(--text-muted)",
              }}
            >
              {files.length} 个文件待上传
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={clearDone} className="admin-btn" style={{ fontSize: "10px" }}>
                清除已完成
              </button>
              <button
                onClick={uploadAll}
                disabled={uploading || files.every((f) => f.status === "done")}
                className="admin-btn primary"
                style={{ fontSize: "10px" }}
              >
                {uploading ? "上传中..." : "开始上传"}
              </button>
            </div>
          </div>

          {files.map((f, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                background: "var(--card-bg)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.preview}
                alt={f.file.name}
                style={{ width: "48px", height: "36px", objectFit: "cover", borderRadius: "4px" }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "11px",
                    color: "var(--text-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {f.file.name}
                </div>
                <div
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "10px",
                    color: "var(--text-muted)",
                    marginTop: "2px",
                  }}
                >
                  {(f.file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "10px",
                    color:
                      f.status === "done"
                        ? "var(--accent)"
                        : f.status === "error"
                        ? "#ff5050"
                        : f.status === "uploading"
                        ? "var(--text-secondary)"
                        : "var(--text-muted)",
                    letterSpacing: "0.5px",
                  }}
                >
                  {f.status === "done"
                    ? "✓ 完成"
                    : f.status === "error"
                    ? `✕ ${f.error}`
                    : f.status === "uploading"
                    ? "上传中..."
                    : "等待中"}
                </span>
                {f.status === "pending" && (
                  <button
                    onClick={() => removeFile(idx)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: "14px",
                      padding: "2px",
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
