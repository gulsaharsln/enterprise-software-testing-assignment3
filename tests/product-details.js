
import { Selector } from 'testcafe';

fixture('Product Details')
    .page('https://opencart.abstracta.us/');

// Open product details page
test('Open MacBook product details', async t => {
    const macbook = Selector('.product-thumb h4 a')
        .withExactText('MacBook');

    await t
        .click(macbook)
        .expect(Selector('#content h1').innerText)
        .eql('MacBook')
        .expect(t.eval(() => window.location.href))
        .contains('product_id=43')
        .takeScreenshot();
});

//  Verify product price and availability
test('Verify MacBook price and availability', async t => {
    await t
        .navigateTo('https://opencart.abstracta.us/index.php?route=product/product&product_id=43')
        .expect(Selector('#content h1').innerText)
        .eql('MacBook')
        .expect(Selector('#content').innerText)
        .contains('$602.00')
        .expect(Selector('#content').innerText)
        .contains('Out Of Stock')
        .takeScreenshot();
});

// View product description and specifications
test('View MacBook description and specifications', async t => {
    const description = Selector('a[href="#tab-description"]');
    const specification = Selector('a[href="#tab-specification"]');

    await t
        .navigateTo('https://opencart.abstracta.us/index.php?route=product/product&product_id=43')
        .click(description)
        .expect(Selector('#tab-description').visible)
        .ok()
        .expect(Selector('#tab-description').innerText)
        .contains('Intel Core 2 Duo')
        .click(specification)
        .expect(Selector('#tab-specification').visible)
        .ok()
        .expect(Selector('#tab-specification').innerText)
        .contains('Processor')
        .takeScreenshot();
});
