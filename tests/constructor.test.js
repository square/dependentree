const puppeteer = require('puppeteer');
const DependenTree = require('./page/main');

const pageURL = 'http://127.0.0.1:8081/index.html';


describe('Constructor', () => {
  describe('Tree initializes when', () => {
    test('element is found', () => {
      const tree = new DependenTree('body');
      expect(tree).toBeInstanceOf(DependenTree);
    });

    test('options is an object', () => {
      const tree = new DependenTree('body', {});
      expect(tree).toBeInstanceOf(DependenTree);
    });

    test('options is an object with properties', () => {
      const options = {
        maxDepth: 25,
        containerWidthMultiplier: 1,
        containerHeight: 1.3,
      }

      const tree = new DependenTree('body', options);
      expect(tree).toBeInstanceOf(DependenTree);
    });
  });

  describe('throws error when', () => {
    test('element is not found', () => {
      const expectedMessage = 'An element could not be selected from the given selector string ".foo". Please refer to https://www.w3.org/TR/selectors-api/ and ensure the element is on the page.';

      let message;
      try {
        tree = new DependenTree('.foo');
      } catch(e) {
        message = e.message;
      }
      expect(message).toBe(expectedMessage);
    });


    test('options is not an object', () => {
      const expectedMessage = 'Argument options is not of type Object. Instead received a value of "true". Please pass an empty object if you do not want to specify options.';

      let tree;
      let message;
      try {
        tree = new DependenTree('body', true);
      } catch(e) {
        message = e.message;
      }
      expect(message).toBe(expectedMessage);
    });
  });

  describe('Sets default', () => {
    let tree;
    let browser;

    beforeEach(() => {
      tree?.removeTree();
    })

    beforeAll(async () => {
      browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    })

    afterAll(() => {
      browser.close();
    })

    describe('container width in px', () => {
      let rect;
      beforeAll(async () => {
        const page = await browser.newPage();
        await page.goto(pageURL)

        rect = await page.evaluate(() => {
          const options = { containerWidthInPx: 200, containerHeightInPx: 800 }
          const tree = new DependenTree('div#tree', options);
          tree.addEntities(royals);
          tree.setTree('Elizabeth II', 'downstream');

          const { height, width } = tree.svg.node().getBoundingClientRect();
          return { height, width };
        });

        await page.close();
        expect(rect.width).toBe(440);
      });
    });

    test('container width with multiplier', () => {
      let rect;
      beforeAll(async () => {
        const page = await browser.newPage();
        await page.goto(pageURL)

        rect = await page.evaluate(() => {
          const options = { containerWidthMultiplier: 2, containerHeight: 2 }
          const tree = new DependenTree('div#tree', options);
          tree.addEntities(royals);
          tree.setTree('Elizabeth II', 'downstream');

          const { height, width } = tree.svg.node().getBoundingClientRect();
          return { height, width };
        });

        await page.close();

        expect(rect.width).toBe(2640);
      });
    });
  });

  describe('Default tree values are empty', () => {
    let tree;
    beforeAll(() => {
      tree = new DependenTree('body');
    });

    test('nodeId', () => {
      expect(tree.nodeId).toBe(0);
    });

    test('upstream', () => {
      expect({}).toMatchObject(tree.upstream);
    });

    test('downstream', () => {
      expect({}).toMatchObject(tree.downstream);
    });

    test('missingEntities', () => {
      expect(Array.isArray(tree.missingEntities)).toBe(true);
      expect(tree.missingEntities.length).toBe(0);
    });

    test('duplicateDependencies', () => {
      expect(Array.isArray(tree.dupDeps)).toBe(true);
      expect(tree.dupDeps.length).toBe(0);
    });

    test('keysMemo', () => {
      expect({}).toMatchObject(tree.keysMemo);
    });

    test('clones', () => {
      expect(Array.isArray(tree.clones)).toBe(true);
      expect(tree.clones.length).toBe(0);
    });
  });
});
