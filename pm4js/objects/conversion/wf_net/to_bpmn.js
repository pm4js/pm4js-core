class WfNetToBpmnConverter {
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static nodeUuid() {
		let uuid = WfNetToBpmnConverter.uuidv4();
		return "id"+uuid.replace(/-/g, "");
	}
	
	static apply(acceptingPetriNet) {
		let bpmnGraph = new BpmnGraph(WfNetToBpmnConverter.nodeUuid());
		let enteringDictio = {};
		let exitingDictio = {};
		for (let placeId in acceptingPetriNet.net.places) {
			let place = acceptingPetriNet.net.places[placeId];
			let node = bpmnGraph.addNode(WfNetToBpmnConverter.nodeUuid());
			node.type = "exclusiveGateway";
			enteringDictio[place] = node;
			exitingDictio[place] = node;
		}
		for (let transId in acceptingPetriNet.net.transitions) {
			let trans = acceptingPetriNet.net.transitions[transId];
			if (trans.label == null) {
				let node = bpmnGraph.addNode(WfNetToBpmnConverter.nodeUuid());
				if (trans.inArcs.length > 1 || trans.outArcs.length > 1) {
					node.type = "parallelGateway";
				}
				else {
					node.type = "exclusiveGateway";
				}
				enteringDictio[trans] = node;
				exitingDictio[trans] = node;
			}
			else {
				let enteringNode = bpmnGraph.addNode(WfNetToBpmnConverter.nodeUuid());
				let exitingNode = bpmnGraph.addNode(WfNetToBpmnConverter.nodeUuid());
				let task = bpmnGraph.addNode(WfNetToBpmnConverter.nodeUuid());
				if (trans.inArcs.length > 1) {
					enteringNode.type = "parallelGateway";
				}
				else {
					enteringNode.type = "exclusiveGateway";
				}
				
				if (trans.outArcs.length > 1) {
					exitingNode.type = "parallelGateway";
				}
				else {
					exitingNode.type = "exclusiveGateway";
				}
				
				task.type = "manualTask";
				task.name = trans.label;
				
				let edge = bpmnGraph.addEdge(WfNetToBpmnConverter.nodeUuid());
				edge.setSource(enteringNode);
				edge.setTarget(exitingNode);
				
				edge = bpmnGraph.addEdge(WfNetToBpmnConverter.nodeUuid());
				edge.setSource(task);
				edge.setTarget(exitingNode);
				
				enteringDictio[trans] = enteringNode;
				exitingDictio[trans] = exitingNode;
			}
		}
		for (let arcId in acceptingPetriNet.net.arcs) {
			let arc = acceptingPetriNet.net.arcs[arcId];
			let edge = bpmnGraph.addEdge(WfNetToBpmnConverter.nodeUuid());
			edge.setSource(exitingDictio[arc.source]);
			edge.setTarget(enteringDictio[arc.target]);
		}
		
		let startNode = bpmnGraph.addNode(WfNetToBpmnConverter.nodeUuid());
		let endNode = bpmnGraph.addNode(WfNetToBpmnConverter.nodeUuid());
		startNode.type = "startEvent";
		endNode.type = "endEvent";
		for (let placeId in acceptingPetriNet.im.tokens) {
			let place = acceptingPetriNet.net.places[placeId];
			let edge = bpmnGraph.addEdge(WfNetToBpmnConverter.nodeUuid());
			edge.setSource(startNode);
			edge.setTarget(enteringDictio[place]);
		}
		for (let placeId in acceptingPetriNet.fm.tokens) {
			let place = acceptingPetriNet.net.places[placeId];
			let edge = bpmnGraph.addEdge(WfNetToBpmnConverter.nodeUuid());
			edge.setSource(exitingDictio[place]);
			edge.setTarget(endNode);
		}
		
		// reduction
		/*let nodes = Object.keys(bpmnGraph.nodes);
		for (let nodeId of nodes) {
			let node = bpmnGraph.nodes[nodeId];
			if (node.type == "exclusiveGateway" && Object.keys(node.incoming).length == 1 && Object.keys(node.outgoing).length == 1) {
				bpmnGraph.removeNode(node.id);
			}
		}*/

		Pm4JS.registerObject(acceptingPetriNet, "BPMN graph (converted from accepting Petri net)");
		
		return bpmnGraph;
	}
}

try {
	require('../../../pm4js.js');
	require('../../petri_net/petri_net.js');
	require('../../bpmn/bpmn_graph.js');
	module.exports = {WfNetToBpmnConverter: WfNetToBpmnConverter};
	global.WfNetToBpmnConverter = WfNetToBpmnConverter;
}
catch (err) {
	//console.log(err);
	// not in Node
}