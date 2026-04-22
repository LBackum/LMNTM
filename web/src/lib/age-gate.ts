/**
 * Explicit-content age gate.
 *
 * This book contains graphic language and explicit adult material (see the
 * Foreword). Before any paid chapter is served, the viewer must have either:
 *   (a) self-attested they are 18+, OR
 *   (b) completed the parental-consent flow (minor + verified parent email).
 *
 * We keep the gate minimal on the free front/back matter so readers can sample
 * the author's introduction and context, but the paywalled body is locked
 * behind the gate regardless of purchase status.
 */
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AgeStatus =
  | { state: "unknown" }
  | { state: "adult" }
  | { state: "minor_pending" }
  | { state: "minor_approved" };

export async function getAgeStatus(): Promise<AgeStatus> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { state: "unknown" };

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { state: "unknown" };

  const { data } = await supabase
    .from("age_verifications")
    .select("is_adult, consent_granted_at")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!data) return { state: "unknown" };
  if (data.is_adult) return { state: "adult" };
  return data.consent_granted_at ? { state: "minor_approved" } : { state: "minor_pending" };
}

export function yearsBetween(birthdateISO: string, now = new Date()): number {
  const bd = new Date(birthdateISO);
  let age = now.getUTCFullYear() - bd.getUTCFullYear();
  const m = now.getUTCMonth() - bd.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < bd.getUTCDate())) age--;
  return age;
}
