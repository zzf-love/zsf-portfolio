"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import Gallery from "@/components/Gallery";
import MediaSection from "@/components/MediaSection";
import MobileMenuButton from "@/components/MobileMenuButton";
import { CATEGORIES } from "@/lib/categories";

const Cursor = dynamic(() => import("@/components/Cursor"), { ssr: false });
const GrainOverlay = dynamic(() => import("@/components/GrainOverlay"), { ssr: false });
import IntroOverlay from "@/components/IntroOverlay";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    setSidebarOpen(false);
  };

  const currentCategory = CATEGORIES.find((c) => c.id === activeCategory);
  const isSocialPage = activeCategory === "social";

  return (
    <>
      <Cursor />
      <GrainOverlay />
      <IntroOverlay />

      <MobileMenuButton
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <Sidebar
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        isOpen={sidebarOpen}
      />

      <main className="main-content">
        {isSocialPage ? (
          <>
            {/* Social section header */}
            <div
              style={{
                padding: "48px 32px 24px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "10px",
                  letterSpacing: "3px",
                  color: "var(--accent)",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                Social Media
              </div>
              <h1
                style={{
                  fontFamily: "Bebas Neue, cursive",
                  fontSize: "48px",
                  letterSpacing: "3px",
                  color: "var(--text-primary)",
                  lineHeight: 1,
                  marginBottom: "12px",
                }}
              >
                社交媒体
              </h1>
              <p
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  maxWidth: "480px",
                  lineHeight: 1.6,
                }}
              >
                小红书、微博、B站等平台上发布的设计作品与创作过程分享
              </p>
            </div>
            <MediaSection />
          </>
        ) : (
          <Gallery folder={currentCategory?.folder ?? null} />
        )}
      </main>
    </>
  );
}
