class LinkedListMaker {
  constructor() {
    this.obj = {};
    this.arr = [];
  }

  createLinkedList(maxDepth) {
    if (maxDepth === 1) { return; }
    const next = maxDepth - 1;
    const obj = {
      _name: maxDepth.toString(),
      _deps: [next.toString()],
    };

    this.obj[maxDepth] = obj;
    this.arr.push(obj);

    this.createLinkedList(next);
  }
}

module.exports = LinkedListMaker;
