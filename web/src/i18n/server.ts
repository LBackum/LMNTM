import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "./dictionary";

const COOKIE = "lmntm_locale";

/**
 * Resolve the current locale for the request:
 *   1. Explicit cookie (user pick overrides everything).
 *   2. Accept-Language negotiation against SUPPORTED_LOCALES.
 *   3. DEFAULT_LOCALE fallback.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(COOKIE)?.value as Locale | undefined;
  if (fromCookie && SUPPORTED_LOCALES.some((l) => l.code === fromCookie)) {
    return fromCookie;
  }
  const hdrs = await headers();
  const accept = hdrs.get("accept-language") ?? "";
  for (const part of accept.split(",")) {
    const code = part.split(";")[0].trim().slice(0, 2).toLowerCase() as Locale;
    if (SUPPORTED_LOCALES.some((l) => l.code === code)) return code;
  }
  return DEFAULT_LOCALE;
}
