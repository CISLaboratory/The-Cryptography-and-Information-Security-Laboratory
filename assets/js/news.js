import './main.js';

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

async function loadNews() {
  const timeline = document.getElementById('news-timeline');
  const yearFilter = document.getElementById('news-year');
  if (!timeline || !yearFilter) return;

  try {
    const response = await fetch('data/news.json');
    if (!response.ok) throw new Error(`Failed to load news: ${response.status}`);
    const newsItems = await response.json();

    const years = Array.from(new Set(newsItems.map((item) => new Date(item.date).getFullYear()))).sort((a, b) => b - a);
    years.forEach((year) => {
      const option = document.createElement('option');
      option.value = String(year);
      option.textContent = year;
      yearFilter.appendChild(option);
    });

    const renderNews = () => {
      const selected = yearFilter.value;
      const fragment = document.createDocumentFragment();

      newsItems
        .filter((item) => selected === 'all' || String(new Date(item.date).getFullYear()) === selected)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach((item) => {
          const slug = item.slug ?? '';
          const article = document.createElement('article');
          article.className = 'timeline-item';

          if (item.image) {
            article.classList.add('timeline-item--with-image');
            const imageLink = document.createElement('a');
            imageLink.href = slug ? `news-detail.html?slug=${encodeURIComponent(slug)}` : '#';
            imageLink.className = 'timeline-image-link';

            const image = document.createElement('img');
            image.src = item.image;
            image.alt = item.imageAlt ?? '';
            image.loading = 'lazy';
            image.className = 'timeline-image';

            imageLink.appendChild(image);
            article.appendChild(imageLink);
          }

          const body = document.createElement('div');
          body.className = 'timeline-body';

          const header = document.createElement('header');
          const titleWrap = document.createElement('div');

          const titleLink = document.createElement('a');
          titleLink.href = slug ? `news-detail.html?slug=${encodeURIComponent(slug)}` : '#';
          titleLink.className = 'timeline-title';
          const title = document.createElement('h3');
          title.textContent = item.title;
          titleLink.appendChild(title);

          const summary = document.createElement('p');
          summary.textContent = item.description;

          titleWrap.appendChild(titleLink);
          titleWrap.appendChild(summary);

          const time = document.createElement('time');
          time.dateTime = item.date;
          time.textContent = formatDate(item.date);

          header.appendChild(titleWrap);
          header.appendChild(time);
          body.appendChild(header);

          const moreLink = document.createElement('a');
          moreLink.href = slug ? `news-detail.html?slug=${encodeURIComponent(slug)}` : '#';
          moreLink.className = 'inline-link';
          moreLink.textContent = 'Read more';
          body.appendChild(moreLink);
          article.appendChild(body);

          fragment.appendChild(article);
        });

      timeline.innerHTML = '';
      if (!fragment.childNodes.length) {
        const emptyState = document.createElement('p');
        emptyState.textContent = 'No news available for the selected year.';
        timeline.appendChild(emptyState);
      } else {
        timeline.appendChild(fragment);
      }
    };

    yearFilter.addEventListener('change', renderNews);
    renderNews();
  } catch (error) {
    timeline.innerHTML = '<p>Unable to load news items at this time.</p>';
    console.error(error);
  }
}

loadNews();
