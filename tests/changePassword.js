/*
  Test Case T015 - Change Password (Function F15)
  Tester : Meshwa Bhaveshbhai Chauhan
  Tool   : TestCafe (JavaScript)
  Website: https://opencart.abstracta.us/

  Scenario 1 (success): change the password with matching confirmation.
  Scenario 2 (failure): password and confirmation do not match - the change must be rejected.
  Scenario 3 (success): after changing the password, log in with the NEW password.

  Run with:  npm run test:password
*/
import { Selector, Role, ClientFunction } from 'testcafe';

// ---------------------------------------------------------------------------
// Constants: page addresses
// ---------------------------------------------------------------------------
const BASE_URL = 'https://opencart.abstracta.us/index.php?route=';
const HOME_URL = BASE_URL + 'common/home';
const REGISTER_URL = BASE_URL + 'account/register';
const LOGIN_URL = BASE_URL + 'account/login';
const PASSWORD_URL = BASE_URL + 'account/password';   // "Change Password" page

// ---------------------------------------------------------------------------
// Selectors: how TestCafe finds elements on the page (CSS selectors, Lecture 9)
// ---------------------------------------------------------------------------
const passwordField = Selector('#input-password');
const confirmField = Selector('#input-confirm');
const continueButton = Selector('input[type="submit"][value="Continue"]');
const successAlert = Selector('div.alert-success');   // green "Success: ..." message
const errorMessages = Selector('.text-danger');       // red validation messages under a field

// ClientFunction: runs inside the browser and returns the current page address
const getUrl = ClientFunction(() => window.location.href);

// ---------------------------------------------------------------------------
// Test user: one brand-new customer account is created for this test run, so the
// password changes below never touch a real account (and the test can be re-run).
// ---------------------------------------------------------------------------
const testEmail = `qa.tester.${Date.now()}@example.com`;  // the current time makes the email unique
const originalPassword = 'Test@123456';
const newPassword = 'Test@12345';

const registeredUser = Role(REGISTER_URL, async t => {
    await t
        .typeText('input[name="firstname"]', 'QA')
        .typeText('input[name="lastname"]', 'Tester')
        .typeText('input[name="email"]', testEmail)
        .typeText('input[name="telephone"]', '0400000000')
        .typeText('input[name="password"]', originalPassword)
        .typeText('input[name="confirm"]', originalPassword)
        .click('input[name="agree"]')                         // tick the Privacy Policy box
        .click('input[type="submit"][value="Continue"]')      // submit the registration form
        .expect(getUrl()).contains('account/success');        // registration worked
});

// Before every test: log in as the test user and open the Change Password page
fixture('T015 - Change Password')
    .page(HOME_URL)
    .beforeEach(async t => {
        await t.useRole(registeredUser);
        await t.navigateTo(PASSWORD_URL);
    });

// ---------------------------------------------------------------------------
// Scenario 1 - Change password successfully (success case)
// ---------------------------------------------------------------------------
test('T015 Scenario 1: Change password successfully', async t => {
    await t
        .typeText(passwordField, newPassword)                  // input: new password
        .typeText(confirmField, newPassword)                   // input: same password again
        .click(continueButton)
        // Expected: a success message is displayed
        .expect(successAlert.innerText).match(/success/i)
        .wait(1000)                                            // let the page finish scrolling before the screenshot
        .takeScreenshot('T015_S1_success_message.png');
});

// ---------------------------------------------------------------------------
// Scenario 2 - Password confirmation does not match (failure case)
// ---------------------------------------------------------------------------
test('T015 Scenario 2: Reject a password confirmation that does not match', async t => {
    await t
        .typeText(passwordField, 'ABC123456')                  // input: new password
        .typeText(confirmField, 'XYZ123456')                   // input: DIFFERENT confirmation
        .click(continueButton)
        // Expected: a red error message says the confirmation does not match ...
        .expect(errorMessages.innerText).match(/match/i)
        // ... and no success message appears (the password is not changed)
        .expect(successAlert.exists).notOk()
        .takeScreenshot('T015_S2_error_message.png');
});

// ---------------------------------------------------------------------------
// Scenario 3 - Log in with the new password (success case)
// This scenario sets the new password itself, so it does not depend on Scenario 1.
// ---------------------------------------------------------------------------
test('T015 Scenario 3: Log in using the new password', async t => {
    // Step 1: make sure the account password is the new password
    await t
        .typeText(passwordField, newPassword)
        .typeText(confirmField, newPassword)
        .click(continueButton)
        .expect(successAlert.innerText).match(/success/i);

    // Step 2: become a guest again (clears the logged-in session)
    await t.useRole(Role.anonymous());

    // Step 3: log in through the login form using the NEW password
    await t
        .navigateTo(LOGIN_URL)
        .typeText('#input-email', testEmail)
        .typeText('#input-password', newPassword)
        .click('input[type="submit"][value="Login"]')
        // Expected: login succeeds and the My Account page is displayed
        .expect(getUrl()).contains('account/account')
        .expect(Selector('h2').withText('My Account').exists).ok()
        .takeScreenshot('T015_S3_login_with_new_password.png');
});