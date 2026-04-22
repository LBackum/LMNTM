"use client";
import { useState } from "react";

type Screen = "gate" | "minor_form" | "adult_done" | "minor_sent";

export default function VerifyAgePage() {
  const [screen, setScreen] = useState<Screen>("gate");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submitAdult() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/verify-age", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "adult_attestation" }),
      });
      if (!res.ok) throw new Error(await res.text());
      setScreen("adult_done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitMinor(form: FormData) {
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        kind: "minor_consent",
        readerFirstName: form.get("readerFirstName"),
        readerLastName: form.get("readerLastName"),
        readerEmail: form.get("readerEmail"),
        readerBirthdate: form.get("readerBirthdate"),
        parentFirstName: form.get("parentFirstName"),
        parentLastName: form.get("parentLastName"),
        parentEmail: form.get("parentEmail"),
        parentPhone: form.get("parentPhone"),
        consentAcknowledged: form.get("consentAcknowledged") === "on",
      };
      const res = await fetch("/api/verify-age", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setScreen("minor_sent");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (screen === "adult_done") {
    return (
      <Shell title="You're all set">
        <p className="font-body text-cocoa/80">
          Thank you. You now have access to purchased chapters. Return to{" "}
          <a href="/contents" className="text-sage underline">Contents</a> to continue reading.
        </p>
      </Shell>
    );
  }

  if (screen === "minor_sent") {
    return (
      <Shell title="Consent request sent">
        <p className="font-body text-cocoa/80">
          We&apos;ve emailed your parent or guardian at the address you provided.
          Once they confirm consent, you&apos;ll be able to access paid chapters.
        </p>
        <p className="mt-4 font-body text-sm text-cocoa/60">
          Questions? Write to{" "}
          <a href="mailto:ask@drkayjay.com" className="text-sage underline">ask@drkayjay.com</a>.
        </p>
      </Shell>
    );
  }

  if (screen === "minor_form") {
    return (
      <Shell title="Parental consent">
        <p className="font-body text-cocoa/80">
          Because you&apos;re under 18, we need a parent or guardian to confirm their consent.
          Fill out the form below — we&apos;ll email them a secure approval link.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitMinor(new FormData(e.currentTarget));
          }}
          className="mt-6 space-y-4"
        >
          <fieldset className="card space-y-3">
            <legend className="font-display text-lg text-cocoa">About you</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input name="readerFirstName" label="First name" required />
              <Input name="readerLastName" label="Last name" required />
            </div>
            <Input name="readerEmail" type="email" label="Your email" required />
            <Input name="readerBirthdate" type="date" label="Your birthdate" required />
          </fieldset>

          <fieldset className="card space-y-3">
            <legend className="font-display text-lg text-cocoa">Parent or guardian</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input name="parentFirstName" label="First name" required />
              <Input name="parentLastName" label="Last name" required />
            </div>
            <Input name="parentEmail" type="email" label="Email" required />
            <Input name="parentPhone" type="tel" label="Phone" required />
          </fieldset>

          <label className="flex items-start gap-3 rounded-xl bg-mist/60 p-4">
            <input
              type="checkbox"
              name="consentAcknowledged"
              required
              className="mt-1 h-4 w-4 rounded border-cocoa/30 text-garnet focus:ring-garnet"
            />
            <span className="font-body text-sm text-cocoa/80">
              I confirm the information above is accurate, and I understand that my parent
              or guardian must approve my access to this book, which contains graphic language
              and explicit adult material. By submitting, I consent to Dr. Karen R. January
              and January Media LLC contacting the parent/guardian listed above for approval.
            </span>
          </label>

          {error && <p className="text-sm text-garnet">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Sending…" : "Send consent request"}
          </button>
        </form>
      </Shell>
    );
  }

  return (
    <Shell title="Age verification">
      <p className="font-body text-cocoa/80">
        <strong>Reader advisory:</strong> Lessons Mama Never Taught Me contains graphic language
        and explicit adult material. Please confirm your age before continuing.
      </p>

      <div className="mt-6 space-y-3">
        <button onClick={submitAdult} disabled={submitting} className="btn-primary w-full">
          I am 18 or older
        </button>
        <button onClick={() => setScreen("minor_form")} className="btn-ghost w-full">
          I am under 18 — start parental consent
        </button>
      </div>
      {error && <p className="mt-4 text-sm text-garnet">{error}</p>}

      <p className="mt-8 font-body text-xs text-cocoa/60">
        Need help? Contact{" "}
        <a href="mailto:ask@drkayjay.com" className="text-sage underline">ask@drkayjay.com</a>.
      </p>
    </Shell>
  );
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="page-shell max-w-xl">
      <h1 className="font-display text-3xl text-cocoa">{title}</h1>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Input({
  name, label, type = "text", required,
}: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-sans font-medium text-cocoa">
        {label}{required && <span aria-hidden className="text-garnet"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded-lg border border-cocoa/20 bg-white px-3 py-2 font-body text-cocoa focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
      />
    </label>
  );
}
