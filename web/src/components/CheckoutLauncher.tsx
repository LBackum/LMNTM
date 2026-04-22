"use client";
import { useState } from "react";

type Props =
  | { sku: "full-book"; label: string; chapter?: never }
  | { sku: "chapter"; chapter: number; label: string };

export default function CheckoutLauncher(props: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function go() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(props.sku === "chapter"
          ? { sku: "chapter", chapter: props.chapter }
          : { sku: "full-book" }),
      });
      if (res.status === 401) {
        window.location.href = `/sign-in?next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      const data: { url?: string; error?: string } = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error ?? "Could not start checkout");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button onClick={go} disabled={busy} className="btn-primary w-full text-base">
        {busy ? "Redirecting to Stripe…" : props.label}
      </button>
      {err && <p className="text-sm text-garnet">{err}</p>}
    </div>
  );
}
