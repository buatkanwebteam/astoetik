import type {
  ChatMessage,
  ContentPlan,
  ContentPlanInput,
  InsightReport,
  Product,
  ProductFaq,
  SocialMetric,
  SocialPost,
  TrackEvent,
} from "@/types";

export type NewChatMessage = Pick<ChatMessage, "sessionId" | "productCode" | "role" | "content">;
export type NewEvent = Pick<TrackEvent, "productCode" | "type" | "meta">;

/** Single data-access contract. `local` and `supabase` implement it. */
export interface Db {
  readonly mode: "local" | "supabase";

  listProducts(): Promise<Product[]>;
  getProduct(code: string): Promise<Product | null>;
  listFaqs(productCode: string): Promise<ProductFaq[]>;

  ensureChatSession(sessionId: string, productCode: string): Promise<void>;
  addChatMessage(msg: NewChatMessage): Promise<ChatMessage>;
  listUserMessages(sinceIso: string, limit: number): Promise<ChatMessage[]>;
  setMessageTopics(updates: { id: string; topic: string }[]): Promise<void>;

  addEvent(event: NewEvent): Promise<void>;
  listEvents(sinceIso: string): Promise<TrackEvent[]>;

  listContentPlans(): Promise<ContentPlan[]>;
  createContentPlans(input: ContentPlanInput[]): Promise<ContentPlan[]>;
  updateContentPlan(id: string, patch: Partial<ContentPlanInput>): Promise<ContentPlan | null>;
  deleteContentPlan(id: string): Promise<void>;

  listSocialMetrics(sinceDate: string): Promise<SocialMetric[]>;
  listSocialPosts(sinceIso: string): Promise<SocialPost[]>;

  saveInsightReport(report: Omit<InsightReport, "id" | "createdAt">): Promise<InsightReport>;
  getLatestInsightReport(): Promise<InsightReport | null>;
}
