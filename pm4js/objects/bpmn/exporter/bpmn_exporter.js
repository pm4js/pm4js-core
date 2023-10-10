class BpmnExporter {
		static uuidv4() {
		  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		  });
		}
		
		static nodeUuid() {
			let uuid = BpmnExporter.uuidv4();
			return "id"+uuid.replace(/-/g, "");
		}
	
	static apply(bpmnGraph) {
		let definitions = document.createElementNS("", "bpmn"+BpmnExporter.DUMMY_SEP+"definitions");
		let processId = BpmnExporter.nodeUuid();
		definitions.setAttribute("xmlns:bpmn", "http://www.omg.org/spec/BPMN/20100524/MODEL");
		definitions.setAttribute("xmlns:bpmndi", "http://www.omg.org/spec/BPMN/20100524/DI");
		definitions.setAttribute("xmlns:omgdc", "http://www.omg.org/spec/DD/20100524/DC");
		definitions.setAttribute("xmlns:omgdi", "http://www.omg.org/spec/DD/20100524/DI");
		definitions.setAttribute("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance");
		definitions.setAttribute("xmlns:xsd", "http://www.w3.org/2001/XMLSchema");
		definitions.setAttribute("targetNamespace", "http://www.signavio.com/bpmn20");
		definitions.setAttribute("typeLanguage", "http://www.w3.org/2001/XMLSchema");
		definitions.setAttribute("expressionLanguage", "http://www.w3.org/1999/XPath");
		let bpmnDiagram = document.createElementNS("", "bpmndi"+BpmnExporter.DUMMY_SEP+"BPMNDiagram");
		definitions.appendChild(bpmnDiagram);
		bpmnDiagram.setAttribute("id", bpmnGraph.id);
		bpmnDiagram.setAttribute("name", bpmnGraph.name);
		let bpmnPlane = document.createElementNS("", "bpmndi"+BpmnExporter.DUMMY_SEP+"BPMNPlane");
		bpmnDiagram.appendChild(bpmnPlane);
		bpmnPlane.setAttribute("id", BpmnExporter.nodeUuid());
		bpmnPlane.setAttribute("bpmnElement", processId);
		for (let nodeId in bpmnGraph.nodes) {
			let node = bpmnGraph.nodes[nodeId];
			let shape = document.createElementNS("", "bpmndi"+BpmnExporter.DUMMY_SEP+"BPMNShape");
			shape.setAttribute("bpmnElement", nodeId);
			shape.setAttribute("id", nodeId+"_gui");
			let bounds = document.createElementNS("", "omgdc"+BpmnExporter.DUMMY_SEP+"Bounds");
			if (Object.keys(node.bounds).length > 0) {
				for (let prop in node.bounds) {
					bounds.setAttribute(prop, ""+node.bounds[prop]);
				}
			}
			else {
				// layouting has not been done. exports with default
				bounds.setAttribute("width", 100);
				bounds.setAttribute("height", 100);
				bounds.setAttribute("x", 0);
				bounds.setAttribute("y", 0);
			}
			shape.appendChild(bounds);
			bpmnPlane.appendChild(shape);
		}
		for (let edgeId in bpmnGraph.edges) {
			let edge = bpmnGraph.edges[edgeId];
			let xmlEdge = document.createElementNS("", "bpmndi"+BpmnExporter.DUMMY_SEP+"BPMNEdge");
			xmlEdge.setAttribute("bpmnElement", edgeId);
			xmlEdge.setAttribute("id", edgeId+"_gui");
			if (Object.keys(edge.waypoints).length > 0) {
				for (let waypoint of edge.waypoints) {
					let xmlWaypoint = document.createElementNS("", "omgdi"+BpmnExporter.DUMMY_SEP+"waypoint");
					xmlWaypoint.setAttribute("x", ""+waypoint[0]);
					xmlWaypoint.setAttribute("y", ""+waypoint[1]);
					xmlEdge.appendChild(xmlWaypoint);
				}
			}
			else {
				// layouting has not been done. exports with default
					let xmlWaypoint = document.createElementNS("", "omgdi"+BpmnExporter.DUMMY_SEP+"waypoint");
					xmlWaypoint.setAttribute("x", 0);
					xmlWaypoint.setAttribute("y", 0);
					xmlEdge.appendChild(xmlWaypoint);
			}
			bpmnPlane.appendChild(xmlEdge);
		}
		//<process id="id071a1d8d-32e0-4b39-ae20-8ab8c71faec3" isClosed="false" isExecutable="false" processType="None">
		let process = document.createElementNS("", "bpmn"+BpmnExporter.DUMMY_SEP+"process");
		process.setAttribute("id", processId);
		process.setAttribute("isClosed", "false");
		process.setAttribute("isExecutable", "false");
		process.setAttribute("processType", "null");
		definitions.appendChild(process);
		for (let nodeId in bpmnGraph.nodes) {
			let node = bpmnGraph.nodes[nodeId];
			let xmlNode = document.createElementNS("", "bpmn"+BpmnExporter.DUMMY_SEP+node.type);
			xmlNode.setAttribute("id", nodeId);
			xmlNode.setAttribute("name", node.name);
			for (let prop in node.properties) {
				xmlNode.setAttribute(prop, node.properties[prop]);
			}
			for (let inc in node.incoming) {
				let xmlInc = document.createElementNS("", "bpmn"+BpmnExporter.DUMMY_SEP+"incoming");
				xmlInc.textContent = inc;
				xmlNode.appendChild(xmlInc);
			}
			for (let out in node.outgoing) {
				let xmlOut = document.createElementNS("", "bpmn"+BpmnExporter.DUMMY_SEP+"outgoing");
				xmlOut.textContent = out;
				xmlNode.appendChild(xmlOut);
			}
			process.appendChild(xmlNode);
		}
		for (let edgeId in bpmnGraph.edges) {
			let edge = bpmnGraph.edges[edgeId];
			let xmlEdge = document.createElementNS("", "bpmn"+BpmnExporter.DUMMY_SEP+"sequenceFlow");
			xmlEdge.setAttribute("id", edgeId);
			xmlEdge.setAttribute("name", edge.name);
			xmlEdge.setAttribute("sourceRef", edge.source.id);
			xmlEdge.setAttribute("targetRef", edge.target.id);
			process.appendChild(xmlEdge);
		}
		let serializer = null;
		try {
			serializer = new XMLSerializer();
		}
		catch (err) {
			serializer = require('xmlserializer');
		}
		let xmlStr = serializer.serializeToString(definitions);
		xmlStr = xmlStr.replace(/AIOEWFRIUOERWQIO/g, ":");
		return xmlStr;
	}
}

// unlikely string, better look at other solutions ...
BpmnExporter.DUMMY_SEP = "AIOEWFRIUOERWQIO";

try {
	module.exports = {BpmnExporter: BpmnExporter};
	global.BpmnExporter = BpmnExporter;
	const jsdom = require("jsdom");
	const { JSDOM } = jsdom;
	global.dom = new JSDOM('<!doctype html><html><body></body></html>');
	global.window = dom.window;
	global.document = dom.window.document;
	global.navigator = global.window.navigator;
}
catch (err) {
	// not in node
	//console.log(err);
}

Pm4JS.registerExporter("BpmnExporter", "apply", "BpmnGraph", "bpmn", "text/xml", "BPMN Exporter (.bpmn)", "Alessandro Berti");
