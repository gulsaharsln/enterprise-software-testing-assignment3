// UTS Assignment 3: T003 / F3 – User Logout
// Tester: Taekyun Kim, 26145639. Every scenario runs with an isolated session.
import { Selector, ClientFunction } from 'testcafe';

const BASE = 'https://opencart.abstracta.us';
const route = (name) => `${BASE}/index.php?route=account/${name}`;
const pageUrl = ClientFunction(() => window.location.href);
const pageTitle = ClientFunction(() => document.title);
const PASSWORD = 'OpenCart2026Test!';

async function setupSignedInCustomer(t) {
  const email = `uts.taekyun.${Date.now()}${Math.random().toString(36).slice(2, 9)}@example.com`;
  await t.navigateTo(route('register'));
  await t.typeText('#input-firstname', 'UTS')
    .typeText('#input-lastname', 'Test')
    .typeText('#input-email', email)
    .typeText('#input-telephone', '0412345678')
    .typeText('#input-password', PASSWORD)
    .typeText('#input-confirm', PASSWORD)
    .click('input[name="agree"]')
    .click('#content input[type="submit"].btn-primary');
  await t.expect(pageUrl()).match(/route=account(?:\/|%2F)success/i);
  await t.expect(pageTitle()).match(/Your Account Has Been Created/i);
  // Registration creates an authenticated session in this demo.
  await t.navigateTo(route('account'));
  await t.expect(Selector('#content').innerText)
    .match(/Edit your account information|Edit Account|Edit your account/i);
}

async function assertSignedOut(t) {
  // A successful logout MUST revoke access to protected /account/account.
  await t.navigateTo(route('account'));
  await t.expect(Selector('#input-email').visible).ok('Logged-out user could still access account');
  await t.expect(Selector('#input-password').visible).ok();
  await t.expect(Selector('#content').innerText).match(/Returning Customer|Account Login/i);
}

fixture`T003 / F3 – Logout – Taekyun Kim (26145639)`
  .page(route('account'));

test('T003-S1: logout using My Account navigation', async t => {
  await setupSignedInCustomer(t);
  // Test user-facing menu, not just the server's logout URL.
  const accountMenu = Selector('#top-links a').withText(/My Account/i);
  await t.click(accountMenu);
  const menuLogout = Selector('#top-links a[href*="account/logout"], #top-links a[href*="account%2Flogout"]');
  if (await menuLogout.visible) {
    await t.click(menuLogout);
  } else {
    const sidebarLogout = Selector('#column-right a[href*="account/logout"], #column-right a[href*="account%2Flogout"]');
    await t.expect(sidebarLogout.visible).ok('Logout link not found in navigation');
    await t.click(sidebarLogout);
  }
  await t.expect(Selector('#content').innerText).match(/logged off|logged out/i);
  await t.takeScreenshot({ path: 'taekyun/T003-S1-logout-via-menu.png', fullPage: true });
  await assertSignedOut(t);
});

test('T003-S2: protect account after explicit logout', async t => {
  await setupSignedInCustomer(t);
  await t.navigateTo(route('logout'));
  await t.expect(Selector('#content').innerText).match(/logged off|logged out/i);
  await assertSignedOut(t);
  await t.takeScreenshot({ path: 'taekyun/T003-S2-account-blocked-after-logout.png', fullPage: true });
});

test('T003-S3: guest logout request does not grant authentication', async t => {
  // Guest fixture session; no account was registered or signed in.
  await t.navigateTo(route('logout'));
  await assertSignedOut(t);
  await t.takeScreenshot({ path: 'taekyun/T003-S3-guest-logout-safe.png', fullPage: true });
});
