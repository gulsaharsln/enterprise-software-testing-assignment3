/*
  Test Case T013 - Product Wishlist (Function F13)
  Tester : Meshwa Bhaveshbhai Chauhan
  Tool   : TestCafe (JavaScript)
  Website: https://opencart.abstracta.us/

  Scenario 1 (success): a logged-in user adds a product to the wishlist.
  Scenario 2 (failure): a guest (not logged in) cannot save a product to a wishlist.
  Scenario 3 (success): a logged-in user removes a product from the wishlist.

  Run with:  npm run test:wishlist
*/
import { Selector, Role, ClientFunction } from 'testcafe';

// ---------------------------------------------------------------------------
// Constants: page addresses and the product used in every scenario
// ---------------------------------------------------------------------------
const BASE_URL = 'https://opencart.abstracta.us/index.php?route=';
const HOME_URL = BASE_URL + 'common/home';
const WISHLIST_URL = BASE_URL + 'account/wishlist';
const REGISTER_URL = BASE_URL + 'account/register';

const PRODUCT_ID = '40';       // iPhone - a featured product shown on the homepage
const PRODUCT_NAME = 'iPhone';

// ---------------------------------------------------------------------------
// Selectors: how TestCafe finds elements on the page (CSS selectors, Lecture 9)
// ---------------------------------------------------------------------------
// The heart ("Add to Wish List") button calls wishlist.add('<product id>'), so that
// onclick text is a reliable way to find the button for one specific product.
const heartButton = Selector(`button[onclick*="wishlist.add('${PRODUCT_ID}')"]`);
const alertBox = Selector('div.alert');                          // message box at the top of the page
const wishlistHeaderLink = Selector('#wishlist-total');          // "Wish List (n)" link in the header
const wishlistRows = Selector('#content table tbody tr');        // one row per product in the wishlist
const removeButtons = Selector('#content a.btn-danger[href*="remove="]'); // red "Remove" (X) buttons
const pageContent = Selector('#content');                        // main content area of the page

// ClientFunctions run inside the browser and return page information
const getPageTitle = ClientFunction(() => document.title);
const getUrl = ClientFunction(() => window.location.href);

// ---------------------------------------------------------------------------
// Test user: one brand-new customer account is created for this test run.
// A Role logs in once and TestCafe re-uses the logged-in session in every test.
// ---------------------------------------------------------------------------
const testEmail = `qa.tester.${Date.now()}@example.com`; // the current time makes the email unique
const testPassword = 'Test@12345';

const registeredUser = Role(REGISTER_URL, async t => {
    await t
        .typeText('input[name="firstname"]', 'QA')
        .typeText('input[name="lastname"]', 'Tester')
        .typeText('input[name="email"]', testEmail)
        .typeText('input[name="telephone"]', '0400000000')
        .typeText('input[name="password"]', testPassword)
        .typeText('input[name="confirm"]', testPassword)
        .click('input[name="agree"]')                              // tick the Privacy Policy box
        .click('input[type="submit"][value="Continue"]')           // submit the registration form
        .expect(getUrl()).contains('account/success');             // registration worked
});

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

// Remove every product from the wishlist so each test starts from an empty wishlist
async function clearWishlist(t) {
    for (let i = 0; i < 20; i++) {                // safety limit so the loop can never run forever
        await t.navigateTo(WISHLIST_URL);
        if ((await removeButtons.count) === 0) {  // nothing left to remove
            return;
        }
        await t.click(removeButtons.nth(0));      // remove the first product in the list
    }
}

// Click the heart button on the homepage and wait for the message box to appear
async function addProductToWishlist(t) {
    await t
        .navigateTo(HOME_URL)
        .click(heartButton)
        .expect(alertBox.exists).ok();            // wait until the site has answered
}

// ===========================================================================
// Scenario 1 and 3 - logged-in user
// ===========================================================================
fixture('T013 - Product Wishlist (logged-in user)')
    .page(HOME_URL)
    .beforeEach(async t => {
        await t.useRole(registeredUser);          // log in as the test user
        await clearWishlist(t);                   // start with an empty wishlist
    });

// Scenario 1 - Add a product to the wishlist (success case)
test('T013 Scenario 1: Logged-in user adds a product to the wishlist', async t => {
    await addProductToWishlist(t);

    // Expected: success message names the product and mentions the wish list
    await t
        .expect(alertBox.innerText).contains(PRODUCT_NAME)
        .expect(alertBox.innerText).match(/wish list/i)
        // Expected: the header link now shows one item, e.g. "Wish List (1)"
        .expect(wishlistHeaderLink.withAttribute('title', /\(1\)/).exists).ok()
        .wait(1000)                               // let the page finish scrolling before the screenshot
        .takeScreenshot('T013_S1_added_message.png');

    // Expected: the Wish List page lists exactly one product - the iPhone
    await t
        .navigateTo(WISHLIST_URL)
        .expect(wishlistRows.count).eql(1)
        .expect(wishlistRows.nth(0).innerText).contains(PRODUCT_NAME)
        .takeScreenshot('T013_S1_wishlist_page.png');
});

// Scenario 3 - Remove a product from the wishlist (success case)
test('T013 Scenario 3: Logged-in user removes a product from the wishlist', async t => {
    await addProductToWishlist(t);                // put the iPhone on the wishlist first

    await t
        .navigateTo(WISHLIST_URL)
        .expect(wishlistRows.count).eql(1)        // precondition: one product is listed
        .takeScreenshot('T013_S3_before_remove.png')
        .click(removeButtons.nth(0))              // click the red Remove (X) button
        // Expected: a success message is shown ...
        .expect(alertBox.innerText).match(/success/i)
        // ... no products are left in the wishlist ...
        .expect(wishlistRows.count).eql(0)
        // ... and the page shows an "empty" message (this site words it "Your shopping cart is empty!")
        .expect(pageContent.innerText).match(/empty/i)
        // ... and the header link goes back to zero items, e.g. "Wish List (0)"
        .expect(wishlistHeaderLink.withAttribute('title', /\(0\)/).exists).ok()
        .wait(1000)
        .takeScreenshot('T013_S3_after_remove.png');
});

// ===========================================================================
// Scenario 2 - guest user (not logged in)
// ===========================================================================
fixture('T013 - Product Wishlist (guest user)')
    .page(HOME_URL);                              // no login: every test starts as a guest

// Scenario 2 - A guest tries to save a product (failure case)
test('T013 Scenario 2: Guest user cannot save a product to the wishlist', async t => {
    await addProductToWishlist(t);                // guest clicks the heart button on the iPhone

    // Expected: the message asks the guest to log in or create an account
    await t
        .expect(alertBox.innerText).match(/login/i)
        .wait(1000)
        .takeScreenshot('T013_S2_guest_message.png');

    // Expected: opening the Wish List page redirects the guest to the Account Login page
    await t
        .navigateTo(WISHLIST_URL)
        .expect(getUrl()).contains('account/login')
        .expect(getPageTitle()).eql('Account Login')
        .takeScreenshot('T013_S2_redirected_to_login.png');
});