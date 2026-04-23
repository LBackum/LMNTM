#!/usr/bin/env python3
"""
Extract Lessons Mama Never Taught Me from the source .docx into structured JSON
sections. Front matter, each of the 13 chapters, and back matter are emitted
as separate files consumed by the Next.js content layer.

Usage:
  python3 scripts/extract_book.py
"""
from __future__ import annotations

import json
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET
import zipfile
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCX = Path(
    "/Users/lakiback/Library/Mobile Documents/com~apple~CloudDocs/Joupernal /Karen January/LMNTM_Print_Interior_4.26.docx"
)
OUT_DIR = ROOT / "web" / "src" / "content" / "sections"
MANIFEST_PATH = ROOT / "web" / "src" / "content" / "manifest.json"

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": W_NS}


@dataclass
class Para:
    style: str | None
    text: str


# Display-title overrides for front/back-matter sections. The body heading is
# otherwise used verbatim; override here to correct genuine manuscript typos
# that the author has asked us to fix (e.g. "FORWORD" → "Foreword").
TITLE_OVERRIDES: dict[str, str] = {
    "foreword": "Foreword",
}


# Canonical title = what appears in the manuscript BODY (the actual chapter
# heading the reader sees). Alternate forms (e.g. TOC wording) are only used
# to help the extractor find the chapter boundary if the body form isn't
# matched verbatim.
CHAPTER_TITLES: list[tuple[str, list[str]]] = [
    ("How My Mother Became My Pimp", []),
    ("The Maniac Husband from Cyberspace", ["The Manic Husband from Cyberspace"]),
    ("A High Roller Who Lost It All", []),
    ("Money Can't Buy You Love!", ["Money Can't Buy Love!"]),
    ("Who's Afraid of The Big Bad Wolf?", ["Who's Afraid of the Big Bad Wolf?"]),
    ("It's A Thin Line Between Sanity and Madness", ["It's a Thin Line Between Sanity and Madness"]),
    ("Deadly Craving for Love", []),
    ("What You Do in The Dark Will Come Out in The Light", []),
    ("357 Magnum Date from Hell", []),
    ("Murder on My Mind", []),
    ("Jordan Taylor's Mama Issues", []),
    ("Jordan Taylor's Second Lesson", ["Jordan's Second Lesson"]),
    ("Mules For Hire: Why I Became One", ["Mules or Hire: Why I Became One"]),
]


def normalize(s: str) -> str:
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.replace("\u2019", "'").replace("\u2018", "'")
    s = s.replace("\u201c", '"').replace("\u201d", '"')
    s = s.replace("\u2014", "-").replace("\u2013", "-")
    return re.sub(r"\s+", " ", s).strip().lower()


def read_paragraphs() -> list[Para]:
    with zipfile.ZipFile(DOCX) as z:
        with z.open("word/document.xml") as f:
            tree = ET.parse(f)
    body = tree.getroot().find("w:body", NS)
    paras: list[Para] = []
    for p in body.findall("w:p", NS):
        style = None
        pPr = p.find("w:pPr", NS)
        if pPr is not None:
            ps = pPr.find("w:pStyle", NS)
            if ps is not None:
                style = ps.get(f"{{{W_NS}}}val")
        texts = [(t.text or "") for t in p.iter(f"{{{W_NS}}}t")]
        paras.append(Para(style=style, text="".join(texts)))
    return paras


def find_index(paras: list[Para], needle: str, start: int = 0) -> int:
    n = normalize(needle)
    for i in range(start, len(paras)):
        if normalize(paras[i].text) == n:
            return i
    for i in range(start, len(paras)):
        if n in normalize(paras[i].text):
            return i
    return -1


def paras_to_text(block: list[Para]) -> str:
    lines: list[str] = []
    for p in block:
        t = p.text.strip()
        if not t and lines and lines[-1] != "":
            lines.append("")
        elif t:
            lines.append(t)
    # collapse >2 consecutive blank lines
    out: list[str] = []
    blank = 0
    for line in lines:
        if line == "":
            blank += 1
            if blank <= 1:
                out.append("")
        else:
            blank = 0
            out.append(line)
    return "\n".join(out).strip()


def slugify(text: str) -> str:
    text = normalize(text)
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def first_words(text: str, n: int = 30) -> str:
    words = re.findall(r"\S+", text)
    return " ".join(words[:n]).rstrip(",.;:") + ("..." if len(words) > n else "")


def build_sections(paras: list[Para]) -> list[dict]:
    # Markers (paragraph index where section HEADING appears).
    # Copyright page ends right before FORWORD (Heading5 at idx ~36).
    fw_idx = find_index(paras, "FORWORD")
    ack_idx = find_index(paras, "ACKNOWLEDGEMENTS")
    toc_idx = find_index(paras, "CONTENTS")
    intro_idx = find_index(paras, "INTRODUCTION", start=toc_idx + 1 if toc_idx >= 0 else 0)
    prologue_idx = find_index(paras, "PROLOGUE", start=intro_idx + 1 if intro_idx >= 0 else 0)

    chapter_indices: list[int] = []
    search_from = prologue_idx + 1 if prologue_idx >= 0 else 0
    for canonical, alternates in CHAPTER_TITLES:
        idx = -1
        for candidate in [canonical, *alternates]:
            idx = find_index(paras, candidate, start=search_from)
            if idx >= 0:
                break
        chapter_indices.append(idx)
        if idx >= 0:
            search_from = idx + 1

    epilogue_idx = find_index(paras, "EPILOGUE", start=search_from)
    about_idx = find_index(paras, "AUTHOR BIOGRAPHY", start=epilogue_idx + 1 if epilogue_idx >= 0 else search_from)
    if about_idx < 0:
        about_idx = find_index(paras, "About the Author", start=epilogue_idx + 1 if epilogue_idx >= 0 else search_from)

    markers: list[tuple[str, int]] = []
    markers.append(("cover", 0))  # virtual; covers paragraphs 0-2 (Title)
    markers.append(("copyright", 3))
    if fw_idx > 0:
        markers.append(("foreword", fw_idx))
    if ack_idx > 0:
        markers.append(("acknowledgements", ack_idx))
    if toc_idx > 0:
        markers.append(("toc", toc_idx))
    if intro_idx > 0:
        markers.append(("introduction", intro_idx))
    if prologue_idx > 0:
        markers.append(("prologue", prologue_idx))
    for i, idx in enumerate(chapter_indices, start=1):
        if idx > 0:
            markers.append((f"chapter-{i}", idx))
    if epilogue_idx > 0:
        markers.append(("epilogue", epilogue_idx))
    if about_idx > 0:
        markers.append(("about-author", about_idx))

    markers.sort(key=lambda m: m[1])

    sections: list[dict] = []
    for i, (sid, start) in enumerate(markers):
        end = markers[i + 1][1] if i + 1 < len(markers) else len(paras)
        # For chapter sections, the start paragraph is the title line; skip it for body
        block = paras[start:end]
        text = paras_to_text(block)

        # Title + body split
        title = ""
        body = text
        is_chapter = sid.startswith("chapter-")
        if sid == "cover":
            title = "Lessons Mama Never Taught Me"
            body = "Dr. Karen R. January"
        elif is_chapter:
            ch_num = int(sid.split("-")[1])
            canonical, alternates = CHAPTER_TITLES[ch_num - 1]
            title = canonical
            for candidate in [canonical, *alternates]:
                stripped = re.sub(
                    r"^.*?" + re.escape(candidate) + r"\s*",
                    "",
                    text,
                    count=1,
                    flags=re.DOTALL | re.IGNORECASE,
                ).strip()
                if stripped and stripped != text:
                    body = stripped
                    break
            else:
                body = text
        elif sid == "copyright":
            title = "Copyright"
        elif sid == "toc":
            title = "Contents"
            body = ""  # TOC auto-generated from manifest
        else:
            # Pull title from first non-blank line
            lines = [l for l in text.splitlines() if l.strip()]
            if lines:
                title = lines[0].strip().title() if lines[0].isupper() else lines[0].strip()
                body = "\n".join(lines[1:]).strip()

        # Apply any author-approved display-title corrections.
        if sid in TITLE_OVERRIDES:
            title = TITLE_OVERRIDES[sid]

        # Remove any TOC-looking pages numbers (trailing roman/arabic)
        body = re.sub(r"\b[ivxlcdmIVXLCDM]+\s*$", "", body)

        sections.append({
            "id": sid,
            "order": i,
            "title": title,
            "isChapter": is_chapter,
            "chapterNumber": int(sid.split("-")[1]) if is_chapter else None,
            "free": not is_chapter,  # chapters 1-13 paid; all others free
            "preview": first_words(body, 45),
            "body": body,
            "wordCount": len(re.findall(r"\S+", body)),
        })
    return sections


def main() -> int:
    if not DOCX.exists():
        print(f"Source docx not found: {DOCX}", file=sys.stderr)
        return 1
    paras = read_paragraphs()
    sections = build_sections(paras)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = []
    for s in sections:
        path = OUT_DIR / f"{s['id']}.json"
        path.write_text(json.dumps(s, indent=2, ensure_ascii=False))
        manifest.append({
            "id": s["id"],
            "order": s["order"],
            "title": s["title"],
            "isChapter": s["isChapter"],
            "chapterNumber": s["chapterNumber"],
            "free": s["free"],
            "preview": s["preview"],
            "wordCount": s["wordCount"],
        })
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2, ensure_ascii=False))
    print(f"Wrote {len(sections)} sections to {OUT_DIR}")
    for s in sections:
        flag = "FREE" if s["free"] else "PAID"
        print(f"  [{flag}] {s['id']:20s} {s['title'][:60]} ({s['wordCount']} words)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
