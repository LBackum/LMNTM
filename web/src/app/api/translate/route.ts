import { NextResponse } from "next/server";
import { z } from "zod";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/dictionary";
import { loadSection } from "@/lib/content";
import { getSupabaseServerClient, getSupabaseServiceClient } from "@/lib/supabase/server";
import { getEntitlements } from "@/lib/entitlements";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const Body = z.object({
  sectionId: z.string().min(1).max(80),
  locale: z.string().refine((v) => SUPPORTED_LOCALES.some((l) => l.code === v)),
});

/**
 * Per-section translation endpoint.
 *
 * Strategy:
 *   1. Enforce entitlement so paid chapters aren't translatable by anons.
 *   2. Check the `translations` cache table keyed by (section_id, locale).
 *   3. On cache miss, call the configured translation provider (DeepL or
 *      Google Cloud Translation). Persist the result, then return it.
 *
 * The provider call is intentionally left as a TODO: you pick one, drop in
 * the API key as an env var, and wire it here. Machine translation of the
 * book body should eventually be replaced with a human-reviewed version for
 * each locale we officially support.
 */
export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return new NextResponse("Supabase not configured", { status: 500 });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return new NextResponse("Sign in required", { status: 401 });

  const rl = rateLimit(`translate:${auth.user.id}`, { window: 60_000, max: 30 });
  if (!rl.ok) return new NextResponse("Too many requests", { status: 429 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new NextResponse("Invalid input", { status: 400 });
  const { sectionId, locale } = parsed.data;

  const section = await loadSection(sectionId);
  if (!section) return new NextResponse("Unknown section", { status: 404 });

  if (!section.free) {
    const ent = await getEntitlements();
    const owned = ent.fullBook || (section.chapterNumber !== null && ent.chapters.includes(section.chapterNumber));
    if (!owned) return new NextResponse("Purchase required", { status: 402 });
  }

  // Cache lookup (service client because `translations` is shared, not per-user).
  const service = getSupabaseServiceClient();
  if (service) {
    const { data: cached } = await service
      .from("translations")
      .select("body")
      .eq("section_id", sectionId)
      .eq("locale", locale)
      .maybeSingle();
    if (cached?.body) return NextResponse.json({ body: cached.body, cached: true });
  }

  const translated = await translateText(section.body, locale as Locale);
  if (!translated) {
    return NextResponse.json(
      { error: "Translation provider not configured. Set TRANSLATION_API_KEY." },
      { status: 503 },
    );
  }

  if (service) {
    await service.from("translations").upsert({
      section_id: sectionId,
      locale,
      body: translated,
      provider: process.env.TRANSLATION_PROVIDER ?? "unknown",
    });
  }

  return NextResponse.json({ body: translated, cached: false });
}

/**
 * Provider adapter. Implemented here (rather than a separate module) so the
 * configuration surface is easy to audit. Returns null when no provider is
 * configured — the caller surfaces that as a 503 to the client.
 */
async function translateText(text: string, target: Locale): Promise<string | null> {
  const key = process.env.TRANSLATION_API_KEY;
  const provider = process.env.TRANSLATION_PROVIDER;
  if (!key || !provider) return null;

  if (provider === "deepl") {
    const res = await fetch("https://api.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: [text], target_lang: target.toUpperCase() }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { translations?: { text: string }[] };
    return json.translations?.[0]?.text ?? null;
  }

  if (provider === "google") {
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text, target, format: "text" }),
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { translations?: { translatedText: string }[] } };
    return json.data?.translations?.[0]?.translatedText ?? null;
  }

  return null;
}
