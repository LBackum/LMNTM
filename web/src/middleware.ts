import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware responsibilities:
 *   1. Refresh the Supabase session cookie so server components see the latest
 *      auth state.
 *   2. Enforce the age gate on the full-book reader. Paywalled chapters get
 *      the gate check inside the page so we can render a softer paywall when
 *      the user hasn't signed in yet.
 */

const AGE_GATED_PATH_RE = /^\/read\/all/;

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (AGE_GATED_PATH_RE.test(request.nextUrl.pathname)) {
    if (!user) {
      const signIn = new URL("/sign-in", request.url);
      signIn.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(signIn);
    }
    const { data: av } = await supabase
      .from("age_verifications")
      .select("is_adult, consent_granted_at")
      .eq("user_id", user.id)
      .maybeSingle();
    const ok = av && (av.is_adult || av.consent_granted_at);
    if (!ok) {
      const verify = new URL("/verify-age", request.url);
      verify.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(verify);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Run on all routes except Next internals and static files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
