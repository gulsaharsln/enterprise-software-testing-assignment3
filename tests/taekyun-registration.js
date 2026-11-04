// UTS Assignment 3: T001 / F1 – User Registration
// Tester: Taekyun Kim, 26145639. TestCafe 3.7.6; OpenCart demo only.
// Three scenarios: valid account, mismatched confirmation, missing consent.
import { Selector, ClientFunction } from 'testcafe';

const BASE = 'https://opencart.abstracta.us';
const REGISTER = `${BASE}/index.php?route=account/register`;
const pageUrl = ClientFunction(() => window.location.href);
const pageTitle = ClientFunction(() => document.title);
const PASSWORD = 'OpenCart2026Test!';

function account() {
  // Unique synthetic address for every attempt; avoids duplicate-email false failures.
  return {
    first: 'UTS', last: 'Test', telephone: '0412345678',
    email: `uts.taekyun.${Date.now()}${Math.random().toString(36).slice(2, 9)}@example.com`,
    password: PASSWORD,
  };
}

async function fillForm(t, data, { confirmation = data.password, consent = true } = {}) {
  await t.typeText('#input-firstname', data.first)
    .typeText('#input-lastname', data.last)
    .typeText('#input-email', data.email)
    .typeText('#input-telephone', data.telephone)
    .typeText('#input-password', data.password)
    .typeText('#input-confirm', confirmation);
  if (consent) await t.click(Selector('input[name="agree"]'));
  await t.click('#content input[type="submit"].btn-primary');
}

fixture`T001 / F1 – Registration – Taekyun Kim (26145639)`
  .page(REGISTER);

test('T001-S1: valid new registration', async t => {
  await fillForm(t, account(), { consent: true });
  // The OpenCart success page may have H1 = Account: check URL and browser TITLE.
  await t.expect(pageUrl()).match(/route=account(?:\/|%2F)success/i);
  await t.expect(pageTitle()).match(/Your Account Has Been Created/i);
  await t.expect(Selector('#content').innerText)
    .match(/congratulations|successfully created|created/i);
  await t.takeScreenshot({ path: 'taekyun/T001-S1-valid-registration.png', fullPage: true });
});

test('T001-S2: reject mismatched password confirmation', async t => {
  await fillForm(t, account(), {
    confirmation: 'Different2026Test!', consent: true,
  });
  // Verify a specific validation error, not just the presence of the form.
  const mismatch = Selector('.text-danger, .alert-danger')
    .withText(/password|confirm|match/i);
  await t.expect(mismatch.exists).ok('Password mismatch warning was not found');
  await t.expect(Selector('#input-confirm').visible).ok();
  await t.expect(pageUrl()).notMatch(/route=account(?:\/|%2F)success/i);
  await t.takeScreenshot({ path: 'taekyun/T001-S2-password-mismatch.png', fullPage: true });
});

test('T001-S3: reject missing Privacy Policy consent', async t => {
  await fillForm(t, account(), { consent: false });
  // The warning is often outside #content. Search the entire document.
  const privacyWarning = Selector('.alert-danger, .text-danger')
    .withText(/Privacy Policy|consent|must agree|terms/i);
  await t.expect(privacyWarning.exists)
    .ok('No Privacy Policy validation message was visible');
  await t.expect(Selector('input[name="agree"]').checked).notOk();
  await t.expect(pageUrl()).notMatch(/route=account(?:\/|%2F)success/i);
  await t.takeScreenshot({ path: 'taekyun/T001-S3-missing-consent.png', fullPage: true });
});
