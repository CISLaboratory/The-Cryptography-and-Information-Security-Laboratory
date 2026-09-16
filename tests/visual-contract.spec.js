import { test, expect } from '@playwright/test';

const styledPages = [
  '/index.html',
  '/people.html',
  '/news.html',
  '/seminars.html',
  '/publications.html',
  '/contact.html',
  '/news-detail.html',
  '/seminar-detail.html',
  '/publication-detail.html'
];

test.describe('visual style loading contract', () => {
  for (const path of styledPages) {
    test(`${path} declares the visual layers in deterministic order`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });

      const styles = await page.locator('head link[rel="stylesheet"]').evaluateAll((links) =>
        links.map((link) => link.getAttribute('href'))
      );

      const structuralIndex = styles.indexOf('assets/css/styles.css');
      const professionalIndex = styles.indexOf('assets/css/professional.css');
      const polishIndex = styles.indexOf('assets/css/polish.css');
      const accessibilityIndex = styles.indexOf('assets/css/accessibility.css');

      expect(structuralIndex).toBeGreaterThanOrEqual(0);
      expect(professionalIndex).toBeGreaterThan(structuralIndex);
      expect(polishIndex).toBeGreaterThan(professionalIndex);
      expect(accessibilityIndex).toBeGreaterThan(polishIndex);
    });
  }
});

test('People keeps its visual hierarchy even when JavaScript is disabled', async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: testInfo.project.use.viewport
  });
  const page = await context.newPage();

  await page.goto('/people.html', { waitUntil: 'load' });

  await expect(page.locator('body')).toHaveAttribute('data-page', 'people');
  await expect(page.locator('#people-filter')).toBeVisible();

  const filterStyles = await page.locator('#people-filter').evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      appearance: styles.appearance,
      borderRadius: styles.borderRadius,
      minHeight: styles.minHeight,
      backgroundImage: styles.backgroundImage
    };
  });

  expect(filterStyles.appearance).toBe('none');
  expect(filterStyles.borderRadius).toBe('8px');
  expect(filterStyles.minHeight).toBe('42px');
  expect(filterStyles.backgroundImage).toContain('data:image/svg+xml');

  const controlsStyles = await page.locator('.table-controls').evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      backgroundColor: styles.backgroundColor,
      borderRadius: styles.borderRadius,
      borderStyle: styles.borderStyle
    };
  });

  expect(controlsStyles.backgroundColor).toBe('rgb(248, 250, 252)');
  expect(controlsStyles.borderRadius).toBe('12px');
  expect(controlsStyles.borderStyle).toBe('solid');

  await context.close();
});

test('home hero preserves restrained academic visual hierarchy', async ({ page }, testInfo) => {
  await page.goto('/index.html', { waitUntil: 'networkidle' });

  const heroStyles = await page.locator('.hero').evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      backgroundImage: styles.backgroundImage,
      color: styles.color
    };
  });

  expect(heroStyles.backgroundImage).toContain('linear-gradient');
  expect(heroStyles.color).toBe('rgb(255, 255, 255)');

  if (testInfo.project.name === 'desktop') {
    const title = page.locator('.hero-title--single-line');
    const metrics = await title.evaluate((element) => ({
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      height: element.getBoundingClientRect().height,
      lineHeight: Number.parseFloat(getComputedStyle(element).lineHeight)
    }));

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
    expect(metrics.height).toBeLessThanOrEqual(metrics.lineHeight * 1.15);
  }
});

test('publication archive keeps clean year headings without count badges', async ({ page }) => {
  await page.goto('/publications.html', { waitUntil: 'networkidle' });

  await expect(page.locator('.publication-year__count')).toHaveCount(0);
  await expect(page.locator('.publication-year__title').first()).toHaveText(/^\d{4}$/);

  const yearStyles = await page.locator('.publication-year__title').first().evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      backgroundColor: styles.backgroundColor,
      borderBottomStyle: styles.borderBottomStyle
    };
  });

  expect(yearStyles.backgroundColor).toBe('rgb(241, 244, 248)');
  expect(yearStyles.borderBottomStyle).toBe('solid');
});
