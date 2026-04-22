import Link from "next/link";
import { SECTIONS, FULL_BOOK_PRICE_CENTS, formatPrice, loadSection } from "@/lib/content";
import { getEntitlements } from "@/lib/entitlements";

export const metadata = { title: "Read Full Book" };

export default async function ReadAllPage() {
  const entitlements = await getEntitlements();
  if (!entitlements.fullBook) {
    return (
      <div className="page-shell">
        <div className="card">
          <h1 className="font-display text-2xl text-cocoa">Unlock the full book</h1>
          <p className="mt-2 font-body text-cocoa/70">
            This continuous reader is available to readers who own the entire book.
          </p>
          <div className="mt-4">
            <Link href="/checkout/book" className="btn-primary">
              Buy full book — {formatPrice(FULL_BOOK_PRICE_CENTS)}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const sections = await Promise.all(SECTIONS.map((s) => loadSection(s.id)));

  return (
    <div className="page-shell">
      <h1 className="font-display text-3xl text-cocoa">Lessons Mama Never Taught Me</h1>
      <p className="font-sans text-sm uppercase tracking-[0.3em] text-sage">Full book</p>
      <div className="mt-10 space-y-16">
        {sections.map((s) =>
          s ? (
            <section key={s.id} id={s.id} className="prose-book scroll-mt-24">
              {s.isChapter && (
                <p className="not-prose font-sans text-xs uppercase tracking-[0.3em] text-sage">
                  Chapter {s.chapterNumber}
                </p>
              )}
              <h2 className="!mt-2">{s.title}</h2>
              {s.body.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
            </section>
          ) : null,
        )}
      </div>
    </div>
  );
}
