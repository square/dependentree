const puppeteer = require('puppeteer');

const pageURL = 'http://127.0.0.1:8081/index.html';


// Note that every test has it's own puppeteer page
// This is so the jest snapshots stay consistent
// Otherwise there are minor changes between each test
describe('Tree', () => {
  let browser;

  beforeAll(async () => {
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  });

  afterAll(() => {
    browser.close();
  });

  describe('Valid Inputs', () => {
    test('key', async () => {
      const key = 'Elizabeth II';

      const page = await browser.newPage();
      await page.goto(pageURL);
      const rootName = await page.evaluate(key => {
        const tree = new DependenTree('div#tree');
        tree.addEntities(royals);
        tree.setTree(key);
        return tree.root.data._name;
      }, key);

      await page.close();

      expect(rootName).toBe(key);
    });

    test('direction', async () => {
      const expected = 'downstream'

      const page = await browser.newPage();
      await page.goto(pageURL);

      const direction = await page.evaluate(direction => {
        const tree = new DependenTree('div#tree');
        tree.addEntities(royals);
        tree.setTree('Elizabeth II', direction);
        return tree.direction;
      }, expected);

      await page.close();

      expect(direction).toBe(expected);
    });

    test('SVG', async () => {
      const direction = 'downstream'

      const page = await browser.newPage();
      await page.goto(pageURL);

      const innerHTML = await page.evaluate(direction => {
        const tree = new DependenTree('div#tree');
        tree.addEntities(royals);
        tree.setTree('Elizabeth II', direction);
        return tree.svg.node().innerHTML;
      }, direction);

      expect(innerHTML).toMatchSnapshot();
    });
  });

  describe('Null Inputs', () => {
    let browser;

    beforeAll(async () => {
      browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    });

    afterAll(() => {
      browser.close();
    });

    test('key', async () => {
      const target = 'The entity "null" is not found.';
      const key = null;

      const page = await browser.newPage();
      await page.goto(pageURL);

      const message = await page.evaluate(key => {
        const tree = new DependenTree('div#tree');
        tree.addEntities(royals);
        let message;
        try {
          tree.setTree(key);
        } catch (e) {
          message = e.message
        }
        return message;
      }, key);

      await page.close();

      expect(message).toBe(target);
    });

    test('direction', async () => {
      const undef = undefined;

      const page = await browser.newPage();
      await page.goto(pageURL);

      const direction = await page.evaluate(directionArg => {
        const tree = new DependenTree('div#tree');
        tree.addEntities(royals);
        tree.setTree('Elizabeth II', directionArg);
        return tree.direction;
      }, undef);

      await page.close();

      expect(direction).toBe('upstream');
    });

    test('SVG', async () => {
      const direction = undefined;

      const page = await browser.newPage();
      await page.goto(pageURL);

      const innerHTML = await page.evaluate(direction => {
        const tree = new DependenTree('div#tree');
        tree.addEntities(royals);
        try {
          tree.setTree('Elizabeth II', direction);
        } catch {
          //
        }
        return tree.svg.node().innerHTML;
      }, direction);

      expect(innerHTML).toMatchSnapshot();
    });
  });

  describe('Invalid Inputs', () => {
    test('key', async () => {
      const key = 'some string';

      const page = await browser.newPage();
      await page.goto(pageURL);
      const rootName = await page.evaluate(key => {
        const tree = new DependenTree('div#tree');
        tree.addEntities(royals);
        try {
          tree.setTree(key);
        } catch {
          //
        }
        return tree.root;
      }, key);

      await page.close();

      expect(rootName).toBeUndefined();
    });

    test('direction', async () => {
      const target = 'The second argument must be either "upstream" or "downstream". Instead received "some string".';
      const direction = 'some string';

      const page = await browser.newPage();
      await page.goto(pageURL);

      const message = await page.evaluate(direction => {
        const tree = new DependenTree('div#tree');
        tree.addEntities(royals);
        let message;
        try {
          tree.setTree('Elizabeth II', direction);
        } catch (e) {
          message = e.message
        }
        return message;
      }, direction);

      await page.close();

      expect(target).toBe(message);
    });

    test('SVG', async () => {
      const direction = 'some string';

      const page = await browser.newPage();
      await page.goto(pageURL);

      const innerHTML = await page.evaluate(() => {
        const tree = new DependenTree('div#tree');
        tree.addEntities(royals);
        try {
          tree.setTree('Elizabeth II', direction);
        } catch {
          //
        }
        return tree.svg;
      });

      expect(innerHTML).toBeUndefined();
    });
  });
  describe('Scroll', () => {
    test('right on upstream', async () => {
      const direction = 'upstream';

      const page = await browser.newPage();
      await page.goto(pageURL);

      const scrollLeft = await page.evaluate(direction => {
        const tree = new DependenTree('div#tree');
        tree.addEntities(royals);
        tree.setTree('Elizabeth II', direction);
        return tree.passedContainerEl.scrollLeft;

      }, direction);

      await page.close();

      expect(scrollLeft).toBe(3840);
    });

    test('left on downstream', async () => {
      const direction = 'downstream';

      const page = await browser.newPage();
      await page.goto(pageURL);

      const scrollLeft = await page.evaluate(direction => {
        const tree = new DependenTree('div#tree');
        tree.addEntities(royals);
        tree.setTree('Elizabeth II', direction);
        return tree.passedContainerEl.scrollLeft

      }, direction);

      await page.close();

      expect(scrollLeft).toBe(0);
    });
  });
});
