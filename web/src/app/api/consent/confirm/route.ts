import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return new NextResponse("Missing token", { status: 400 });

  const service = getSupabaseServiceClient();
  if (!service) return new NextResponse("Service unavailable", { status: 500 });

  const { data, error } = await service
    .from("age_verifications")
    .select("user_id, consent_granted_at")
    .eq("consent_token", token)
    .maybeSingle();

  if (error || !data) return new NextResponse("Invalid or expired link", { status: 404 });

  if (!data.consent_granted_at) {
    await service
      .from("age_verifications")
      .update({ consent_granted_at: new Date().toISOString() })
      .eq("consent_token", token);
  }

  return NextResponse.redirect(new URL("/consent/approved", url.origin));
}
