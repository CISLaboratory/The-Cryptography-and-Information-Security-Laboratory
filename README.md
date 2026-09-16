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
- `assets/js/*.js` — shared and page-specific JavaScript modules.
- `assets/js/site-meta.js` — canonical URL, Open Graph, and structured-data helpers for data-driven detail pages.
- `assets/images/` — site images and favicon.
- `data/*.json` — canonical content data.
- `scripts/validate_content.py` — repository content validator used locally and by CI.
- `scripts/generate_sitemap.py` — deterministic sitemap generator/checker.
- `docs/REPOSITORY_GOVERNANCE.md` — repository-owner/admin settings and handover checklist.

## Content policy

- **Publications:** include research outputs with at least one **current CIS-Lab member** among the authors. Authors should use structured objects with `name` and `laboratoryMember` fields so this policy can be checked automatically.
- **Seminars:** record the speaker, calendar date at **day precision (`YYYY-MM-DD`)**, title/description, and authoritative paper/resource links. Do not record meeting time or room unless explicitly requested.
- **News:** use a stable slug, an ISO calendar date (`YYYY-MM-DD`), a concise description, and optional article paragraphs/images.
- **People:** keep names, positions, roles, email addresses, and personal websites in `data/people.json`.
- Prefer authoritative resource links such as IACR ePrint, conference/journal pages, DOI links, or publisher pages.
- Slugs are public identifiers: keep them unique and do not change an existing slug without a migration plan.

## Maintenance workflow

1. Create a topic branch from `main`; do not make routine content changes directly on `main`.
2. Edit the relevant `data/*.json` file or site code.
3. When news, seminar, or publication records change, regenerate the sitemap:

   ```bash
   python scripts/generate_sitemap.py
   ```

4. Run the local checks:

   ```bash
   python scripts/validate_content.py
   python scripts/generate_sitemap.py --check
   for file in assets/js/*.js; do node --check "$file"; done
   ```

5. Open a pull request and review the diff before merging.
6. Merge only after the `Validate site content` GitHub Actions workflow passes.

Repository administrators should also complete and periodically review [`docs/REPOSITORY_GOVERNANCE.md`](docs/REPOSITORY_GOVERNANCE.md).

## SEO baseline

The current static site provides:

- explicit UCAS / School of Cryptology identity;
- per-page titles, descriptions, canonical URLs, Open Graph metadata, and favicon;
- JSON-LD organization/site data on the home page;
- dynamically generated NewsArticle, Event, and ScholarlyArticle metadata on detail pages;
- `robots.txt`, generated `sitemap.xml`, and a `404.html` page.

The current detail routes still use `?slug=...` and client-side rendering. This is a known architectural limitation for crawlers/social preview systems that do not execute JavaScript; a future static-page/Jekyll migration should address it while preserving URL compatibility.

## Automated validation

`.github/workflows/validate-content.yml` runs on every pull request and on pushes to `main`. It validates:

- JSON syntax and top-level data shape;
- unique and well-formed slugs;
- valid calendar dates;
- seminar `date`/`year` consistency;
- local image/resource existence;
- structured publication authors and the current-member inclusion rule;
- generated sitemap freshness;
- basic JavaScript syntax.

The validation and sitemap tooling intentionally use only the Python standard library so the maintenance workflow has no package-install dependency.
