import CheckoutLauncher from "@/components/CheckoutLauncher";
import { FULL_BOOK_PRICE_CENTS, formatPrice } from "@/lib/content";

export const metadata = { title: "Buy the full book" };

export default function BuyBookPage() {
  return (
    <div className="page-shell max-w-xl">
      <h1 className="font-display text-3xl text-cocoa">Buy the full book</h1>
      <p className="mt-2 font-body text-cocoa/70">
        All 13 chapters plus the introduction, prologue, and epilogue — yours for{" "}
        {formatPrice(FULL_BOOK_PRICE_CENTS)}.
      </p>
      <div className="mt-8">
        <CheckoutLauncher sku="full-book" label={`Continue to secure checkout — ${formatPrice(FULL_BOOK_PRICE_CENTS)}`} />
      </div>
      <p className="mt-6 font-body text-xs text-cocoa/60">
        Payments are processed by Stripe. We never see or store your card details.
      </p>
    </div>
  );
}
