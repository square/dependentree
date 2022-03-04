const DependenTree = require('./page/main');
const { royals, rps } = require('./page/testData');


// test data needs to be cloned as objects stay consistent
// across different runs of create graph.
function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

// Note that _warnDuplicates is already tested in validate

describe('Create Graph', () => {
  describe('_populateUpstream', () => {
    test('valid array input produces upstream', () => {
      const tree = new DependenTree('body');
      tree._populateUpstream(royals);

      expect(tree.upstream).toMatchSnapshot();
    });

    test('valid object input produces upstream', () => {
      const tree = new DependenTree('body');
      tree._populateUpstream(rps);

      expect(tree.upstream).toMatchSnapshot();
    });

    test('invalid array input throws error', () => {
      const expected = 'Entity "Elizabeth II" is duplicated in the input data. Ensure that every entity in the input data has a unique name.';

      const tree = new DependenTree('body');
      const invalidRoyals = [royals[0], royals[0]];
      let error = null;

      try {
        tree._populateUpstream(invalidRoyals);
      } catch (e) {
        error = e.message;
      }

      expect(error).toBe(expected);
    });
  });

  // this._populateUpstream(dependencies);
  // this._setPointersForUpstreamAndPopulateDownstream();
  // this._setPointersForDownstream();

  describe('_setPointersForUpstreamAndPopulateDownstream', () => {
    test('produces expected upstream object', () => {
      const royalsClone = deepClone(royals);
      const tree = new DependenTree('body');
      tree._populateUpstream(royalsClone);
      tree._setPointersForUpstreamAndPopulateDownstream();
      expect(tree.upstream).toMatchSnapshot();
    });

    test('produces expected downstream object', () => {
      const royalsClone = deepClone(royals);
      const tree = new DependenTree('body');
      tree._populateUpstream(royalsClone);
      tree._setPointersForUpstreamAndPopulateDownstream();
      expect(tree.downstream).toMatchSnapshot();
    });
  });

  describe('_setPointersForDownstream', () => {
    test('produces expected downstream object royals', () => {
      const royalsClone = deepClone(royals);
      const tree = new DependenTree('body');
      tree._populateUpstream(royalsClone);
      tree._setPointersForUpstreamAndPopulateDownstream();
      tree._setPointersForDownstream();
      expect(tree.downstream).toMatchSnapshot();
    });

    test('produces expected downstream object rps', () => {
      const rpsClone = deepClone(rps);
      const tree = new DependenTree('body');
      tree._populateUpstream(rpsClone);
      tree._setPointersForUpstreamAndPopulateDownstream();
      tree._setPointersForDownstream();
      expect(tree.downstream).toMatchSnapshot();
    });
  });


  describe('_typeCheckEntity', () => {
    test('catches not object error', () => {
      const expected = 'Entity "foo" is not of type Object. Instead received a value of "true".'
      let error = null;
      try {
        DependenTree.prototype._typeCheckEntity(true, 'foo');
      } catch (e) {
        error = e.message;
      }
      expect(error).toBe(expected);
    });

    test('catches when _deps is not undefined, null, or array', () => {
      const expected = '"_deps" key in "foo" entity object is not of type array, undefined, or null. Instead received a value of "true".';
      let error = null;
      try {
        DependenTree.prototype._typeCheckEntity({ _name: 'foo', _deps: true }, 'foo');
      } catch (e) {
        error = e.message;
      }
      expect(error).toBe(expected);
    });
  });

  describe('_isValidNameStr', () => {
    test('catches non string name error', () => {
      const expected = '"_name" key in entity object is not of type string. Instead received a value of "true" with a type of "boolean".'

      let error = null;
      try {
        DependenTree.prototype._isValidNameStr(null, true);
      } catch (e) {
        error = e.message;
      }
      expect(error).toBe(expected);
    });

    test('throws error', () => {
      const expected = 'An entity was found with a "_name" key as an empty string. This is considered invalid.';
      let error = null;
      try {
        DependenTree.prototype._isValidNameStr(null, '');
      } catch (e) {
        error = e.message;
      }
      expect(error).toBe(expected);
    });

    test('throws parent error', () => {
      const expected = 'Entity "parent" was found with an element in "_deps" containing an empty string. This is considered invalid. Ensure all dependencies in _deps are valid strings.';
      let error = null;
      try {
        DependenTree.prototype._isValidNameStr('parent', '');
      } catch (e) {
        error = e.message;
      }
      expect(error).toBe(expected);
    });

    test('does not throw error with valid input', () => {
      let error = null;
      try {
        DependenTree.prototype._isValidNameStr('parent', 'child');
      } catch (e) {
        error = e.message;
      }
      expect(error).toBeNull();
    });
  });

  describe('_isNullOrUndef', () => {
    test('null', () => {
      const result = DependenTree.prototype._isNullOrUndef(null);
      expect(result).toBe(true);
    });

    test('undefined', () => {
      const result = DependenTree.prototype._isNullOrUndef();
      expect(result).toBe(true);
    });

    test('other falsy value is not', () => {
      const result = DependenTree.prototype._isNullOrUndef('');
      expect(result).toBe(false);
    });

    test('truthy value is not', () => {
      const result = DependenTree.prototype._isNullOrUndef({});
      expect(result).toBe(false);
    });
  });


  describe('_addNode', () => {
    test('adds to upstream', () => {
      const tree = new DependenTree('body');
      tree._addNode('upstream', { _name: 'foo' });
      expect({ foo: { _name: 'foo' } }).toMatchObject(tree.upstream);
    });

    test('adds to downstream', () => {
      const tree = new DependenTree('body');
      tree._addNode('downstream', { _name: 'foo' });
      expect({ foo: { _name: 'foo' } }).toMatchObject(tree.downstream);
    });

    test('adds additional properties', () => {
      const tree = new DependenTree('body');
      tree._addNode('upstream', { _name: 'foo' }, { baz: 'bar'});
      expect({ foo: { _name: 'foo',  baz: 'bar' } }).toMatchObject(tree.upstream);
    });
  });

  describe('_createMissingEntity', () => {
    test('adds missing entity to array', () => {
      const tree = new DependenTree('body', { missingEntityMessage: 'foo' });
      tree._createMissingEntity('foo', 'upstream');

      expect(tree.missingEntities).toEqual(expect.arrayContaining(['foo']));
    });

    test('missing entity is found in up/downstream', () => {
      const expected = { foo: { _name: 'foo', _missing: true, 'Automated Note': 'foo' } };
      const tree = new DependenTree('body', { missingEntityMessage: 'foo' });
      tree._createMissingEntity('foo', 'upstream');

      expect(expected).toMatchObject(tree.upstream);
    });

    test('missingEntityMessage option as string matches automated note', () => {
      const missingEntityMessage = 'foo';
      const tree = new DependenTree('body', { missingEntityMessage });
      const note = tree._createMissingEntity('foo', 'upstream')['Automated Note'];

      expect(note).toBe(missingEntityMessage);
    });

    test('missingEntityMessage option as function changes automated note', () => {
      function missingEntityMessage(arg) { return `this is ${arg}`; }
      const tree = new DependenTree('body', { missingEntityMessage });
      const note = tree._createMissingEntity('foo', 'upstream')['Automated Note'];

      expect(note).toBe('this is foo');
    });

    test('missingEntityMessage option default', () => {
      const expected = '"foo" was not found in the input entity list and was added by the visualization library. This entity have additional dependencies of its own.';
      const tree = new DependenTree('body');
      const note = tree._createMissingEntity('foo', 'upstream')['Automated Note'];

      expect(note).toBe(expected);
    });
  });
});
