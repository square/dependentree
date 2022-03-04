# Contributing

- [Contributing](#contributing)
  - [Sign the CLA](#sign-the-cla)
  - [Guidance](#guidance)
    - [One issue or bug per Pull Request](#one-issue-or-bug-per-pull-request)
    - [Issues before features](#issues-before-features)
    - [Backwards compatibility](#backwards-compatibility)
    - [Forwards compatibility](#forwards-compatibility)
  - [Making changes](#making-changes)
    - [Setup](#setup)
    - [Modifying tree behavior](#modifying-tree-behavior)
    - [Working with test data](#working-with-test-data)
    - [Test data](#test-data)
    - [Style Guide / Linting](#style-guide--linting)
  - [Testing](#testing)
    - [Setup](#setup-1)
    - [All Tests](#all-tests)
    - [Individual Tests](#individual-tests)
  - [Build versions of the library](#build-versions-of-the-library)

## Sign the CLA

All contributors to your PR must sign our [Individual Contributor License Agreement (CLA)](https://spreadsheets.google.com/spreadsheet/viewform?formkey=dDViT2xzUHAwRkI3X3k5Z0lQM091OGc6MQ&ndplr=1). The CLA is a short form that ensures that you are eligible to contribute.


## Guidance

### One issue or bug per Pull Request

Keep your Pull Requests small. Small PRs are easier to reason about which makes them significantly more likely to get merged.


### Issues before features

If you want to add a feature, please file an [Issue](../../issues) first. An Issue gives us the opportunity to discuss the requirements and implications of a feature with you before you start writing code.


### Backwards compatibility

Respect the minimum deployment target. If you are adding code that uses new APIs, make sure to prevent older clients from crashing or misbehaving. Our CI runs against our minimum deployment targets, so you will not get a green build unless your code is backwards compatible. 


### Forwards compatibility

Please do not write new code using deprecated APIs.


## Making changes

### Setup

Develop with live reloading. Make changes in `src/` and see code changes reflected in the `dev/` folder which is served to http://127.0.0.1:8080/.

```bash
yarn install

yarn dev-init

yarn start
```

Note that `yarn dev-init` copies over test data from `data/` and overwrites any changes you have made to these files.


### Modifying tree behavior

DependenTree is a visualization library and it's often best to test tree behavior manually as you make source code changes. To do so, make changes in `dev/index.html`.


### Working with test data

Test data is found in the `data/` folder. These files are copied into `dev/testData.js` and `tests/page/testData.js`. If you need to modify any test data as you develop, please do so in `dev/testData.js` as we do not want to impact `tests/`. Note that changes made to `dev/testData.js` will be overwritten by running `yarn dev-init` again.

Changes to test data or further additions to test data will be considered in pull requests with good reason.


### Test data

| Data                | Description                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| royals              | Data which produces the current british royal family tree. This data is useful as entities in this test data have a number of additional fields. |
| rock-paper-scissors | Data which includes a cycle.                                                                                                                     |
| binary              | a class that produces a binary tree of varying size. Useful for testing scale.                                                                   |
|                     | `const bt = new BinaryTreeMaker(); bt.createBinaryTree(30); tree.addEntities(bt.obj);`                                                           |
| linked-list         | a class that produces a linked list of varying size. Useful for testing max-depth.                                                               |
|                     | `const ll = new LinkedListMaker(); ll.createLinkedList(30); tree.addEntities(ll.obj);`                                                           |


### Style Guide / Linting 
The files in `src/` follow the [Square JavaScript style guide](https://github.com/square/eslint-plugin-square). Pre-commit hooks will prevent commits unless all lint rules are met. 

```bash
yarn install

yarn lint

or 

yarn lint-fix
```


## Testing

Tests use a mix of Jest's jsdom and puppeteer. The jsdom is used for basic unit tests. Puppeteer is used when a real DOM is required. All tests that require `DependenTree.prototype.setTree` need to execute on a real DOM as real pixel hights and lengths are needed to make calculations on SVG element size.

With a visualization library, it is difficult to test every aspect of the tree layout. We use Jest [Snapshots](https://jestjs.io/docs/snapshot-testing) when ensuring the structure of the DOM or other verbose outputs remain consistent.


### Setup

`test-init` bundles DependenTree from `src/` and copies over test and html files from `data/` into `tests/page/`. The files in `test/page/` should not be modified.

```bash
yarn install

yarn test-init
```

### All Tests 

```bash
yarn test
```

This will launch a server which will serve `tests/page`.

### Individual Tests

Launch the server and webpack bundler separately and then individually run each test suite

```bash
yarn serve-test

yarn build-test --watch

jest tests/clone.test.js
```

It's also a good idea to run `yarn start` concurrently as this will allow you to see live changes to the source code if you need to edit or debug it when working on tests.


## Build versions of the library
| Command          | Description                                                                      |
| ---------------- | -------------------------------------------------------------------------------- |
| yarn build-min   | minified production build in `dist/`                                             |
| yarn build-es5   | minified ES5 production build in `dist/`                                         |
| yarn build-plain | production build in `dist/`                                                      |
| yarn build       | build all production versions above in `dist/`                                   |
| yarn build-dev   | builds a development version in `dev/`                                           |
| yarn build-watch | continually builds a development version in `dev/` on each code change in `src/` |
