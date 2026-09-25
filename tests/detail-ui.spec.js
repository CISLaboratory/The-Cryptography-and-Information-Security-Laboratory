import { test, expect } from '@playwright/test';

const detailPages = [
  '/news-detail.html?slug=anze-sun-presents-research-at-acisp-2026',
  '/seminar-detail.html?slug=alzette-64-bit-arx-box-design-analysis-2026-09-16',
  '/publication-detail.html?slug=sok-cryptanalysis-sha3-standard',
  '/contact.html'
];

for (const path of detailPages) {
  test(`${path} loads the focused detail style layer in the correct order`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });
    const styles = await page.locator('head link[rel="stylesheet"]').evaluateAll((links) =>
      links.map((link) => link.getAttribute('href'))
    );

    const polishIndex = styles.indexOf('assets/css/polish.css');
    const detailIndex = styles.findIndex((href) => href.split('?')[0] === 'assets/css/detail.css');
    const accessibilityIndex = styles.indexOf('assets/css/accessibility.css');

    expect(detailIndex).toBeGreaterThan(polishIndex);
    expect(detailIndex).toBeLessThan(accessibilityIndex);
  });
}

test('detail pages use a flat reading surface instead of a generic card', async ({ page }) => {
  await page.goto('/publication-detail.html?slug=sok-cryptanalysis-sha3-standard', { waitUntil: 'networkidle' });

  const styles = await page.locator('.detail-card').evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      borderStyle: computed.borderStyle,
      borderRadius: computed.borderRadius,
      boxShadow: computed.boxShadow,
      backgroundColor: computed.backgroundColor
    };
  });

  expect(styles.borderStyle).toBe('none');
  expect(styles.borderRadius).toBe('0px');
  expect(styles.boxShadow).toBe('none');
  expect(styles.backgroundColor).toBe('rgba(0, 0, 0, 0)');
});

test('contact details use editorial rows rather than a card shell', async ({ page }) => {
  await page.goto('/contact.html', { waitUntil: 'networkidle' });

  const row = page.locator('.contact-detail-row').first();
  const styles = await row.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      display: computed.display,
      borderBottomStyle: computed.borderBottomStyle
    };
  });

  expect(styles.display).toBe('grid');
  expect(styles.borderBottomStyle).toBe('solid');
  await expect(page.locator('.contact-card')).toHaveCount(0);
});
