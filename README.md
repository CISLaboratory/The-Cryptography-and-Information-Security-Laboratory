# CIS-Lab Website

## Structure

- `index.html` – Home page with hero, recent news, featured publications, and links to the main site sections.
- `people.html` – Team directory rendered from `data/people.json` into a sortable table with name, job position, email, and personal website columns.
- `news.html` – News archive sourced from `data/news.json` with year filtering and links to item detail pages.
- `seminars.html` – Seminar timeline rendered from `data/seminars.json`, supporting links to papers and other resources plus detail pages for each session.
- `publications.html` – Publication archive grouped by year and hydrated from `data/publications.json` with optional resource links and dedicated detail pages.
- `contact.html` – Standalone laboratory contact page.
- `news-detail.html`, `seminar-detail.html`, `publication-detail.html` – Shared detail layouts that load content by `slug` query parameters.
- `assets/css/styles.css` – Shared styling.
- `assets/js/*.js` – JavaScript modules that hydrate each page.
- `data/*.json` – Content data files for easy editing.
- `assets/resources/` – Optional PDF or multimedia assets referenced from seminars.

## Content policy

- **Publications:** include research outputs with at least one **current CIS-Lab member** among the authors. This is the default inclusion rule for the Publications page.
- **Seminars:** record the speaker, date/time, location when known, and authoritative paper/resource links. Use unique, stable slugs so detail-page URLs remain valid.
- Prefer authoritative publication links such as IACR ePrint, conference/journal pages, or DOI/publisher pages.
