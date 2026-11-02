// Test Case T009 - Product Filtering (filter search result by category)

import { Selector } from "testcafe";

// The Search page has a category drop-down that filters the results
fixture('Product Filtering')
    .page('https://opencart.abstracta.us/index.php?route=product/search');

const searchBox = Selector('#input-search');    // keyword field
const categorySelect = Selector('select[name="category_id"]');  //category filter dropdown
const descriptionBox = Selector('#description');    // "Search in product descriptions" checkbox
const searchButton = Selector('#button-search');    // search button 
const results = Selector('#content .product-thumb');    // result cards

// Helper: search a keyword, optionally inside one category 
async function searchInCategory(t, keyword, categoryLabel){
    // make sure descriptions are not searched, so only product names are matched
    if (await descriptionBox.checked){
        await t.click(descriptionBox);
    }
    await t.typeText(searchBox, keyword, {replace: true});  // type the keyword
    if(categoryLabel){
        await t 
            .click(categorySelect)      // open the category dropdown
            .click(categorySelect.find('option').withText(categoryLabel));  // pick the category
    }
    await t.click(searchButton);        // run the search
}

// Scenario 1: no category filter, products from different categories appear 
test('Search without category filter', async t => {
    await searchInCategory(t, 'Mac', null);
    await t
        .expect(results.withText('iMac').exists).ok()   // a desktop is listed
        .expect(results.withText('MacBook').exists).ok()    // a laptop is listed
        .takeScreenshot();
});

// Scenario 2: categroy Laptops & Notebooks keeps laptops and removes the desktop
test('Filter by Laptops & Notebooks', async t => {
    await searchInCategory(t, 'Mac', 'Laptops & Notebooks');
    await t 
        .expect(results.withText('MacBook').exists).ok()    // laptop is still listed
        .expect(results.withText('iMac').exists).notOk()    // desktop is filtered out
        .takeScreenshot();
});

// Scenario 3: a cateogory without matching products gives no results
test('Filter by a category with no match', async t =>{
    await searchInCategory(t, 'Mac', 'Phones & PDAs');
    await t
        .expect(results.count).eql(0)       // no product cards are listed
        .expect(Selector('#content').innerText).contains('Search Criteria') // still on the search page with the form
        .takeScreenshot();
});