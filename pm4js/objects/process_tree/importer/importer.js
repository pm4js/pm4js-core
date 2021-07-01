class PtmlImporter {
	static apply(xmlString) {
		let parser = new DOMParser();
		var xmlDoc = parser.parseFromString(xmlString, "text/xml");
		let xmlPtml = xmlDoc.getElementsByTagName("ptml")[0];
		var xmlProcessTree = xmlPtml.getElementsByTagName("processTree")[0];
		let processTree = PtmlImporter.importFromXml(xmlProcessTree);
		Pm4JS.registerObject(processTree, "Process Tree imported from a PTML file");
		return processTree;
	}
	
	static importFromXml(xmlProcessTree) {
		let nodes = {};
		for (let childId in xmlProcessTree.childNodes) {
			console.log(childId);
			let child = xmlProcessTree.childNodes[childId];
			if (child.tagName != null) {
				let elId = child.getAttribute("id");
				let elLabel = child.getAttribute("name");
				console.log(elId);
				let elOperator = null;
				if (child.tagName == "and") {
					elOperator = ProcessTreeOperator.AND;
				}
				else if (child.tagName == "xorLoop") {
					elOperator = ProcessTreeOperator.LOOP;
				}
				else if (child.tagName == "sequence") {
					elOperator = ProcessTreeOperator.SEQUENCE;
				}
				else if (child.tagName == "or") {
					elOperator = ProcessTreeOperator.INCLUSIVE;
				}
				else if (child.tagName == "xor") {
					elOperator = ProcessTreeOperator.EXCLUSIVE;
				}
				
				if (child.tagName != "parentsNode") {
					let tree = new ProcessTree(null, elOperator, elLabel);
					nodes[elId] = tree;
				}
				else {
					let sourceId = child.getAttribute("sourceId");
					let targetId = child.getAttribute("targetId");
					nodes[targetId].parentNode = nodes[sourceId];
					nodes[sourceId].children.push(nodes[targetId]);
				}
			}
		}
		for (let nodeId in nodes) {
			let node = nodes[nodeId];
			if (node.parentNode == null) {
				return node;
			}
		}
	}
}

try {
	require('../../../pm4js.js');
	require('../process_tree.js');
	module.exports = {PtmlImporter: PtmlImporter};
	global.PtmlImporter = PtmlImporter;
	global.DOMParser = require('xmldom').DOMParser;
}
catch (err) {
	// not in Node
	console.log(err);
}

Pm4JS.registerImporter("PtmlImporter", "apply", ["ptml"], "PTML Importer", "Alessandro Berti");
