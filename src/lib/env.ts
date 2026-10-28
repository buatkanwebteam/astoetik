import "server-only";

export const env = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  geminiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  demoEmail: process.env.DEMO_ADMIN_EMAIL || "admin@astoetik.test",
  demoPassword: process.env.DEMO_ADMIN_PASSWORD || "astera123",
};

export const isSupabaseEnabled = Boolean(env.supabaseUrl && env.supabaseServiceKey);
export const isGeminiEnabled = Boolean(env.geminiKey);
