import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell max-w-xl text-center">
      <h1 className="font-display text-4xl text-cocoa">Page not found</h1>
      <p className="mt-3 font-body text-cocoa/70">
        The page you were looking for doesn&apos;t exist in this book.
      </p>
      <div className="mt-6">
        <Link href="/" className="btn-primary">Return home</Link>
      </div>
    </div>
  );
}
