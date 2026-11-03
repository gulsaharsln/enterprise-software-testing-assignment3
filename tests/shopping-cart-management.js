import { Selector } from 'testcafe';

fixture('Shopping Cart Management')
    .page('https://opencart.abstracta.us/');

// Scenario 1: Update product quantity in the shopping cart
test('Update iPhone quantity in cart', async t => {
    const quantityInput = Selector('#input-quantity');
    const addToCartButton = Selector('#button-cart');
    const cartButton = Selector('#cart button');

    await t
        .navigateTo('https://opencart.abstracta.us/index.php?route=product/product&product_id=40')
        .expect(Selector('#content h1').innerText).eql('iPhone')
        .selectText(quantityInput)
        .typeText(quantityInput, '1')
        .click(addToCartButton)
        .expect(cartButton.innerText).contains('1 item(s)');

    await t.navigateTo(
        'https://opencart.abstracta.us/index.php?route=checkout/cart'
    );

    const cartQuantity = Selector('input[name^="quantity"]');
    const updateButton = Selector('button[data-original-title="Update"]');

    await t
        .selectText(cartQuantity)
        .typeText(cartQuantity, '2')
        .click(updateButton)
        .expect(Selector('.alert-success').innerText)
        .contains('Success')
        .expect(cartQuantity.value)
        .eql('2')
        .takeScreenshot();
});

// Scenario 2: Remove a product from the shopping cart
test('Remove iPhone from cart', async t => {
    const quantityInput = Selector('#input-quantity');
    const addToCartButton = Selector('#button-cart');

    await t
        .navigateTo('https://opencart.abstracta.us/index.php?route=product/product&product_id=40')
        .selectText(quantityInput)
        .typeText(quantityInput, '1')
        .click(addToCartButton)
        .navigateTo('https://opencart.abstracta.us/index.php?route=checkout/cart');

    const removeButton = Selector('button[data-original-title="Remove"]');

    await t
        .expect(Selector('.table-responsive').exists)
        .ok('Shopping cart should contain a product')
        .click(removeButton)
        .expect(Selector('#content').innerText)
        .contains('Your shopping cart is empty!')
        .takeScreenshot();
});

// Scenario 3: Set product quantity to zero
test('Set cart quantity to zero', async t => {
    const quantityInput = Selector('#input-quantity');
    const addToCartButton = Selector('#button-cart');

    await t
        .navigateTo('https://opencart.abstracta.us/index.php?route=product/product&product_id=40')
        .selectText(quantityInput)
        .typeText(quantityInput, '1')
        .click(addToCartButton)
        .navigateTo('https://opencart.abstracta.us/index.php?route=checkout/cart');

    const cartQuantity = Selector('input[name^="quantity"]');
    const updateButton = Selector('button[data-original-title="Update"]');

    await t
        .selectText(cartQuantity)
        .typeText(cartQuantity, '0')
        .click(updateButton)
        .expect(Selector('#content').innerText)
        .contains('Your shopping cart is empty!')
        .takeScreenshot();
});