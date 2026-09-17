import './main.js';
import { formatDateOnly } from './date-utils.js';
import {
  LAB_ORGANIZATION,
  setCanonicalUrl,
  setMetaName,
  setMetaProperty,
  setStructuredData,
  toSiteUrl
} from './site-meta.js';

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function getSeminarDataUrl() {
  const url = new URL('data/seminars.json', window.location.href);
  url.searchParams.set('v', Date.now());
  return url;
}

async function loadSeminarDetail() {
  const slug = getQueryParam('slug');
  const container = document.getElementById('seminar-detail');
  const titleEl = document.getElementById('seminar-title');
  const subtitleEl = document.getElementById('seminar-subtitle');

  if (!container) return;

  if (!slug) {
    container.innerHTML = '<p>Seminar not found. Please return to the seminar listings.</p>';
    return;
  }

  try {
    const response = await fetch(getSeminarDataUrl(), { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to load seminars: ${response.status}`);
    const seminars = await response.json();

    const seminar = seminars.find((item) => item.slug === slug);
    if (!seminar) {
      container.innerHTML = '<p>Seminar not found. Please return to the seminar listings.</p>';
      return;
    }

    const canonicalUrl = toSiteUrl(`seminar-detail.html?slug=${encodeURIComponent(slug)}`);
    const descriptionText = seminar.description || `${seminar.title}, presented by ${seminar.speaker} in the CIS-Lab seminar series at UCAS.`;

    if (titleEl) titleEl.textContent = seminar.title;
    if (subtitleEl) subtitleEl.hidden = true;

    document.title = `${seminar.title} | CIS-Lab Seminar | UCAS`;
    setCanonicalUrl(canonicalUrl);
    setMetaName('description', descriptionText);
    setMetaProperty('og:title', seminar.title);
    setMetaProperty('og:description', descriptionText);
    setMetaProperty('og:type', 'article');
    setMetaProperty('og:url', canonicalUrl);
    setMetaProperty('og:site_name', 'CIS-Lab | UCAS');
    setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: seminar.title,
      description: descriptionText,
      startDate: seminar.date,
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      url: canonicalUrl,
      performer: {
        '@type': 'Person',
        name: seminar.speaker
      },
      organizer: LAB_ORGANIZATION,
      sameAs: Array.isArray(seminar.resources)
        ? seminar.resources.map((resource) => resource.url).filter(Boolean)
        : undefined
    });

    const fragment = document.createDocumentFragment();

    const meta = document.createElement('div');
    meta.className = 'detail-summary-meta detail-summary-meta--seminar';

    const speaker = document.createElement('span');
    speaker.className = 'detail-summary-primary';
    speaker.textContent = seminar.speaker;
    meta.appendChild(speaker);

    const date = document.createElement('time');
    date.dateTime = seminar.date;
    date.textContent = formatDateOnly(seminar.date);
    meta.appendChild(date);

    if (seminar.location) {
      const location = document.createElement('span');
      location.textContent = seminar.location;
      meta.appendChild(location);
    }
    fragment.appendChild(meta);

    if (seminar.description) {
      const body = document.createElement('div');
      body.className = 'detail-prose';
      const description = document.createElement('p');
      description.textContent = seminar.description;
      body.appendChild(description);
      fragment.appendChild(body);
    }

    if (Array.isArray(seminar.resources) && seminar.resources.length) {
      const resources = document.createElement('nav');
      resources.className = 'detail-resource-row';
      resources.setAttribute('aria-label', 'Seminar resources');

      seminar.resources.forEach((resource) => {
        if (!resource?.url) return;
        const link = document.createElement('a');
        link.href = resource.url;
        if (resource.url.startsWith('http')) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }
        link.textContent = resource.label ?? 'Resource';
        resources.appendChild(link);
      });

      fragment.appendChild(resources);
    }

    const backLink = document.createElement('a');
    backLink.href = 'seminars.html';
    backLink.className = 'inline-link detail-back-link';
    backLink.textContent = 'Back to seminars';
    fragment.appendChild(backLink);

    container.innerHTML = '';
    container.appendChild(fragment);
  } catch (error) {
    container.innerHTML = '<p>Unable to load seminar details at this time.</p>';
    console.error(error);
  }
}

loadSeminarDetail();
