"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const DAILY_LIMIT = 10;

/* ── 机器人 SVG 图标 ── */
function RobotIcon({ talking }: { talking: boolean }) {
  return (
    <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="chat-robot-svg">
      {/* 天线 */}
      <line x1="14" y1="8" x2="14" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="14" cy="1.5" r="1.5" fill="currentColor" className="chat-antenna-dot" />
      {/* 头部 */}
      <rect x="2" y="8" width="24" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.06" />
      {/* 左眼 */}
      <rect x="6" y="13" width="5" height="4" rx="1" fill="currentColor" className="chat-eye-left" />
      {/* 右眼 */}
      <rect x="17" y="13" width="5" height="4" rx="1" fill="currentColor" className="chat-eye-right" />
      {/* 嘴巴（三点）*/}
      <circle cx="9" cy="21" r="1" fill="currentColor" opacity="0.7" />
      <circle
        cx="14" cy="21" r="1" fill="currentColor" opacity="0.9"
        className={talking ? "chat-mouth-mid-talk" : ""}
      />
      <circle cx="19" cy="21" r="1" fill="currentColor" opacity="0.7" />
      {/* 身体 */}
      <rect x="6" y="25" width="16" height="9" rx="2" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.04" />
      {/* 身体格栅线 */}
      <line x1="10" y1="25" x2="10" y2="34" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="18" y1="25" x2="18" y2="34" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="6" y1="29" x2="22" y2="29" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
    </svg>
  );
}

/* ── 打点 loading ── */
function ThinkingDots() {
  return (
    <div style={{ display: "flex", gap: "4px", padding: "4px 0" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="chat-dot"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

/* ── 消息气泡 ── */
function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "10px",
        animation: isUser ? "bubble-in-user 0.2s both" : "bubble-in-ai 0.2s both",
      }}
    >
      <div
        style={{
          maxWidth: "82%",
          padding: "9px 13px",
          borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
          background: isUser ? "rgba(0,255,170,0.12)" : "var(--faint)",
          border: isUser ? "1px solid rgba(0,255,170,0.25)" : "1px solid var(--edge)",
          fontFamily: "var(--body)",
          fontSize: "12.5px",
          color: "var(--text)",
          lineHeight: "1.7",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {msg.content}
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(DAILY_LIMIT);
  const [exhausted, setExhausted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* 初始化：获取剩余次数 */
  useEffect(() => {
    fetch("/api/chat/status")
      .then((r) => r.json())
      .then((d) => {
        setRemaining(d.remaining ?? DAILY_LIMIT);
        if (d.globalExhausted || d.remaining === 0) setExhausted(true);
      })
      .catch(() => {});
  }, []);

  /* 展开时聚焦输入框 */
  useEffect(() => {
    if (open && !exhausted) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, exhausted]);

  /* 新消息后滚到底部 */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading || exhausted) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      if (data.error === "LIMIT_EXCEEDED" || data.error === "QUOTA_EXCEEDED") {
        setExhausted(true);
        setRemaining(0);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply || "今日对话次数已用完，您可以前往 About Me 页面了解更多关于我的信息。" },
        ]);
      } else if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        setRemaining(data.remaining ?? 0);
        if (data.remaining === 0) setExhausted(true);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "网络开小差了，请稍后重试。" },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "网络开小差了，请稍后重试。" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const isTalking = loading;

  return (
    <>
      {/* ── 收起状态：机器人浮动按钮 ── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="chat-toggle-btn"
          title="与 AI 助理对话"
          aria-label="打开 AI 助理"
        >
          <div className="chat-signal-ring r1" />
          <div className="chat-signal-ring r2" />
          <div className="chat-robot-wrap">
            <RobotIcon talking={false} />
          </div>
        </button>
      )}

      {/* ── 展开状态：聊天窗口 ── */}
      {open && (
        <div className="chat-window">
          {/* 头部 */}
          <div className="chat-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: 24, height: 24, flexShrink: 0 }}>
                <RobotIcon talking={isTalking} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--display)", fontSize: "14px", letterSpacing: "2px", color: "var(--etch)" }}>
                  AI ASSISTANT
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "9px", color: "var(--muted)", letterSpacing: "1px" }}>
                  代表张森福回答问题
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="chat-close-btn"
              aria-label="关闭"
            >
              ✕
            </button>
          </div>

          {/* 消息区 */}
          <div className="chat-messages">
            {messages.length === 0 && !exhausted && (
              <div className="chat-welcome">
                <p>你好！我是张森福的 AI 助理。</p>
                <p>可以问我关于他的工作经历、技能或作品集的任何问题 👋</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <Bubble key={i} msg={msg} />
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "10px" }}>
                <div style={{ padding: "9px 13px", background: "var(--faint)", border: "1px solid var(--edge)", borderRadius: "12px 12px 12px 2px" }}>
                  <ThinkingDots />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* 超限提示 */}
          {exhausted && !loading && (
            <div className="chat-exhausted">
              <p>今日对话次数已用完 😊</p>
              <Link href="/about" onClick={() => setOpen(false)} className="chat-about-link">
                前往 About Me 了解更多 →
              </Link>
            </div>
          )}

          {/* 输入区 */}
          {!exhausted && (
            <div className="chat-input-area">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="输入问题，Enter 发送..."
                rows={1}
                className="chat-textarea"
                disabled={loading}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="chat-send-btn"
                aria-label="发送"
              >
                ↑
              </button>
            </div>
          )}

          {/* 底栏：剩余次数 */}
          <div className="chat-footer">
            {exhausted
              ? "今日次数已用完"
              : `今日还可提问 ${remaining} 次`}
          </div>
        </div>
      )}
    </>
  );
}
