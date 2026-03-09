export interface Category {
  id: string;
  label: string;
  folder: string | null;
}

export const CATEGORIES: Category[] = [
  { id: "all", label: "全部作品", folder: null },
  { id: "xcxd", label: "兴长信达", folder: "xcxd" },
  { id: "add", label: "爱哆哆", folder: "add" },
  { id: "older_work", label: "早期作品", folder: "older_work" },
  { id: "others", label: "个人项目", folder: "others" },
  { id: "social", label: "社交媒体", folder: null },
];

export const FOLDERS = ["xcxd", "add", "older_work", "others"] as const;
export type FolderType = (typeof FOLDERS)[number];

export const FOLDER_LABELS: Record<string, string> = {
  xcxd: "兴长信达",
  add: "爱哆哆",
  older_work: "早期作品",
  others: "个人项目",
};

export const PRESET_TAGS = [
  "Blender",
  "C4D",
  "PS",
  "Illustrator",
  "AI辅助",
  "摄影",
  "视频",
  "3D渲染",
];

export const STAR_WEIGHTS: Record<number, number> = {
  5: 10,
  4: 5,
  3: 2,
  2: 1,
  1: 0.5,
  0: 0,
};

export function weightedShuffle<T extends { stars: number }>(items: T[]): T[] {
  const visible = items.filter((item) => item.stars > 0);

  // 按星级分组，同组内随机打乱，高星级组永远排在低星级组前面
  const groups: Record<number, T[]> = {};
  for (const item of visible) {
    if (!groups[item.stars]) groups[item.stars] = [];
    groups[item.stars].push(item);
  }
  for (const star in groups) {
    groups[star] = groups[star].sort(() => Math.random() - 0.5);
  }
  return [5, 4, 3, 2, 1].flatMap((s) => groups[s] ?? []);
}
