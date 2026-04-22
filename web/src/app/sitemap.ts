import type { MetadataRoute } from "next";
import { SECTIONS } from "@/lib/content";
import { publicEnv } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const now = new Date();
  const staticPaths = ["/", "/contents", "/ebook", "/about", "/support", "/legal/privacy", "/legal/terms"];
  return [
    ...staticPaths.map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...SECTIONS.map((s) => ({
      url: `${base}/read/${s.id}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: s.isChapter ? 0.7 : 0.6,
    })),
  ];
}
