import './main.js';
import {
  setCanonicalUrl,
  setMetaName,
  setMetaProperty,
  setStructuredData,
  toSiteUrl
} from './site-meta.js';

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function createAuthors(authors) {
  const wrapper = document.createElement('p');
  wrapper.className = 'publication-authors publication-authors--detail';

  if (typeof authors === 'string') {
    wrapper.textContent = authors;
    return wrapper;
  }

  (Array.isArray(authors) ? authors : []).forEach((author, index) => {
    if (index) wrapper.append(', ');
    const isMember = typeof author === 'object' && author?.laboratoryMember;
    const isCorresponding = typeof author === 'object' && author?.correspondingAuthor;
    const name = document.createElement(isMember ? 'strong' : 'span');
    name.textContent = typeof author === 'string' ? author : author?.name ?? '';

    if (isCorresponding) {
      const marker = document.createElement('sup');
      marker.className = 'corresponding-author-marker';
      marker.title = 'Corresponding author';
      marker.setAttribute('aria-label', ' corresponding author');
      marker.textContent = '*';
      name.appendChild(marker);
    }

    wrapper.appendChild(name);
  });
  return wrapper;
}

function authorNames(authors) {
  if (typeof authors === 'string') return authors;
  if (!Array.isArray(authors)) return '';
  return authors
    .map((author) => (typeof author === 'string' ? author : author?.name))
    .filter(Boolean)
    .join(', ');
}

function appendDefinition(list, label, value, linkUrl) {
  if (value === undefined || value === null || value === '') return;
  const term = document.createElement('dt');
  term.textContent = label;
  const description = document.createElement('dd');

  if (linkUrl) {
    const link = document.createElement('a');
    link.href = linkUrl;
    link.textContent = value;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    description.appendChild(link);
  } else {
    description.textContent = value;
  }
  list.append(term, description);
}

function createSummaryMeta(publication) {
  const meta = document.createElement('div');
  meta.className = 'detail-summary-meta publication-summary-meta';

  const venue = document.createElement('span');
  venue.textContent = publication.venue;
  meta.appendChild(venue);

  const year = document.createElement('span');
  year.textContent = String(publication.year);
  meta.appendChild(year);

  return meta;
}

function createResourceRow(publication) {
  const resources = Array.isArray(publication.links) ? publication.links.filter((link) => link?.url) : [];
  if (!resources.length) return null;

  const row = document.createElement('nav');
  row.className = 'detail-resource-row';
  row.setAttribute('aria-label', 'Publication resources');

  resources.forEach((resource) => {
    const anchor = document.createElement('a');
    anchor.href = resource.url;
    anchor.textContent = resource.label ?? 'Resource';
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    row.appendChild(anchor);
  });

  return row;
}

function createSectionHeading(text) {
  const heading = document.createElement('h2');
  heading.textContent = text;
  return heading;
}

async function loadPublicationDetail() {
  const slug = getQueryParam('slug');
  const container = document.getElementById('publication-detail');
  const titleEl = document.getElementById('publication-title');
  const subtitleEl = document.getElementById('publication-subtitle');

  if (!container) return;
  if (!slug) {
    container.innerHTML = '<p>Publication not found. Please return to the publications archive.</p>';
    return;
  }

  try {
    const response = await fetch('data/publications.json');
    if (!response.ok) throw new Error(`Failed to load publications: ${response.status}`);
    const publications = await response.json();
    const publication = publications.find((item) => item.slug === slug);

    if (!publication) {
      container.innerHTML = '<p>Publication not found. Please return to the publications archive.</p>';
      return;
    }

    const canonicalUrl = toSiteUrl(`publication-detail.html?slug=${encodeURIComponent(slug)}`);
    const names = authorNames(publication.authors);
    const abstractText = publication.abstract ?? publication.summary;
    const descriptionText = abstractText || `${publication.title} by ${names}. Published in ${publication.venue} (${publication.year}).`;

    if (titleEl) titleEl.textContent = publication.title;
    if (subtitleEl) subtitleEl.hidden = true;
    document.title = `${publication.title} | CIS-Lab | UCAS`;
    setCanonicalUrl(canonicalUrl);
    setMetaName('description', descriptionText);
    setMetaProperty('og:title', publication.title);
    setMetaProperty('og:description', descriptionText);
    setMetaProperty('og:type', 'article');
    setMetaProperty('og:url', canonicalUrl);
    setMetaProperty('og:site_name', 'CIS-Lab | UCAS');
    setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'ScholarlyArticle',
      headline: publication.title,
      name: publication.title,
      author: Array.isArray(publication.authors)
        ? publication.authors
            .map((author) => (typeof author === 'string' ? author : author?.name))
            .filter(Boolean)
            .map((name) => ({ '@type': 'Person', name }))
        : undefined,
      datePublished: String(publication.year),
      isPartOf: publication.venue
        ? { '@type': 'CreativeWork', name: publication.venue }
        : undefined,
      identifier: publication.doi || undefined,
      sameAs: publication.doiUrl || publication.links?.[0]?.url || undefined,
      abstract: abstractText || undefined,
      url: canonicalUrl,
      mainEntityOfPage: canonicalUrl
    });

    const fragment = document.createDocumentFragment();

    if (publication.authors) {
      fragment.appendChild(createAuthors(publication.authors));
    }
    fragment.appendChild(createSummaryMeta(publication));

    const resourceRow = createResourceRow(publication);
    if (resourceRow) fragment.appendChild(resourceRow);

    if (abstractText) {
      fragment.appendChild(createSectionHeading('Abstract'));
      const abstract = document.createElement('p');
      abstract.className = 'publication-abstract';
      abstract.textContent = abstractText;
      fragment.appendChild(abstract);
    }

    if (Array.isArray(publication.keywords) && publication.keywords.length) {
      fragment.appendChild(createSectionHeading('Keywords'));
      const keywords = document.createElement('ul');
      keywords.className = 'keyword-list';
      publication.keywords.forEach((keyword) => {
        const item = document.createElement('li');
        item.textContent = keyword;
        keywords.appendChild(item);
      });
      fragment.appendChild(keywords);
    }

    fragment.appendChild(createSectionHeading('Bibliographic Details'));
    const metaList = document.createElement('dl');
    metaList.className = 'detail-meta detail-meta--bibliographic';
    const details = publication.publicationDetails ?? {};
    appendDefinition(metaList, 'Venue', details.conference ?? publication.venue);
    appendDefinition(metaList, 'Proceedings', details.proceedings);
    const series = details.series && details.volume
      ? `${details.series}, Vol. ${details.volume}`
      : details.series;
    appendDefinition(metaList, 'Series', series);
    appendDefinition(metaList, 'Pages', details.pages);
    appendDefinition(metaList, 'Publisher', details.publisher);
    appendDefinition(metaList, 'Year', publication.year);
    appendDefinition(metaList, 'First Online', publication.firstOnline);
    appendDefinition(metaList, 'DOI', publication.doi, publication.doiUrl);
    fragment.appendChild(metaList);

    const backLink = document.createElement('a');
    backLink.href = 'publications.html';
    backLink.className = 'inline-link detail-back-link';
    backLink.textContent = 'Back to publications';
    fragment.appendChild(backLink);

    container.innerHTML = '';
    container.appendChild(fragment);
  } catch (error) {
    container.innerHTML = '<p>Unable to load publication details at this time.</p>';
    console.error(error);
  }
}

loadPublicationDetail();
