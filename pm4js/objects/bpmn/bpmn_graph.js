class BpmnGraph {
	constructor(id="") {
		this.id=id;
		this.nodes = {};
		this.edges = {};
		this.properties = {};
	}
	
	addNode(id) {
		if (id in this.nodes) {
			return this.nodes[id];
		}
		this.nodes[id] = new BpmnNode(this, id);
		return this.nodes[id];
	}
	
	addEdge(id) {
		if (id in this.edges) {
			return this.edges[id];
		}
		this.edges[id] = new BpmnEdge(this, id);
		return this.edges[id];
	}
}

class BpmnNode {
	constructor(graph, id) {
		this.graph = graph;
		this.id = id;
		this.name = "";
		this.type = null;
		this.incoming = {};
		this.outgoing = {};
		this.bounds = {};
		this.properties = {};
	}
	
	addIncoming(id) {
		let edge = this.graph.addEdge(id);
		this.incoming[id] = edge;
	}
	
	addOutgoing(id) {
		let edge = this.graph.addEdge(id);
		this.outgoing[id] = edge;
	}
}

class BpmnEdge {
	constructor(graph, id) {
		this.graph = graph;
		this.id = id;
		this.name = "";
		this.source = null;
		this.target = null;
		this.waypoints = [];
		this.properties = {};
	}
	
	setSource(id) {
		let sourceNode = this.graph.addNode(id);
		sourceNode.outgoing[this.id] = this;
		this.source = sourceNode;
	}
	
	setTarget(id) {
		let targetNode = this.graph.addNode(id);
		targetNode.incoming[this.id] = this;
		this.target = targetNode;
	}
}

try {
	require('../../pm4js.js');
	module.exports = {BpmnGraph: BpmnGraph, BpmnNode: BpmnNode, BpmnEdge: BpmnEdge};
	global.BpmnGraph = BpmnGraph;
	global.BpmnNode = BpmnNode;
	global.BpmnEdge = BpmnEdge;
}
catch (err) {
	// not in node
}