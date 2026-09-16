# Architecture v2 Decision Record

**Status:** Deferred / evaluate when trigger conditions are met  
**Current architecture:** static HTML + shared CSS/JavaScript + canonical JSON content files  
**Leading v2 candidate:** Jekyll on GitHub Pages

## Decision

Do **not** migrate the CIS-Lab website to Jekyll yet.

The current site remains small enough that the existing architecture is easy to understand, has no package/runtime dependency, and is now protected by content validation, generated sitemap checks, and a documented pull-request workflow. Migrating immediately would introduce URL, template, and deployment risk without enough operational benefit.

Architecture v2 should be reconsidered when the website's content volume or publishing requirements make the current client-rendered detail-page model materially expensive.

## Why v2 may eventually be needed

The current architecture has deliberate limitations:

- detail pages use routes such as `publication-detail.html?slug=...`;
- the initial HTML for those pages is generic and the item is rendered in the browser from JSON;
- item-specific canonical metadata and JSON-LD are therefore added by JavaScript;
- social preview crawlers that do not execute JavaScript cannot reliably receive item-specific Open Graph metadata;
- header/footer/navigation markup is duplicated across multiple HTML files;
- adding richer archive, taxonomy, pagination, bilingual content, or per-item static metadata will increase maintenance cost.

These limitations are acceptable today, but they become more important as the archive grows.

## Migration trigger conditions

Re-evaluate Architecture v2 when **any two** of the following become true, or when one becomes a hard requirement:

1. **Content scale:** news + seminars + publications exceed roughly 50 detail records, or content is being added often enough that manual/static-shell maintenance becomes a recurring burden.
2. **Static SEO/social previews:** item-specific title, description, Open Graph image, canonical URL, and structured data must be available without JavaScript.
3. **Template maintenance:** the same navigation/header/footer/metadata change repeatedly requires edits across many HTML files.
4. **Information architecture:** the lab needs tags, topic pages, pagination, author pages, research-area pages, or cross-linked publication/seminar archives.
5. **Internationalization:** the website needs maintained Chinese and English versions rather than isolated translated text.
6. **Publishing workflow:** non-developer maintainers need to create content as individual files with front matter instead of editing large JSON arrays.

The numeric threshold in item 1 is a guideline, not a rule. A hard SEO or publishing requirement can justify migration earlier.

## Preferred v2 shape

If migration is triggered, Jekyll is the first candidate to evaluate because it fits GitHub Pages and can keep the site static.

A likely structure is:

```text
_config.yml
_layouts/
  default.html
  detail.html
_includes/
  header.html
  footer.html
  seo.html
_data/
  people.json
_publications/
  <slug>.md
_seminars/
  <slug>.md
_news/
  <slug>.md
assets/
  css/
  images/
```

Recommended collection permalinks:

```text
/publications/<slug>/
/seminars/<slug>/
/news/<slug>/
```

Each detail page should be generated as complete HTML at build time so title/description/canonical/Open Graph/JSON-LD are present in the source document before JavaScript runs.

## Migration requirements

A v2 migration is not complete unless all of the following are handled:

### 1. Preserve content semantics

- Preserve publication authors, current-member flags, DOI/resource links, venue/year/month metadata, abstracts, and keywords.
- Preserve seminar speaker/date/resource information using the existing day-precision date policy.
- Preserve news dates, images, alt text, captions, and body paragraphs.
- Preserve the Publications inclusion rule: at least one current CIS-Lab member must be an author.

### 2. Preserve old URLs

Existing links may already have been shared or indexed:

```text
publication-detail.html?slug=...
seminar-detail.html?slug=...
news-detail.html?slug=...
```

GitHub Pages does not provide application-server routing for arbitrary query-string redirects. During migration, keep the three legacy detail shells as compatibility adapters. They should read the old `slug` query parameter and redirect the browser to the corresponding new static permalink.

Do not delete the old routes on the same release that introduces new permalinks.

### 3. Preserve search signals

- New static detail pages must use self-referencing canonical URLs.
- Regenerate `sitemap.xml` using the new permalinks.
- Keep `robots.txt` valid for the final Pages/custom-domain base URL.
- Verify no custom-domain change is mixed into the same migration unless intentionally planned.
- Validate structured data after migration.

### 4. Preserve deployment safety

- Keep pull-request validation before merge.
- Add a Jekyll build check in CI before switching production Pages output.
- Build the full v2 site on a branch first.
- Compare current and v2 URL inventories before release.
- Test desktop/mobile navigation, key archive pages, every legacy compatibility route, and representative detail pages.

## Suggested migration sequence

1. Freeze the current URL/content inventory.
2. Add Jekyll layouts/includes and reproduce the existing visual design without changing content.
3. Convert News/Seminars/Publications into output collections.
4. Generate static detail pages and metadata.
5. Rebuild sitemap and crawler files.
6. Add legacy `?slug=` compatibility redirects.
7. Run automated link/build/content validation.
8. Preview from a non-production branch/deployment.
9. Switch production only after parity checks pass.
10. Keep legacy adapters for a defined transition period and monitor for broken links.

## What not to do

- Do not migrate to React/Next.js solely because they are more modern; the lab website does not currently need an application runtime.
- Do not combine framework migration, repository-owner migration, custom-domain migration, and a visual redesign in one change.
- Do not change public slugs casually.
- Do not remove the current JSON/content validation guarantees without equivalent or stronger v2 validation.

## Re-evaluation checklist

When revisiting this decision, answer:

- How many News/Seminar/Publication detail records exist now?
- Are social previews or non-JavaScript crawler metadata causing real problems?
- How often do shared-layout edits require duplicated HTML changes?
- Are tags, research areas, author pages, pagination, or bilingual pages now required?
- Who will maintain the site after the current maintainer leaves?
- Can v2 preserve all existing public URLs or provide compatibility redirects?

Until those answers show a clear migration benefit, the current stabilized architecture remains the production baseline.
