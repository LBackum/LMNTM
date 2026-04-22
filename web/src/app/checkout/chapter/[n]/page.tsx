import { notFound } from "next/navigation";
import CheckoutLauncher from "@/components/CheckoutLauncher";
import { CHAPTERS, CHAPTER_PRICE_CENTS, formatPrice } from "@/lib/content";

export default async function BuyChapterPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const num = Number(n);
  if (!Number.isInteger(num) || num < 1 || num > 13) notFound();
  const ch = CHAPTERS.find((c) => c.chapterNumber === num);
  if (!ch) notFound();

  return (
    <div className="page-shell max-w-xl">
      <p className="font-sans text-xs uppercase tracking-[0.3em] text-sage">Chapter {num}</p>
      <h1 className="mt-1 font-display text-3xl text-cocoa">{ch.title}</h1>
      <blockquote className="mt-6 rounded-2xl border-l-4 border-sand bg-white/70 p-6 font-body text-lg italic text-cocoa/80 shadow-page">
        “{ch.preview}”
      </blockquote>
      <div className="mt-8">
        <CheckoutLauncher
          sku="chapter"
          chapter={num}
          label={`Continue to secure checkout — ${formatPrice(CHAPTER_PRICE_CENTS)}`}
        />
      </div>
    </div>
  );
}
