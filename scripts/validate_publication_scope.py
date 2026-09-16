#!/usr/bin/env python3
"""Ensure Publications contains work authored by at least one current CIS-Lab student."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"


def load(name: str) -> list[dict]:
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def main() -> int:
    people = load("people.json")
    publications = load("publications.json")

    student_names = {
        person.get("name", "").strip()
        for person in people
        if "student" in str(person.get("role", person.get("position", ""))).lower()
        and person.get("name", "").strip()
    }

    errors: list[str] = []
    for publication in publications:
        title = publication.get("title", "<untitled>")
        authors = publication.get("authors", [])
        has_current_student = any(
            isinstance(author, dict)
            and author.get("laboratoryMember") is True
            and author.get("name") in student_names
            for author in authors
        )
        if not has_current_student:
            errors.append(
                f"{title}: Publications requires at least one current CIS-Lab student author"
            )

    if errors:
        print("Publication scope validation failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print("Publication scope validation passed: every entry includes a current CIS-Lab student author.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
