"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "登录失败");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: "24px",
      }}
    >
      {/* Noise texture */}
      <div className="grain-overlay" />

      <div
        style={{
          width: "100%",
          maxWidth: "380px",
        }}
      >
        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div
            style={{
              fontFamily: "Bebas Neue, cursive",
              fontSize: "36px",
              letterSpacing: "4px",
              color: "var(--text-primary)",
              marginBottom: "8px",
            }}
          >
            张森福
          </div>
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "10px",
              letterSpacing: "3px",
              color: "var(--text-muted)",
              textTransform: "uppercase",
            }}
          >
            管理后台
          </div>
        </div>

        {/* Login card */}
        <div
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "36px",
          }}
        >
          <div
            style={{
              fontFamily: "Bebas Neue, cursive",
              fontSize: "22px",
              letterSpacing: "2px",
              color: "var(--text-primary)",
              marginBottom: "28px",
            }}
          >
            管理员登录
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "9px",
                  letterSpacing: "2px",
                  color: "var(--text-muted)",
                  display: "block",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                }}
              >
                管理密码
              </label>
              <input
                type="password"
                className="admin-input"
                placeholder="输入管理员密码..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
            </div>

            {error && (
              <div
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "11px",
                  color: "#ff5050",
                  padding: "10px 12px",
                  background: "rgba(255, 80, 80, 0.08)",
                  border: "1px solid rgba(255, 80, 80, 0.2)",
                  borderRadius: "6px",
                  letterSpacing: "0.5px",
                }}
              >
                ✕ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="admin-btn primary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "12px",
                fontSize: "12px",
                letterSpacing: "2px",
                marginTop: "8px",
                opacity: !password ? 0.5 : 1,
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 1, borderTopColor: "#000" }} />
                  验证中...
                </span>
              ) : (
                "进入后台"
              )}
            </button>
          </form>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "24px",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "10px",
            color: "var(--text-muted)",
            letterSpacing: "0.5px",
          }}
        >
          ← <a href="/" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
            返回作品集
          </a>
        </div>
      </div>
    </div>
  );
}
