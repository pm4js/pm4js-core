const heapqTop = 0;
const heapqParent = i => ((i + 1) >>> 1) - 1;
const heapqLeft = i => (i << 1) + 1;
const heapqRight = i => (i + 1) << 1;

class PriorityQueue {
  constructor(comparator = (a, b) => a > b) {
    this._heap = [];
    this._comparator = comparator;
  }
  size() {
    return this._heap.length;
  }
  isEmpty() {
    return this.size() == 0;
  }
  peek() {
    return this._heap[heapqTop];
  }
  push(...values) {
    values.forEach(value => {
      this._heap.push(value);
      this._siftUp();
    });
    return this.size();
  }
  pop() {
    const poppedValue = this.peek();
    const bottom = this.size() - 1;
    if (bottom > heapqTop) {
      this._swap(heapqTop, bottom);
    }
    this._heap.pop();
    this._siftDown();
    return poppedValue;
  }
  replace(value) {
    const replacedValue = this.peek();
    this._heap[heapqTop] = value;
    this._siftDown();
    return replacedValue;
  }
  _greater(i, j) {
    return this._comparator(this._heap[i], this._heap[j]);
  }
  _swap(i, j) {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }
  _siftUp() {
    let node = this.size() - 1;
    while (node > heapqTop && this._greater(node, heapqParent(node))) {
      this._swap(node, heapqParent(node));
      node = heapqParent(node);
    }
  }
  _siftDown() {
    let node = heapqTop;
    while (
      (heapqLeft(node) < this.size() && this._greater(heapqLeft(node), node)) ||
      (heapqRight(node) < this.size() && this._greater(heapqRight(node), node))
    ) {
      let maxChild = (heapqRight(node) < this.size() && this._greater(heapqRight(node), heapqLeft(node))) ? heapqRight(node) : heapqLeft(node);
      this._swap(node, maxChild);
      node = maxChild;
    }
  }
}

try {
	module.exports = {PriorityQueue: PriorityQueue};
	global.PriorityQueue = PriorityQueue;
}
catch (err) {
	// not in Node
	//console.log(err);
}
