#!/usr/bin/env python3
"""Validate CIS-Lab JSON content using only the Python standard library."""

from __future__ import annotations

import json
import re
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

errors: list[str] = []


def fail(message: str) -> None:
    errors.append(message)


def load_array(filename: str) -> list[dict]:
    path = DATA / filename
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"{filename}: cannot parse JSON: {exc}")
        return []
    if not isinstance(value, list):
        fail(f"{filename}: top-level value must be an array")
        return []
    if not all(isinstance(item, dict) for item in value):
        fail(f"{filename}: every array item must be an object")
        return []
    return value


def require_text(item: dict, field: str, context: str, *, allow_empty: bool = False) -> str:
    value = item.get(field)
    if not isinstance(value, str) or (not allow_empty and not value.strip()):
        fail(f"{context}: {field!r} must be a non-empty string")
        return ""
    return value


def validate_slug(value: str, context: str) -> None:
    if value and not SLUG_RE.fullmatch(value):
        fail(f"{context}: invalid slug {value!r}")


def validate_date(value: str, context: str) -> None:
    if not DATE_RE.fullmatch(value or ""):
        fail(f"{context}: date must use YYYY-MM-DD, got {value!r}")
        return
    try:
        date.fromisoformat(value)
    except ValueError:
        fail(f"{context}: invalid calendar date {value!r}")


def validate_url(value: str, context: str, *, allow_local: bool = True) -> None:
    if not value:
        fail(f"{context}: URL/path must not be empty")
        return
    parsed = urlparse(value)
    if parsed.scheme in {"http", "https", "mailto"}:
        return
    if parsed.scheme:
        fail(f"{context}: unsupported URL scheme in {value!r}")
        return
    if allow_local:
        local = ROOT / value
        if not local.is_file():
            fail(f"{context}: referenced local file does not exist: {value}")
    else:
        fail(f"{context}: expected an http(s) URL, got {value!r}")


def validate_unique_slugs(items: list[dict], filename: str) -> None:
    seen: set[str] = set()
    for index, item in enumerate(items):
        context = f"{filename}[{index}]"
        slug = require_text(item, "slug", context)
        validate_slug(slug, context)
        if slug in seen:
            fail(f"{context}: duplicate slug {slug!r}")
        seen.add(slug)


def validate_people() -> None:
    items = load_array("people.json")
    names: set[str] = set()
    for index, item in enumerate(items):
        context = f"people.json[{index}]"
        name = require_text(item, "name", context)
        require_text(item, "position", context)
        require_text(item, "role", context)
        if name in names:
            fail(f"{context}: duplicate member name {name!r}")
        names.add(name)
        email = item.get("email", "")
        website = item.get("website", "")
        if email and not isinstance(email, str):
            fail(f"{context}: email must be a string")
        if website:
            if not isinstance(website, str):
                fail(f"{context}: website must be a string")
            else:
                validate_url(website, f"{context}.website", allow_local=False)


def validate_news() -> None:
    items = load_array("news.json")
    validate_unique_slugs(items, "news.json")
    for index, item in enumerate(items):
        context = f"news.json[{index}]"
        require_text(item, "title", context)
        validate_date(require_text(item, "date", context), context)
        require_text(item, "description", context)
        content = item.get("content")
        if content is not None and (
            not isinstance(content, list) or not all(isinstance(p, str) and p.strip() for p in content)
        ):
            fail(f"{context}: content must be an array of non-empty strings")
        image = item.get("image")
        if image is not None:
            if not isinstance(image, str):
                fail(f"{context}: image must be a string")
            else:
                validate_url(image, f"{context}.image")
                if not isinstance(item.get("imageAlt"), str) or not item.get("imageAlt", "").strip():
                    fail(f"{context}: imageAlt is required when image is present")


def validate_resources(resources: object, context: str) -> None:
    if not isinstance(resources, list):
        fail(f"{context}: resources must be an array")
        return
    for index, resource in enumerate(resources):
        rctx = f"{context}.resources[{index}]"
        if not isinstance(resource, dict):
            fail(f"{rctx}: resource must be an object")
            continue
        require_text(resource, "label", rctx)
        url = require_text(resource, "url", rctx)
        if url:
            validate_url(url, f"{rctx}.url")


def validate_seminars() -> None:
    items = load_array("seminars.json")
    validate_unique_slugs(items, "seminars.json")
    for index, item in enumerate(items):
        context = f"seminars.json[{index}]"
        require_text(item, "title", context)
        require_text(item, "speaker", context)
        value = require_text(item, "date", context)
        validate_date(value, context)
        if "datetime" in item:
            fail(f"{context}: use 'date' (YYYY-MM-DD), not legacy 'datetime'")
        year = item.get("year")
        if not isinstance(year, int):
            fail(f"{context}: year must be an integer")
        elif value and str(year) != value[:4]:
            fail(f"{context}: year {year} does not match date {value}")
        description = item.get("description", "")
        if not isinstance(description, str):
            fail(f"{context}: description must be a string")
        validate_resources(item.get("resources", []), context)


def validate_publications() -> None:
    items = load_array("publications.json")
    validate_unique_slugs(items, "publications.json")
    for index, item in enumerate(items):
        context = f"publications.json[{index}]"
        require_text(item, "title", context)
        year = item.get("year")
        if not isinstance(year, int) or year < 1900 or year > 2200:
            fail(f"{context}: year must be a reasonable integer")
        month = item.get("month")
        if month is not None and (not isinstance(month, int) or month < 1 or month > 12):
            fail(f"{context}: month must be an integer from 1 to 12")
        authors = item.get("authors")
        if not isinstance(authors, list) or not authors:
            fail(f"{context}: authors must be a non-empty structured array")
        else:
            has_current_member = False
            for author_index, author in enumerate(authors):
                actx = f"{context}.authors[{author_index}]"
                if not isinstance(author, dict):
                    fail(f"{actx}: author must be an object with name/laboratoryMember")
                    continue
                require_text(author, "name", actx)
                member = author.get("laboratoryMember")
                if not isinstance(member, bool):
                    fail(f"{actx}: laboratoryMember must be boolean")
                has_current_member = has_current_member or member is True
            if not has_current_member:
                fail(f"{context}: publication must include at least one current CIS-Lab member")
        links = item.get("links", [])
        if not isinstance(links, list):
            fail(f"{context}: links must be an array")
        else:
            for link_index, link in enumerate(links):
                lctx = f"{context}.links[{link_index}]"
                if not isinstance(link, dict):
                    fail(f"{lctx}: link must be an object")
                    continue
                require_text(link, "label", lctx)
                url = require_text(link, "url", lctx)
                if url:
                    validate_url(url, f"{lctx}.url")


def main() -> int:
    validate_people()
    validate_news()
    validate_seminars()
    validate_publications()

    if errors:
        print("Content validation failed:", file=sys.stderr)
        for message in errors:
            print(f"- {message}", file=sys.stderr)
        return 1

    print("Content validation passed: people, news, seminars, publications.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
