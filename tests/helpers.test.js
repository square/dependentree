const puppeteer = require('puppeteer');
const DependenTree = require('./page/main');
const { royals, rps } = require('./page/testData');

const pageURL = 'http://127.0.0.1:8081/index.html';

const royalsStr = JSON.stringify(royals);

describe('Helpers', () => {
  let browser;

  beforeAll(async () => {
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  });

  afterAll(() => {
    browser.close();
  });

  describe('addEntities', () => {
    test('sets dependenciesAdded to true', () => {
      const tree = new DependenTree('body');
      tree.addEntities([{ _name: 'foo' }]);

      expect(tree.dependenciesAdded).toBe(true);
    });

    test("can't be added twice", () => {
      const expected = 'Entities have already been added. Create a new instance of DependenTree if you need to display other data.'
      let message;

      const tree = new DependenTree('body');
      tree.addEntities([{ _name: 'foo' }]);
      try {
        tree.addEntities([{ _name: 'foo' }]);
      } catch (e) {
        message = e.message;
      }
      expect(message).toBe(expected);
    });
  });

  describe('getEntityList', () => {
    let tree;
    const princesses = ['Diana', 'Charlotte', 'Anne'];

    beforeAll(() => {
      tree = new DependenTree('body');
      tree.addEntities(royals);
    })

    test('method returns appropriate filtered list', () => {
      const list = tree.getEntityList('_shortTitle', 'Princess');
      expect(list).toEqual(expect.arrayContaining(princesses));
    });

    test('filtered list is memoized', () => {
      const key = '_shortTitle---Princess';
      const list = tree.keysMemo[key];

      expect(list).toEqual(expect.arrayContaining(princesses));
    });

    test('all entities are fetched when no key-value is passed', () => {
      const tree = new DependenTree('body');
      tree.addEntities(rps);
      const list = tree.getEntityList();

      expect(list).toEqual(expect.arrayContaining(['rock', 'paper', 'scissors']));
    });

    test('incorrectly typed key throws error', () => {
      const target = 'The first argument (key) must be a string or undefined. Instead, a value of "true" was received with type "boolean".';

      const tree = new DependenTree('body');
      tree.addEntities(JSON.parse(royalsStr));

      let message;
      try {
        tree.getEntityList(true, 'value');
      } catch (e) {
        message = e.message;
      }

      expect(message).toBe(target);
    });

    test('incorrectly typed value throws error', () => {
      const target = 'The second argument (value) must be a string or undefined. Instead, a value of "true" was received with type "boolean".';

      const tree = new DependenTree('body');
      tree.addEntities(JSON.parse(royalsStr));

      let message;
      try {
        tree.getEntityList('key', true);
      } catch (e) {
        message = e.message;
      }

      expect(message).toBe(target);
    });
  });

  describe('_setTooltip', () => {
    const targetStr = 'body';

    test('tool tip element on page', async() => {
      const page = await browser.newPage();
      await page.goto(pageURL);

      const elementsEqual = await page.evaluate(targetStr => {
        const tree = new DependenTree(targetStr);
        tree.addEntities(royals);
        tree.setTree('Elizabeth II');

        // triggers tooltip to be populated with ul for query below
        const node = tree.svg.selectAll('g');
        node.dispatch('mouseover');
        node.dispatch('mousemove');

        const nodeInDOM = document.querySelector(`${targetStr} > div > ul`).parentElement;
        const nodeInClass = tree.tooltip.node();
        return nodeInClass === nodeInDOM;
      }, targetStr);

      await page.close();

      expect(elementsEqual).toBe(true);
    });

    test('tool tip element in class', async() => {
      const page = await browser.newPage();
      await page.goto(pageURL)

      const toolTipStyle = await page.evaluate(targetStr => {
        const tree = new DependenTree(targetStr);
        tree.addEntities(royals);
        tree.setTree('Elizabeth II');
        const { position, visibility } = tree.tooltip.node().style;
        return { position, visibility };
      }, targetStr);

      await page.close();

      expect(toolTipStyle.position).toBe('fixed');
      expect(toolTipStyle.visibility).toBe('hidden');
    });
  });

  describe('_styleObjToStyleStr', () => {
    test('converts style object to string', () => {
      const input = {
        'font-family': 'sans-serif',
        'font-size': '12px',
      }
      const styleStr = DependenTree.prototype._styleObjToStyleStr(input);
      expect(styleStr).toBe('font-family:sans-serif;font-size:12px;');
    });
  });
});
