import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { getSupabaseServerClient, getSupabaseServiceClient } from "@/lib/supabase/server";
import { yearsBetween } from "@/lib/age-gate";
import { sendParentConsentEmail } from "@/lib/email";
import { serverEnv } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const AdultSchema = z.object({ kind: z.literal("adult_attestation") });
const MinorSchema = z.object({
  kind: z.literal("minor_consent"),
  readerFirstName: z.string().min(1).max(100),
  readerLastName: z.string().min(1).max(100),
  readerEmail: z.string().email(),
  readerBirthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  parentFirstName: z.string().min(1).max(100),
  parentLastName: z.string().min(1).max(100),
  parentEmail: z.string().email(),
  parentPhone: z.string().min(7).max(30),
  consentAcknowledged: z.literal(true),
});

const Body = z.discriminatedUnion("kind", [AdultSchema, MinorSchema]);

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return new NextResponse("Supabase not configured", { status: 500 });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return new NextResponse("Sign in required", { status: 401 });

  const rl = rateLimit(`verify-age:${auth.user.id}`, { window: 60_000, max: 5 });
  if (!rl.ok) return new NextResponse("Too many requests", { status: 429 });

  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return new NextResponse("Invalid input", { status: 400 });
  const body = parsed.data;

  const service = getSupabaseServiceClient();
  if (!service) return new NextResponse("Service client unavailable", { status: 500 });

  if (body.kind === "adult_attestation") {
    const { error } = await service.from("age_verifications").upsert({
      user_id: auth.user.id,
      birthdate: new Date().toISOString().slice(0, 10),
      is_adult: true,
    });
    if (error) return new NextResponse(error.message, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const age = yearsBetween(body.readerBirthdate);
  if (age >= 18) {
    // Reader filled out the minor form but is actually an adult — attest that
    // and stop. Don't email the parent.
    const { error } = await service.from("age_verifications").upsert({
      user_id: auth.user.id,
      birthdate: body.readerBirthdate,
      is_adult: true,
    });
    if (error) return new NextResponse(error.message, { status: 500 });
    return NextResponse.json({ ok: true, note: "adult_detected" });
  }

  const token = randomBytes(32).toString("base64url");
  const { error } = await service.from("age_verifications").upsert({
    user_id: auth.user.id,
    birthdate: body.readerBirthdate,
    is_adult: false,
    parent_first_name: body.parentFirstName,
    parent_last_name: body.parentLastName,
    parent_email: body.parentEmail,
    parent_phone: body.parentPhone,
    consent_token: token,
    consent_sent_at: new Date().toISOString(),
  });
  if (error) return new NextResponse(error.message, { status: 500 });

  await sendParentConsentEmail({
    to: body.parentEmail,
    parentName: `${body.parentFirstName} ${body.parentLastName}`,
    childName: `${body.readerFirstName} ${body.readerLastName}`,
    confirmUrl: `${serverEnv.NEXT_PUBLIC_SITE_URL}/api/consent/confirm?token=${token}`,
    supportEmail: serverEnv.SUPPORT_EMAIL,
  });

  return NextResponse.json({ ok: true });
}
