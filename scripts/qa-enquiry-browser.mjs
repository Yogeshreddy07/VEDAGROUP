// UI flow with intercepted delivery. Never sends a real enquiry or email.
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  let submissions = 0;
  await page.route('**/api/enquiry', async route => {
    submissions++;
    const payload = route.request().postDataJSON();
    assert.equal(payload.service, 'international-market-entry');
    assert.equal(payload.email, 'sample@example.com');
    assert.equal(payload.privacy, true);
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ mode: 'email', confirmationSent: true, message: 'Browser test accepted. Delivery was intercepted; no email sent.' }) });
  });
  await page.goto((process.env.QA_URL || 'http://127.0.0.1:3848') + '/contact?service=international-market-entry');
  const submit = page.locator('button[type="submit"]');
  await submit.click();
  assert.equal(submissions, 0);
  assert.ok(await page.locator('#name-error').isVisible());
  await page.locator('#name').fill('Sample Person');
  await page.locator('#email').fill('sample@example.com');
  await page.locator('.country-trigger').click();
  await page.locator('.country-search').fill('United Kingdom');
  await page.locator('.country-search').press('Enter');
  await page.locator('#phone').fill('020 7946 0958');
  await page.locator('#message').fill('A sample international opportunity for intercepted browser testing only.');
  await page.locator('[name=privacy]').check();
  await submit.click();
  await page.getByRole('status').filter({ hasText: 'Delivery was intercepted' }).waitFor();
  assert.equal(submissions, 1);
  assert.equal(await page.locator('#name').inputValue(), '');
  console.log('Enquiry browser QA passed: required fields, country/phone entry, service selection, payload, success display and reset. Delivery intercepted; no real email sent.');
} finally { await browser.close(); }
