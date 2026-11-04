const { test, expect } = require('@playwright/test');
const {
  ROOT, ROUTES, newAccount, goto, registerNew, logoutDirect,
  expectAuthenticated, expectGuestAccountDenied, evidence, recordFailure,
} = require('../lib/opencart');

test.describe('T003 - F3 User Logout (Taekyun Kim)', () => {
  test.afterEach(async ({ page }, info) => recordFailure(page, info));

  // Check the user-facing menu, not just a direct logout endpoint.
  test('T003-S1: logout through customer navigation menu', async ({ page }, info) => {
    await registerNew(page, newAccount());
    await goto(page, ROUTES.account);
    await expectAuthenticated(page);
    const menu = page.locator('#top-links a').filter({ hasText: /My Account/i }).first();
    await expect(menu).toBeVisible();
    await menu.click();
    const headerLogout = page.locator('#top-links a[href*="account/logout"], #top-links a[href*="account%2Flogout"]').first();
    if (await headerLogout.isVisible().catch(() => false)) {
      await headerLogout.click();
    } else {
      // On some responsive themes, the same logout control appears in account sidebar.
      const sideLogout = page.locator('#column-right a[href*="account/logout"], #column-right a[href*="account%2Flogout"]').first();
      await expect(sideLogout).toBeVisible();
      await sideLogout.click();
    }
    await evidence(page, info, 'T003-S1-logout-via-menu');
    await expect(page.locator('#content')).toContainText(/logged off|logged out/i);
    await expectGuestAccountDenied(page);
  });

  // Security check: a signed-out session cannot reopen protected account data.
  test('T003-S2: protected account denied after logout', async ({ page }, info) => {
    await registerNew(page, newAccount());
    await goto(page, ROUTES.account);
    await expectAuthenticated(page);
    await logoutDirect(page);
    await expectGuestAccountDenied(page);
    await evidence(page, info, 'T003-S2-account-blocked-after-logout');
  });

  // Negative check: calling logout as a guest must not confer login status.
  test('T003-S3: guest logout does not create an authenticated session', async ({ page }, info) => {
    await goto(page, ROUTES.logout);
    // Whether the demo shows the logout notice or a redirect, the protected account must stay blocked.
    await expectGuestAccountDenied(page);
    await evidence(page, info, 'T003-S3-guest-logout-safe');
  });
});
