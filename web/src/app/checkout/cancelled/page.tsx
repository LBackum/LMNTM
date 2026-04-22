import Link from "next/link";

export const metadata = { title: "Checkout cancelled" };

export default function CancelledPage() {
  return (
    <div className="page-shell max-w-xl">
      <h1 className="font-display text-3xl text-cocoa">No charge made</h1>
      <p className="mt-3 font-body text-cocoa/80">
        You cancelled checkout and nothing was charged. You can return to the book at any time.
      </p>
      <div className="mt-6">
        <Link href="/contents" className="btn-primary">Back to Contents</Link>
      </div>
    </div>
  );
}
