import dynamic from "next/dynamic";
import Link from "next/link";
import type { Metadata } from "next";

const Cursor = dynamic(() => import("@/components/Cursor"), { ssr: false });
const GrainOverlay = dynamic(() => import("@/components/GrainOverlay"), { ssr: false });

export const metadata: Metadata = {
  title: "关于我 · 张森福",
  description: "视觉设计师张森福 · 8年电商视觉经验 · 擅长 AI 辅助设计与三维渲染",
};

const SKILLS = [
  "Blender",
  "Photoshop",
  "Illustrator",
  "AI辅助设计",
  "摄影",
  "C4D",
  "电商视觉",
  "3D渲染",
];

const EXPERIENCE = [
  {
    company: "北京兴长信达科技发展有限公司",
    role: "高级电商设计师",
    period: "2025.06 — 至今",
    desc: "主导 Kinder健达天猫旗舰店全套电商视觉设计（主图、详情页、活动大促KV等）；兼负费列罗天猫超市及微信小程序、Nutella意榛滋旗舰店部分电商视觉设计工作。",
  },
  {
    company: "上海爱哆哆实业有限公司",
    role: "视觉设计师",
    period: "2021.10 — 2025.04",
    desc: "主导 AI 辅助设计工作流落地（效率提升约3倍）；独立完成 Blender 3D 全流程设计，涵盖建模、材质、渲染到合成的完整链路。",
  },
  {
    company: "上海亿朵网络科技有限公司",
    role: "电商设计师",
    period: "2021.05 — 2021.09",
    desc: "负责电商平台商品主图及详情页视觉设计。",
  },
  {
    company: "上海域美实业有限公司",
    role: "平面设计师",
    period: "2018.09 — 2021.03",
    desc: "负责品牌平面设计、印刷物料及线下展示物料设计制作。",
  },
];

export default function AboutPage() {
  return (
    <>
      <Cursor />
      <GrainOverlay />

      {/* Back link */}
      <Link
        href="/"
        style={{
          position: "fixed",
          top: "24px",
          left: "24px",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "11px",
          letterSpacing: "1px",
          color: "var(--text-muted)",
          textDecoration: "none",
          zIndex: 50,
          transition: "color 0.2s ease",
        }}
        onMouseEnter={undefined}
      >
        ← 返回
      </Link>

      <div className="about-container">
        {/* Header */}
        <header style={{ marginBottom: "64px" }}>
          <div className="about-header-label">Visual Designer · Portfolio 2025</div>
          <h1 className="about-name">ZHANG SENFU</h1>
          <p className="about-tagline">
            视觉设计师 · 8年电商视觉经验 · 擅长 AI 辅助设计与三维渲染
          </p>

          {/* Status */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              border: "1px solid var(--accent-border)",
              borderRadius: "100px",
              background: "var(--accent-dim)",
            }}
          >
            <span className="status-dot" />
            <span
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
                color: "var(--accent)",
                letterSpacing: "1px",
              }}
            >
              正在积极求职 · 上海 / 深圳 / 广州 / 远程
            </span>
          </div>
        </header>

        {/* Work Experience */}
        <section style={{ marginBottom: "56px" }}>
          <h2 className="about-section-title">工作经历</h2>
          <div>
            {EXPERIENCE.map((exp, i) => (
              <div key={i} className="experience-item">
                <div className="exp-company">{exp.company}</div>
                <div className="exp-role">{exp.role}</div>
                <div className="exp-period">{exp.period}</div>
                <p className="exp-desc">{exp.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section style={{ marginBottom: "56px" }}>
          <h2 className="about-section-title">技能工具</h2>
          <div className="skill-tags">
            {SKILLS.map((skill) => (
              <span key={skill} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Education */}
        <section style={{ marginBottom: "56px" }}>
          <h2 className="about-section-title">教育背景</h2>
          <div
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "12px",
              color: "var(--text-muted)",
              letterSpacing: "0.5px",
            }}
          >
            天津职业大学 · 印刷技术 · 2015 — 2018
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="about-section-title">联系方式</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <a href="mailto:zsf97@outlook.com" className="contact-link">
              <span style={{ color: "var(--accent)", fontSize: "14px" }}>✉</span>
              zsf97@outlook.com
            </a>
            <a href="tel:15679734517" className="contact-link">
              <span style={{ color: "var(--accent)", fontSize: "14px" }}>☏</span>
              156 7973 4517
            </a>
          </div>
        </section>

        {/* Footer */}
        <div
          style={{
            marginTop: "80px",
            paddingTop: "32px",
            borderTop: "1px solid var(--border)",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "10px",
            color: "var(--text-muted)",
            letterSpacing: "1px",
          }}
        >
          © 2025 ZHANG SENFU · zsf97@outlook.com
        </div>
      </div>
    </>
  );
}
