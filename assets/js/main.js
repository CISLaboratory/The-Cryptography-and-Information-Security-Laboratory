const yearTarget = document.getElementById('year');
if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

async function loadNews() {
  const newsList = document.getElementById('news-list');
  if (!newsList) return;

  try {
    const response = await fetch('data/news.json');
    if (!response.ok) throw new Error(`Failed to load news: ${response.status}`);
    const newsItems = await response.json();

    const fragment = document.createDocumentFragment();
    newsItems.forEach((item) => {
      const slug = item.slug ?? '';
      const article = document.createElement('article');
      article.className = 'card';

      const date = document.createElement('time');
      date.dateTime = item.date;
      date.textContent = new Date(item.date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      const title = document.createElement('h3');
      const titleLink = document.createElement('a');
      titleLink.href = slug ? `news-detail.html?slug=${encodeURIComponent(slug)}` : '#';
      titleLink.textContent = item.title;
      title.appendChild(titleLink);

      const description = document.createElement('p');
      description.textContent = item.description;

      const cta = document.createElement('a');
      cta.href = slug ? `news-detail.html?slug=${encodeURIComponent(slug)}` : '#';
      cta.className = 'inline-link';
      cta.textContent = 'Read more';

      article.appendChild(date);
      article.appendChild(title);
      article.appendChild(description);
      article.appendChild(cta);

      fragment.appendChild(article);
    });

    newsList.innerHTML = '';
    newsList.appendChild(fragment);
  } catch (error) {
    newsList.innerHTML = '<p>Unable to load news at this time. Please try again later.</p>';
    console.error(error);
  }
}

loadNews();

async function loadHomePublications() {
  const publicationsList = document.getElementById('home-publications-list');
  if (!publicationsList) return;

  try {
    const response = await fetch('data/publications.json');
    if (!response.ok) throw new Error(`Failed to load publications: ${response.status}`);
    const publications = await response.json();

    const sorted = [...publications].sort((a, b) => {
      const yearDiff = (b.year ?? 0) - (a.year ?? 0);
      if (yearDiff !== 0) return yearDiff;
      const monthA = typeof a.month === 'number' ? a.month : 0;
      const monthB = typeof b.month === 'number' ? b.month : 0;
      return monthB - monthA;
    });

    const featured = sorted.slice(0, 3);

    if (!featured.length) {
      return;
    }

    const fragment = document.createDocumentFragment();

    featured.forEach((item) => {
      const slug = item.slug ?? '';
      const article = document.createElement('article');
      article.className = 'card card--publication';

      if (item.venue) {
        const meta = document.createElement('p');
        meta.className = 'card-meta';
        meta.textContent = item.venue;
        article.appendChild(meta);
      }

      const title = document.createElement('h3');
      const titleLink = document.createElement('a');
      titleLink.href = slug ? `publication-detail.html?slug=${encodeURIComponent(slug)}` : '#';
      titleLink.textContent = item.title;
      title.appendChild(titleLink);

      const cta = document.createElement('a');
      cta.href = slug ? `publication-detail.html?slug=${encodeURIComponent(slug)}` : '#';
      cta.className = 'inline-link';
      cta.textContent = 'Read more';

      article.appendChild(title);

      if (item.authors) {
        const authors = document.createElement('p');
        authors.className = 'card-authors';
        authors.textContent = Array.isArray(item.authors)
          ? item.authors
              .map((author) => (typeof author === 'string' ? author : author?.name))
              .filter(Boolean)
              .join(', ')
          : item.authors;
        article.appendChild(authors);
      }

      if (item.summary) {
        const summary = document.createElement('p');
        summary.className = 'card-summary';
        summary.textContent = item.summary;
        article.appendChild(summary);
      }

      article.appendChild(cta);

      fragment.appendChild(article);
    });

    publicationsList.innerHTML = '';
    publicationsList.appendChild(fragment);
  } catch (error) {
    console.error(error);
  }
}

loadHomePublications();
