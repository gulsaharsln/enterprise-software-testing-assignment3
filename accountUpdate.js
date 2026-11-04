/*
  Test Case T014 - Account Information Update (Function F14)
  Tester : Meshwa Bhaveshbhai Chauhan
  Tool   : TestCafe (JavaScript)
  Website: https://opencart.abstracta.us/

  Scenario 1 (success): update the first name and check it is saved.
  Scenario 2 (success): update the telephone number and check it is saved.
  Scenario 3 (failure): enter a telephone number that is too short - the update must be rejected.

  Run with:  npm run test:account
*/
import { Selector, Role, ClientFunction } from 'testcafe';

// ---------------------------------------------------------------------------
// Constants: page addresses
// ---------------------------------------------------------------------------
const BASE_URL = 'https://opencart.abstracta.us/index.php?route=';
const HOME_URL = BASE_URL + 'common/home';
const REGISTER_URL = BASE_URL + 'account/register';
const EDIT_URL = BASE_URL + 'account/edit';          // "Edit Account" page

// ---------------------------------------------------------------------------
// Selectors: how TestCafe finds elements on the page (CSS selectors, Lecture 9)
// ---------------------------------------------------------------------------
const firstNameField = Selector('#input-firstname');
const telephoneField = Selector('#input-telephone');
const continueButton = Selector('input[type="submit"][value="Continue"]');
const successAlert = Selector('div.alert-success');   // green "Success: ..." message
const errorMessages = Selector('.text-danger');       // red validation messages under a field

// ClientFunction: runs inside the browser and returns the current page address
const getUrl = ClientFunction(() => window.location.href);

// ---------------------------------------------------------------------------
// Test user: one brand-new customer account is created for this test run.
// A Role logs in once and TestCafe re-uses the logged-in session in every test,
// so no real account or password is stored in this file.
// ---------------------------------------------------------------------------
const testEmail = `qa.tester.${Date.now()}@example.com`;  // the current time makes the email unique
const testPassword = 'Test@12345';

const registeredUser = Role(REGISTER_URL, async t => {
    await t
        .typeText('input[name="firstname"]', 'QA')
        .typeText('input[name="lastname"]', 'Tester')
        .typeText('input[name="email"]', testEmail)
        .typeText('input[name="telephone"]', '0400000000')
        .typeText('input[name="password"]', testPassword)
        .typeText('input[name="confirm"]', testPassword)
        .click('input[name="agree"]')                         // tick the Privacy Policy box
        .click('input[type="submit"][value="Continue"]')      // submit the registration form
        .expect(getUrl()).contains('account/success');        // registration worked
});

// Before every test: log in as the test user and open the Edit Account page
fixture('T014 - Account Information Update')
    .page(HOME_URL)
    .beforeEach(async t => {
        await t.useRole(registeredUser);
        await t.navigateTo(EDIT_URL);
    });

// ---------------------------------------------------------------------------
// Scenario 1 - Update first name (success case)
// ---------------------------------------------------------------------------
test('T014 Scenario 1: Update first name', async t => {
    const newFirstName = 'QAUpdated';                          // input

    await t
        .typeText(firstNameField, newFirstName, { replace: true })   // replace the old first name
        .click(continueButton)
        // Expected: a success message is displayed
        .expect(successAlert.innerText).match(/success/i)
        .wait(1000)                                            // let the page finish scrolling before the screenshot
        .takeScreenshot('T014_S1_success_message.png')
        // Expected: the new first name is saved - re-open the page and check the field
        .navigateTo(EDIT_URL)
        .expect(firstNameField.value).eql(newFirstName)
        .takeScreenshot('T014_S1_saved_first_name.png');
});

// ---------------------------------------------------------------------------
// Scenario 2 - Update telephone number (success case)
// ---------------------------------------------------------------------------
test('T014 Scenario 2: Update telephone number', async t => {
    const newTelephone = '0400002000';                         // input

    await t
        .typeText(telephoneField, newTelephone, { replace: true })
        .click(continueButton)
        // Expected: a success message is displayed
        .expect(successAlert.innerText).match(/success/i)
        .wait(1000)
        .takeScreenshot('T014_S2_success_message.png')
        // Expected: the new telephone number is saved
        .navigateTo(EDIT_URL)
        .expect(telephoneField.value).eql(newTelephone)
        .takeScreenshot('T014_S2_saved_telephone.png');
});

// ---------------------------------------------------------------------------
// Scenario 3 - Telephone number that is too short (failure case)
// ---------------------------------------------------------------------------
test('T014 Scenario 3: Reject a telephone number that is too short', async t => {
    const invalidTelephone = '12';                             // input: only 2 characters

    await t
        .typeText(telephoneField, invalidTelephone, { replace: true })
        .click(continueButton)
        // Expected: a red error message about the telephone number is shown ...
        .expect(errorMessages.innerText).match(/telephone/i)
        // ... and no success message appears (the update is not saved)
        .expect(successAlert.exists).notOk()
        .takeScreenshot('T014_S3_error_message.png');
});