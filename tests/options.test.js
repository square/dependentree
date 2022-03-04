const puppeteer = require('puppeteer');
const DependenTree = require('./page/main');

const pageURL = 'http://127.0.0.1:8081/index.html';


const defaultOpts = {
  // behavior options
  animationDuration: 750,
  maxDepth: 25,
  enableTooltip: true,
  enableTooltipKey: true,
  modifyEntityName: null,
  textClick: null,
  maxDepthMessage: null,
  missingEntityMessage: null,
  cyclicDependencyMessage: null,

  // appearance options
  containerWidthMultiplier: 4,
  containerWidthInPx: null,
  marginTop: 60,
  marginRight: 120,
  marginBottom: 200,
  marginLeft: 120 ,
  parentNodeTextOrientation: 'left',
  childNodeTextOrientation: 'right',
  textOffset: 13,
  textStyleFont: '12px sans-serif',
  textStyleColor: 'black',
  circleStrokeColor: 'steelblue',
  circleStrokeWidth: 3,
  circleSize: 10,
  linkStrokeColor: '#dddddd',
  linkStrokeWidth: 2,
  closedNodeCircleColor: 'lightsteelblue',
  openNodeCircleColor: 'white',
  cyclicNodeColor: '#FF4242',
  missingNodeColor: '#E8F086',
  maxDepthNodeColor: '#A691AE',
  horizontalSpaceBetweenNodes: 180,
  verticalSpaceBetweenNodes: 30,
  wrapNodeName: true,
  splitStr: null,
  tooltipItemStyleObj: {
    'font-family': 'sans-serif',
    'font-size': '12px',
  },
  tooltipColonStr: ': ',
  tooltipKeyStyleObj: { 'font-weight': 'bold' },
  tooltipColonStyleObj: { 'font-weight': 'bold' },
  tooltipValueStyleObj: {},
  tooltipStyleObj: {
    'background-color': 'white',
    border: 'solid',
    'border-width': '1px',
    'border-radius': '5px',
    padding: '10px',
  },
};

// testing most options. Some of these are tested elsewhere
// so modifying them here is not necessary. those are specified in comments
const modifiedOpts = {
  // containerWidthMultiplier: 4, → see constructor.test.js
  // containerWidthInPx: null, → see constructor.test.js
  // containerHeight: 1, → see constructor.test.js
  // containerHeightInPx: null, → see constructor.test.js
  margin: { right: 10, bottom: 10, left: 10 }, // note that top is omitted here
  // animationDuration: 500, → animation duration is difficult to test, so this is omitted
  parentNodeTextOrientation: 'right',
  childNodeTextOrientation: 'left',
  textOffset: 10,
  textStyleFont: '10px sans-serif',
  textStyleColor: 'green',
  circleStrokeColor: 'green',
  circleStrokeWidth: 10,
  circleSize: 20,
  linkStrokeColor: 'green',
  linkStrokeWidth: 5,
  closedNodeCircleColor: 'blue',
  openNodeCircleColor: 'purple',
  cyclicNodeColor: 'green',
  missingNodeColor: 'green',
  maxDepthNodeColor: 'green',
  horizontalSpaceBetweenNodes: 200,
  verticalSpaceBetweenNodes: 100,
  // maxDepth: 25, → see clone.test.js
  // wrapNodeName: true, → see text.test.js
  // splitStr: null, → see text.test.js
  // enableTooltip: true, → see mouse.test.js
  // enableTooltipKey: true, → see mouse.test.js
  tooltipItemStyleObj: {
    'font-family': 'Times New Roman',
    'font-size': '20px',
  },
  tooltipColonStr: ' - ',
  tooltipKeyStyleObj: { 'font-weight': 'normal' },
  tooltipColonStyleObj: { 'font-weight': 'normal' },
  tooltipValueStyleObj: { 'font-weight': 'bold' },
  tooltipStyleObj: {
    'background-color': 'green',
    border: 'dotted',
    'border-width': '10px',
    'border-radius': '10px',
    padding: '20px',
  },
  // modifyEntityName: null, → tested separately at the bottom
  // textClick: null, → tested separately at the bottom
  // maxDepthMessage: null, → see clone.test.js
  // missingEntityMessage: null, → see create-graph.test.js
  // cyclicDependencyMessage: null, → see clone.test.js
};

describe('Options', () => {
  let browser;
  beforeAll(async () => {
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('_setOptions', () => {
    const combinedOpts = {
      ...defaultOpts,
      ...modifiedOpts
    };

    test('default option', () => {
      const tree = new DependenTree('body');
      expect(tree.options).toMatchObject(defaultOpts);
    });

    test('passed options updated, but others left default', () => {
      const tree = new DependenTree('body', modifiedOpts);
      expect(tree.options).toMatchObject(combinedOpts);
    });
  });

  describe('changing options impacts visual output', () => {
    describe('default', () => {
      let page;
      beforeAll(async () => {
        page = await browser.newPage();
        await page.goto(pageURL);
        await page.evaluate(() => {
          const tree = new DependenTree('div#tree', { animationDuration: 0 });
          tree.addEntities(royals);
          tree.setTree('Elizabeth II', 'downstream');

          // A few misc properties we're saving before expanding the tree
          window.fillColor = document.querySelector('g:nth-of-type(4)> circle').style.fill;
          const node = tree.svg.select('svg > g:nth-of-type(3)');
          node.dispatch('mouseover');
          node.dispatch('mousemove');
          window.svgHTML = tree.tooltip.node().outerHTML;

          tree.expandAll();
        });

        await page.waitForTimeout(1000);
      });

      afterAll(async () => {
        await page.close();
      });

      test('parentNodeTextOrientation', async () => {
        const x = await page.evaluate(() => {
          return document.querySelector('text').x.animVal[0].value;
        });

        expect(x).toBeLessThan(0);
      });

      test('childNodeTextOrientation', async () => {
        const x = await page.evaluate(() => {
          return document.querySelector('g:nth-of-type(20) > text').x.animVal[0].value;
        });

        expect(x).toBeGreaterThan(0);
      });

      test('textOffset', async () => {
        const x = await page.evaluate(() => {
          return document.querySelector('text').x.animVal[0].value;
        });

        expect(Math.abs(x)).toBe(defaultOpts.textOffset);
      });

      test('textStyleFont', async () => {
        const font = await page.evaluate(() => {
          return document.querySelector('text').style.font;
        });

        expect(font).toBe(defaultOpts.textStyleFont);
      });

      test('textStyleColor', async () => {
        const color = await page.evaluate(() => {
          return document.querySelector('text').getAttribute('fill');
        });

        expect(color).toBe(defaultOpts.textStyleColor);
      });

      test('circleStrokeColor', async () => {
        const color = await page.evaluate(() => {
          return document.querySelector('circle').style.stroke;
        });

        expect(color).toBe(defaultOpts.circleStrokeColor);
      });

      test('circleStrokeWidth', async () => {
        const color = await page.evaluate(() => {
          return document.querySelector('circle').style.strokeWidth;
        });

        expect(color).toBe(`${defaultOpts.circleStrokeWidth}px`);
      });

      test('circleSize', async () => {
        const r = await page.evaluate(() => {
          return document.querySelector('circle').r.animVal.value;
        });

        expect(r).toBe(defaultOpts.circleSize);
      });

      test('linkStrokeColor', async () => {
        const color = await page.evaluate(() => {
          return document.querySelector('path').style.stroke;
        });

        expect(color).toBe('rgb(221, 221, 221)');
      });

      test('linkStrokeWidth', async () => {
        const width = await page.evaluate(() => {
          return document.querySelector('path').style['strokeWidth'];
        });

        expect(width).toBe(`${defaultOpts.linkStrokeWidth}px`);
      });

      test('closedNodeCircleColor', async () => {
        const color = await page.evaluate(() => window.fillColor);

        expect(color).toBe(defaultOpts.closedNodeCircleColor);
      });

      test('openNodeCircleColor', async () => {
        const color = await page.evaluate(() => {
          return document.querySelector('circle').style.fill
        });

        expect(color).toBe(defaultOpts.openNodeCircleColor);
      });

      test('horizontalSpaceBetweenNodes', async () => {
        const e = await page.evaluate(() => {
          return document.querySelector('g:nth-of-type(3)').transform.baseVal.consolidate().matrix.e
        });

        expect(e).toBe(defaultOpts.horizontalSpaceBetweenNodes);
      });

      // Its a little too cumbersome to test every tooltip style option
      // Settling for snapshotting the HTML output
      test('tootip styles', async () => {
        const outerHTML = await page.evaluate(() => window.svgHTML);

        expect(outerHTML).toMatchSnapshot();
      });

      describe('other colors', () => {
        let page;
        beforeAll(async () => {
          page = await browser.newPage();
          await page.goto(pageURL);
          await page.evaluate(() => {
            // modify royals slightly so we get different node colors
            const james = royals[28];
            james._deps.push('Harry');
            james._deps.push('foo');
            royals[26]._deps.push('James');

            const tree = new DependenTree('div#tree', { maxDepth: 2, animationDuration: 0 });
            tree.addEntities(royals);
            tree.setTree('James');
            tree.expandAll();
          });

          await page.waitForTimeout(1200);
        });

        afterAll(async () => {
          await page.close();
        });

        test('missingNodeColor', async () => {
          const color = await page.evaluate(() => {
            return document.querySelector('g:nth-of-type(6) > circle').style.fill;
          });

          expect(color).toBe('rgb(232, 240, 134)');
        });

        test('cyclicNodeColor', async () => {
          const color = await page.evaluate(() => {
            return document.querySelector('g:nth-of-type(9) > circle').style.fill;
          });

          expect(color).toBe('rgb(255, 66, 66)');
        });


        test('maxDepthNodeColor', async () => {
          const color = await page.evaluate(() => {
            return document.querySelector('g:nth-of-type(11) > circle').style.fill;
          });

          expect(color).toBe('rgb(166, 145, 174)');
        });
      });
    });

    describe('modified options', () => {
      let page;
      beforeAll(async () => {
        page = await browser.newPage();
        await page.goto(pageURL);
        await page.evaluate(modifiedOpts => {
          const tree = new DependenTree('div#tree', { ...modifiedOpts, animationDuration: 0 });
          tree.addEntities(royals);
          tree.setTree('Elizabeth II', 'downstream');

          // A few misc properties we're saving before expanding the tree
          window.fillColor = document.querySelector('g:nth-of-type(4)> circle').style.fill;
          const node = tree.svg.select('svg > g:nth-of-type(3)');
          node.dispatch('mouseover');
          node.dispatch('mousemove');
          window.svgHTML = tree.tooltip.node().outerHTML;

          tree.expandAll();
        }, modifiedOpts);

        await page.waitForTimeout(1000);
      });

      afterAll(async () => {
        await page.close();
      });

      test('parentNodeTextOrientation', async () => {
        const x = await page.evaluate(() => {
          return document.querySelector('text').x.animVal[0].value;
        });

        expect(x).toBeGreaterThan(0);
      });

      test('childNodeTextOrientation', async () => {
        const x = await page.evaluate(() => {
          return document.querySelector('g:nth-of-type(20) > text').x.animVal[0].value;
        });

        expect(x).toBeLessThan(0);
      });

      test('textOffset', async () => {
        const x = await page.evaluate(() => {
          return document.querySelector('text').x.animVal[0].value;
        });

        expect(Math.abs(x)).toBe(modifiedOpts.textOffset)
      });

      test('textStyleFont', async () => {
        const font = await page.evaluate(() => {
          return document.querySelector('text').style.font;
        });

        expect(font).toBe(modifiedOpts.textStyleFont);
      });

      test('textStyleColor', async () => {
        const color = await page.evaluate(() => {
          return document.querySelector('text').getAttribute('fill')
        });

        expect(color).toBe(modifiedOpts.textStyleColor);
      });

      test('circleStrokeColor', async () => {
        const color = await page.evaluate(() => {
          return document.querySelector('circle').style.stroke;
        });

        expect(color).toBe(modifiedOpts.circleStrokeColor);
      });

      test('circleStrokeWidth', async () => {
        const color = await page.evaluate(() => {
          return document.querySelector('circle').style.strokeWidth;
        });

        expect(color).toBe(`${modifiedOpts.circleStrokeWidth}px`);
      });

      test('circleSize', async () => {
        const r = await page.evaluate(() => {
          return document.querySelector('circle').r.animVal.value;
        });

        expect(r).toBe(modifiedOpts.circleSize);
      });

      test('linkStrokeColor', async () => {
        const color = await page.evaluate(() => {
          return document.querySelector('path').style.stroke;
        });

        expect(color).toBe(modifiedOpts.linkStrokeColor);
      });

      test('linkStrokeWidth', async () => {
        const width = await page.evaluate(() => {
          return document.querySelector('path').style['strokeWidth'];
        });

        expect(width).toBe(`${modifiedOpts.linkStrokeWidth}px`);
      });

      test('closedNodeCircleColor', async () => {
        const color = await page.evaluate(() => window.fillColor);

        expect(color).toBe(modifiedOpts.closedNodeCircleColor);
      });

      test('openNodeCircleColor', async () => {
        const color = await page.evaluate(() => {
          return document.querySelector('circle').style.fill
        });

        expect(color).toBe(modifiedOpts.openNodeCircleColor);
      });

      test('horizontalSpaceBetweenNodes', async () => {
        const e = await page.evaluate(() => {
          return document.querySelector('g:nth-of-type(3)').transform.baseVal.consolidate().matrix.e
        });

        expect(e).toBe(modifiedOpts.horizontalSpaceBetweenNodes);
      });

      // Its a little too cumbersome to test every tooltip style option
      // Settling for snapshotting the HTML output
      test('tootip styles', async () => {
        const outerHTML = await page.evaluate(() => window.svgHTML);

        expect(outerHTML).toMatchSnapshot();
      });

      describe('other colors', () => {
        let page;
        beforeAll(async () => {
          page = await browser.newPage();
          await page.goto(pageURL);
          await page.evaluate(modifiedOpts => {
            // modify royals slightly so we get different node colors
            const james = royals[28];
            james._deps.push('Harry');
            james._deps.push('foo');
            royals[26]._deps.push('James');

            const tree = new DependenTree(
              'body',
              { ...modifiedOpts, maxDepth: 2, animationDuration: 0 }
            );
            tree.addEntities(royals);
            tree.setTree('James');
            tree.expandAll();
          }, modifiedOpts);

          await page.waitForTimeout(2000);
        });

        afterAll(async () => {
          await page.close();
        });

        test('missingNodeColor', async () => {
          const color = await page.evaluate(() => {
            return document.querySelector('g:nth-of-type(6) > circle').style.fill;
          });

          expect(color).toBe(modifiedOpts.cyclicNodeColor);
        });

        test('cyclicNodeColor', async () => {
          const color = await page.evaluate(() => {
            return document.querySelector('g:nth-of-type(9) > circle').style.fill;
          });

          expect(color).toBe(modifiedOpts.cyclicNodeColor);
        });


        test('maxDepthNodeColor', async () => {
          const color = await page.evaluate(() => {
            return document.querySelector('g:nth-of-type(11) > circle').style.fill;
          });

          expect(color).toBe(modifiedOpts.maxDepthNodeColor);
        });
      });
    });
  });

  describe('modifyEntityName & textClick', () => {
    describe('passed as functions', () => {
      let page;
      beforeAll(async () => {

        page = await browser.newPage();
        await page.goto(pageURL);

        await page.evaluate(() => {
          function modifyEntityName(data) { return `${data._name} foo`; };
          function textClick() { window.clicked = true; };
          window.tree = new DependenTree(
            'body',
            { animationDuration: 0, modifyEntityName, textClick },
          );
          window.tree.addEntities(royals);
          window.tree.setTree('Elizabeth II', 'downstream');
        });
      });

      afterAll(async () => {
        await page.close();
      });

      test('modifyEntityName', async () => {
        const innerHTML = await page.evaluate(() => {
          return document.querySelector('tspan').innerHTML;
        });

        expect(innerHTML).toBe('Elizabeth II foo');
      });

      test('textClick', async () => {
        const clicked = await page.evaluate(() => {
          window.tree.svg.select('text').dispatch('click');
          return window.clicked;
        });

        expect(clicked).toBe(true);
      });

      test('with textClick function, clicking on text does not expand/collapse node', async () => {
        const [before, after] = await page.evaluate(() => {
          const before = document.querySelector('circle').style.fill;
          window.tree.svg.select('text').dispatch('click');
          const after = document.querySelector('circle').style.fill;
          return [before, after]
        });

        expect(before).toBe(after);
      });
    });

    describe('default value of null', () => {
      let page;
      beforeAll(async () => {
        page = await browser.newPage();
        await page.goto(pageURL);

        await page.evaluate(() => {
          window.tree = new DependenTree('div#tree',{ animationDuration: 0 });
          window.tree.addEntities(royals);
          window.tree.setTree('Elizabeth II', 'downstream');
        });
      });

      afterAll(async () => {
        await page.close();
      });

      test('modifyEntityName', async () => {
        const innerHTML = await page.evaluate(() => {
          return document.querySelector('tspan').innerHTML;
        });

        expect(innerHTML).toBe('Elizabeth II');
      });

      test('textClick', async () => {
        const clicked = await page.evaluate(() => {
          window.tree.svg.select('text').dispatch('click');
          return window.clicked;
        });

        expect(clicked).toBeUndefined();
      });

      test('without textClick function, clicking on text expands/collapses node', async () => {
        const [before, after] = await page.evaluate(() => {
          const before = document.querySelector('circle').style.fill;
          window.tree.svg.select('text').dispatch('click');
          const after = document.querySelector('circle').style.fill;
          return [before, after];
        });

        expect(before).not.toBe(after);
      });
    });
  });

  describe('catches script injection', () => {
    test('in options', () => {
      let treeInitialized;
      try {
        new DependenTree('body', { maxDepthMessage: '<script></script>' });
        treeInitialized = true;
      } catch {
        treeInitialized = false;
      }
      expect(treeInitialized).toBe(false);
    });
  })
});
