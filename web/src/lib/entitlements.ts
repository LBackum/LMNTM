import { getSupabaseServerClient } from "@/lib/supabase/server";

export type Entitlements = {
  userId: string | null;
  fullBook: boolean;
  chapters: number[];
};

const EMPTY: Entitlements = { userId: null, fullBook: false, chapters: [] };

/**
 * Returns the current user's entitlements. Anonymous / unauthenticated users
 * get an empty set — only free sections (front/back matter) are accessible
 * without a purchase.
 */
export async function getEntitlements(): Promise<Entitlements> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return EMPTY;

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return EMPTY;

  const { data: rows, error } = await supabase
    .from("entitlements")
    .select("sku, chapter_number")
    .eq("user_id", auth.user.id);

  if (error || !rows) {
    return { ...EMPTY, userId: auth.user.id };
  }

  const fullBook = rows.some((r) => r.sku === "full-book");
  const chapters = rows
    .filter((r) => r.sku === "chapter" && typeof r.chapter_number === "number")
    .map((r) => r.chapter_number as number);

  return { userId: auth.user.id, fullBook, chapters };
}
