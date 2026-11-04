const { test, expect } = require('@playwright/test');
const {
  ROUTES, newAccount, goto, fillRegistration, expectRegistered,
  evidence, recordFailure,
} = require('../lib/opencart');

test.describe('T001 - F1 User Registration (Taekyun Kim)', () => {
  test.afterEach(async ({ page }, info) => recordFailure(page, info));

  // Positive path: a unique, complete account must reach the success page.
  test('T001-S1: accept a valid, unique registration', async ({ page }, info) => {
    const account = newAccount();
    await goto(page, ROUTES.register);
    await fillRegistration(page, account, { agree: true });
    await evidence(page, info, 'T001-S1-valid-registration');
    await expectRegistered(page);
    await expect(page.locator('#content')).toContainText(/congratulations|successfully created|created/i);
  });

  // Negative path: different passwords must be rejected by field validation.
  test('T001-S2: reject mismatched confirmation', async ({ page }, info) => {
    const account = newAccount();
    await goto(page, ROUTES.register);
    await fillRegistration(page, account, { confirm: 'Different2026Test!', agree: true });
    await evidence(page, info, 'T001-S2-password-mismatch');
    await expect(page.locator('#input-confirm')).toBeVisible();
    const feedback = page.locator('#content .text-danger, #content .alert-danger');
    await expect(feedback.filter({ hasText: /password|confirm|match/i }).first()).toBeVisible();
    await expect(page.locator('#content h1')).not.toContainText(/Your Account Has Been Created/i);
  });

  // Negative path: refusing policy consent must not create an account.
  test('T001-S3: reject missing Privacy Policy consent', async ({ page }, info) => {
    const account = newAccount();
    await goto(page, ROUTES.register);
    await fillRegistration(page, account, { agree: false });
    await evidence(page, info, 'T001-S3-missing-consent');
    await expect(page.locator('#content h1')).not.toContainText(/Your Account Has Been Created/i);
    await expect(page.locator('input[name="agree"]')).not.toBeChecked();
    await expect(page.locator('#content input[type="submit"].btn-primary')).toBeVisible();
    const warning = page.locator('.alert-danger, .text-danger, .invalid-feedback');
    const warningMessages = (await warning.allTextContents()).join(' ');
    const html5Missing = await page.locator('input[name="agree"]').evaluate(el => el.validity.valueMissing);
    if (!/privacy policy|consent|agree|terms/i.test(warningMessages) && !html5Missing) {
      throw new Error(`Registration remained open, but no privacy-policy validation was observable. Feedback: ${warningMessages || '(none)'}`);
    }
  });
});
