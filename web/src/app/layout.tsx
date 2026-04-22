import type { Metadata, Viewport } from "next";
import { Playfair_Display, Lora, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AccessibilityControls from "@/components/AccessibilityControls";
import { getLocale } from "@/i18n/server";
import { t } from "@/i18n/dictionary";
import { RTL_LOCALES } from "@/i18n/dictionary";

const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Lora({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://lmntm.app"),
  title: {
    default: "Lessons Mama Never Taught Me — Dr. Karen R. January",
    template: "%s | Lessons Mama Never Taught Me",
  },
  description:
    "Lessons Mama Never Taught Me by Dr. Karen R. January — real-life stories of love, survival, and self-worth. Read free front matter or unlock chapters individually.",
  keywords: [
    "Lessons Mama Never Taught Me",
    "Dr. Karen R. January",
    "ebook",
    "memoir",
    "Black women authors",
    "self-esteem",
    "healing",
  ],
  openGraph: {
    title: "Lessons Mama Never Taught Me",
    description: "Real stories. Real lessons. By Dr. Karen R. January.",
    url: "https://lmntm.app",
    siteName: "Lessons Mama Never Taught Me",
    type: "book",
    authors: ["Dr. Karen R. January"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lessons Mama Never Taught Me",
    description: "Real stories. Real lessons. By Dr. Karen R. January.",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#593325",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`${display.variable} ${body.variable} ${sans.variable}`}>
      <body className="font-body">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50
                     focus:rounded-full focus:bg-cocoa focus:px-4 focus:py-2 focus:text-white"
        >
          {t(locale, "a11y.skip")}
        </a>
        <header className="border-b border-cocoa/10 bg-mist/70 backdrop-blur">
          <nav
            aria-label="Primary"
            className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-4 sm:px-8"
          >
            <Link href="/" className="font-display text-lg tracking-wide text-cocoa">
              LMNTM
            </Link>
            <div className="flex items-center gap-3 text-sm font-sans text-cocoa/80">
              <Link href="/contents" className="hover:text-garnet">{t(locale, "nav.contents")}</Link>
              <Link href="/library" className="hover:text-garnet">{t(locale, "nav.library")}</Link>
              <Link href="/ebook" className="hover:text-garnet">{t(locale, "nav.ebook")}</Link>
              <AccessibilityControls compact />
              <LanguageSwitcher />
            </div>
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer className="mt-16 border-t border-cocoa/10 bg-mist/40 py-8">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 px-5 text-sm text-cocoa/70 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <span>© {new Date().getFullYear()} January Media LLC</span>
            <div className="flex flex-wrap gap-4">
              <Link href="/about" className="hover:text-garnet">{t(locale, "footer.about")}</Link>
              <Link href="/support" className="hover:text-garnet">{t(locale, "footer.support")}</Link>
              <Link href="/legal/privacy" className="hover:text-garnet">{t(locale, "footer.privacy")}</Link>
              <Link href="/legal/terms" className="hover:text-garnet">{t(locale, "footer.terms")}</Link>
              <Link href="/legal/accessibility" className="hover:text-garnet">Accessibility</Link>
              <a href="mailto:ask@drkayjay.com" className="hover:text-garnet">ask@drkayjay.com</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
