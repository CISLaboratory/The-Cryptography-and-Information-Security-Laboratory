function installPolishStyles() {
  if (document.querySelector('link[data-polish-styles]')) return;

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('../css/polish.css', import.meta.url).href;
  stylesheet.dataset.polishStyles = 'true';
  document.head.appendChild(stylesheet);
}

export function ensureResultsSummary(controlElement, id) {
  if (!controlElement) return null;

  let summary = document.getElementById(id);
  if (!summary) {
    summary = document.createElement('p');
    summary.id = id;
    summary.className = 'results-summary';
    summary.setAttribute('aria-live', 'polite');
    controlElement.insertAdjacentElement('afterend', summary);
  }
  return summary;
}

function getPageKey() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  return page.replace(/\.html$/, '') || 'index';
}

function installDetailBreadcrumbs() {
  const pageKey = getPageKey();
  const details = {
    'publication-detail': {
      section: 'Publications',
      href: 'publications.html',
      current: 'Publication details'
    },
    'seminar-detail': {
      section: 'Seminars',
      href: 'seminars.html',
      current: 'Seminar details'
    },
    'news-detail': {
      section: 'News',
      href: 'news.html',
      current: 'News article'
    }
  }[pageKey];

  if (!details || document.querySelector('.detail-breadcrumbs')) return;

  const container = document.querySelector('main.section > .container');
  if (!container) return;

  const nav = document.createElement('nav');
  nav.className = 'detail-breadcrumbs';
  nav.setAttribute('aria-label', 'Breadcrumb');

  const list = document.createElement('ol');

  const homeItem = document.createElement('li');
  const homeLink = document.createElement('a');
  homeLink.href = 'index.html';
  homeLink.textContent = 'Home';
  homeItem.appendChild(homeLink);

  const sectionItem = document.createElement('li');
  const sectionLink = document.createElement('a');
  sectionLink.href = details.href;
  sectionLink.textContent = details.section;
  sectionItem.appendChild(sectionLink);

  const currentItem = document.createElement('li');
  const current = document.createElement('span');
  current.setAttribute('aria-current', 'page');
  current.textContent = details.current;
  currentItem.appendChild(current);

  list.append(homeItem, sectionItem, currentItem);
  nav.appendChild(list);
  container.prepend(nav);
}

function installNavigationRefinements() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('nav-links');
  if (!toggle || !nav) return;

  const close = () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  document.addEventListener('pointerdown', (event) => {
    if (!nav.classList.contains('open')) return;
    if (nav.contains(event.target) || toggle.contains(event.target)) return;
    close();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 720 && nav.classList.contains('open')) close();
  });
}

function markFooterCurrentPage() {
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  const sectionFallbacks = {
    'publication-detail.html': 'publications.html',
    'seminar-detail.html': 'seminars.html',
    'news-detail.html': 'news.html'
  };
  const activeFile = sectionFallbacks[currentFile] ?? currentFile;

  document.querySelectorAll('.footer-nav a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === activeFile) link.setAttribute('aria-current', 'page');
  });
}

installPolishStyles();

document.addEventListener('DOMContentLoaded', () => {
  installDetailBreadcrumbs();
  installNavigationRefinements();
  markFooterCurrentPage();
});
