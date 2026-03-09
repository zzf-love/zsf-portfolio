export interface ImageItem {
  id: string;
  filename: string;
  cloudinaryId: string;
  url: string;
  folder: string;
  stars: number;
  tags: string[];
  title: string;
  description: string;
  aiDesc: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  type: "video" | "screenshot";
  platform: string;
  url: string;
  embedUrl: string;
  caption: string;
  sortOrder: number;
  visible: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalImages: number;
  visibleImages: number;
  totalMedia: number;
  byFolder: Record<string, number>;
  byStars: Record<string, number>;
}
