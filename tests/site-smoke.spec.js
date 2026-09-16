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

    const overflow = await page.evaluate(() =>
      Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

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

  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('publication lists emphasize current student authors', async ({ page }) => {
  await page.goto('/publications.html', { waitUntil: 'networkidle' });
  await expect(page.locator('.publication-meta strong')).toHaveCount(2);
});
