import { test, expect } from '@playwright/test';

const corePages = [
  { path: '/index.html', locator: 'main' },
  { path: '/people.html', locator: '#people-table-body tr' },
  { path: '/news.html', locator: '#news-timeline .timeline-item' },
  { path: '/seminars.html', locator: '#seminar-timeline .timeline-item' },
  { path: '/publications.html', locator: '#publications-list .publication-item' },
  { path: '/contact.html', locator: '.contact-card' }
];

for (const entry of corePages) {
  test(`${entry.path} renders without page errors`, async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    const response = await page.goto(entry.path, { waitUntil: 'networkidle' });
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator(entry.locator).first()).toBeVisible();
    expect(pageErrors).toEqual([]);
    await expect(page.locator('main')).toHaveAttribute('id', 'main-content');
    await expect(page.locator('.skip-link')).toHaveAttribute('href', '#main-content');
    await expect(page.locator('.top-nav')).toHaveAttribute('aria-label', 'Primary navigation');
    await expect(page.locator('link[data-professional-styles]')).toHaveCount(1);
    await expect(page.locator('link[data-polish-styles]')).toHaveCount(1);
    await expect(page.locator('link[data-accessibility-styles]')).toHaveCount(1);
    await expect(page.locator('.footer[data-enhanced="true"]')).toHaveCount(1);
    const overflow = await page.evaluate(() =>
      Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test('home page presents existing content as a lab portal without unconfirmed research-focus copy', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'networkidle' });
  await expect(page.locator('.hero-title--single-line')).toHaveText('The Cryptography and Information Security Laboratory');
  await expect(page.locator('.explore-grid .explore-item')).toHaveCount(3);
  await expect(page.locator('.explore-grid')).toContainText('People');
  await expect(page.locator('.explore-grid')).toContainText('Seminars');
  await expect(page.locator('.explore-grid')).toContainText('Contact');
  await expect(page.getByText('Research Focus', { exact: true })).toHaveCount(0);
});

test('skip link becomes keyboard-accessible on focus', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'networkidle' });
  const skipLink = page.locator('.skip-link');
  await skipLink.focus();
  await expect(skipLink).toBeFocused();
  const box = await skipLink.boundingBox();
  expect(box).not.toBeNull();
  expect(box.y).toBeGreaterThanOrEqual(0);
});

test('mobile navigation opens and closes accessibly', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.goto('/index.html', { waitUntil: 'networkidle' });
  const toggle = page.locator('#nav-toggle');
  const nav = page.locator('#nav-links');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(nav.locator('a', { hasText: 'Publications' })).toBeVisible();
  await page.locator('.hero-content').click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('people directory uses academic grouping without member counts', async ({ page }) => {
  await page.goto('/people.html', { waitUntil: 'networkidle' });
  const filter = page.locator('#people-filter');

  await expect(filter.locator('option')).toHaveText(['All', 'Mentor', 'Ph.D. Students', "Master's Students"]);
  await expect(page.locator('.people-group-row')).toHaveCount(3);
  await expect(page.locator('.people-group-row__count')).toHaveCount(0);
  await expect(page.locator('#people-summary')).toHaveCount(0);

  const appearance = await filter.evaluate((element) => getComputedStyle(element).appearance);
  expect(appearance).toBe('none');

  await filter.selectOption('mentor');
  await expect(page.locator('.people-group-row')).toHaveCount(1);
  await expect(page.locator('.website-link').first()).toHaveText('Website ↗');
});

test('news and seminar archives expose result feedback', async ({ page }) => {
  await page.goto('/news.html', { waitUntil: 'networkidle' });
  await expect(page.locator('#news-summary')).toContainText('news item');
  await page.goto('/seminars.html', { waitUntil: 'networkidle' });
  await expect(page.locator('#seminar-summary')).toContainText('seminar');
});

test('publication lists emphasize current lab authors and mark corresponding authors', async ({ page }) => {
  await page.goto('/publications.html', { waitUntil: 'networkidle' });
  await expect(page.locator('.publication-meta strong')).toHaveCount(4);
  await expect(page.locator('.publication-meta .corresponding-author-marker')).toHaveCount(2);
  await expect(page.locator('.publication-meta strong').first()).toContainText('Hailun Yan');
  await expect(page.locator('.publication-year__count')).toHaveCount(0);
  await expect(page.locator('.publication-year__title').first()).toHaveText('2026');
});

test('publication detail preserves author markers and provides breadcrumb navigation', async ({ page }) => {
  await page.goto('/publication-detail.html?slug=sok-cryptanalysis-sha3-standard', { waitUntil: 'networkidle' });
  await expect(page.locator('.publication-authors strong').first()).toContainText('Hailun Yan');
  await expect(page.locator('.publication-authors .corresponding-author-marker')).toHaveCount(1);
  await expect(page.locator('.detail-breadcrumbs')).toContainText('Home');
  await expect(page.locator('.detail-breadcrumbs')).toContainText('Publications');
  await expect(page.locator('.detail-breadcrumbs [aria-current="page"]')).toHaveText('Publication details');
  await expect(page.locator('.footer-nav a[aria-current="page"]')).toHaveText('Publications');
});
