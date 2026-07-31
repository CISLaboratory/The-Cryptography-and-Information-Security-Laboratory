import './main.js';

function formatAuthors(authors) {
  if (typeof authors === 'string') return authors;
  if (!Array.isArray(authors)) return '';
  return authors
    .map((author) => (typeof author === 'string' ? author : author?.name))
    .filter(Boolean)
    .join(', ');
}

async function loadPublications() {
  const publicationsList = document.getElementById('publications-list');
  if (!publicationsList) return;

  try {
    const response = await fetch('data/publications.json');
    if (!response.ok) throw new Error(`Failed to load publications: ${response.status}`);
    const publications = await response.json();

    if (!Array.isArray(publications) || publications.length === 0) {
      publicationsList.innerHTML = '<p>No publications available at this time.</p>';
      return;
    }

    const grouped = publications.reduce((acc, item) => {
      const year = item.year ?? 'Other';
      acc[year] = acc[year] ?? [];
      acc[year].push(item);
      return acc;
    }, {});

    const sortedYears = Object.keys(grouped).sort((a, b) => {
      const yearA = Number(a);
      const yearB = Number(b);

      const aIsNumber = !Number.isNaN(yearA);
      const bIsNumber = !Number.isNaN(yearB);

      if (aIsNumber && bIsNumber) return yearB - yearA;
      if (aIsNumber) return -1;
      if (bIsNumber) return 1;
      return a.localeCompare(b);
    });

    const fragment = document.createDocumentFragment();
    sortedYears.forEach((year) => {
      const yearSection = document.createElement('section');
      yearSection.className = 'publication-year';

      const heading = document.createElement('h2');
      heading.className = 'publication-year__title';
      heading.textContent = year;
      yearSection.appendChild(heading);

      const itemsList = document.createElement('ul');
      itemsList.className = 'publication-items';

      grouped[year]
        .slice()
        .sort((a, b) => {
          const monthA = 'month' in a ? Number(a.month) : 12;
          const monthB = 'month' in b ? Number(b.month) : 12;
          if (monthA !== monthB) return monthB - monthA;
          return a.title.localeCompare(b.title);
        })
        .forEach((item) => {
          const itemEl = document.createElement('li');
          itemEl.className = 'publication-item';

          const titleEl = document.createElement('p');
          titleEl.className = 'publication-title';

          const slug = item.slug ?? '';
          const detailLink = document.createElement('a');
          detailLink.href = slug ? `publication-detail.html?slug=${encodeURIComponent(slug)}` : '#';
          detailLink.textContent = item.title;
          titleEl.appendChild(detailLink);
          itemEl.appendChild(titleEl);

          const metaParts = [];
          const authors = formatAuthors(item.authors);
          if (authors) metaParts.push(authors);
          if (item.venue) metaParts.push(item.venue);
          if (item.note) metaParts.push(item.note);

          if (metaParts.length) {
            const metaEl = document.createElement('p');
            metaEl.className = 'publication-meta';
            metaEl.textContent = metaParts.join(' · ');
            itemEl.appendChild(metaEl);
          }

          const links = Array.isArray(item.links)
            ? item.links
            : item.link
            ? [{ label: item.linkLabel ?? 'View', url: item.link }]
            : [];

          if (links.length) {
            const linksEl = document.createElement('div');
            linksEl.className = 'publication-links';

            links.forEach((link) => {
              if (!link?.url) return;
              const anchor = document.createElement('a');
              anchor.href = link.url;
              anchor.target = link.target ?? '_blank';
              anchor.rel = 'noopener noreferrer';
              anchor.textContent = link.label ?? 'Link';
              linksEl.appendChild(anchor);
            });

            if (linksEl.childElementCount) {
              itemEl.appendChild(linksEl);
            }
          }

          const moreLink = document.createElement('a');
          moreLink.href = slug ? `publication-detail.html?slug=${encodeURIComponent(slug)}` : '#';
          moreLink.className = 'inline-link';
          moreLink.textContent = 'View publication details';
          itemEl.appendChild(moreLink);

          itemsList.appendChild(itemEl);
        });

      yearSection.appendChild(itemsList);
      fragment.appendChild(yearSection);
    });

    publicationsList.innerHTML = '';
    publicationsList.appendChild(fragment);
  } catch (error) {
    publicationsList.innerHTML = '<p>Unable to load publications at this time. Please try again later.</p>';
    console.error(error);
  }
}

loadPublications();
