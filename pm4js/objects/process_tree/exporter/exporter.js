class PtmlExporter {
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static apply(processTree) {
		let xmlDoc = document.createElement("ptml");
		let xmlProcessTree = document.createElementNS(PtmlExporter.DUMMY_SEP, "processTree");
		xmlDoc.appendChild(xmlProcessTree);
		let ptId = PtmlExporter.uuidv4();
		xmlProcessTree.setAttribute("id", ptId);
		xmlProcessTree.setAttribute("name", ptId);
		xmlProcessTree.setAttribute("root", processTree.id);
		let descendants = {};
		PtmlExporter.findAllDescendants(processTree, descendants);
		for (let treeId in descendants) {
			let tree = descendants[treeId];
			let label = "";
			let nodeType = "automaticTask";
			if (tree.label != null) {
				label = tree.label;
				nodeType = "manualTask";
			}
			if (tree.operator == ProcessTreeOperator.SEQUENCE) {
				nodeType = "sequence";
			}
			else if (tree.operator == ProcessTreeOperator.PARALLEL) {
				nodeType = "and";
			}
			else if (tree.operator == ProcessTreeOperator.INCLUSIVE) {
				nodeType = "or";
			}
			else if (tree.operator == ProcessTreeOperator.EXCLUSIVE) {
				nodeType = "xor";
			}
			else if (tree.operator == ProcessTreeOperator.LOOP) {
				nodeType = "xorLoop";
			}
			
			let xmlNode = document.createElementNS(PtmlExporter.DUMMY_SEP, nodeType);
			xmlNode.setAttribute("id", treeId);
			xmlNode.setAttribute("name", label);
			xmlProcessTree.appendChild(xmlNode);
		}

		for (let treeId in descendants) {
			let tree = descendants[treeId];

			if (tree.parentNode != null) {
				let xmlParentsNode = document.createElementNS(PtmlExporter.DUMMY_SEP, "parentsNode");
				xmlParentsNode.setAttribute("id", PtmlExporter.uuidv4());
				xmlParentsNode.setAttribute("sourceId", tree.parentNode.id);
				xmlParentsNode.setAttribute("targetId", tree.id);
				xmlProcessTree.appendChild(xmlParentsNode);
			}
			
		}
		
		let serializer = null;
		try {
			serializer = new XMLSerializer();
		}
		catch (err) {
			serializer = require('xmlserializer');
		}
		
		let xmlStr = serializer.serializeToString(xmlDoc);
		xmlStr = xmlStr.replace(/AIOEWFRIUOERWQIO/g, "");

		return xmlStr;
	}

	static findAllDescendants(processTree, descendants) {
		descendants[processTree.id] = processTree;
		if (processTree.operator == ProcessTreeOperator.LOOP) {
			if (processTree.children.length < 3) {
				let thirdChild = new ProcessTree();
				thirdChild.parent = processTree;
				processTree.children.push(thirdChild);
			}
		}
		for (let child of processTree.children) {
			PtmlExporter.findAllDescendants(child, descendants);
		}
	}
}

// unlikely string, better look at other solutions ...
PtmlExporter.DUMMY_SEP = "AIOEWFRIUOERWQIO";

try {
	const jsdom = require("jsdom");
	const { JSDOM } = jsdom;
	global.dom = new JSDOM('<!doctype html><html><body></body></html>');
	global.window = dom.window;
	global.document = dom.window.document;
	global.navigator = global.window.navigator;
	require('../../../pm4js.js');
	global.PtmlExporter = PtmlExporter;
	module.exports = {PtmlExporter: PtmlExporter};
}
catch (err) {
	// not in node
	//console.log(err);
}

Pm4JS.registerExporter("PtmlExporter", "apply", "ProcessTree", "ptml", "text/xml", "Process tree Exporter (.ptml)", "Alessandro Berti");
