# CIS-Lab Website

Static website for the Cryptography and Information Security Laboratory (CIS-Lab).

## Site structure

- `index.html` — home page with recent news and featured publications.
- `people.html` — team directory backed by `data/people.json`.
- `news.html` / `news-detail.html` — news archive and slug-based detail view backed by `data/news.json`.
- `seminars.html` / `seminar-detail.html` — seminar archive and slug-based detail view backed by `data/seminars.json`.
- `publications.html` / `publication-detail.html` — publication archive and slug-based detail view backed by `data/publications.json`.
- `contact.html` — laboratory contact page.
- `assets/css/styles.css` — shared site styles.
- `assets/js/*.js` — shared and page-specific JavaScript modules.
- `assets/images/` — site images.
- `data/*.json` — canonical content data.
- `scripts/validate_content.py` — repository content validator used locally and by CI.
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
3. Run the local checks:

   ```bash
   python scripts/validate_content.py
   for file in assets/js/*.js; do node --check "$file"; done
   ```

4. Open a pull request and review the diff before merging.
5. Merge only after the `Validate site content` GitHub Actions workflow passes.

Repository administrators should also complete and periodically review [`docs/REPOSITORY_GOVERNANCE.md`](docs/REPOSITORY_GOVERNANCE.md).

## Automated validation

`.github/workflows/validate-content.yml` runs on every pull request and on pushes to `main`. It validates:

- JSON syntax and top-level data shape;
- unique and well-formed slugs;
- valid calendar dates;
- seminar `date`/`year` consistency;
- local image/resource existence;
- structured publication authors and the current-member inclusion rule;
- basic JavaScript syntax.

The validator intentionally uses only the Python standard library so the maintenance workflow has no package-install dependency.
