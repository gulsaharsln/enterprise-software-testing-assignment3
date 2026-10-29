
import { Selector } from 'testcafe';

fixture('Product Category Navigation')
    .page('https://opencart.abstracta.us/');

// Navigate to a main category
test('Navigate to Desktops category', async t => {
    const desktopsMenu = Selector('#menu a').withText('Desktops');
    const desktops = Selector('a').withText('Show All Desktops');

    await t
        .hover(desktopsMenu)
        .click(desktops)
        .expect(Selector('#content h2').innerText)
        .contains('Desktops')
        .takeScreenshot();
});

// Navigate to a subcategory
test('Navigate to Mac subcategory', async t => {
    const desktopsMenu = Selector('#menu a').withText('Desktops');
    const macCategory = Selector('a[href*="path=20_27"]');

    await t
        .hover(desktopsMenu)
        .click(macCategory)
        .expect(Selector('#content h2').innerText)
        .contains('Mac')
        .expect(t.eval(() => window.location.href))
        .contains('path=20_27')
        .expect(Selector('.product-thumb').count)
        .gt(0)
        .takeScreenshot();
});

//  Switch between categories
test('Switch from Desktops to Laptops & Notebooks', async t => {
    const desktopsMenu = Selector('#menu a').withText('Desktops');
    const desktops = Selector('a').withText('Show All Desktops');
    const laptopsMenu = Selector('#menu a').withText('Laptops & Notebooks');
    const laptops = Selector('a').withText('Show All Laptops & Notebooks');

    await t
        .hover(desktopsMenu)
        .click(desktops)
        .expect(Selector('#content h2').innerText)
        .contains('Desktops')
        .hover(laptopsMenu)
        .click(laptops)
        .expect(Selector('#content h2').innerText)
        .contains('Laptops & Notebooks')
        .takeScreenshot();
});
