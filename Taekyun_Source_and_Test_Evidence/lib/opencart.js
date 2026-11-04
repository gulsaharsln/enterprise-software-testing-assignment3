const { expect } = require('@playwright/test');
const { randomBytes } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.env.OPENCART_BASE_URL || 'https://opencart.abstracta.us';
const ROUTES = Object.freeze({
  register: '/index.php?route=account/register',
  login: '/index.php?route=account/login',
  account: '/index.php?route=account/account',
  logout: '/index.php?route=account/logout',
});
const DEFAULT_PASS = 'OpenCart2026Test!';
const EVIDENCE_DIR = path.join(process.cwd(), 'evidence', 'screenshots');

function newAccount() {
  // Reserved example.com is synthetic; if a demo rejects it, set TEST_EMAIL_DOMAIN
  // to a domain under your control (do not use an unsuspecting person's address).
  const domain = process.env.TEST_EMAIL_DOMAIN || 'example.com';
  if (!/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
    throw new Error(`Invalid TEST_EMAIL_DOMAIN: ${domain}`);
  }
  const suffix = `${Date.now()}${randomBytes(4).toString('hex')}`;
  return {
    firstName: 'UTS', lastName: 'Test', telephone: '0412345678',
    email: `uts.taekyun.${suffix}@${domain}`,
    password: DEFAULT_PASS,
  };
}

async function diagnostic(page) {
  let url = '(unavailable)', title = '', heading = '', messages = '';
  try { url = page.url(); } catch (_) {}
  try { title = await page.title(); } catch (_) {}
  try { heading = (await page.locator('h1').allTextContents()).join(' | '); } catch (_) {}
  try {
    messages = (await page.locator('.alert, .alert-danger, .text-danger, .invalid-feedback, .error').allTextContents()).join(' | ');
  } catch (_) {}
  return { url, title, heading, messages };
}

async function goto(page, route) {
  const url = `${ROOT}${route}`;
  let response;
  try {
    response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  } catch (err) {
    throw new Error(`SITE/NETWORK ERROR loading ${url}: ${err.message}`);
  }
  if (!response || response.status() >= 400) {
    throw new Error(`SITE/NETWORK ERROR: ${url} returned HTTP ${response ? response.status() : 'no response'}`);
  }
  await expect(page.locator('#content')).toBeVisible({ timeout: 18000 });
}

async function fillRegistration(page, account, { confirm = account.password, agree = true } = {}) {
  await page.locator('#input-firstname').fill(account.firstName);
  await page.locator('#input-lastname').fill(account.lastName);
  await page.locator('#input-email').fill(account.email);
  await page.locator('#input-telephone').fill(account.telephone);
  await page.locator('#input-password').fill(account.password);
  await page.locator('#input-confirm').fill(confirm);
  const privacy = page.locator('input[name="agree"]');
  if (agree) await privacy.check();
  else if (await privacy.isChecked()) await privacy.uncheck();
  await page.locator('#content input[type="submit"].btn-primary').click();
}

async function expectRegistered(page) {
  // OpenCart's <h1> may be "Account" even on a successful registration.
  // Confirm BOTH the successful navigation and browser title instead.
  try {
    await expect(page).toHaveURL(/route=account(?:\/|%2F)success(?:&|$)/i, { timeout: 15000 });
    await expect(page).toHaveTitle(/Your Account Has Been Created/i, { timeout: 15000 });
  } catch (e) {
    const d = await diagnostic(page);
    throw new Error(`Registration was NOT verified.\n${JSON.stringify(d, null, 2)}\n${e.message}`);
  }
}

async function registerNew(page, account) {
  await goto(page, ROUTES.register);
  await fillRegistration(page, account, { agree: true });
  await expectRegistered(page);
  return account;
}

async function logoutDirect(page) {
  await goto(page, ROUTES.logout);
  await expect(page.locator('#content')).toContainText(/logged off|logged out/i);
}

async function login(page, email, password) {
  await goto(page, ROUTES.login);
  await page.locator('#input-email').fill(email);
  await page.locator('#input-password').fill(password);
  await page.locator('#content input[type="submit"].btn-primary').click();
}

async function expectAuthenticated(page) {
  // Authenticated dashboard, not merely a success-looking green message.
  await expect(page.locator('#content')).toContainText(/My Account/i);
  await expect(page.locator('#content')).toContainText(/Edit your account information|Edit Account|Edit your account/i);
}

async function expectGuestAccountDenied(page) {
  await goto(page, ROUTES.account);
  await expect(page.locator('#input-email')).toBeVisible();
  await expect(page.locator('#input-password')).toBeVisible();
  await expect(page.locator('#content')).toContainText(/Returning Customer|Account Login/i);
}

async function evidence(page, testInfo, label) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  const filename = `${label}.png`;
  const target = path.join(EVIDENCE_DIR, filename);
  try {
    await page.screenshot({ path: target, fullPage: true, timeout: 15000 });
    await testInfo.attach(`Browser result ${label}`, { path: target, contentType: 'image/png' });
  } catch (e) {
    console.warn(`[SCREENSHOT] ${label}: ${e.message}`);
  }
}

async function recordFailure(page, testInfo) {
  if (testInfo.status === testInfo.expectedStatus) return;
  const state = await diagnostic(page);
  const target = testInfo.outputPath('diagnostic.json');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify({ test: testInfo.title, ...state }, null, 2), 'utf8');
  console.error(`[${testInfo.title}] Diagnostic: ${JSON.stringify(state)}`);
  await testInfo.attach('Page diagnostic', { path: target, contentType: 'application/json' });
}

module.exports = {
  ROOT, ROUTES, DEFAULT_PASS, newAccount, diagnostic, goto, fillRegistration,
  expectRegistered, registerNew, logoutDirect, login, expectAuthenticated,
  expectGuestAccountDenied, evidence, recordFailure,
};
