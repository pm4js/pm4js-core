require('../../init.js');

let root = new ProcessTree(null, ProcessTreeOperator.SEQUENCE, null);
let child1 = new ProcessTree(root, ProcessTreeOperator.EXCLUSIVE, null);
let child2 = new ProcessTree(root, null, 'label of the visibile leaf');
let child3 = new ProcessTree(root, null, null);
root.children.push(child1);
root.children.push(child2);
root.children.push(child3);
let gv = ProcessTreeVanillaVisualizer.apply(root);
console.log(gv);
