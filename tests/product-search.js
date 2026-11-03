
import { Selector } from 'testcafe';

fixture('Product Search')
    .page('https://opencart.abstracta.us/');

//Search for an existing product
test('Search for MacBook', async t => {
    const searchInput = Selector('input[name="search"]');
    const searchButton = Selector('#search button');
    const product = Selector('.product-thumb').withText('MacBook');

    await t
        .typeText(searchInput, 'MacBook')
        .click(searchButton)
        .expect(t.eval(() => window.location.href))
        .contains('route=product/search')
        .expect(product.exists).ok()
        .takeScreenshot();
});

//Search for a non-existing product
test('Search for a non-existing product', async t => {
    const searchInput = Selector('input[name="search"]');
    const searchButton = Selector('#search button');
    const products = Selector('#content .product-thumb');

    await t
        .typeText(searchInput, 'xyznonexistent123')
        .click(searchButton)
        .expect(t.eval(() => window.location.href))
        .contains('route=product/search')
        .expect(products.count).eql(0)
        .takeScreenshot();
});


// Search with an empty keyword
test('Search with empty keyword', async t => {
    const searchButton = Selector('#search button');

    await t
        .click(searchButton)
        .expect(t.eval(() => window.location.href))
        .contains('route=product/search')
        .expect(Selector('#content .product-thumb').count)
        .eql(0)
        .takeScreenshot();
});
