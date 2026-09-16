#!/usr/bin/env python3
"""Generate or verify the CIS-Lab GitHub Pages sitemap from canonical JSON data."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from urllib.parse import quote
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "https://cislaboratory.github.io/The-Cryptography-and-Information-Security-Laboratory/"
SITEMAP = ROOT / "sitemap.xml"

STATIC_PATHS = [
    "",
    "people.html",
    "news.html",
    "seminars.html",
    "publications.html",
    "contact.html",
]

DETAIL_SOURCES = [
    ("news.json", "news-detail.html"),
    ("seminars.json", "seminar-detail.html"),
    ("publications.json", "publication-detail.html"),
]


def load_slugs(filename: str) -> list[str]:
    data = json.loads((ROOT / "data" / filename).read_text(encoding="utf-8"))
    return [item["slug"] for item in data]


def build_sitemap() -> str:
    urls = [f"{BASE_URL}{path}" for path in STATIC_PATHS]

    for filename, detail_page in DETAIL_SOURCES:
        for slug in load_slugs(filename):
            encoded_slug = quote(slug, safe="-")
            urls.append(f"{BASE_URL}{detail_page}?slug={encoded_slug}")

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for url in urls:
        lines.extend(("  <url>", f"    <loc>{escape(url)}</loc>", "  </url>"))
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--check",
        action="store_true",
        help="fail when sitemap.xml is missing or differs from generated content",
    )
    args = parser.parse_args()

    generated = build_sitemap()

    if args.check:
        if not SITEMAP.exists():
            print("sitemap.xml is missing; run scripts/generate_sitemap.py", file=sys.stderr)
            return 1
        current = SITEMAP.read_text(encoding="utf-8")
        if current != generated:
            print(
                "sitemap.xml is out of date; run scripts/generate_sitemap.py and commit it",
                file=sys.stderr,
            )
            return 1
        print("sitemap.xml is up to date.")
        return 0

    SITEMAP.write_text(generated, encoding="utf-8")
    print(f"Wrote {SITEMAP.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
