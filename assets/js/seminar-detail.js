import './main.js';

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function formatDateTime(value) {
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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

    if (titleEl) titleEl.textContent = seminar.title;
    if (subtitleEl) subtitleEl.textContent = seminar.speaker;

    const fragment = document.createDocumentFragment();

    const metaList = document.createElement('dl');
    metaList.className = 'detail-meta';

    const dateTerm = document.createElement('dt');
    dateTerm.textContent = 'Date & Time';
    const dateValue = document.createElement('dd');
    dateValue.textContent = formatDateTime(seminar.datetime);

    metaList.append(dateTerm, dateValue);

    if (seminar.location) {
      const locationTerm = document.createElement('dt');
      locationTerm.textContent = 'Location';
      const locationValue = document.createElement('dd');
      locationValue.textContent = seminar.location;

      metaList.append(locationTerm, locationValue);
    }
    fragment.appendChild(metaList);

    if (seminar.description) {
      const description = document.createElement('p');
      description.textContent = seminar.description;
      fragment.appendChild(description);
    }

    if (Array.isArray(seminar.resources) && seminar.resources.length) {
      const resourcesHeading = document.createElement('h2');
      resourcesHeading.textContent = 'Resources';
      fragment.appendChild(resourcesHeading);

      const resourcesList = document.createElement('ul');
      resourcesList.className = 'link-list';

      seminar.resources.forEach((resource) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = resource.url;
        if (resource.url.startsWith('http')) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }
        link.textContent = resource.label ?? 'Resource';
        item.appendChild(link);
        resourcesList.appendChild(item);
      });

      fragment.appendChild(resourcesList);
    }

    const backLink = document.createElement('a');
    backLink.href = 'seminars.html';
    backLink.className = 'inline-link';
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
