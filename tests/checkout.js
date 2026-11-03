import { Selector } from 'testcafe';

fixture('Checkout')
    .page('https://opencart.abstracta.us/');

// Scenario 1: Proceed to checkout with a valid product in the cart
test('Proceed to checkout with product in cart', async t => {
    const quantityInput = Selector('#input-quantity');
    const addToCartButton = Selector('#button-cart');

    await t
        .navigateTo('https://opencart.abstracta.us/index.php?route=product/product&product_id=40')
        .expect(Selector('#content h1').innerText)
        .eql('iPhone')
        .selectText(quantityInput)
        .typeText(quantityInput, '1')
        .click(addToCartButton)
        .navigateTo('https://opencart.abstracta.us/index.php?route=checkout/checkout')
        .expect(t.eval(() => window.location.href))
        .contains('route=checkout/checkout')
        .expect(Selector('#content h1').innerText)
        .contains('Checkout')
        .takeScreenshot();
});

// Scenario 2: Attempt to continue guest checkout without required details
test('Guest checkout validation for empty required fields', async t => {
    const quantityInput = Selector('#input-quantity');
    const addToCartButton = Selector('#button-cart');

    await t
        .navigateTo('https://opencart.abstracta.us/index.php?route=product/product&product_id=40')
        .selectText(quantityInput)
        .typeText(quantityInput, '1')
        .click(addToCartButton)
        .navigateTo('https://opencart.abstracta.us/index.php?route=checkout/checkout');

    const guestRadio = Selector('input[name="account"][value="guest"]');
    const accountContinueButton = Selector('#button-account');

    await t
        .expect(guestRadio.exists)
        .ok('Guest checkout option should be available')
        .click(guestRadio)
        .click(accountContinueButton);

    const guestContinueButton = Selector('#button-guest');

    // Remove Bitnami hosting banner because it obstructs
    // the OpenCart Guest Checkout Continue button.
    await t.eval(() => {
        const banner = document.querySelector('#bitnami-banner');

        if (banner) {
            banner.remove();
        }
    });

    await t
        .expect(guestContinueButton.exists)
        .ok('Guest details form should be displayed')
        .expect(guestContinueButton.visible)
        .ok('Guest Continue button should be visible')
        .click(guestContinueButton)
        .wait(1500)
        .expect(Selector('.text-danger').count)
        .gt(0, 'Validation errors should appear for required fields')
        .takeScreenshot();
});

// Scenario 3: Attempt checkout with an empty shopping cart
test('Checkout with empty cart', async t => {
    await t
        .navigateTo('https://opencart.abstracta.us/index.php?route=checkout/checkout')
        .expect(Selector('#content').innerText)
        .contains('Your shopping cart is empty!')
        .takeScreenshot();
});
