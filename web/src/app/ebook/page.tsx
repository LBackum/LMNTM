import Link from "next/link";
import { FULL_BOOK_PRICE_CENTS, formatPrice } from "@/lib/content";
import { getEntitlements } from "@/lib/entitlements";

export const metadata = {
  title: "E-book & Downloads",
  description: "Read Lessons Mama Never Taught Me in the app, on Kindle, in Apple Books, or download a PDF.",
};

// NOTE: Replace these placeholders with real store/file URLs once available.
const APPLE_BOOKS_URL = "https://books.apple.com/"; // TODO: paste Apple Books listing
const KINDLE_URL = "https://www.amazon.com/kindle-dbs/fd/kcp"; // TODO: paste Kindle listing
const PDF_URL = "/downloads/lessons-mama-never-taught-me.pdf"; // TODO: add signed-URL endpoint

export default async function EbookPage() {
  const entitlements = await getEntitlements();

  return (
    <div className="page-shell">
      <h1 className="font-display text-3xl text-cocoa sm:text-4xl">E-book & Downloads</h1>
      <p className="mt-2 font-body text-cocoa/70">
        Choose how you want to read. Read in the app, take it to your e-reader, or download a PDF.
      </p>

      <section className="mt-10 card">
        <h2 className="font-display text-xl text-cocoa">Read in the app</h2>
        <p className="mt-1 font-body text-sm text-cocoa/70">
          Scroll through the entire book, page-by-page. Requires the full-book purchase.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {entitlements.fullBook ? (
            <Link href="/read/all" className="btn-primary">Open full book</Link>
          ) : (
            <Link href="/checkout/book" className="btn-primary">
              Unlock — {formatPrice(FULL_BOOK_PRICE_CENTS)}
            </Link>
          )}
        </div>
      </section>

      <section className="mt-6 card">
        <h2 className="font-display text-xl text-cocoa">E-book readers</h2>
        <p className="mt-1 font-body text-sm text-cocoa/70">
          Get the e-book through your preferred storefront.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <a
            href={APPLE_BOOKS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            Apple Books
          </a>
          <a
            href={KINDLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            Kindle
          </a>
        </div>
      </section>

      <section className="mt-6 card">
        <h2 className="font-display text-xl text-cocoa">Download a PDF</h2>
        <p className="mt-1 font-body text-sm text-cocoa/70">
          Take a PDF copy with you. Requires the full-book purchase.
        </p>
        <div className="mt-4">
          {entitlements.fullBook ? (
            <a href={PDF_URL} className="btn-secondary" download>
              Download PDF
            </a>
          ) : (
            <Link href="/checkout/book" className="btn-secondary">
              Unlock PDF — {formatPrice(FULL_BOOK_PRICE_CENTS)}
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
