import { Selector } from 'testcafe';

fixture('Add to Cart')
    .page('https://opencart.abstracta.us/');

// Scenario 1: Add an available product to the shopping cart
test('Add iPhone to cart', async t => {
    const searchInput = Selector('input[name="search"]');
    const searchButton = Selector('#search button');
    const iPhone = Selector('.product-thumb').withText('iPhone');
    const addToCartButton = iPhone.find('button').withAttribute('onclick', /cart\.add/);
    const successAlert = Selector('.alert-success');
    const cartButton = Selector('#cart button');

    await t
        .typeText(searchInput, 'iPhone')
        .click(searchButton)
        .expect(iPhone.exists).ok('iPhone should appear in search results')
        .click(addToCartButton)
        .expect(successAlert.exists).ok('Success message should appear')
        .expect(successAlert.innerText).contains('Success')
        .expect(cartButton.innerText).contains('1 item(s)')
        .takeScreenshot();
});

// Scenario 2: Add a product with quantity 2
test('Add two iPhones to cart', async t => {
    const quantityInput = Selector('#input-quantity');
    const addToCartButton = Selector('#button-cart');
    const successAlert = Selector('.alert-success');
    const cartButton = Selector('#cart button');

    await t
        .navigateTo('https://opencart.abstracta.us/index.php?route=product/product&product_id=40')
        .expect(Selector('#content h1').innerText).eql('iPhone')
        .selectText(quantityInput)
        .typeText(quantityInput, '2')
        .click(addToCartButton)
        .expect(successAlert.exists).ok('Success message should appear')
        .expect(successAlert.innerText).contains('Success')
        .expect(cartButton.innerText).contains('2 item(s)')
        .takeScreenshot();
});

// Scenario 3: Attempt to add a product without selecting a required option
test('Add product without required option', async t => {
    const addToCartButton = Selector('#button-cart');
    const warning = Selector('.text-danger');

    await t
        .navigateTo('https://opencart.abstracta.us/index.php?route=product/product&product_id=30')
        .expect(Selector('#content h1').innerText).eql('Canon EOS 5D')
        .click(addToCartButton)
        .expect(warning.exists).ok('Validation message should appear for required option')
        .takeScreenshot();
});