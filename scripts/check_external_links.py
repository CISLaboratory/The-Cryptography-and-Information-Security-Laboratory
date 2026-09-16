#!/usr/bin/env python3
"""Check externally linked resources without making routine PR CI network-dependent.

The checker scans root HTML files and canonical JSON content for http(s) URLs.
Only definitive 404/410 responses fail the run. Access-control responses, rate
limits, server errors, and transient network failures are reported as warnings so
that bot blocking or temporary outages do not create false broken-link alerts.
"""

from __future__ import annotations

import argparse
import json
import socket
import ssl
import sys
import time
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
OWN_HOSTS = {"cislaboratory.github.io"}
IGNORED_HOSTS = {"schema.org"}
USER_AGENT = "CIS-Lab-Link-Checker/1.0 (+https://cislaboratory.github.io/)"
DEFINITELY_BROKEN = {404, 410}


class ExternalLinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.urls: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for key, value in attrs:
            if key in {"href", "src"} and value:
                self._add(value)

    def _add(self, value: str) -> None:
        if value.startswith(("http://", "https://")):
            self.urls.add(value)


def collect_json_urls(value: Any, output: set[str]) -> None:
    if isinstance(value, dict):
        for item in value.values():
            collect_json_urls(item, output)
    elif isinstance(value, list):
        for item in value:
            collect_json_urls(item, output)
    elif isinstance(value, str) and value.startswith(("http://", "https://")):
        output.add(value)


def is_external(url: str) -> bool:
    host = (urlparse(url).hostname or "").lower()
    return bool(host) and host not in OWN_HOSTS and host not in IGNORED_HOSTS


def collect_urls() -> list[str]:
    urls: set[str] = set()

    for path in sorted(ROOT.glob("*.html")):
        parser = ExternalLinkParser()
        parser.feed(path.read_text(encoding="utf-8"))
        urls.update(parser.urls)

    for path in sorted(DATA_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        collect_json_urls(data, urls)

    return sorted(url for url in urls if is_external(url))


def check_url(url: str, timeout: float, retries: int) -> tuple[str, str]:
    request = Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "*/*",
            "Range": "bytes=0-0",
        },
        method="GET",
    )

    last_warning = "unknown network error"
    for attempt in range(retries + 1):
        try:
            with urlopen(request, timeout=timeout) as response:
                status = response.getcode() or 200
                if 200 <= status < 400:
                    return "ok", str(status)
                if status in DEFINITELY_BROKEN:
                    return "broken", str(status)
                last_warning = str(status)
        except HTTPError as exc:
            if exc.code in DEFINITELY_BROKEN:
                return "broken", str(exc.code)
            last_warning = f"HTTP {exc.code}"
        except (URLError, TimeoutError, socket.timeout, ssl.SSLError) as exc:
            last_warning = str(exc.reason if isinstance(exc, URLError) else exc)

        if attempt < retries:
            time.sleep(1.0 + attempt)

    return "warning", last_warning


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--list", action="store_true", help="List discovered external URLs without requesting them")
    parser.add_argument("--timeout", type=float, default=15.0, help="Per-request timeout in seconds")
    parser.add_argument("--retries", type=int, default=1, help="Retries for non-definitive failures")
    args = parser.parse_args()

    urls = collect_urls()
    if args.list:
        for url in urls:
            print(url)
        print(f"Discovered {len(urls)} external URLs.")
        return 0

    broken: list[str] = []
    warnings: list[str] = []

    for url in urls:
        state, detail = check_url(url, args.timeout, max(0, args.retries))
        if state == "ok":
            print(f"OK      [{detail}] {url}")
        elif state == "broken":
            print(f"BROKEN  [{detail}] {url}")
            broken.append(url)
        else:
            print(f"WARNING [{detail}] {url}")
            warnings.append(url)

    print(
        f"Checked {len(urls)} external URLs: "
        f"{len(urls) - len(broken) - len(warnings)} ok, "
        f"{len(warnings)} warnings, {len(broken)} broken."
    )

    if broken:
        print("Definitively broken external links detected:", file=sys.stderr)
        for url in broken:
            print(f"- {url}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
