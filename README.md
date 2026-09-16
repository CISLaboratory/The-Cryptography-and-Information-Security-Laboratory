# CIS-Lab Website

Static website for the Cryptography and Information Security Laboratory (CIS-Lab), School of Cryptology, University of Chinese Academy of Sciences (UCAS).

Current GitHub Pages base URL:

`https://cislaboratory.github.io/The-Cryptography-and-Information-Security-Laboratory/`

If a custom domain is introduced later, update the canonical/OG base URL, `robots.txt`, sitemap generator, and 404 asset paths together.

## Site structure

- `index.html` — home page with recent news and featured publications.
- `people.html` — team directory backed by `data/people.json`.
- `news.html` / `news-detail.html` — news archive and slug-based detail view backed by `data/news.json`.
- `seminars.html` / `seminar-detail.html` — seminar archive and slug-based detail view backed by `data/seminars.json`.
- `publications.html` / `publication-detail.html` — publication archive and slug-based detail view backed by `data/publications.json`.
- `contact.html` — laboratory contact page.
- `404.html` — GitHub Pages not-found page.
- `robots.txt` / `sitemap.xml` — crawler discovery files.
- `assets/css/styles.css` — shared site styles.
- `assets/css/home.css` — home-page-only hero layout rules.
- `assets/css/accessibility.css` — shared keyboard-accessibility styles, including the skip link.
- `assets/js/*.js` — shared and page-specific JavaScript modules.
- `assets/js/author-utils.js` — shared helpers for emphasizing current lab authors and marking corresponding authors.
- `assets/js/site-meta.js` — canonical URL, Open Graph, and structured-data helpers for data-driven detail pages.
- `assets/images/` — site images and favicon.
- `data/*.json` — canonical content data.
- `scripts/validate_content.py` — repository content validator used locally and by CI.
- `scripts/validate_publication_scope.py` — checks that every publication includes at least one current CIS-Lab student author.
- `scripts/generate_sitemap.py` — deterministic sitemap generator/checker.
- `scripts/check_external_links.py` — scans public HTML/JSON URLs and reports external-link health.
- `tests/site-smoke.spec.js` — Playwright desktop/mobile smoke tests for core pages and navigation.
- `docs/REPOSITORY_GOVERNANCE.md` — repository-owner/admin settings and handover checklist.
- `docs/ARCHITECTURE_V2.md` — deferred Jekyll/static-detail migration decision, triggers, and compatibility requirements.

## Content policy

- **Publications:** include only research outputs with at least one **current CIS-Lab student** among the authors. A paper authored by the supervisor/mentor but by no current lab student is not included. Authors use structured objects with `name` and `laboratoryMember`; add `correspondingAuthor: true` when correspondence is confirmed. Current lab authors are emphasized in the UI, and corresponding authors receive a superscript `*`.
- **Seminars:** record the speaker, calendar date at **day precision (`YYYY-MM-DD`)**, title/description, and authoritative paper/resource links. Do not record meeting time or room unless explicitly requested.
- **News:** use a stable slug, an ISO calendar date (`YYYY-MM-DD`), a concise description, and optional article paragraphs/images.
- **People:** keep names, positions, roles, email addresses, and personal websites in `data/people.json`. The public role filter is ordered as **Mentor → Ph.D. Students → Master's Students**.
- Prefer authoritative resource links such as IACR ePrint, conference/journal pages, DOI links, or publisher pages.
- Slugs are public identifiers: keep them unique and do not change an existing slug without a migration plan.

## Maintenance workflow

1. Create a topic branch from `main`; do not make routine content changes directly on `main`.
2. Edit the relevant `data/*.json` file or site code.
3. When news, seminar, or publication records change, regenerate the sitemap:

   ```bash
   python scripts/generate_sitemap.py
   ```

4. Run the lightweight local checks:

   ```bash
   python -m py_compile scripts/*.py
   python scripts/validate_content.py
   python scripts/validate_publication_scope.py
   python scripts/generate_sitemap.py --check
   python scripts/check_external_links.py --list
   for file in assets/js/*.js; do node --check "$file"; done
   ```

5. For browser-level verification, install the pinned Playwright dependency and Chromium, then run:

   ```bash
   npm install --no-package-lock
   npx playwright install chromium
   npm run test:smoke
   ```

6. Open a pull request and review the diff before merging.
7. Merge only after the `Validate site content` GitHub Actions workflow passes.

Repository administrators should also complete and periodically review [`docs/REPOSITORY_GOVERNANCE.md`](docs/REPOSITORY_GOVERNANCE.md).

## SEO baseline

The current static site provides:

- explicit UCAS / School of Cryptology identity;
- per-page titles, descriptions, canonical URLs, Open Graph metadata, and favicon;
- JSON-LD organization/site data on the home page;
- dynamically generated NewsArticle, Event, and ScholarlyArticle metadata on detail pages;
- `robots.txt`, generated `sitemap.xml`, and a `404.html` page.

The current detail routes still use `?slug=...` and client-side rendering. This is a known architectural limitation for crawlers/social preview systems that do not execute JavaScript; a future static-page/Jekyll migration should address it while preserving URL compatibility. The migration decision and trigger conditions are documented in [`docs/ARCHITECTURE_V2.md`](docs/ARCHITECTURE_V2.md).

## Automated validation

`.github/workflows/validate-content.yml` runs on every pull request and on pushes to `main`. It validates:

- Python helper-script syntax;
- JSON syntax and top-level data shape;
- unique and well-formed slugs;
- valid calendar dates;
- seminar `date`/`year` consistency;
- local image/resource existence;
- structured publication authors and optional corresponding-author flags;
- the student-authored Publications inclusion rule;
- generated sitemap freshness;
- basic JavaScript syntax;
- desktop and mobile rendering of core pages;
- mobile navigation open/close behavior;
- horizontal overflow on the tested viewports;
- skip-to-content and primary-navigation accessibility hooks;
- visible emphasis of current lab authors and corresponding-author markers in Publications.

The content and sitemap validators use only the Python standard library. Browser smoke tests use a pinned Playwright development dependency and run in Chromium in CI.

`.github/workflows/check-links.yml` runs weekly and can also be started manually. It checks external URLs discovered from root HTML pages and canonical JSON data. Only definitive `404`/`410` responses fail the workflow; access-control, rate-limit, server, and transient network failures are surfaced as warnings to reduce false positives from bot blocking or temporary outages.
