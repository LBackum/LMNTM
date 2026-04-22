import { loadSection } from "@/lib/content";

export const metadata = { title: "About the Author" };

export default async function AboutPage() {
  const section = await loadSection("about-author");
  return (
    <div className="page-shell">
      <h1 className="font-display text-3xl text-cocoa">About the Author</h1>
      {section && (
        <div className="prose-book mt-6">
          {section.body.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
        </div>
      )}
    </div>
  );
}
