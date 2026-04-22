import Link from "next/link";

export const metadata = { title: "Thank you" };

export default function SuccessPage() {
  return (
    <div className="page-shell max-w-xl">
      <h1 className="font-display text-3xl text-cocoa">Thank you</h1>
      <p className="mt-3 font-body text-cocoa/80">
        Your purchase has been received. It can take a moment for your access to unlock —
        refresh the Contents page if you don&apos;t see your chapters yet.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href="/contents" className="btn-primary">Open Contents</Link>
        <Link href="/library" className="btn-ghost">My Library</Link>
      </div>
      <p className="mt-8 font-body text-xs text-cocoa/60">
        Questions? Write to{" "}
        <a href="mailto:ask@drkayjay.com" className="text-sage underline">ask@drkayjay.com</a>.
      </p>
    </div>
  );
}
