const puppeteer = require('puppeteer');
const DependenTree = require('./page/main');

const pageURL = 'http://127.0.0.1:8081/index.html';


describe('Clone', () => {
  let browser;
  beforeAll(async () => {
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('Cyclic', () => {
    let clones;
    let upstream;
    let page;
    beforeAll(async () => {
      page = await browser.newPage();
      await page.goto(pageURL);

      ([clones, upstream] = await page.evaluate(() => {
        window.tree = new DependenTree('div#tree');
        window.tree.addEntities(rps);
        window.tree.setTree('rock');
        return [tree.clones, tree.upstream];
      }));
    });

    afterAll(async () => {
      await page.close();
    });

    test('catches cycles', () => {
      expect(clones.length).toBe(1);
    });

    test('cloned node is rock', () => {
      const child = clones[0][2];
      expect(child._name).toBe('rock');
    });

    test('cloned node is identified as clone', () => {
      const rockClone = upstream.scissors._deps[0];
      expect(rockClone._isClone).toBe(true);
    });

    test('cloned rock node is not the same as original rock node', () => {
      const rockClone = upstream.scissors._deps[0];
      const { rock } = upstream;
      expect(rockClone).not.toBe(rock);
    });

    test('"Cyclic Dependency Paths" sets correctly', () => {
      const paths = upstream.scissors._deps[0]['Cyclic Dependency Paths'];
      expect(paths).toBe('rock → paper → scissors → rock');
    });

    test('"Automated Note" sets correctly', () => {
      const note = upstream.scissors._deps[0]['Automated Note'];
      expect(note).toBe(
        'This entity depends on another entity that has already been displayed up the branch. No more entities will be displayed here to prevent an infinite loop.'
      );
    });

    test('cyclicDependencyMessage option as string changes "Automated Note"', async () => {
      const page2 = await browser.newPage();
      await page2.goto(pageURL);

      const expectedNote = 'This note is passed in as an option';

      const note = await page2.evaluate((expectedNote) => {
        const tree = new DependenTree('div#tree', { cyclicDependencyMessage: expectedNote });
        tree.addEntities(rps);
        tree.setTree('rock');
        return tree.upstream.scissors._deps[0]['Automated Note'];
      }, expectedNote);

      page2.close();

      expect(note).toBe(expectedNote);
    });

    test('cyclicDependencyMessage option as function changes "Automated Note"', async () => {
      const page2 = await browser.newPage();
      await page2.goto(pageURL);

      const expectedNote = 'This note is passed in as an option';

      const note = await page2.evaluate((expectedNote) => {
        const tree = new DependenTree('div#tree', { cyclicDependencyMessage: () => expectedNote });
        tree.addEntities(rps);
        tree.setTree('rock');
        return tree.upstream.scissors._deps[0]['Automated Note'];
      }, expectedNote);

      page2.close();

      expect(note).toBe(expectedNote);
    });

    // upstream will be undefined because puppeteer
    // can't return a circular structure
    test('deleting clones makes a circular structure', async () => {
      const newUpstream = await page.evaluate(() => {
        window.tree._deleteClones();
        return tree.upstream;
      });
      expect(newUpstream).toBeUndefined();
    });
  });

  describe('Max Depth', () => {
    const maxDepth = 1;
    let clones;
    let upstream;
    let page;
    beforeAll(async () => {
      page = await browser.newPage();
      await page.goto(pageURL);

      ([clones, upstream] = await page.evaluate((maxDepth) => {
        window.tree = new DependenTree('div#tree', { maxDepth });
        window.tree.addEntities(rps);
        window.tree.setTree('rock');
        return [tree.clones, tree.upstream];
      }, maxDepth));
    });

    afterAll(async () => {
      await page.close();
    });

    test('catches max depth', () => {
      expect(clones.length).toBe(1);
    });

    test('cloned node is paper', () => {
      const child = clones[0][2];
      expect(child._name).toBe('paper');
    });

    test('cloned paper node is not the same as original paper node', () => {
      const paperClone = upstream.rock._deps[0];
      const { paper } = upstream;
      expect(paperClone).not.toBe(paper);
    });

    test('"Automated Note" sets correctly', () => {
      const note = upstream.rock._deps[0]['Automated Note'];
      expect(note).toBe(
        `Maximum depth of ${maxDepth} entities reached. This entity has additional children, but they cannot be displayed. Set this entity as the root to view additional dependencies.`
      );
    });

    test('maxDepthMessage option as string changes "Automated Note"', async () => {
      const page2 = await browser.newPage();
      await page2.goto(pageURL);

      const expectedNote = 'This note is passed in as an option';

      const note = await page2.evaluate((maxDepth, expectedNote) => {
        const tree = new DependenTree('div#tree', { maxDepth, maxDepthMessage: expectedNote });
        tree.addEntities(rps);
        tree.setTree('rock');
        return tree.upstream.rock._deps[0]['Automated Note'];
      }, maxDepth, expectedNote);

      page2.close();

      expect(note).toBe(expectedNote);
    });

    test('maxDepthMessage option as function changes "Automated Note"', async () => {
      const page2 = await browser.newPage();
      await page2.goto(pageURL);

      const expectedNote = 'This note is passed in as an option';

      const note = await page2.evaluate((maxDepth, expectedNote) => {
        const tree = new DependenTree('div#tree', { maxDepth, maxDepthMessage: () => expectedNote });
        tree.addEntities(rps);
        tree.setTree('rock');
        return tree.upstream.rock._deps[0]['Automated Note'];
      }, maxDepth, expectedNote);

      page2.close();

      expect(note).toBe(expectedNote);
    });

    test('deleting clones brings back upstream children', async () => {
      // only non-clones have a _deps property;
      const depsExist = await page.evaluate(() => {
        window.tree._deleteClones();
        return Boolean(tree.upstream.rock._deps[0]._deps);
      });
      expect(depsExist).toBe(true);
    });
  });

  describe('Error message hierarchy', () => {
    test('missing entity > max depth', async () => {
      const page2 = await browser.newPage();
      await page2.goto(pageURL);

      const maxDepth = 1;
      const data = [{_name: 'a', _deps: ['b', 'c']}, { _name: 'b', _deps: ['d'] }];

      const [b, c] = await page2.evaluate((maxDepth, data) => {
        const tree = new DependenTree('div#tree', { maxDepth });
        tree.addEntities(data);
        tree.setTree('a');
        return [
          tree.upstream.a._deps[0]._maxDepth,
          tree.upstream.c._missing
        ];
      }, maxDepth, data);

      await page2.close();

      // b is not missing, so we get get _maxDepth
      expect(b).toBe(true);

      // c is missing so _missing takes precedence over _maxDepth
      expect(c).toBe(true);
    });

    test('cycle > max depth', async () => {
      const page2 = await browser.newPage();
      await page2.goto(pageURL);

      const maxDepth = 1;
      const data = [{_name: 'a', _deps: ['b', 'a']}, { _name: 'b', _deps: ['d'] }];

      const [b, a] = await page2.evaluate((maxDepth, data) => {
        const tree = new DependenTree('div#tree', { maxDepth });
        tree.addEntities(data);
        tree.setTree('a');
        return [
          tree.upstream.a._deps[0]._maxDepth,
          tree.upstream.a._deps[1]._cyclic,
        ];
      }, maxDepth, data);

      await page2.close();

      // a is cycle and should have _cyclic which takes precedence
      expect(a).toBe(true);

      // b is at max depth but not a cycle so it should have _maxDepth
      expect(b).toBe(true);
    });

    test('entity without _deps does not have _maxDepth', async () => {
      const page2 = await browser.newPage();
      await page2.goto(pageURL);

      const maxDepth = 1;
      const data = [{ _name: 'a', _deps: ['b'] }, { _name: 'b' }];

      const _maxDepth = await page2.evaluate((maxDepth, data) => {
        const tree = new DependenTree('div#tree', { maxDepth });
        tree.addEntities(data);
        tree.setTree('a');
        return tree.upstream.a._deps[0]._maxDepth;
      }, maxDepth, data);

      await page2.close();

      expect(_maxDepth).toBeUndefined();
    });
  });

  describe('Utils', () => {
    test('_cloneNode', () => {
      const child = { _name: 'bar', _deps: [1, 2, 3] };
      const node = { _name: 'foo', _deps: [child] };
      const index = 0;

      const tree = new DependenTree('body');
      tree._cloneNode(node, index, child);

      const clonedChild = node._deps[index];

      expect(child).not.toBe(clonedChild);
      expect(child._name).toBe('bar');
    });

    test('_createNodeCopy', () => {
      const expected = { _name: 'foo', bar: 'baz' }

      const node = { _name: 'foo', _deps: [] };
      const additionalProperties = { bar: 'baz' };
      const result = DependenTree.prototype._createNodeCopy(node, additionalProperties);

      expect(result).toMatchObject(expected);
    });
  });
});
