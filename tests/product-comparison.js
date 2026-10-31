// Test Case T007 - Product Comparison

import { Selector } from "testcafe";

fixture('Product Comparison')
    .page('https://opencart.abstracta.us/index.php?route=product/category&path=20')

// URL of the compare page
const compareUrl = 'https://opencart.abstracta.us/index.php?route=product/compare';

const productCards = Selector('#content .product-thumb'); // every product card on the page
const compareButton = 'button[onclick*="compare.add"], button[title="Compare this Product"], button[data-original-title="Compare this Product"], .button-group button:nth-of-type(3) ';
const compareTotalLink = Selector('#compare-total');  // the "Product Compare (n)"  at the top 
const compareTable =  Selector('#content table'); // table on the compare page

// Scenario 1: add two products, both appear on the compare page 
test('Add two products to comparison', async t => {
    // read the name of the first 2 products so we can check them later
    const name1 = await productCards.nth(0).find('h4 a').innerText;
    const name2 = await productCards.nth(1).find('h4 a').innerText;

    await t 
        .click(productCards.nth(0).find(compareButton))     // add product 1
        .expect(Selector('.alert-success').exists).ok()     // wait until the first add is finished
        .click(productCards.nth(1).find(compareButton))     // add product 2
        .expect(compareTotalLink.innerText).contains('(2)')  // counter shows 2
        .navigateTo(compareUrl)                         // go to compare page (list is kept in the session)
        .expect(compareTable.exists).ok()               // the comparison table is shown
        .expect(compareTable.withText(name1).exists).ok()   // product 1 is listed
        .expect(compareTable.withText(name2).exists).ok()   // product 2 is listed
        .takeScreenshot();
});
// Scenario 2: remove one product, the other one stays
test('Remove a product from comparison', async t => {
    const name1 = await productCards.nth(0).find('h4 a').innerText;
    const name2 = await productCards.nth(1).find('h4 a').innerText;

    await t
        .click(productCards.nth(0).find(compareButton))     // add product 1 
        .expect(compareTotalLink.innerText).contains('(1)') // wait until the first add is finished
        .click(productCards.nth(1).find(compareButton))     // add product 2
        .expect(compareTotalLink.innerText).contains('(2)') // wait until both are added
        .navigateTo(compareUrl)                             // go to the compare page
        .click(Selector('#content a').withText('Remove').nth(0))  // click the first remove button
        .expect(compareTable.withText(name1).exists).notOk()    // product 1 is gone
        .expect(compareTable.withText(name2).exists).ok()       // prdouct 2 is still there
        .takeScreenshot();
});
// Scenariio 3: open the compare page with nothing added
test.page(compareUrl)('Empty comparison page', async t =>{
    await t
        .expect(compareTable.exists).notOk()        // no comparison table when nothing was added
        .expect(Selector('#content p').exists).ok() // some empty-state message is shown
        .takeScreenshot();
});