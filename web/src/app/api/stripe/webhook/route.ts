import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";

export const runtime = "nodejs";
// Disable body parsing — Stripe's signature check requires the raw body.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) return new NextResponse("Stripe not configured", { status: 500 });
  if (!serverEnv.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse("Webhook secret missing", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new NextResponse("Missing signature", { status: 400 });

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, serverEnv.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new NextResponse(
      `Signature verification failed: ${err instanceof Error ? err.message : "unknown"}`,
      { status: 400 },
    );
  }

  const service = getSupabaseServiceClient();
  if (!service) return new NextResponse("Service client unavailable", { status: 500 });

  // Idempotency: record the event id; skip if we've already processed it.
  const { error: insertErr } = await service
    .from("stripe_events")
    .insert({ id: event.id, type: event.type });
  if (insertErr && !String(insertErr.message).includes("duplicate")) {
    return new NextResponse(insertErr.message, { status: 500 });
  }
  if (insertErr) {
    // Duplicate — already processed. Acknowledge so Stripe stops retrying.
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = (session.metadata?.user_id ?? session.client_reference_id) || null;
    const sku = session.metadata?.sku;

    if (!userId || !sku) {
      await service.from("purchase_audit").insert({
        event: "checkout.session.completed",
        stripe_id: session.id,
        amount_cents: session.amount_total ?? null,
        metadata: { warning: "missing_user_or_sku", raw_metadata: session.metadata ?? {} },
      });
      return NextResponse.json({ received: true, skipped: true });
    }

    if (sku === "full-book") {
      await service.from("entitlements").upsert(
        { user_id: userId, sku: "full-book", chapter_number: null, stripe_session_id: session.id },
        { onConflict: "user_id,sku,chapter_number" },
      );
    } else if (sku === "chapter") {
      const n = Number(session.metadata?.chapter);
      if (Number.isInteger(n) && n >= 1 && n <= 13) {
        await service.from("entitlements").upsert(
          { user_id: userId, sku: "chapter", chapter_number: n, stripe_session_id: session.id },
          { onConflict: "user_id,sku,chapter_number" },
        );
      }
    }

    await service.from("purchase_audit").insert({
      user_id: userId,
      event: event.type,
      stripe_id: session.id,
      amount_cents: session.amount_total ?? null,
      metadata: session.metadata ?? {},
    });
  }

  await service
    .from("stripe_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("id", event.id);

  return NextResponse.json({ received: true });
}
