class BpmnImporter {
	static apply(xmlString) {
		let parser = new DOMParser();
		var xmlDoc = parser.parseFromString(xmlString, "text/xml");
		let definitions = null;
		for (let childId in xmlDoc.childNodes) {
			let child = xmlDoc.childNodes[childId];
			if (child.tagName != null && child.tagName.endsWith("definitions")) {
				definitions = child;
			}
		}
		let bpmnGraph = new BpmnGraph();
		BpmnImporter.parseRecursive(definitions, null, bpmnGraph);
		
		return bpmnGraph;
	}
	
	static parseRecursive(el, thisParent, bpmnGraph) {
		if (el.tagName != null) {
			if (el.tagName.endsWith("BPMNDiagram")) {
				for (let attrId in el.attributes) {
					let attr = el.attributes[attrId];
					if (attr.name == "id") {
						bpmnGraph.id = attr.value;
					}
					else if (attr.name == "name") {
						bpmnGraph.name = attr.value;
					}
					else {
						if (attr.value != null) {
							bpmnGraph.properties[attr.name] = attr.value;
						}
					}
				}
				for (let childId in el.childNodes) {
					let child = el.childNodes[childId];
					BpmnImporter.parseRecursive(child, thisParent, bpmnGraph);
				}
			}
			else if (el.tagName.endsWith("definitions")) {
				for (let childId in el.childNodes) {
					let child = el.childNodes[childId];
					BpmnImporter.parseRecursive(child, thisParent, bpmnGraph);
				}
			}
			else if (el.tagName.endsWith("process")) {
				for (let childId in el.childNodes) {
					let child = el.childNodes[childId];
					BpmnImporter.parseRecursive(child, thisParent, bpmnGraph);
				}
			}
			else if (el.tagName.endsWith("BPMNPlane")) {
				for (let childId in el.childNodes) {
					let child = el.childNodes[childId];
					BpmnImporter.parseRecursive(child, thisParent, bpmnGraph);
				}
			}
			else if (el.tagName.endsWith("BPMNShape")) {
				let nodeId = null;
				for (let attrId in el.attributes) {
					let attr = el.attributes[attrId];
					if (attr.name == "bpmnElement") {
						nodeId = attr.value;
					}
				}
				let bpmnNode = bpmnGraph.addNode(nodeId);
				for (let childId in el.childNodes) {
					let child = el.childNodes[childId];
					BpmnImporter.parseRecursive(child, bpmnNode, bpmnGraph);
				}
			}
			else if (el.tagName.endsWith("Bounds")) {
				for (let attrId in el.attributes) {
					let attr = el.attributes[attrId];
					if (attr.value != null) {
						thisParent.bounds[attr.name] = attr.value;
					}
				}
			}
			else if (el.tagName.endsWith("BPMNEdge")) {
				let edgeId = null;
				for (let attrId in el.attributes) {
					let attr = el.attributes[attrId];
					if (attr.name == "bpmnElement") {
						edgeId = attr.value;
					}
				}
				let bpmnEdge = bpmnGraph.addEdge(edgeId);
				for (let childId in el.childNodes) {
					let child = el.childNodes[childId];
					BpmnImporter.parseRecursive(child, bpmnEdge, bpmnGraph);
				}
			}
			else if (el.tagName.endsWith("waypoint")) {
				let this_X = "0";
				let this_Y = "0";
				for (let attrId in el.attributes) {
					let attr = el.attributes[attrId];
					if (attr.name == "x") {
						this_X = attr.value;
					}
					else if (attr.name == "y") {
						this_Y = attr.value;
					}
				}
				this_X = parseInt(this_X);
				this_Y = parseInt(this_Y);
				thisParent.waypoints.push([this_X, this_Y]);
			}
			else if (el.tagName.toLowerCase().endsWith("flow")) {
				let flowId = null;
				let flowName = "";
				let flowSourceRef = null;
				let flowTargetRef = null;
				for (let attrId in el.attributes) {
					let attr = el.attributes[attrId];
					if (attr.name == "id") {
						flowId = attr.value;
					}
					else if (attr.name == "name") {
						flowName = attr.value;
					}
					else if (attr.name == "sourceRef") {
						flowSourceRef = attr.value;
					}
					else if (attr.name == "targetRef") {
						flowTargetRef = attr.value;
					}
				}
				let bpmnEdge = bpmnGraph.addEdge(flowId);
				bpmnEdge.name = flowName;
				bpmnEdge.setSource(flowSourceRef);
				bpmnEdge.setTarget(flowTargetRef);
			}
			else if (thisParent != null && thisParent.constructor.name == "BpmnNode") {
				if (el.tagName == "incoming") {
					thisParent.addIncoming(el.textContent);					
				}
				else if (el.tagName == "outgoing") {
					thisParent.addOutgoing(el.textContent);
				}
			}
			else {
				let nodeId = null;
				let nodeName = "";
				let nodeType = el.tagName;
				for (let attrId in el.attributes) {
					let attr = el.attributes[attrId];
					if (attr.name == "id") {
						nodeId = attr.value;
					}
					else if (attr.name == "name") {
						nodeName = attr.value;
					}
				}
				let bpmnNode = bpmnGraph.addNode(nodeId);
				bpmnNode.name = nodeName;
				bpmnNode.type = nodeType.split(":");
				bpmnNode.type = bpmnNode.type[bpmnNode.type.length - 1];
				for (let attrId in el.attributes) {
					let attr = el.attributes[attrId];
					if (attr.value != null) {
						if (attr.name != "id" && attr.name != "name") {
							bpmnNode.properties[attr.name] = attr.value;
						}
					}
				}
				for (let childId in el.childNodes) {
					let child = el.childNodes[childId];
					BpmnImporter.parseRecursive(child, bpmnNode, bpmnGraph);
				}
			}
		}
	}
}

try {
	require('../../../pm4js.js');
	require('../bpmn_graph.js');
	module.exports = {BpmnImporter: BpmnImporter};
	global.BpmnImporter = BpmnImporter;
	global.DOMParser = require('xmldom').DOMParser;
}
catch (err) {
	// not in Node
	//console.log(err);
}

Pm4JS.registerImporter("BpmnImporter", "apply", ["bpmn"], "BPMN Importer", "Alessandro Berti");
