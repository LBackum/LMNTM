import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CHAPTER_PRICE_CENTS,
  FULL_BOOK_PRICE_CENTS,
  formatPrice,
  getAdjacent,
  getSectionMeta,
  loadSection,
} from "@/lib/content";
import { getEntitlements } from "@/lib/entitlements";
import TranslateToggle from "@/components/TranslateToggle";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meta = getSectionMeta(id);
  if (!meta) return { title: "Not found" };
  return { title: meta.title, description: meta.preview };
}

export default async function ReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meta = getSectionMeta(id);
  if (!meta) notFound();
  const entitlements = await getEntitlements();
  const hasAccess =
    meta.free ||
    entitlements.fullBook ||
    (meta.chapterNumber !== null && entitlements.chapters.includes(meta.chapterNumber));

  const section = hasAccess ? await loadSection(id) : null;
  const { prev, next } = getAdjacent(id);

  return (
    <article className="page-shell">
      <nav className="mb-6 text-sm text-cocoa/60">
        <Link href="/contents" className="hover:text-garnet">← Contents</Link>
      </nav>

      <header className="mb-8">
        {meta.isChapter && (
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-sage">
            Chapter {meta.chapterNumber}
          </p>
        )}
        <h1 className="mt-1 font-display text-3xl leading-tight text-cocoa sm:text-4xl">
          {meta.title}
        </h1>
      </header>

      {hasAccess && section ? (
        <>
          <TranslateToggle sectionId={meta.id} originalBody={section.body} />
          <div className="prose-book">
            {section.body.split(/\n{2,}/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </>
      ) : (
        <PaywallPreview meta={meta} />
      )}

      <div className="mt-16 flex items-center justify-between border-t border-cocoa/10 pt-6 text-sm">
        {prev ? (
          <Link href={`/read/${prev.id}`} className="text-cocoa hover:text-garnet">
            ← {prev.title}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/read/${next.id}`} className="text-right text-cocoa hover:text-garnet">
            {next.title} →
          </Link>
        ) : <span />}
      </div>
    </article>
  );
}

function PaywallPreview({ meta }: { meta: NonNullable<ReturnType<typeof getSectionMeta>> }) {
  return (
    <div className="space-y-8">
      <blockquote className="rounded-2xl border-l-4 border-sand bg-white/70 p-6 font-body text-lg italic text-cocoa/80 shadow-page">
        “{meta.preview}”
      </blockquote>
      <div className="card space-y-4">
        <h2 className="font-display text-xl text-cocoa">Unlock this chapter</h2>
        <p className="font-body text-sm text-cocoa/70">
          Purchase this chapter individually for {formatPrice(CHAPTER_PRICE_CENTS)}, or unlock
          the full book for {formatPrice(FULL_BOOK_PRICE_CENTS)} and read every chapter.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {meta.chapterNumber !== null && (
            <Link
              href={`/checkout/chapter/${meta.chapterNumber}`}
              className="btn-secondary"
            >
              Buy chapter — {formatPrice(CHAPTER_PRICE_CENTS)}
            </Link>
          )}
          <Link href="/checkout/book" className="btn-primary">
            Buy full book — {formatPrice(FULL_BOOK_PRICE_CENTS)}
          </Link>
        </div>
      </div>
    </div>
  );
}
