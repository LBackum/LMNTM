import Link from "next/link";
import { CHAPTERS, FULL_BOOK_PRICE_CENTS, formatPrice } from "@/lib/content";
import { getEntitlements } from "@/lib/entitlements";
import { getAgeStatus } from "@/lib/age-gate";

export const metadata = { title: "My Library" };

export default async function LibraryPage() {
  const [entitlements, age] = await Promise.all([getEntitlements(), getAgeStatus()]);

  if (!entitlements.userId) {
    return (
      <div className="page-shell max-w-xl">
        <h1 className="font-display text-3xl text-cocoa">Sign in to see your library</h1>
        <p className="mt-3 font-body text-cocoa/80">
          Your purchases are tied to your email so you can read on any device.
        </p>
        <div className="mt-6">
          <Link href="/sign-in" className="btn-primary">Sign in</Link>
        </div>
      </div>
    );
  }

  const owned = entitlements.fullBook
    ? CHAPTERS
    : CHAPTERS.filter((c) => c.chapterNumber && entitlements.chapters.includes(c.chapterNumber));

  return (
    <div className="page-shell">
      <h1 className="font-display text-3xl text-cocoa">My Library</h1>
      <p className="mt-1 font-body text-cocoa/70">
        {entitlements.fullBook ? "You own the full book." : `You own ${owned.length} chapter${owned.length === 1 ? "" : "s"}.`}
      </p>

      {age.state !== "adult" && age.state !== "minor_approved" && (
        <div className="mt-6 card border-l-4 border-garnet">
          <h2 className="font-display text-lg text-cocoa">Age verification required</h2>
          <p className="mt-1 font-body text-sm text-cocoa/70">
            Before opening chapters, please complete the brief age verification.
          </p>
          <div className="mt-3">
            <Link href="/verify-age" className="btn-primary">Verify age</Link>
          </div>
        </div>
      )}

      <ul className="mt-6 divide-y divide-cocoa/10 rounded-2xl bg-white/70 ring-1 ring-cocoa/10">
        {owned.map((c) => (
          <li key={c.id} className="flex items-center justify-between px-5 py-4">
            <Link href={`/read/${c.id}`} className="flex-1 hover:text-garnet">
              <p className="font-display text-lg text-cocoa">Chapter {c.chapterNumber}. {c.title}</p>
              <p className="mt-1 line-clamp-1 font-body text-sm text-cocoa/60">{c.preview}</p>
            </Link>
          </li>
        ))}
      </ul>

      {!entitlements.fullBook && (
        <div className="mt-8 card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-cocoa/70">Want the whole book?</p>
          <Link href="/checkout/book" className="btn-primary">
            Upgrade — {formatPrice(FULL_BOOK_PRICE_CENTS)}
          </Link>
        </div>
      )}
    </div>
  );
}
