import "server-only";
import { getDb } from "@/lib/db";
import { byPlatform, sinceDate, type Filters } from "@/lib/analytics";

/** Metrics and posts for the selected window and platform. */
export async function loadWindow(filters: Filters) {
  const db = getDb();
  const since = sinceDate(filters.days);
  const [metrics, posts] = await Promise.all([
    db.listSocialMetrics(since),
    db.listSocialPosts(`${since}T00:00:00.000Z`),
  ]);
  return {
    metrics: byPlatform(metrics, filters.platform),
    posts: byPlatform(posts, filters.platform),
  };
}
