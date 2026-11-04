// UTS Assignment 3: T002 / F2 – User Login
// Tester: Taekyun Kim, 26145639. Each scenario has its own browser session.
// F1 registration supplies a valid customer for the positive and wrong-password tests.
import { Selector, ClientFunction } from 'testcafe';

const BASE = 'https://opencart.abstracta.us';
const route = (name) => `${BASE}/index.php?route=account/${name}`;
const pageUrl = ClientFunction(() => window.location.href);
const pageTitle = ClientFunction(() => document.title);
const PASSWORD = 'OpenCart2026Test!';

function newCustomer() {
  return {
    email: `uts.taekyun.${Date.now()}${Math.random().toString(36).slice(2, 9)}@example.com`,
    password: PASSWORD,
  };
}

async function registerAndLogout(t, customer) {
  await t.navigateTo(route('register'));
  await t.typeText('#input-firstname', 'UTS')
    .typeText('#input-lastname', 'Test')
    .typeText('#input-email', customer.email)
    .typeText('#input-telephone', '0412345678')
    .typeText('#input-password', customer.password)
    .typeText('#input-confirm', customer.password)
    .click('input[name="agree"]')
    .click('#content input[type="submit"].btn-primary');
  // Do NOT proceed to F2 if F1 failed.
  await t.expect(pageUrl()).match(/route=account(?:\/|%2F)success/i);
  await t.expect(pageTitle()).match(/Your Account Has Been Created/i);
  await t.navigateTo(route('logout'));
  await t.expect(Selector('#content').innerText).match(/logged off|logged out/i);
}

async function submitLogin(t, email, password) {
  await t.navigateTo(route('login'));
  if (email) await t.typeText('#input-email', email);
  if (password) await t.typeText('#input-password', password);
  await t.click('#content input[type="submit"].btn-primary');
}

async function assertGuestCannotOpenAccount(t) {
  // Protect against false PASS: the account page must still require sign-in.
  await t.navigateTo(route('account'));
  await t.expect(Selector('#input-email').visible).ok('Guest could access customer account');
  await t.expect(Selector('#input-password').visible).ok();
  await t.expect(Selector('#content').innerText).match(/Returning Customer|Account Login/i);
}

fixture`T002 / F2 – Login – Taekyun Kim (26145639)`
  .page(route('login'));

test('T002-S1: accept valid registered credentials', async t => {
  const user = newCustomer();
  await registerAndLogout(t, user);
  await submitLogin(t, user.email, user.password);
  await t.expect(Selector('#content').innerText).match(/My Account/i);
  await t.expect(Selector('#content').innerText)
    .match(/Edit your account information|Edit Account|Edit your account/i);
  await t.takeScreenshot({ path: 'taekyun/T002-S1-valid-login.png', fullPage: true });
});

test('T002-S2: reject a valid email with incorrect password', async t => {
  const user = newCustomer();
  await registerAndLogout(t, user);
  await submitLogin(t, user.email, 'Wrong2026Password!');
  await t.expect(Selector('#input-email').visible).ok();
  await t.expect(Selector('#input-password').visible).ok();
  // Check the actual global warning (OpenCart's warning can sit outside #content).
  const warning = Selector('.alert-danger, .text-danger')
    .withText(/No match for E-Mail Address and\/or Password|incorrect|invalid/i);
  await t.expect(warning.exists).ok('Expected incorrect-credentials warning not found');
  await t.takeScreenshot({ path: 'taekyun/T002-S2-wrong-password.png', fullPage: true });
  await assertGuestCannotOpenAccount(t);
});

test('T002-S3: reject blank email and password', async t => {
  await submitLogin(t, '', '');
  await t.expect(Selector('#input-email').visible).ok();
  await t.expect(Selector('#input-password').visible).ok();
  await t.expect(Selector('#input-email').value).eql('');
  await t.expect(Selector('#input-password').value).eql('');
  // Application warning OR browser-native constraint is acceptable, but authentication
  // must still be denied. The protected-page check is the primary security oracle.
  await t.takeScreenshot({ path: 'taekyun/T002-S3-empty-inputs.png', fullPage: true });
  await assertGuestCannotOpenAccount(t);
});
