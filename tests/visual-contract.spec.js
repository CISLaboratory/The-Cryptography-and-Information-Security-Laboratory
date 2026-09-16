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
  expect(controlsStyles.borderRadius).toBe('8px');
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
    const whiteSpace = await page.locator('.hero-title--single-line').evaluate(
      (element) => getComputedStyle(element).whiteSpace
    );
    expect(whiteSpace).toBe('nowrap');

    const overflow = await page.evaluate(() =>
      Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
    );
    expect(overflow).toBeLessThanOrEqual(1);
  }
});

test('Home section headings stay concise without redundant labels or helper copy', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'networkidle' });

  const newsSection = page.locator('#news');
  await expect(newsSection.locator('.section-heading h2')).toHaveText('Latest News');
  await expect(newsSection.locator('.section-kicker')).toHaveCount(0);
  await expect(newsSection.getByText('Recent updates published by CIS-Lab.', { exact: true })).toHaveCount(0);

  const publicationsSection = page.locator('#publications');
  await expect(publicationsSection.locator('.section-heading h2')).toHaveText('Selected Publications');
  await expect(publicationsSection.locator('.section-kicker')).toHaveCount(0);
  await expect(
    publicationsSection.getByText('Recent publications involving current CIS-Lab students.', { exact: true })
  ).toHaveCount(0);

  const exploreSection = page.locator('section[aria-labelledby="explore-title"]');
  await expect(exploreSection.locator('#explore-title')).toHaveText('Explore CIS-Lab');
  await expect(exploreSection.locator('.section-kicker')).toHaveCount(0);
});

test('home publications use flat academic-list styling', async ({ page }) => {
  await page.goto('/index.html', { waitUntil: 'networkidle' });

  const listStyles = await page.locator('#home-publications-list').evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      display: styles.display,
      borderTopStyle: styles.borderTopStyle
    };
  });
  expect(listStyles.display).toBe('block');
  expect(listStyles.borderTopStyle).toBe('solid');

  const entryStyles = await page.locator('.home-publication-entry').first().evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      borderBottomStyle: styles.borderBottomStyle,
      borderRadius: styles.borderRadius,
      boxShadow: styles.boxShadow
    };
  });
  expect(entryStyles.borderBottomStyle).toBe('solid');
  expect(entryStyles.borderRadius).toBe('0px');
  expect(entryStyles.boxShadow).toBe('none');
});

test('publication archive keeps clean editorial year headings without count badges', async ({ page }) => {
  await page.goto('/publications.html', { waitUntil: 'networkidle' });

  await expect(page.locator('.publication-year__count')).toHaveCount(0);
  await expect(page.locator('.publication-year__title').first()).toHaveText(/^\d{4}$/);

  const yearStyles = await page.locator('.publication-year__title').first().evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      backgroundColor: styles.backgroundColor,
      borderBottomStyle: styles.borderBottomStyle,
      borderBottomWidth: styles.borderBottomWidth,
      paddingTop: styles.paddingTop,
      paddingBottom: styles.paddingBottom,
      lineHeight: styles.lineHeight
    };
  });

  expect(yearStyles.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  expect(yearStyles.borderBottomStyle).toBe('solid');
  expect(yearStyles.borderBottomWidth).toBe('2px');
  expect(parseFloat(yearStyles.paddingTop)).toBeGreaterThan(10);
  expect(parseFloat(yearStyles.paddingBottom)).toBeGreaterThan(10);
  expect(parseFloat(yearStyles.lineHeight)).toBeGreaterThan(20);

  const sectionStyles = await page.locator('.publication-year').first().evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      paddingLeft: styles.paddingLeft,
      paddingRight: styles.paddingRight
    };
  });

  expect(parseFloat(sectionStyles.paddingLeft)).toBeGreaterThanOrEqual(16);
  expect(parseFloat(sectionStyles.paddingRight)).toBeGreaterThanOrEqual(16);
});

test('archive filters share one restrained visual language', async ({ page }) => {
  for (const [path, selector] of [
    ['/people.html', '#people-filter'],
    ['/news.html', '#news-year'],
    ['/seminars.html', '#seminar-year']
  ]) {
    await page.goto(path, { waitUntil: 'networkidle' });
    const styles = await page.locator(selector).evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        appearance: computed.appearance,
        minHeight: computed.minHeight,
        borderRadius: computed.borderRadius,
        backgroundImage: computed.backgroundImage
      };
    });

    expect(styles.appearance).toBe('none');
    expect(styles.minHeight).toBe('42px');
    expect(styles.borderRadius).toBe('8px');
    expect(styles.backgroundImage).toContain('data:image/svg+xml');
  }
});

test('desktop navigation uses a text-first current-page treatment', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  await page.goto('/people.html', { waitUntil: 'networkidle' });
  const activeLink = page.locator('.nav-links a[aria-current="page"]');
  const styles = await activeLink.evaluate((element) => {
    const computed = getComputedStyle(element);
    const marker = getComputedStyle(element, '::after');
    return {
      borderRadius: computed.borderRadius,
      backgroundColor: computed.backgroundColor,
      markerDisplay: marker.display,
      markerHeight: marker.height
    };
  });

  expect(styles.borderRadius).toBe('0px');
  expect(styles.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  expect(styles.markerDisplay).toBe('block');
  expect(styles.markerHeight).toBe('2px');
});

test('People presents member rows as compact cards on mobile', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.goto('/people.html', { waitUntil: 'networkidle' });

  const row = page.locator('.people-table tbody tr:not(.people-group-row)').first();
  const rowStyles = await row.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      display: styles.display,
      borderStyle: styles.borderStyle,
      borderRadius: styles.borderRadius
    };
  });

  expect(rowStyles.display).toBe('block');
  expect(rowStyles.borderStyle).toBe('solid');
  expect(rowStyles.borderRadius).toBe('8px');

  const firstCell = row.locator('td').first();
  const firstCellStyles = await firstCell.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      display: styles.display,
      backgroundColor: styles.backgroundColor
    };
  });

  expect(firstCellStyles.display).toBe('block');
  expect(firstCellStyles.backgroundColor).toBe('rgb(251, 252, 254)');
});
