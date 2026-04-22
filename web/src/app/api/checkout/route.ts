import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getStripe, PRICING } from "@/lib/stripe";
import { serverEnv } from "@/lib/env";
import { CHAPTERS } from "@/lib/content";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const Body = z.discriminatedUnion("sku", [
  z.object({ sku: z.literal("full-book") }),
  z.object({ sku: z.literal("chapter"), chapter: z.number().int().min(1).max(13) }),
]);

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) return new NextResponse("Stripe not configured", { status: 500 });

  const supabase = await getSupabaseServerClient();
  if (!supabase) return new NextResponse("Supabase not configured", { status: 500 });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "sign_in_required" }, { status: 401 });

  const rl = rateLimit(`checkout:${auth.user.id}`, { window: 60_000, max: 15 });
  if (!rl.ok) return new NextResponse("Too many requests", { status: 429 });

  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return new NextResponse("Invalid input", { status: 400 });

  const baseUrl = serverEnv.NEXT_PUBLIC_SITE_URL;
  let name: string;
  let amount: number;
  let metadata: Record<string, string>;

  if (parsed.data.sku === "full-book") {
    name = PRICING["full-book"].name();
    amount = PRICING["full-book"].amount;
    metadata = { sku: "full-book", user_id: auth.user.id };
  } else {
    const n = parsed.data.chapter;
    const ch = CHAPTERS.find((c) => c.chapterNumber === n);
    if (!ch) return new NextResponse("Unknown chapter", { status: 400 });
    name = `Chapter ${n}: ${ch.title}`;
    amount = PRICING.chapter.amount;
    metadata = { sku: "chapter", chapter: String(n), user_id: auth.user.id };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: auth.user.email ?? undefined,
    client_reference_id: auth.user.id,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: amount,
        product_data: { name, description: "Lessons Mama Never Taught Me — Dr. Karen R. January" },
      },
    }],
    metadata,
    payment_intent_data: { metadata },
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout/cancelled`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
