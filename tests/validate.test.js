const DependenTree = require('./page/main');
const { royals, rps } = require('./page/testData');


describe('Validate', () => {
  test('throws an error if entities have not been added', () => {
    const target = 'Cannot validate entities before entities have been added. Pass data to addEntities first.';

    const tree = new DependenTree('body');
    let message;
    try {
      tree.validate();
    } catch (e) {
      message = e.message
    }
    expect(message).toBe(target);
  });


  describe('Simple clean data is all "valid"', () => {
    const tree = new DependenTree('body');
    tree.addEntities(royals);
    const {
      noDuplicateDependencies,
      noMissingEntities,
      duplicateDependencies,
      missingEntities,
      noCycles,
    } = tree.validate();

    test('noDuplicateDependencies', () => {
      expect(noDuplicateDependencies).toBe(true);
    });

    test('noMissingEntities', () => {
      expect(noMissingEntities).toBe(true);
    });

    test('duplicateDependencies', () => {
      expect(duplicateDependencies.length).toBe(0);
    });

    test('missingEntities', () => {
      expect(missingEntities.length).toBe(0);
    });

    test('noCycles', () => {
      expect(noCycles).toBe(true);
    });
  });

  describe('Cyclic malformed data is all "not valid"', () => {
    rps.rock._deps.push('paper');
    rps.rock._deps.push('paa');
    rps.scissors._deps.push('guu');
    rps.paper._deps.push('choki');

    const tree = new DependenTree('body');
    tree.addEntities(rps);
    const {
      noDuplicateDependencies,
      noMissingEntities,
      duplicateDependencies,
      missingEntities,
      noCycles,
    } = tree.validate();

    test('noDuplicateDependencies', () => {
      expect(noDuplicateDependencies).toBe(false);
    });

    test('noMissingEntities', () => {
      expect(noMissingEntities).toBe(false);
    });

    test('duplicateDependencies', () => {
      expect(duplicateDependencies).toEqual(expect.arrayContaining(['rock -> paper']));
    });

    test('missingEntities', () => {
      expect(missingEntities).toEqual(expect.arrayContaining(['paa', 'guu', 'choki']));
    });

    test('noCycles', () => {
      expect(noCycles).toBe(false);
    });
  });
});
