import manifest from "@/content/manifest.json";

export type SectionMeta = {
  id: string;
  order: number;
  title: string;
  isChapter: boolean;
  chapterNumber: number | null;
  free: boolean;
  preview: string;
  wordCount: number;
};

export type Section = SectionMeta & { body: string };

export const SECTIONS: SectionMeta[] = manifest as SectionMeta[];

export const CHAPTERS = SECTIONS.filter((s) => s.isChapter);
export const FRONT_MATTER = SECTIONS.filter(
  (s) => !s.isChapter && s.order < (CHAPTERS[0]?.order ?? Number.MAX_SAFE_INTEGER),
);
export const BACK_MATTER = SECTIONS.filter(
  (s) => !s.isChapter && s.order > (CHAPTERS[CHAPTERS.length - 1]?.order ?? -1),
);

export const CHAPTER_PRICE_CENTS = 299;
export const FULL_BOOK_PRICE_CENTS = 2000;

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function getSectionMeta(id: string): SectionMeta | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export function getAdjacent(id: string) {
  const idx = SECTIONS.findIndex((s) => s.id === id);
  if (idx < 0) return { prev: undefined, next: undefined } as const;
  return {
    prev: idx > 0 ? SECTIONS[idx - 1] : undefined,
    next: idx < SECTIONS.length - 1 ? SECTIONS[idx + 1] : undefined,
  } as const;
}

export async function loadSection(id: string): Promise<Section | null> {
  try {
    const mod = await import(`@/content/sections/${id}.json`);
    return mod.default as Section;
  } catch {
    return null;
  }
}
