import { test, expect } from '@playwright/test';

test('desktop navigation underline matches the text content width', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');

  await page.goto('/people.html', { waitUntil: 'networkidle' });

  const activeLink = page.locator('.nav-links a[aria-current="page"]');
  const metrics = await activeLink.evaluate((element) => {
    const linkStyles = getComputedStyle(element);
    const markerStyles = getComputedStyle(element, '::after');
    const linkWidth = element.getBoundingClientRect().width;
    const horizontalPadding =
      parseFloat(linkStyles.paddingLeft) + parseFloat(linkStyles.paddingRight);

    return {
      markerWidth: parseFloat(markerStyles.width),
      textContentWidth: linkWidth - horizontalPadding,
      markerHeight: markerStyles.height
    };
  });

  expect(metrics.markerHeight).toBe('2px');
  expect(Math.abs(metrics.markerWidth - metrics.textContentWidth)).toBeLessThanOrEqual(1.5);
});
