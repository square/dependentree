const puppeteer = require('puppeteer');
const DependenTree = require('./page/main');

const pageURL = 'http://127.0.0.1:8081/index.html';


// NOTE: No tests for _delayExpand or _click

describe('Tree Helpers', () => {
  // Not much to test with expand collapse
  // Best we can do is capture the structure of the tree
  describe('Expand Collapse Remove', () => {
    let one;
    let two;
    let three;
    let four;
    let svgOnPage;
    let svgNotOnPage;

    beforeAll(async () => {
      const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
      const page = await browser.newPage();
      await page.goto(pageURL);

      ({ one, two, three, four, svgOnPage, svgNotOnPage } = await page.evaluate(() => {
        const tree = new DependenTree('div#tree');
        tree.addEntities(royals, { animationDuration: 0 });
        tree.setTree('Elizabeth II', 'downstream');

        const one = tree.svg.node().innerHTML;

        tree.expandAll();
        const two = tree.svg.node().innerHTML;

        tree.collapseAll();
        const three = tree.svg.node().innerHTML;

        tree.expandAll(3);
        const four = tree.svg.node().innerHTML;

        const svgOnPage = Boolean(document.querySelector('div#tree > div > svg'));
        tree.removeTree();
        const svgNotOnPage = Boolean(document.querySelector('body > svg'));

        return { one, two, three, four, svgOnPage, svgNotOnPage };
      }));

      await page.close();
      await browser.close();
    });

    test('default tree', () => {
      expect(one).toMatchSnapshot();
    });

    test('expand Infinity', () => {
      expect(two).toMatchSnapshot();
    });

    test('collapse all', () => {
      expect(three).toMatchSnapshot();
    });

    test('expand 3', () => {
      expect(four).toMatchSnapshot();
    });

    test('tree on page', () => {
      expect(svgOnPage).toBe(true);
    });

    test('tree removed from page', () => {
      expect(svgNotOnPage).toBe(false);
    });
  });

  describe('_collapse', () => {
    test('recursively collapses', () => {
      const node = { children: [{ children: [{ children: [] }] }] };
      const target = { _children: [{ _children: [{ _children: [] }] }] };

      DependenTree.prototype._collapse(node);

      expect(node).toMatchObject(target);
    });

    test('no action to node without children', () => {
      const node = { _children: [{}] }
      const target = { _children: [{}] };

      DependenTree.prototype._collapse(node);

      expect(node).toMatchObject(target);
    });

    test('secondLevel argument set to true keeps children of the root', () => {
      const node = { children: [{ children: [{ children: [] }] }] };
      const target = { _children: [{ _children: [{ children: null }] }] };

      DependenTree.prototype._collapse(node);

      expect(node).toMatchObject(target);
    });
  });

  describe('_diagonal', () => {
    test('Passed in numbers produce expected output', () => {
      const str = DependenTree.prototype._diagonal({x: 1, y: 2}, {x: 3, y: 4})

      expect(str).toMatchSnapshot();
    });
  });
});
