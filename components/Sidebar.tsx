"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  isOpen: boolean;
}

export default function Sidebar({ activeCategory, onCategoryChange, isOpen }: SidebarProps) {
  const pathname = usePathname();
  const isGalleryPage = pathname === "/";

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-[99]"
          onClick={() => onCategoryChange(activeCategory)}
        />
      )}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <Link href="/" style={{ textDecoration: "none" }}>
            <div className="name">ZHANG SENFU</div>
            <div className="title">Visual Designer</div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {/* Gallery Categories */}
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.id === "social" ? "/#social" : "/"}
              className={`nav-item ${
                isGalleryPage && activeCategory === cat.id ? "active" : ""
              }`}
              onClick={(e) => {
                if (cat.id === "social") {
                  e.preventDefault();
                  const el = document.getElementById("social");
                  el?.scrollIntoView({ behavior: "smooth" });
                  onCategoryChange("social");
                } else {
                  onCategoryChange(cat.id);
                }
              }}
            >
              <span className="nav-dot" />
              {cat.label}
            </Link>
          ))}

          <div className="divider" style={{ margin: "16px 0" }} />

          {/* About link */}
          <Link
            href="/about"
            className={`nav-item ${pathname === "/about" ? "active" : ""}`}
          >
            <span className="nav-dot" />
            关于我
          </Link>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="status-badge">
            <span className="status-dot" />
            求职中
          </div>
          <div
            style={{
              marginTop: "12px",
              fontFamily: "'JetBrains Mono', 'CJK', monospace",
              fontSize: "9px",
              color: "var(--text-muted)",
              letterSpacing: "0.5px",
            }}
          >
            上海 · 深圳 · 广州 · 远程
          </div>
        </div>
      </aside>
    </>
  );
}
