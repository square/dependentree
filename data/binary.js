class BinaryTreeMaker {
  constructor () {
    this.obj = {};
    this.arr = [];
  }

  createBinaryTree(maxDepth, str = ' ') {
    const obj = {
      _name: str,
      _deps: [`${str}0`.trim(), `${str}1`.trim()],
      Number: Number.parseInt(str.split('').reverse().join(''), 2),
    };

    this.obj[str] = obj;
    this.arr.push(obj);

    if (str.length === maxDepth) {
      delete obj._deps;
      return;
    }

    this.createBinaryTree(maxDepth, obj._deps[0]);
    this.createBinaryTree(maxDepth, obj._deps[1]);
  };
}

module.exports = BinaryTreeMaker;
