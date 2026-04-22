"use client";
import { useState } from "react";
import { SUPPORTED_LOCALES } from "@/i18n/dictionary";

type Props = { sectionId: string; originalBody: string };

export default function TranslateToggle({ sectionId, originalBody }: Props) {
  const [locale, setLocale] = useState<string>("");
  const [body, setBody] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");
  const [error, setError] = useState("");

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setLocale(next);
    if (!next) { setBody(null); return; }
    setStatus("pending");
    setError("");
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId, locale: next }),
      });
      if (res.status === 401) {
        window.location.href = `/sign-in?next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as { body: string };
      setBody(json.body);
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Translation failed");
    }
  }

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-white/70 p-4 ring-1 ring-cocoa/10 sm:flex-row sm:items-center sm:justify-between">
      <label className="flex items-center gap-3 text-sm text-cocoa">
        <span>Translate this chapter:</span>
        <select
          value={locale}
          onChange={onChange}
          aria-label="Translate chapter into language"
          className="rounded-full border border-cocoa/20 bg-white px-3 py-1.5 font-sans text-sm text-cocoa focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
        >
          <option value="">Original (English)</option>
          {SUPPORTED_LOCALES.filter((l) => l.code !== "en").map((l) => (
            <option key={l.code} value={l.code}>{l.native}</option>
          ))}
        </select>
      </label>
      {status === "pending" && <span className="text-sm text-cocoa/60">Translating…</span>}
      {status === "error" && <span className="text-sm text-garnet">{error}</span>}
      {body && (
        <>
          <Translated body={body} />
          <button
            type="button"
            onClick={() => { setBody(null); setLocale(""); }}
            className="btn-ghost text-xs"
          >
            Show original
          </button>
        </>
      )}
      {/* Preserve original in DOM so screen readers and print still work: */}
      <span className="sr-only" aria-hidden={body ? "true" : "false"}>{originalBody}</span>
    </div>
  );
}

function Translated({ body }: { body: string }) {
  return (
    <div className="w-full">
      <details className="mt-2">
        <summary className="cursor-pointer text-sm text-sage">Translated text</summary>
        <div className="prose-book mt-3 w-full">
          {body.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </details>
    </div>
  );
}
