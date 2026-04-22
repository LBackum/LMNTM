export const metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <div className="page-shell max-w-xl">
      <h1 className="font-display text-3xl text-cocoa">Support</h1>
      <p className="mt-3 font-body text-cocoa/80">
        We&apos;re here to help with purchases, access, refunds, and parental consent questions.
      </p>
      <div className="mt-6 card">
        <h2 className="font-display text-lg text-cocoa">Customer service</h2>
        <p className="mt-2 font-body text-cocoa/70">
          Email us at{" "}
          <a href="mailto:ask@drkayjay.com" className="text-sage underline">ask@drkayjay.com</a>.
          We respond within one business day.
        </p>
      </div>
    </div>
  );
}
