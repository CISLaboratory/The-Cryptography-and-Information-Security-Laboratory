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

async function loadNewsDetail() {
  const slug = getQueryParam('slug');
  const container = document.getElementById('news-detail');
  const titleEl = document.getElementById('news-title');
  const subtitleEl = document.getElementById('news-subtitle');

  if (!container) return;

  if (!slug) {
    container.innerHTML = '<p>News item not found. Please return to the news archive.</p>';
    return;
  }

  try {
    const response = await fetch('data/news.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to load news: ${response.status}`);
    const newsItems = await response.json();

    const news = newsItems.find((item) => item.slug === slug);
    if (!news) {
      container.innerHTML = '<p>News item not found. Please return to the news archive.</p>';
      return;
    }

    const displayDate = formatDateOnly(news.date);
    const canonicalUrl = toSiteUrl(`news-detail.html?slug=${encodeURIComponent(slug)}`);
    const descriptionText = news.description || `News from CIS-Lab at UCAS: ${news.title}`;

    if (titleEl) titleEl.textContent = news.title;
    if (subtitleEl) subtitleEl.hidden = true;

    document.title = `${news.title} | CIS-Lab | UCAS`;
    setCanonicalUrl(canonicalUrl);
    setMetaName('description', descriptionText);
    setMetaProperty('og:title', news.title);
    setMetaProperty('og:description', descriptionText);
    setMetaProperty('og:type', 'article');
    setMetaProperty('og:url', canonicalUrl);
    setMetaProperty('og:site_name', 'CIS-Lab | UCAS');
    if (news.image) {
      setMetaProperty('og:image', toSiteUrl(news.image));
    }
    setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: news.title,
      description: descriptionText,
      datePublished: news.date,
      url: canonicalUrl,
      mainEntityOfPage: canonicalUrl,
      image: news.image ? [toSiteUrl(news.image)] : undefined,
      publisher: LAB_ORGANIZATION
    });

    const fragment = document.createDocumentFragment();

    const meta = document.createElement('div');
    meta.className = 'detail-summary-meta';
    const date = document.createElement('time');
    date.dateTime = news.date;
    date.textContent = displayDate;
    meta.appendChild(date);
    fragment.appendChild(meta);

    const body = document.createElement('div');
    body.className = 'detail-prose';
    if (Array.isArray(news.content) && news.content.length) {
      news.content.forEach((paragraph) => {
        const p = document.createElement('p');
        p.textContent = paragraph;
        body.appendChild(p);
      });
    } else if (news.description) {
      const p = document.createElement('p');
      p.textContent = news.description;
      body.appendChild(p);
    }
    fragment.appendChild(body);

    if (news.image) {
      const figure = document.createElement('figure');
      figure.className = 'news-detail-figure detail-media';

      const image = document.createElement('img');
      image.src = news.image;
      image.alt = news.imageAlt ?? '';
      image.className = 'news-detail-image';
      figure.appendChild(image);

      if (news.imageCaption) {
        const caption = document.createElement('figcaption');
        caption.textContent = news.imageCaption;
        figure.appendChild(caption);
      }

      fragment.appendChild(figure);
    }

    const backLink = document.createElement('a');
    backLink.href = 'news.html';
    backLink.className = 'inline-link detail-back-link';
    backLink.textContent = 'Back to news';
    fragment.appendChild(backLink);

    container.innerHTML = '';
    container.appendChild(fragment);
  } catch (error) {
    container.innerHTML = '<p>Unable to load news details at this time.</p>';
    console.error(error);
  }
}

loadNewsDetail();
