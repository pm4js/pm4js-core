class BpmnGraph {
	constructor(id="", name="") {
		this.id = id;
		this.name = name;
		this.nodes = {};
		this.edges = {};
		this.properties = {};
	}
	
	addNode(id) {
		if (id == null) {
			throw "addNode called with id=null";
		}
		if (id in this.nodes) {
			return this.nodes[id];
		}
		this.nodes[id] = new BpmnNode(this, id);
		return this.nodes[id];
	}
	
	addEdge(id) {
		if (id == null) {
			throw "addEdge called with id=null";
		}
		if (id in this.edges) {
			return this.edges[id];
		}
		this.edges[id] = new BpmnEdge(this, id);
		return this.edges[id];
	}
	
	toString() {
		return this.id;
	}
	
	removeNode(id) {
		if (id == null) {
			throw "removeNode called with id=null";
		}
		if (id in this.nodes) {
			let node = this.nodes[id];
			for (let edgeId in node.incoming) {
				let edge = node.incoming[edgeId];
				let source = edge.source;
				delete source.outgoing[edge];
				delete this.edges[edge];
			}
			for (let edgeId in node.outgoing) {
				let edge = node.outgoing[edgeId];
				let target = edge.target;
				delete target.incoming[edge];
				delete this.edges[edge];
			}
			delete this.nodes[id];
		}
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
		if (id == null) {
			throw "addIncoming called with id=null";
		}
		let edge = this.graph.addEdge(id);
		this.incoming[id] = edge;
	}
	
	addOutgoing(id) {
		if (id == null) {
			throw "addOutgoing called with id=null";
		}
		let edge = this.graph.addEdge(id);
		this.outgoing[id] = edge;
	}
	
	toString() {
		return this.id;
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
		if (id == null) {
			throw "setSource called with id=null";
		}
		if (!(id in this.graph.nodes)) {
			console.log("creating node with ID "+id+" before node instantiation");
		}
		let sourceNode = this.graph.addNode(id);
		sourceNode.outgoing[this.id] = this;
		this.source = sourceNode;
	}
	
	setTarget(id) {
		if (id == null) {
			throw "setTarget called with id=null";
		}
		if (!(id in this.graph.nodes)) {
			console.log("creating node with ID "+id+" before node instantiation");
		}
		let targetNode = this.graph.addNode(id);
		targetNode.incoming[this.id] = this;
		this.target = targetNode;
	}
	
	toString() {
		return this.id;
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