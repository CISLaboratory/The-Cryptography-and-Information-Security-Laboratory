import './main.js';

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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
    const response = await fetch('data/news.json');
    if (!response.ok) throw new Error(`Failed to load news: ${response.status}`);
    const newsItems = await response.json();

    const news = newsItems.find((item) => item.slug === slug);
    if (!news) {
      container.innerHTML = '<p>News item not found. Please return to the news archive.</p>';
      return;
    }

    if (titleEl) titleEl.textContent = news.title;
    if (subtitleEl) subtitleEl.textContent = formatDate(news.date);

    const fragment = document.createDocumentFragment();

    const metaList = document.createElement('dl');
    metaList.className = 'detail-meta';

    const dateTerm = document.createElement('dt');
    dateTerm.textContent = 'Published';
    const dateValue = document.createElement('dd');
    dateValue.textContent = formatDate(news.date);

    metaList.append(dateTerm, dateValue);
    fragment.appendChild(metaList);

    if (Array.isArray(news.content) && news.content.length) {
      news.content.forEach((paragraph) => {
        const p = document.createElement('p');
        p.textContent = paragraph;
        fragment.appendChild(p);
      });
    } else if (news.description) {
      const p = document.createElement('p');
      p.textContent = news.description;
      fragment.appendChild(p);
    }

    const backLink = document.createElement('a');
    backLink.href = 'news.html';
    backLink.className = 'inline-link';
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
