import type { Metadata } from "next";
import dynamic from "next/dynamic";
import "./globals.css";

const ChatWidget = dynamic(() => import("@/components/ChatWidget"), { ssr: false });

export const metadata: Metadata = {
  title: "张森福 · 视觉设计师",
  description: "视觉设计师 · 8年电商视觉经验 · 擅长 AI 辅助设计与三维渲染",
  keywords: ["视觉设计", "电商设计", "Blender", "3D渲染", "AI辅助设计", "张森福"],
  openGraph: {
    title: "张森福 · 视觉设计师",
    description: "视觉设计师 · 8年电商视觉经验 · 擅长 AI 辅助设计与三维渲染",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body suppressHydrationWarning>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
