import "server-only";

export const env = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "https://asterax.my.id").replace(/\/$/, ""),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  geminiKey: process.env.GEMINI_API_KEY || "",
  // Quality model for structured analysis (advisor, insights, content ideas).
  geminiModel: process.env.GEMINI_MODEL || "gemini-3.5-flash",
  // Fast model for chat answers; also the fallback when the quality model is busy.
  geminiFastModel: process.env.GEMINI_FAST_MODEL || "gemini-3.5-flash-lite",
  // Dashboard login uses Supabase Auth only when this is "true"; otherwise DEMO_ADMIN_* below.
  useSupabaseAuth: process.env.USE_SUPABASE_AUTH === "true",
  demoEmail: process.env.DEMO_ADMIN_EMAIL || "admin",
  demoPassword: process.env.DEMO_ADMIN_PASSWORD || "admin",
};

export const isSupabaseEnabled = Boolean(env.supabaseUrl && env.supabaseServiceKey);
export const isGeminiEnabled = Boolean(env.geminiKey);
