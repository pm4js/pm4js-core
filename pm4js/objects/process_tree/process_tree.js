class ProcessTreeOperator {
}

ProcessTreeOperator.SEQUENCE = "sequence";
ProcessTreeOperator.PARALLEL = "and";
ProcessTreeOperator.INCLUSIVE = "or";
ProcessTreeOperator.EXCLUSIVE = "xor";
ProcessTreeOperator.LOOP = "xorLoop";

class ProcessTree {
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	constructor(parentNode, operator, label) {
		this.parentNode = parentNode;
		this.operator = operator;
		this.label = label;
		this.id = ProcessTree.uuidv4();
		this.children = [];
	}
}

try {
	require('../../pm4js.js');
	module.exports = { ProcessTree: ProcessTree, ProcessTreeOperator: ProcessTreeOperator };
	global.ProcessTree = ProcessTree;
	global.ProcessTreeOperator = ProcessTreeOperator;
}
catch (err) {
	// not in Node
	console.log(err);
}