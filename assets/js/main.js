import { compareDateDesc, formatDateOnly } from './date-utils.js';
import { appendAuthors, getCurrentMemberNames } from './author-utils.js';

function installProfessionalStyling() {
  if (!document.querySelector('link[data-professional-styles]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = new URL('../css/professional.css', import.meta.url).href;
    stylesheet.dataset.professionalStyles = 'true';
    document.head.appendChild(stylesheet);
  }

  const pageName = window.location.pathname.split('/').pop() || 'index.html';
  document.body.dataset.page = pageName.replace(/\.html$/, '') || 'home';
}

function installAccessibilityScaffolding() {
  if (!document.querySelector('link[data-accessibility-styles]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = new URL('../css/accessibility.css', import.meta.url).href;
    stylesheet.dataset.accessibilityStyles = 'true';
    document.head.appendChild(stylesheet);
  }

  const main = document.querySelector('main');
  if (main) {
    if (!main.id) main.id = 'main-content';

    if (!document.querySelector('.skip-link')) {
      const skipLink = document.createElement('a');
      skipLink.className = 'skip-link';
      skipLink.href = `#${main.id}`;
      skipLink.textContent = 'Skip to main content';
      document.body.prepend(skipLink);
    }
  }

  const primaryNavigation = document.querySelector('.top-nav');
  if (primaryNavigation && !primaryNavigation.hasAttribute('aria-label')) {
    primaryNavigation.setAttribute('aria-label', 'Primary navigation');
  }
}

function enhanceFooter() {
  const footer = document.querySelector('.footer');
  if (!footer || footer.dataset.enhanced === 'true') return;

  const container = footer.querySelector('.container');
  if (!container) return;

  const layout = document.createElement('div');
  layout.className = 'footer-layout';

  const brand = document.createElement('div');
  brand.className = 'footer-brand';

  const brandName = document.createElement('strong');
  brandName.textContent = 'CIS-Lab';

  const institution = document.createElement('span');
  institution.textContent = 'School of Cryptology · University of Chinese Academy of Sciences (UCAS)';

  brand.append(brandName, institution);

  const nav = document.createElement('nav');
  nav.className = 'footer-nav';
  nav.setAttribute('aria-label', 'Footer navigation');

  [
    ['People', 'people.html'],
    ['News', 'news.html'],
    ['Seminars', 'seminars.html'],
    ['Publications', 'publications.html'],
    ['Contact', 'contact.html']
  ].forEach(([label, href]) => {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    nav.appendChild(link);
  });

  layout.append(brand, nav);

  const meta = document.createElement('div');
  meta.className = 'footer-meta';
  const copyright = document.createElement('p');
  copyright.textContent = `© ${new Date().getFullYear()} CIS-Lab. All rights reserved.`;
  meta.appendChild(copyright);

  container.replaceChildren(layout, meta);
  footer.dataset.enhanced = 'true';
}

installProfessionalStyling();
installAccessibilityScaffolding();
enhanceFooter();

const yearTarget = document.getElementById('year');
if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

if (navToggle && navLinks) {
  const closeNavigation = () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  navToggle.setAttribute('aria-controls', navLinks.id || 'nav-links');
  navToggle.setAttribute('aria-expanded', 'false');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeNavigation();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeNavigation();
      navToggle.focus();
    }
  });
}

async function loadNews() {
  const newsList = document.getElementById('news-list');
  if (!newsList) return;

  try {
    const response = await fetch('data/news.json');
    if (!response.ok) throw new Error(`Failed to load news: ${response.status}`);
    const newsItems = await response.json();

    const featured = [...newsItems]
      .sort((a, b) => compareDateDesc(a.date, b.date))
      .slice(0, 3);

    const fragment = document.createDocumentFragment();
    featured.forEach((item) => {
      const slug = item.slug ?? '';
      const article = document.createElement('article');
      article.className = 'card';

      const date = document.createElement('time');
      date.dateTime = item.date;
      date.textContent = formatDateOnly(item.date);

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
        appendAuthors(authors, item.authors, currentMemberNames);
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
