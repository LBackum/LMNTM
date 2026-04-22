"use client";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setStatus("sent");
      setMessage("Check your inbox for a secure sign-in link.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="page-shell max-w-md">
      <h1 className="font-display text-3xl text-cocoa">Sign in</h1>
      <p className="mt-2 font-body text-cocoa/70">
        Enter your email and we&apos;ll send you a one-time sign-in link. No password required.
      </p>

      <form onSubmit={onSubmit} className="mt-8 card space-y-4">
        <label className="block">
          <span className="text-sm font-sans font-medium text-cocoa">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-cocoa/20 bg-white px-3 py-2 font-body text-cocoa focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
            placeholder="you@example.com"
          />
        </label>

        <button type="submit" disabled={status === "sending"} className="btn-primary w-full">
          {status === "sending" ? "Sending…" : "Send sign-in link"}
        </button>

        {message && (
          <p className={status === "error" ? "text-sm text-garnet" : "text-sm text-sage"}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
