"use client";

const ITEMS = [
  "Blender 3D",
  "Photoshop",
  "Illustrator",
  "AI 辅助设计",
  "电商视觉",
  "3D 渲染",
  "摄影",
  "C4D",
  "详情页设计",
  "活动大促 KV",
  "包装设计",
  "品牌视觉",
  "ChatGPT 工作流",
  "主图设计",
  "8年设计经验",
];

// 复制两份实现无缝滚动
const TRACK = [...ITEMS, ...ITEMS];

export default function SkillTicker() {
  return (
    <div className="ticker-wrap">
      <div className="ticker-track">
        {TRACK.map((text, i) => (
          <div key={i} className="ticker-item">
            <span className="ticker-dot" />
            <span className="ticker-text">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
