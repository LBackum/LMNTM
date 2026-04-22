"use client";
import { useEffect, useState } from "react";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/dictionary";

const COOKIE = "lmntm_locale";

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`))
    ?.split("=")[1];
}

export default function LanguageSwitcher() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const fromCookie = readCookie(COOKIE) as Locale | undefined;
    if (fromCookie) setLocale(fromCookie);
  }, []);

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Locale;
    setLocale(next);
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = `${COOKIE}=${next}; path=/; max-age=${oneYear}; samesite=lax`;
    window.location.reload();
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm text-cocoa/80">
      <span className="sr-only">Language</span>
      <select
        value={locale}
        onChange={onChange}
        aria-label="Change language"
        className="rounded-full border border-cocoa/20 bg-white/80 px-3 py-1.5 font-sans text-sm text-cocoa focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
      >
        {SUPPORTED_LOCALES.map((l) => (
          <option key={l.code} value={l.code}>{l.native}</option>
        ))}
      </select>
    </label>
  );
}
