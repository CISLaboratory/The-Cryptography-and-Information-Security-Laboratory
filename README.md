# CIS-Lab Website


## Structure

- `index.html` – Home page with hero, news, research highlights, featured publications, and contact details.
- `people.html` – Team directory rendered from `data/people.json` into a sortable table with name, job position, email, and personal website columns.
- `news.html` – News archive sourced from `data/news.json` with year filtering and links to item detail pages.
- `seminars.html` – Seminar timeline rendered from `data/seminars.json`, supporting links to PDFs and other resources plus detail pages for each session.
- `publications.html` – Publication archive grouped by year and hydrated from `data/publications.json` with optional resource links and dedicated detail pages.
- `news-detail.html`, `seminar-detail.html`, `publication-detail.html` – Shared detail layout that loads content by `slug` query parameters.
- `assets/css/styles.css` – Shared styling.
- `assets/js/*.js` – JavaScript modules that hydrate each page.
- `data/*.json` – Content data files for easy editing.
- `assets/resources/` – Optional PDF or multimedia assets referenced from seminars.


