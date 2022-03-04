const { interpolate } = require('d3');
const puppeteer = require('puppeteer');
const DependenTree = require('./page/main');
const { royals } = require('./page/testData');

const pageURL = 'http://127.0.0.1:8081/index.html';

describe('Mouse', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    page = await browser.newPage();
    await page.goto(pageURL);
    await page.evaluate(() => {
      window.tree = new DependenTree('div#tree');
      window.tree.addEntities(royals);
      window.tree.setTree('Elizabeth II');
      // triggers hover event on Elizabeth II
      window.tree.svg.select('svg > g:nth-of-type(2)').dispatch('mousemove');
    });
  });

  afterAll(async () => {
    await page.close();
    browser.close();
  });

  describe('_entityHasProps', () => {
    const obj = { data: { _name: 'foo', Title: 'Prince' } };

    test('true case', () => {
      const bool = DependenTree.prototype._entityHasProps(obj);
      expect(bool).toBe(true);
    });

    test('false case', () => {
      delete obj.data.Title;
      const bool = DependenTree.prototype._entityHasProps(obj)
      expect(bool).toBe(false);
    });
  });

  describe('_mouseover & _mouseout', () => {
    test('_mouseover shows visibility', async () => {
      const visibility = await page.evaluate(() => {
        window.tree.svg.selectAll('g').dispatch('mouseover');
        return tree.tooltip.node().style.visibility;
      });

      expect(visibility).toBe('visible');
    });

    test('_mouseout hides visibility', async () => {
      const visibility = await page.evaluate(() => {
        window.tree.svg.selectAll('g').dispatch('mouseout');
        return window.tree.tooltip.node().style.visibility;
      });

      expect(visibility).toBe('hidden');
    });
  });

  // these target strings are verbose
  // opting to use snapshots instead for this reason
  describe('_mousemove', () => {
    test('Sets tooltip HTML', async () => {
      const innerHTML = await page.evaluate(() => {
        return window.tree.tooltip.node().innerHTML;
      });

      expect(innerHTML).toMatchSnapshot();
    });

    test('Sets tooltip style', async () => {
      const cssText = await page.evaluate(() => {
        return window.tree.tooltip.node().style.cssText;
      });

      expect(cssText).toMatchSnapshot();
    });

    test('enableTooltipKey option to false does not show key', async () => {
      const page2 = await browser.newPage();
      await page2.goto(pageURL);

      const innerHTML = await page2.evaluate(() => {
        const tree = new DependenTree('div#tree', { enableTooltipKey: false });
        tree.addEntities(royals);
        tree.setTree('Elizabeth II');
        // triggers hover event on Elizabeth II
        const node = tree.svg.select('svg > g:nth-of-type(2)');
        node.dispatch('mouseover');
        node.dispatch('mousemove');

        return tree.tooltip.node().innerHTML;
      });

      await page2.close();

      expect(innerHTML).toMatchSnapshot();
    });

    test('enableTooltip option to false does not show tooltip', async () => {
      const page2 = await browser.newPage();
      await page2.goto(pageURL);

      const outerHTML = await page2.evaluate(() => {
        const tree = new DependenTree('div#tree', { enableTooltip: false });
        tree.addEntities(royals);
        tree.setTree('Elizabeth II');
        // triggers hover event on Elizabeth II
        tree.svg.select('svg > g:nth-of-type(2)').dispatch('mousemove');
        return tree.tooltip.node().outerHTML;
      });

      await page2.close();

      expect(outerHTML).toMatchSnapshot();
    });
  });

  describe('catches script injection', () => {
    let browser;
    let page;
    let results;

    beforeAll(async () => {
      browser = await puppeteer.launch({ args: ['--no-sandbox'] });
      page = await browser.newPage();
      await page.goto(pageURL);
      results = await page.evaluate(() => {
        royals[0].scriptInjection = '<script type="text/javascript" id="bad-script"> console.log("break stuff!"); </script>';
        royals[0]['<script type="text/javascript" id="worse-script"></script>'] = true;
        window.tree = new DependenTree('div#tree');
        window.tree.addEntities(royals);
        window.tree.setTree('Elizabeth II');
        // triggers hover event on Liz
        const node = tree.svg.select('svg > g:nth-of-type(2)');
        node.dispatch('mouseover');
        node.dispatch('mousemove');

        return [
          Boolean(document.getElementById('bad-script')),
          Boolean(document.getElementById('worse-script'))
        ];
      });
    });

    afterAll(async () => {
      await page.close();
      browser.close();
    });

    test('catches key strings', () => {
      expect(results[0]).toBe(false);
    });

    test('catches value strings', () => {
      expect(results[1]).toBe(false);
    });
  });
});
