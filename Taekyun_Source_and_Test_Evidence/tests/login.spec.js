const { test, expect } = require('@playwright/test');
const {
  ROUTES, newAccount, goto, registerNew, logoutDirect, login,
  expectAuthenticated, expectGuestAccountDenied, evidence, recordFailure,
} = require('../lib/opencart');

test.describe('T002 - F2 User Login (Taekyun Kim)', () => {
  test.afterEach(async ({ page }, info) => recordFailure(page, info));

  // Setup depends on successful F1; then check genuine authenticated access.
  test('T002-S1: login with valid registered credentials', async ({ page }, info) => {
    const account = newAccount();
    await registerNew(page, account);  // Setup dependency: F1 verified before F2.
    await logoutDirect(page);
    await login(page, account.email, account.password);
    await evidence(page, info, 'T002-S1-valid-login');
    await expectAuthenticated(page);
  });

  // Verify a registered email alone is insufficient for authentication.
  // T002-S2: A wrong password must NOT grant access to the customer account.
  // A banner is useful feedback but is not a reliable authentication oracle.
  test('T002-S2: reject a valid email with incorrect password', async ({ page }, info) => {
    const account = newAccount();
    await registerNew(page, account);
    await logoutDirect(page);
    await login(page, account.email, 'Wrong2026Password!');
    await evidence(page, info, 'T002-S2-wrong-password');

    // If credentials were accepted, the login form would no longer be present.
    await expect(page.locator('#input-email')).toBeVisible();
    await expect(page.locator('#input-password')).toBeVisible();
    await expect(page.locator('#content')).not.toContainText(/Edit your account information/i);

    // Record the actual feedback before navigation to the account page.
    const messages = (await page.locator('.alert, .text-danger, .invalid-feedback').allTextContents())
      .map(s => s.trim()).filter(Boolean);
    console.log('[T002-S2] Login attempt feedback:', messages.join(' | ') || '(none observed)');

    // Security assertion: a rejected login cannot access a protected account.
    // If the application mistakenly grants a session, this step MUST fail.
    await expectGuestAccountDenied(page);
  });

  // T002-S3: Blank fields must NOT grant a session. Browser-native HTML5
  // validation may block submit without showing a site-level alert element.
  test('T002-S3: reject empty email and password', async ({ page }, info) => {
    await goto(page, ROUTES.login);
    await page.locator('#content input[type="submit"].btn-primary').click();
    await evidence(page, info, 'T002-S3-empty-inputs');

    // The empty form remains available after the invalid submission.
    await expect(page.locator('#input-email')).toBeVisible();
    await expect(page.locator('#input-password')).toBeVisible();
    await expect(page.locator('#input-email')).toHaveValue('');
    await expect(page.locator('#input-password')).toHaveValue('');
    await expect(page.locator('#content')).not.toContainText(/Edit your account information/i);

    // Record feedback, then test protected account access independently.
    const messages = (await page.locator('.alert, .text-danger, .invalid-feedback').allTextContents())
      .map(s => s.trim()).filter(Boolean);
    console.log('[T002-S3] Blank login attempt feedback:', messages.join(' | ') || '(none observed)');

    // Core security behaviour: unauthenticated visitors cannot open My Account.
    await expectGuestAccountDenied(page);
  });
});
