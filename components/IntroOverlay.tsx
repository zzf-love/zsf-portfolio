"use client";

import { useState, useEffect } from "react";

const ITEM_H = 64; // px per slot item
const DEFAULT_SKILLS = [
  "AI 复合型工作",
  "平面 · 三维设计",
  "Blender 3D 渲染",
  "AI 编程",
  "视频剪辑",
  "MORE SKILLS",
];

export default function IntroOverlay() {
  const [skills, setSkills] = useState<string[]>([]);
  const [step, setStep]     = useState(0);
  const [show, setShow]     = useState(false);
  const [exiting, setExiting] = useState(false);

  /* ── 加载词语 ── */
  useEffect(() => {
    if (sessionStorage.getItem("intro_seen")) return;
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setSkills(d.skills?.length ? d.skills : DEFAULT_SKILLS);
        setShow(true);
      })
      .catch(() => {
        setSkills(DEFAULT_SKILLS);
        setShow(true);
      });
  }, []);

  /* ── 逐步推进 ── */
  useEffect(() => {
    if (!show || skills.length === 0) return;
    let s = 0;
    const tick = () => {
      s++;
      if (s < skills.length) {
        setStep(s);
        setTimeout(tick, 1150);
      } else {
        setExiting(true);
        setTimeout(() => {
          setShow(false);
          sessionStorage.setItem("intro_seen", "1");
        }, 650);
      }
    };
    const t = setTimeout(tick, 1150);
    return () => clearTimeout(t);
  }, [show, skills]);

  if (!show) return null;

  /* 在词语前后各填 2 个空槽，让第一个和最后一个词都能居中 */
  const allItems = ["", "", ...skills, "", ""];
  const centerIdx = step + 2;          // 当前词在 allItems 中的下标
  const listY     = -step * ITEM_H;    // 列表整体偏移

  return (
    <div className={`intro-overlay${exiting ? " intro-exiting" : ""}`}>
      <div className="intro-panel">

        {/* 固定箭头 — 与 window 等高并垂直居中 */}
        <div className="intro-arrow-col">
          <span className="intro-arrow">›</span>
        </div>

        {/* 滚动槽 */}
        <div className="intro-window">
          <div
            className="intro-list"
            style={{ transform: `translateY(${listY}px)` }}
          >
            {allItems.map((text, i) => {
              const dist = Math.abs(i - centerIdx);
              return (
                <div
                  key={i}
                  className="intro-item"
                  style={{
                    height:        ITEM_H,
                    opacity:       dist === 0 ? 1 : dist === 1 ? 0.28 : 0.07,
                    fontSize:      dist === 0 ? "17px" : dist === 1 ? "12px" : "10px",
                    color:         dist === 0 ? "var(--etch)" : "var(--text)",
                    letterSpacing: dist === 0 ? "6px" : "3px",
                    transform:     dist === 0 ? "scale(1)" : "scale(0.93)",
                    transition:    "opacity 0.42s ease, font-size 0.42s ease, color 0.42s ease, letter-spacing 0.42s ease, transform 0.42s ease",
                  }}
                >
                  {text}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
