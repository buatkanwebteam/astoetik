export type ProductCategory = "kompor" | "kompor-cap" | "canting";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface MarketplaceLinks {
  shopee?: string;
  tokopedia?: string;
}

export interface Product {
  code: string;
  name: string;
  category: ProductCategory;
  price: number;
  /** Only specs present in the source data. Missing values are omitted, never guessed. */
  specs: ProductSpec[];
  tkdn: string | null;
  sni: boolean;
  image: string;
  gallery: string[];
  marketplaceLinks: MarketplaceLinks;
  note: string | null;
}

/** Every unit that gets a QR has passed QC, so there is only one status. */
export type QcStatus = "lulus";

/** One physical unit of a product type. Its QR opens /p/<productCode>/<serial>. */
export interface ProductUnit {
  productCode: string;
  /** Unique within the product type; part of the URL printed in the QR. */
  serial: string;
  productionCode: string;
  /** YYYY-MM-DD */
  productionDate: string;
  /** Counted from productionDate (purchase date is unknown to the system). */
  warrantyMonths: number;
  qcStatus: QcStatus;
  /** YYYY-MM-DD */
  qcDate: string | null;
  qcInspector: string | null;
  note: string | null;
  createdAt: string;
}

export type FaqSource = "manual" | "generated";

export interface ProductFaq {
  id: string;
  productCode: string;
  question: string;
  answer: string;
  source: FaqSource;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  sessionId: string;
  productCode: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  topic: string | null;
}

export type EventType = "qr_scan" | "page_view" | "chat_open" | "marketplace_click";

export interface TrackEvent {
  id: string;
  productCode: string;
  type: EventType;
  meta: Record<string, string | number | boolean | null>;
  createdAt: string;
}

export type ContentPlatform = "instagram" | "tiktok";
export type ContentStatus = "idea" | "draft" | "scheduled" | "posted";

export interface ContentPlan {
  id: string;
  platform: ContentPlatform;
  title: string;
  caption: string;
  format: string;
  scheduledAt: string;
  status: ContentStatus;
  productCode: string | null;
  createdByAi: boolean;
}

export type ContentPlanInput = Omit<ContentPlan, "id">;

export type SocialPlatform = "tiktok" | "instagram" | "shopee" | "youtube";
export const SOCIAL_PLATFORMS: SocialPlatform[] = ["tiktok", "instagram", "shopee", "youtube"];

export interface SocialMetric {
  id: string;
  platform: SocialPlatform;
  date: string; // YYYY-MM-DD
  impressions: number;
  engagement: number;
  profileVisits: number;
  marketplaceClicks: number;
  purchases: number;
  followers: number;
}

export type PostFormat = "reel" | "carousel" | "video" | "live";

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  title: string;
  postedAt: string;
  format: PostFormat;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  purchases: number;
}

export interface InsightTopic {
  topic: string;
  count: number;
  examples: string[];
  action: string;
}

export interface InsightReport {
  id: string;
  createdAt: string;
  totalMessages: number;
  topics: InsightTopic[];
  demo: boolean;
}
