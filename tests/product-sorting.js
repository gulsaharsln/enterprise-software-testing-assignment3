// Test case T008 - Product Sorting

import { Selector } from "testcafe";

// Laptops & Notebooks listing page: a category with several products
fixture('Product Sorting')
    .page('https://opencart.abstracta.us/index.php?route=product/category&path=18');

    const sortSelect = Selector('#input-sort'); // the "Sort By" drop-down

    // Read the price used for sorting of every product card on the page
    // "Ex Tax: $x" is the price before tax and already uses the special when there is one 
    async function getPrices(){
        const cards = Selector('.product-thumb');   // one card per product
        const count = await cards.count;            // how many products are listed
        const prices = [];
        for(let i = 0; i < count; i++){
            const text = await cards.nth(i).find('.price').innerText;
            const exTax = text.match(/Ex Tax:\s*\$([\d,]+\.\d{2})/);
            const first = text.match(/\$([\d,]+\.\d{2})/);  //fallback: first dollar amount
            const found = exTax || first;
            prices.push(found ? parseFloat(found[1].replace(',', '')) : NaM);
        }
        return prices;
    }


    // Read the name of every product card (lower case so capitals do not matter)
    async function getNames(){
        const nameElements = Selector('.product-thumb h4 a');   // one name link per product card
        const count = await nameElements.count;
        const names = [];
        for(let i = 0; i < count; i++){
            const text = await nameElements.nth(i).innerText;
            names.push(text.trim().toLowerCase());
        }
        return names;
    }


    // Scenario 1: price low to high gives ascending prices 
    test('Sort by price low to high', async t=>{
        await t
            .click(sortSelect)                          // open the dropdown
            .click(sortSelect.find('option').withText('Price (Low > High)'))    // choose the option
            .expect(t.eval(() => window.location.href)).contains('sort=p.price')    // page reloaded with the sort parameter
            .expect(t.eval(()=> window.location.href)).contains('order=ASC');
        const prices = await getPrices();           // prices as shown on the page
        const expected = [...prices].sort((a, b) => a -b );  // the same prices sorted ascending
        await t
            .expect(prices.length).gt(1)        // at least two products to compare
            .expect(prices).eql(expected)   // page order equals sorted order
            .takeScreenshot();
    });

    // Scenario 2: price high to low gives descending prices
    test('Sort by price high to low', async t => {
        await t
            .click(sortSelect)
            .click(sortSelect.find('option').withText('Price (High > Low)'))
            .expect(t.eval(() => window.location.href)).contains('sort=p.price')
            .expect(t.eval(() => window.location.href)).contains('order=DESC');
        const prices = await getPrices();
        const expected = [...prices].sort((a, b) => b - a); // sort descending
        await t 
            .expect(prices.length).gt(1)
            .expect(prices).eql(expected)
            .takeScreenshot();    
    });

    //Scenario 3: name A-Z gives alphabetical names
    test('Sort by name A to Z', async t => {
        await t
            .click(sortSelect)
            .click(sortSelect.find('option').withText('Name (A - Z)'))
            .expect(t.eval(() => window.location.href)).contains('sort=pd.name')
            .expect(t.eval(() => window.location.href)).contains('order=ASC');
        const names = await getNames();
        const expected = [...names].sort();     // alphabetical order
        await t
            .expect(names.length).gt(1)
            .expect(names).eql(expected)
            .takeScreenshot();
    });