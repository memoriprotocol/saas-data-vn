export type PlatformId =
  | "tiktok_shop"
  | "douyin"
  | "youtube"
  | "shopee"
  | "fb_ads"
  | "google_ads"
  | "social_mix";

export type PlatformCategory = "ecom" | "video" | "ads" | "social";

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  shortName: string;
  badge: string;
  cost: number;
  placeholder: string;
  category: PlatformCategory;
}

export interface ResultItem {
  id: string;
  platform: PlatformId;
  title: string;
  author: string;
  thumbnail: string;
  metricPrimaryLabel: string;
  metricPrimaryValue: string;
  metricPrimaryNum: number;
  metricSecondaryLabel: string;
  metricSecondaryValue: string;
  tag: string;
  date: string;
  targetUrl: string;
  downloadUrl?: string;
}

export interface HistoryRecord {
  id: string;
  platform: PlatformId;
  keyword: string;
  filterSummary: string;
  timestamp: string;
  results: ResultItem[];
}
