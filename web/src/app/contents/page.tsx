import Link from "next/link";
import { SECTIONS, FULL_BOOK_PRICE_CENTS, CHAPTER_PRICE_CENTS, formatPrice } from "@/lib/content";

export const metadata = { title: "Table of Contents" };

export default function ContentsPage() {
  return (
    <div className="page-shell">
      <h1 className="font-display text-3xl text-cocoa sm:text-4xl">Contents</h1>
      <p className="mt-2 font-body text-cocoa/70">
        Front and back matter are free. Chapters are {formatPrice(CHAPTER_PRICE_CENTS)} each,
        or unlock the entire book for {formatPrice(FULL_BOOK_PRICE_CENTS)}.
      </p>

      <ol className="mt-8 divide-y divide-cocoa/10 rounded-2xl bg-white/70 ring-1 ring-cocoa/10">
        {SECTIONS.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0 flex-1">
              <Link href={`/read/${s.id}`} className="block">
                <p className="truncate font-display text-lg text-cocoa hover:text-garnet">
                  {s.isChapter ? `Chapter ${s.chapterNumber}. ` : ""}{s.title}
                </p>
                {s.preview && (
                  <p className="mt-1 line-clamp-2 font-body text-sm text-cocoa/60">{s.preview}</p>
                )}
              </Link>
            </div>
            <div className="shrink-0">
              {s.free ? (
                <span className="rounded-full bg-sage/10 px-3 py-1 text-xs font-sans font-semibold uppercase tracking-wide text-sage">
                  Free
                </span>
              ) : (
                <Link
                  href={`/checkout/chapter/${s.chapterNumber}`}
                  className="btn-secondary text-xs"
                  aria-label={`Buy ${s.title} for ${formatPrice(CHAPTER_PRICE_CENTS)}`}
                >
                  {formatPrice(CHAPTER_PRICE_CENTS)}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 card flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl text-cocoa">Read the whole book</h2>
          <p className="mt-1 font-body text-sm text-cocoa/70">
            All 13 chapters plus front and back matter.
          </p>
        </div>
        <Link href="/checkout/book" className="btn-primary">
          Buy full book — {formatPrice(FULL_BOOK_PRICE_CENTS)}
        </Link>
      </div>
    </div>
  );
}
