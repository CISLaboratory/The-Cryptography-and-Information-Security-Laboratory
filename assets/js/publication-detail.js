import './main.js';

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
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

function createAuthors(authors) {
  const wrapper = document.createElement('p');
  wrapper.className = 'publication-authors';

  if (typeof authors === 'string') {
    wrapper.textContent = authors;
    return wrapper;
  }

  (Array.isArray(authors) ? authors : []).forEach((author, index) => {
    if (index) wrapper.append(', ');
    const isMember = typeof author === 'object' && author?.laboratoryMember;
    const name = document.createElement(isMember ? 'strong' : 'span');
    name.textContent = typeof author === 'string' ? author : author?.name ?? '';
    wrapper.appendChild(name);

    if (isMember) {
      const marker = document.createElement('span');
      marker.className = 'member-label';
      marker.textContent = ' (Laboratory Member)';
      wrapper.appendChild(marker);
    }
  });
  return wrapper;
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

    if (titleEl) titleEl.textContent = publication.title;
    if (subtitleEl) subtitleEl.hidden = true;
    document.title = `${publication.title} | CIS-Lab`;

    const fragment = document.createDocumentFragment();

    if (publication.authors) {
      const authorsHeading = document.createElement('h2');
      authorsHeading.textContent = 'Authors';
      fragment.append(authorsHeading, createAuthors(publication.authors));
    }

    const detailsHeading = document.createElement('h2');
    detailsHeading.textContent = 'Publication Details';
    fragment.appendChild(detailsHeading);

    const metaList = document.createElement('dl');
    metaList.className = 'detail-meta';
    const details = publication.publicationDetails ?? {};
    appendDefinition(metaList, 'Conference', details.conference ?? publication.venue);
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

    const abstractText = publication.abstract ?? publication.summary;
    if (abstractText) {
      const abstractHeading = document.createElement('h2');
      abstractHeading.textContent = 'Abstract';
      const abstract = document.createElement('p');
      abstract.className = 'publication-abstract';
      abstract.textContent = abstractText;
      fragment.append(abstractHeading, abstract);
    }

    if (Array.isArray(publication.keywords) && publication.keywords.length) {
      const keywordsHeading = document.createElement('h2');
      keywordsHeading.textContent = 'Keywords';
      const keywords = document.createElement('ul');
      keywords.className = 'keyword-list';
      publication.keywords.forEach((keyword) => {
        const item = document.createElement('li');
        item.textContent = keyword;
        keywords.appendChild(item);
      });
      fragment.append(keywordsHeading, keywords);
    }

    if (Array.isArray(publication.links) && publication.links.length) {
      const linksHeading = document.createElement('h2');
      linksHeading.textContent = 'Resources';
      const linksList = document.createElement('ul');
      linksList.className = 'link-list';

      publication.links.forEach((link) => {
        if (!link?.url) return;
        const item = document.createElement('li');
        const anchor = document.createElement('a');
        anchor.href = link.url;
        anchor.textContent = link.label ?? 'Link';
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        item.appendChild(anchor);
        linksList.appendChild(item);
      });
      fragment.append(linksHeading, linksList);
    }

    const backLink = document.createElement('a');
    backLink.href = 'publications.html';
    backLink.className = 'inline-link';
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
