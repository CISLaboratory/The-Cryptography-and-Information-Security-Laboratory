import './polish.js';
import { compareDateDesc, formatDateOnly } from './date-utils.js';
import { appendAuthors, getCurrentMemberNames } from './author-utils.js';

function installPageContext() {
  if (document.body.dataset.page) return;

  const pageName = window.location.pathname.split('/').pop() || 'index.html';
  document.body.dataset.page = pageName.replace(/\.html$/, '') || 'index';
}

function installFavicon() {
  const icon = document.querySelector('link[rel~="icon"]');
  if (!icon) return;
  icon.href = 'assets/images/favicon-cas.svg';
  icon.type = 'image/svg+xml';
}

function installAccessibilityScaffolding() {
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

installPageContext();
installFavicon();
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
    if (!featured.length) return;

    const fragment = document.createDocumentFragment();

    featured.forEach((item) => {
      const slug = item.slug ?? '';
      const article = document.createElement('article');
      article.className = 'home-publication-entry';

      const meta = document.createElement('div');
      meta.className = 'home-publication-meta';

      if (item.year) {
        const year = document.createElement('span');
        year.className = 'home-publication-year';
        year.textContent = item.year;
        meta.appendChild(year);
      }

      if (item.venue) {
        const venue = document.createElement('span');
        venue.className = 'home-publication-venue';
        venue.textContent = item.venue;
        meta.appendChild(venue);
      }

      const title = document.createElement('h3');
      const titleLink = document.createElement('a');
      titleLink.href = slug ? `publication-detail.html?slug=${encodeURIComponent(slug)}` : '#';
      titleLink.textContent = item.title;
      title.appendChild(titleLink);

      article.append(meta, title);

      if (item.authors) {
        const authors = document.createElement('p');
        authors.className = 'home-publication-authors';
        appendAuthors(authors, item.authors, currentMemberNames);
        article.appendChild(authors);
      }

      const resources = document.createElement('div');
      resources.className = 'home-publication-resources';

      const detailLink = document.createElement('a');
      detailLink.href = slug ? `publication-detail.html?slug=${encodeURIComponent(slug)}` : '#';
      detailLink.textContent = 'Details';
      resources.appendChild(detailLink);

      const links = Array.isArray(item.links) ? item.links : [];
      links.forEach((link) => {
        if (!link?.url) return;
        const anchor = document.createElement('a');
        anchor.href = link.url;
        anchor.target = link.target ?? '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.textContent = link.label ?? 'Resource';
        resources.appendChild(anchor);
      });

      article.appendChild(resources);
      fragment.appendChild(article);
    });

    publicationsList.replaceChildren(fragment);
  } catch (error) {
    console.error(error);
  }
}

loadHomePublications();
