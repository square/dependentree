const puppeteer = require('puppeteer');

const pageURL = 'http://127.0.0.1:8081/index.html';


// Not much to test with update. Just ensure clicking on nodes
// triggers update which changes the tree
// Note that nodes that are not visible will still show up
// in the snapshots
describe('Update', () => {
  let one;
  let two;
  let three;

  beforeAll(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(pageURL);
    ({ one, two, three } = await page.evaluate(() => {
      const tree = new DependenTree('div#tree');
      tree.addEntities(royals, { animationDuration: 0 });
      tree.setTree('Elizabeth II', 'downstream');

      const one = tree.svg.node().innerHTML;

      // clicking on Charles
      tree.svg.select('g:nth-of-type(3) > circle').dispatch('click');
      const two = tree.svg.node().innerHTML;

      // clicking on Elizabeth II
      tree.svg.select('circle').dispatch('click');
      const three = tree.svg.node().innerHTML;

      return { one, two, three };
    }));

    await page.close();
    await browser.close();
  });

  test('default tree', () => {
    expect(one).toMatchSnapshot();
  });

  test('open node', () => {
    expect(two).toMatchSnapshot();
  });

  test('close root', () => {
    expect(three).toMatchSnapshot();
  });
});
