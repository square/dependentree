const puppeteer = require('puppeteer');
const DependenTree = require('./page/main');

const pageURL = 'http://127.0.0.1:8081/index.html';

describe('Text', () => {
  describe('_wrap', () => {
    let browser;
    const longStr = 'very long string that must be wrapped';
    beforeAll(async () => {
      browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    });

    afterAll(() => {
      browser.close();
    });

    describe('string with spaces', () => {
      test('long string is wrapped', async () => {
        const data = [
          { _name: longStr }
        ];

        const page = await browser.newPage();
        await page.goto(pageURL)

        const numLinesOfText = await page.evaluate((data) => {
          const tree = new DependenTree('div#tree');
          tree.addEntities(data);
          tree.setTree(data[0]._name);
          return document.querySelector('text').childElementCount;
        }, data);

        await page.close();

        expect(numLinesOfText).toBe(2);
      });

      test('short string is not wrapped', async () => {
        const data = [
          { _name: 'short string' }
        ];

        const page = await browser.newPage();
        await page.goto(pageURL)

        const numLinesOfText = await page.evaluate((data) => {
          const tree = new DependenTree('div#tree');
          tree.addEntities(data);
          tree.setTree(data[0]._name);
          return document.querySelector('text').childElementCount;
        }, data);

        await page.close();

        expect(numLinesOfText).toBe(1);
      });
    });

    describe('string with no spaces', () => {
      test('long string is wrapped', async () => {
        const data = [
          { _name: longStr.split(' ').join('') }
        ];

        const page = await browser.newPage();
        await page.goto(pageURL)

        const numLinesOfText = await page.evaluate((data) => {
          const tree = new DependenTree('div#tree');
          tree.addEntities(data);
          tree.setTree(data[0]._name);
          return document.querySelector('text').childElementCount;
        }, data);

        await page.close();

        expect(numLinesOfText).toBe(2);
      });

      test('short string is not wrapped', async () => {
        const data = [
          { _name: 'shortstring' }
        ];

        const page = await browser.newPage();
        await page.goto(pageURL)

        const numLinesOfText = await page.evaluate((data) => {
          const tree = new DependenTree('div#tree');
          tree.addEntities(data);
          tree.setTree(data[0]._name);
          return document.querySelector('text').childElementCount;
        }, data);

        await page.close();

        expect(numLinesOfText).toBe(1);
      });
    });

    describe('splitStr option', () => {
      test('long string with target string is wrapped', async () => {
        const splitStr = '_';
        const data = [
          { _name: longStr.split(' ').join(splitStr) }
        ];

        const page = await browser.newPage();
        await page.goto(pageURL)

        const numLinesOfText = await page.evaluate((data, splitStr) => {
          const tree = new DependenTree('div#tree', { splitStr });
          tree.addEntities(data);
          tree.setTree(data[0]._name);
          return document.querySelector('text').childElementCount;
        }, data, splitStr);

        await page.close();

        expect(numLinesOfText).toBe(2);
      });

      test('long string with spaces is not wrapped', async () => {
        const splitStr = '_';
        const data = [
          { _name: longStr }
        ];

        const page = await browser.newPage();
        await page.goto(pageURL)

        const numLinesOfText = await page.evaluate((data, splitStr) => {
          const tree = new DependenTree('div#tree', { splitStr });
          tree.addEntities(data);
          tree.setTree(data[0]._name);
          return document.querySelector('text').childElementCount;
        }, data, splitStr);

        await page.close();

        expect(numLinesOfText).toBe(1);
      });
    });

    describe('wrapNodeName option', () => {
      test('long string is not wrapped', async () => {
        const data = [
          { _name: longStr }
        ];

        const page = await browser.newPage();
        await page.goto(pageURL)

        const innerHTML = await page.evaluate((data) => {
          const tree = new DependenTree('div#tree', { wrapNodeName: false });
          tree.addEntities(data);
          tree.setTree(data[0]._name);
          // text element will have no element children if wrap is disabled
          return document.querySelector('text').innerHTML;
        }, data);

        await page.close();

        expect(innerHTML).toBe(longStr);
      });
    });
  });

  describe('_getTextDirection', () => {
    describe('downstream', () => {
      describe('left', () => {
        test('orientation end', () => {
          const tree = new DependenTree('body');
          tree.direction = 'downstream';
          const { orientation } = tree._getTextDirection('left');
          expect(orientation).toBe('end');
        });

        test('offset -13', () => {
          const tree = new DependenTree('body');
          tree.direction = 'downstream';
          const { offset } = tree._getTextDirection('left');
          expect(offset).toBe(-13)
        });
      });

      describe('right', () => {
        test('orientation start', () => {
          const tree = new DependenTree('body');
          tree.direction = 'downstream';
          const { orientation } = tree._getTextDirection('right');
          expect(orientation).toBe('start')
        });

        test('offset 13', () => {
          const tree = new DependenTree('body');
          tree.direction = 'downstream';
          const { offset } = tree._getTextDirection('right');
          expect(offset).toBe(13)
        });
      });
    });

    describe('upstream', () => {
      describe('left', () => {
        test('orientation end', () => {
          const tree = new DependenTree('body');
          tree.direction = 'upstream';
          const { orientation } = tree._getTextDirection('left');
          expect(orientation).toBe('start');
        });

        test('offset -13', () => {
          const tree = new DependenTree('body');
          tree.direction = 'upstream';
          const { offset } = tree._getTextDirection('left');
          expect(offset).toBe(13)
        });
      });

      describe('right', () => {
        test('orientation start', () => {
          const tree = new DependenTree('body');
          tree.direction = 'upstream';
          const { orientation } = tree._getTextDirection('right');
          expect(orientation).toBe('end')
        });

        test('offset 13', () => {
          const tree = new DependenTree('body');
          tree.direction = 'upstream';
          const { offset } = tree._getTextDirection('right');
          expect(offset).toBe(-13)
        });
      });
    });
  });
});
