import './main.js';
import { appendAuthors, getCurrentMemberNames } from './author-utils.js';

async function loadPublications() {
  const publicationsList = document.getElementById('publications-list');
  if (!publicationsList) return;

  try {
    const [publicationsResponse, peopleResponse] = await Promise.all([
      fetch('data/publications.json'),
      fetch('data/people.json')
    ]);

    if (!publicationsResponse.ok) {
      throw new Error(`Failed to load publications: ${publicationsResponse.status}`);
    }
    if (!peopleResponse.ok) {
      throw new Error(`Failed to load people: ${peopleResponse.status}`);
    }

    const publications = await publicationsResponse.json();
    const people = await peopleResponse.json();
    const currentMemberNames = getCurrentMemberNames(people);

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

      const yearLabel = document.createElement('span');
      yearLabel.textContent = year;

      const count = grouped[year].length;
      const countLabel = document.createElement('span');
      countLabel.className = 'publication-year__count';
      countLabel.textContent = `${count} ${count === 1 ? 'publication' : 'publications'}`;

      heading.append(yearLabel, countLabel);
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

          if (item.authors || item.venue || item.note) {
            const metaEl = document.createElement('p');
            metaEl.className = 'publication-meta';

            if (item.authors) {
              appendAuthors(metaEl, item.authors, currentMemberNames);
            }
            if (item.venue) {
              if (metaEl.childNodes.length) metaEl.append(' · ');
              metaEl.append(item.venue);
            }
            if (item.note) {
              if (metaEl.childNodes.length) metaEl.append(' · ');
              metaEl.append(item.note);
            }

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
