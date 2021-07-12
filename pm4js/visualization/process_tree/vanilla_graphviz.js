class ProcessTreeVanillaVisualizer {
	static nodeUuid(uuid) {
		return "n"+uuid.replace(/-/g, "");
	}
	
	static apply(processTree) {
		let descendants = {};
		ProcessTreeVanillaVisualizer.findAllDescendants(processTree, descendants);
		let ret = [];
		ret.push("digraph G {");
		for (let desc in descendants) {
			let tree = descendants[desc];
			let treeId = ProcessTreeVanillaVisualizer.nodeUuid(desc);
			let nodeLabel = "";
			if (tree.label != null) {
				nodeLabel = tree.label;
			}
			
			if (tree.operator == ProcessTreeOperator.SEQUENCE) {
				nodeLabel = "seq";
			}
			else if (tree.operator == ProcessTreeOperator.PARALLEL) {
				nodeLabel = "and";
			}
			else if (tree.operator == ProcessTreeOperator.INCLUSIVE) {
				nodeLabel = "or";
			}
			else if (tree.operator == ProcessTreeOperator.EXCLUSIVE) {
				nodeLabel = "xor";
			}
			else if (tree.operator == ProcessTreeOperator.LOOP) {
				nodeLabel = "xorLoop";
			}
			
			if (tree.operator == null && tree.label == null) {
				ret.push(treeId+" [shape=point, label=\"\", style=filled, fillcolor=black]");
			}
			else {
				ret.push(treeId+" [shape=ellipse; label=\""+nodeLabel+"\"]");
			}
		}
		for (let desc in descendants) {
			let tree = descendants[desc];
			let treeId = ProcessTreeVanillaVisualizer.nodeUuid(desc);
			let childCount = 0;
			for (let child of tree.children) {
				let childId = ProcessTreeVanillaVisualizer.nodeUuid(child.id);
				ret.push(treeId+" -> "+childId+" [dir=none]");
				childCount++;
				if (tree.operator == ProcessTreeOperator.LOOP) {
					if (childCount == 2) {
						break;
					}
				}
			}
		}
		ret.push("}");
		return ret.join('\n');
	}
	
	static findAllDescendants(processTree, descendants) {
		descendants[processTree.id] = processTree;
		if (processTree.operator == ProcessTreeOperator.LOOP) {
			ProcessTreeVanillaVisualizer.findAllDescendants(processTree.children[0], descendants);
			ProcessTreeVanillaVisualizer.findAllDescendants(processTree.children[1], descendants);
		}
		else {
			for (let child of processTree.children) {
				ProcessTreeVanillaVisualizer.findAllDescendants(child, descendants);
			}
		}
	}
}

try {
	require('../../pm4js.js');
	require('../../objects/process_tree/process_tree.js');
	module.exports = {ProcessTreeVanillaVisualizer: ProcessTreeVanillaVisualizer};
	global.ProcessTreeVanillaVisualizer = ProcessTreeVanillaVisualizer;
}
catch (err) {
	// not in node
	console.log(err);
}
