import Image from "next/image";
import Link from "next/link";
import { CHAPTERS, FULL_BOOK_PRICE_CENTS, formatPrice } from "@/lib/content";

export default function HomePage() {
  return (
    <div className="page-shell items-center text-center">
      <section className="mt-6 flex flex-col items-center gap-8">
        <div className="relative overflow-hidden rounded-2xl bg-mist p-4 shadow-page ring-1 ring-cocoa/10 sm:p-6">
          <Image
            src="/cover.png"
            alt="Lessons Mama Never Taught Me — cover art by Melissa Koby"
            width={775}
            height={1200}
            priority
            sizes="(max-width: 640px) 80vw, 320px"
            className="h-auto w-[260px] rounded-lg shadow-[0_10px_40px_-10px_rgba(89,51,37,0.45)] sm:w-[320px]"
          />
        </div>

        <div className="space-y-3">
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-sage">By Dr. Karen R. January</p>
          <h1 className="font-display text-4xl leading-tight text-cocoa sm:text-5xl">
            Lessons Mama<br />Never Taught Me
          </h1>
          <p className="mx-auto max-w-lg font-body text-lg text-cocoa/80">
            Real-life stories of love, survival, and self-worth — shared to free and heal
            women, mothers, and daughters everywhere.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <Link href="/checkout/book" className="btn-primary px-8 text-base">
            Buy the full book — {formatPrice(FULL_BOOK_PRICE_CENTS)}
          </Link>
          <Link href="/contents" className="btn-ghost px-8 text-base">
            Start reading — free front matter
          </Link>
        </div>

        <div className="grid w-full gap-4 pt-6 sm:grid-cols-3">
          <Feature title="Own the whole journey" body={`Unlock all ${CHAPTERS.length} chapters plus intro, prologue, and epilogue for one price.`} />
          <Feature title="Or read chapter-by-chapter" body="Purchase any chapter for $2.99 — read in-app, any time." />
          <Feature title="Read anywhere" body="Browser, iOS, Android, or download your copy as a PDF." />
        </div>
      </section>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="card text-left">
      <h3 className="font-display text-lg text-cocoa">{title}</h3>
      <p className="mt-2 font-body text-sm text-cocoa/70">{body}</p>
    </div>
  );
}

