import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { ChatMessage, ContentPlan, ContentPlanInput, InsightReport, Product, ProductUnit, TrackEvent } from "@/types";
import { PRODUCTS } from "@/data/products";
import { PRODUCT_FAQS } from "@/data/faqs";
import { SAMPLE_UNITS } from "@/data/units";
import { generateSocialMetrics, generateSocialPosts } from "@/data/dummy";
import type { Db, NewChatMessage, NewEvent } from "./types";

// Demo store: static seed for products/analytics, JSON file for user-generated
// rows. On read-only filesystems (e.g. Vercel) it falls back to /tmp, and if
// that fails too, to memory only.

interface Store {
  /** Absent until an admin edits the catalogue / units; until then the seed is used. */
  products?: Product[];
  units?: ProductUnit[];
  chatSessions: { id: string; productCode: string; startedAt: string }[];
  chatMessages: ChatMessage[];
  events: TrackEvent[];
  contentPlans: ContentPlan[];
  insightReports: InsightReport[];
}

const DATA_DIR = process.env.VERCEL ? "/tmp/astera-data" : path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "store.json");
const MAX_ROWS = 5000;

let cache: Store | null = null;
let cacheMtime = 0;
let writeChain: Promise<void> = Promise.resolve();

function seedContentPlans(): ContentPlan[] {
  const now = new Date();
  const at = (dayOffset: number, hour: number) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, hour);
    return d.toISOString();
  };
  const rows: ContentPlanInput[] = [
    { platform: "tiktok", title: "Tutorial canting listrik 60 detik", caption: "Belajar mencanting tanpa ribet pakai canting listrik K-CL001.", format: "video", scheduledAt: at(1, 19), status: "scheduled", productCode: "K-CL001", createdByAi: false },
    { platform: "instagram", title: "Carousel: beda kompor SNI dan non-SNI", caption: "Geser untuk lihat perbedaannya.", format: "carousel", scheduledAt: at(3, 12), status: "draft", productCode: "A-SD003N", createdByAi: false },
    { platform: "instagram", title: "Reels behind the scenes produksi", caption: "Dari workshop Bantul ke sanggar batik di seluruh Indonesia.", format: "reel", scheduledAt: at(-4, 18), status: "posted", productCode: null, createdByAi: false },
    { platform: "tiktok", title: "Live demo kompor tanah liat", caption: "Live jam 8 malam, ada promo khusus penonton!", format: "live", scheduledAt: at(6, 20), status: "scheduled", productCode: "T-SD001", createdByAi: false },
    { platform: "tiktok", title: "Testimoni pembatik pemula", caption: "Cerita pembatik yang baru pertama kali pakai kompor listrik.", format: "video", scheduledAt: at(9, 19), status: "idea", productCode: "A-AS001", createdByAi: false },
  ];
  return rows.map((r) => ({ ...r, id: randomUUID() }));
}

function emptyStore(): Store {
  return { chatSessions: [], chatMessages: [], events: [], contentPlans: seedContentPlans(), insightReports: [] };
}

async function mtimeOf(file: string): Promise<number> {
  try {
    return (await fs.stat(file)).mtimeMs;
  } catch {
    return 0;
  }
}

// Next bundles route handlers and pages separately, so each bundle has its own
// copy of this module. Re-read the file whenever another bundle has written it,
// otherwise a page keeps serving products an API route already changed.
async function load(): Promise<Store> {
  const mtime = await mtimeOf(DATA_FILE);
  if (cache && mtime <= cacheMtime) return cache;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    cache = { ...emptyStore(), ...(JSON.parse(raw) as Partial<Store>) };
    cacheMtime = mtime;
  } catch {
    cache ??= emptyStore();
  }
  return cache;
}

function persist(): Promise<void> {
  const snapshot = JSON.stringify(cache);
  writeChain = writeChain
    .then(async () => {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(DATA_FILE, snapshot, "utf8");
      // Our own write is already in memory; don't treat it as a foreign change.
      cacheMtime = await mtimeOf(DATA_FILE);
    })
    .catch(() => {
      // Read-only FS: keep running in memory.
    });
  return writeChain;
}

function cap<T>(rows: T[]): T[] {
  return rows.length > MAX_ROWS ? rows.slice(rows.length - MAX_ROWS) : rows;
}

export function createLocalDb(): Db {
  return {
    mode: "local",

    async listProducts() {
      return (await load()).products ?? PRODUCTS;
    },
    async getProduct(code) {
      const products = (await load()).products ?? PRODUCTS;
      return products.find((p) => p.code.toLowerCase() === code.toLowerCase()) ?? null;
    },
    async createProduct(product) {
      const s = await load();
      const products = s.products ?? PRODUCTS;
      if (products.some((p) => p.code.toLowerCase() === product.code.toLowerCase())) return false;
      s.products = [...products, product];
      await persist();
      return true;
    },
    async updateProduct(product) {
      const s = await load();
      const products = s.products ?? PRODUCTS;
      if (!products.some((p) => p.code === product.code)) return false;
      s.products = products.map((p) => (p.code === product.code ? product : p));
      await persist();
      return true;
    },
    async deleteProduct(code) {
      const s = await load();
      s.products = (s.products ?? PRODUCTS).filter((p) => p.code !== code);
      s.units = (s.units ?? SAMPLE_UNITS).filter((u) => u.productCode !== code);
      await persist();
    },
    async listFaqs(productCode) {
      return PRODUCT_FAQS.filter((f) => f.productCode === productCode);
    },

    async listUnits(productCode) {
      return ((await load()).units ?? SAMPLE_UNITS)
        .filter((u) => u.productCode === productCode)
        .sort((a, b) => a.serial.localeCompare(b.serial, "id", { numeric: true }));
    },
    async getUnit(productCode, serial) {
      const units = (await load()).units ?? SAMPLE_UNITS;
      return units.find((u) => u.productCode === productCode && u.serial.toLowerCase() === serial.toLowerCase()) ?? null;
    },
    async createUnit(unit) {
      const s = await load();
      const units = s.units ?? SAMPLE_UNITS;
      if (units.some((u) => u.productCode === unit.productCode && u.serial === unit.serial)) return false;
      s.units = [...units, unit];
      await persist();
      return true;
    },
    async updateUnit(unit) {
      const s = await load();
      const units = s.units ?? SAMPLE_UNITS;
      const same = (u: ProductUnit) => u.productCode === unit.productCode && u.serial === unit.serial;
      if (!units.some(same)) return false;
      s.units = units.map((u) => (same(u) ? unit : u));
      await persist();
      return true;
    },
    async deleteUnit(productCode, serial) {
      const s = await load();
      s.units = (s.units ?? SAMPLE_UNITS).filter((u) => !(u.productCode === productCode && u.serial === serial));
      await persist();
    },

    async ensureChatSession(sessionId, productCode) {
      const s = await load();
      if (s.chatSessions.some((c) => c.id === sessionId)) return;
      s.chatSessions = cap([...s.chatSessions, { id: sessionId, productCode, startedAt: new Date().toISOString() }]);
      await persist();
    },
    async addChatMessage(msg: NewChatMessage) {
      const s = await load();
      const row: ChatMessage = { ...msg, id: randomUUID(), createdAt: new Date().toISOString(), topic: null };
      s.chatMessages = cap([...s.chatMessages, row]);
      await persist();
      return row;
    },
    async listUserMessages(sinceIso, limit) {
      const s = await load();
      return s.chatMessages
        .filter((m) => m.role === "user" && m.createdAt >= sinceIso)
        .slice(-limit);
    },
    async setMessageTopics(updates) {
      const s = await load();
      const map = new Map(updates.map((u) => [u.id, u.topic]));
      s.chatMessages = s.chatMessages.map((m) => (map.has(m.id) ? { ...m, topic: map.get(m.id) ?? null } : m));
      await persist();
    },

    async addEvent(event: NewEvent) {
      const s = await load();
      s.events = cap([...s.events, { ...event, id: randomUUID(), createdAt: new Date().toISOString() }]);
      await persist();
    },
    async listEvents(sinceIso) {
      const s = await load();
      return s.events.filter((e) => e.createdAt >= sinceIso);
    },

    async listContentPlans() {
      const s = await load();
      return [...s.contentPlans].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    },
    async createContentPlans(input) {
      const s = await load();
      const rows = input.map((r) => ({ ...r, id: randomUUID() }));
      s.contentPlans = [...s.contentPlans, ...rows];
      await persist();
      return rows;
    },
    async updateContentPlan(id, patch) {
      const s = await load();
      let updated: ContentPlan | null = null;
      s.contentPlans = s.contentPlans.map((p) => {
        if (p.id !== id) return p;
        updated = { ...p, ...patch, id };
        return updated;
      });
      await persist();
      return updated;
    },
    async deleteContentPlan(id) {
      const s = await load();
      s.contentPlans = s.contentPlans.filter((p) => p.id !== id);
      await persist();
    },

    async listSocialMetrics(sinceDate) {
      return generateSocialMetrics().filter((m) => m.date >= sinceDate);
    },
    async listSocialPosts(sinceIso) {
      return generateSocialPosts().filter((p) => p.postedAt >= sinceIso);
    },

    async saveInsightReport(report) {
      const s = await load();
      const row: InsightReport = { ...report, id: randomUUID(), createdAt: new Date().toISOString() };
      s.insightReports = [...s.insightReports, row].slice(-20);
      await persist();
      return row;
    },
    async getLatestInsightReport() {
      const s = await load();
      return s.insightReports.at(-1) ?? null;
    },
  };
}
