"use client";
import { useEffect } from "react";

function getTheme(): "light" | "dark" {
  const h = new Date().getHours();
  return h >= 7 && h < 19 ? "light" : "dark";
}

export default function ThemeProvider() {
  useEffect(() => {
    const apply = () => {
      document.documentElement.setAttribute("data-theme", getTheme());
    };
    apply();

    // 计算到下一个切换时间点的毫秒数
    const scheduleNext = () => {
      const now = new Date();
      const h = now.getHours();
      let nextHour: number;
      if (h < 7) nextHour = 7;
      else if (h < 19) nextHour = 19;
      else nextHour = 7; // 明天

      const next = new Date(now);
      next.setHours(nextHour, 0, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);

      const ms = next.getTime() - now.getTime();
      return setTimeout(() => { apply(); scheduleNext(); }, ms);
    };

    const t = scheduleNext();
    return () => clearTimeout(t);
  }, []);

  return null;
}
