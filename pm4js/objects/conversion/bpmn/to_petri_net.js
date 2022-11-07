class BpmnToPetriNetConverter {
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static nodeUuid() {
		let uuid = BpmnToPetriNetConverter.uuidv4();
		return "id"+uuid.replace(/-/g, "");
	}
		
	static apply(bpmnGraph, reduce=true, returnFlowPlace=false) {
		let petriNet = new PetriNet("converted from BPMN");
		let im = new Marking(petriNet);
		let fm = new Marking(petriNet);
		let sourcePlace = petriNet.addPlace("source");
		let sinkPlace = petriNet.addPlace("sink");
		im.setTokens(sourcePlace, 1);
		fm.setTokens(sinkPlace, 1);
		let inclusiveGatewayEntry = {};
		let inclusiveGatewayExit = {};
		let flowPlace = {};
		let sourceCount = {};
		let targetCount = {};
		for (let flowId in bpmnGraph.edges) {
			let flow = bpmnGraph.edges[flowId];
			let source = flow.source;
			let target = flow.target;
			let place = petriNet.addPlace(flowId);
			flowPlace[flow] = place;
			if (!(source in sourceCount)) {
				sourceCount[source] = 0;
			}
			if (!(target in targetCount)) {
				targetCount[target] = 0;
			}
			sourceCount[source] = sourceCount[source] + 1;
			targetCount[target] = targetCount[target] + 1;
		}
		for (let flowId in bpmnGraph.edges) {
			let flow = bpmnGraph.edges[flowId];
			let source = flow.source;
			let target = flow.target;
			if (source.type.endsWith("inclusiveGateway") && sourceCount[source] > 1) {
				inclusiveGatewayExit[flowId] = 0;
			}
			if (target.type.endsWith("inclusiveGateway") && targetCount[target] > 1) {
				inclusiveGatewayEntry[flowId] = 0;
			}
		}
		let inclusivGatInters = {};
		for (let el in inclusiveGatewayEntry) {
			if (el in inclusiveGatewayExit) {
				inclusivGatInters[el] = 0;
			}
		}
		
		let nodesEntering = {};
		let nodesExiting = {};
		let transMap = {};
		
		for (let nodeId in bpmnGraph.nodes) {
			let node = bpmnGraph.nodes[nodeId];
			let entryPlace = petriNet.addPlace("ent_"+nodeId);
			let exitingPlace = petriNet.addPlace("exi_"+nodeId);
			let label = null;
			if (node.type.toLowerCase().endsWith("task")) {
				label = node.name;
			}
			let transition = petriNet.addTransition(nodeId, label);
			transMap[nodeId] = [transition];
			petriNet.addArcFromTo(entryPlace, transition);
			petriNet.addArcFromTo(transition, exitingPlace);
			if (node.type.endsWith("parallelGateway") || node.type.endsWith("inclusiveGateway")) {
				let exitingObject = null;
				let enteringObject = null;
				if (sourceCount[node] > 1) {
					exitingObject = petriNet.addTransition(BpmnToPetriNetConverter.nodeUuid(), null);
					petriNet.addArcFromTo(exitingPlace, exitingObject);
					transMap[nodeId].push(exitingObject);
				}
				else {
					exitingObject = exitingPlace;
				}
				
				if (targetCount[node] > 1) {
					enteringObject = petriNet.addTransition(BpmnToPetriNetConverter.nodeUuid(), null);
					petriNet.addArcFromTo(enteringObject, entryPlace);
					transMap[nodeId].push(enteringObject);
				}
				else {
					enteringObject = entryPlace;
				}
				nodesEntering[node] = enteringObject;
				nodesExiting[node] = exitingObject;
			}
			else {
				nodesEntering[node] = entryPlace;
				nodesExiting[node] = exitingPlace;
			}
			
			if (node.type.toLowerCase().endsWith("startevent")) {
				let startTransition = petriNet.addTransition(BpmnToPetriNetConverter.nodeUuid(), null);
				petriNet.addArcFromTo(sourcePlace, startTransition);
				petriNet.addArcFromTo(startTransition, entryPlace);
				transMap[nodeId].push(startTransition);
			}
			else if (node.type.toLowerCase().endsWith("endevent")) {
				let endTransition = petriNet.addTransition(BpmnToPetriNetConverter.nodeUuid(), null);
				petriNet.addArcFromTo(exitingPlace, endTransition);
				petriNet.addArcFromTo(endTransition, sinkPlace);
				transMap[nodeId].push(endTransition);
			}
		}
		
		for (let flowId in bpmnGraph.edges) {
			let flow = bpmnGraph.edges[flowId];
			let sourceObject = nodesExiting[flow.source];
			let targetObject = nodesEntering[flow.target];
			if (sourceObject.constructor.name == "PetriNetPlace") {
				let inv1 = petriNet.addTransition(BpmnToPetriNetConverter.nodeUuid(), null);
				petriNet.addArcFromTo(sourceObject, inv1);
				transMap[flow.source].push(inv1);
				sourceObject = inv1;
			}
			if (targetObject.constructor.name == "PetriNetPlace") {
				let inv2 = petriNet.addTransition(BpmnToPetriNetConverter.nodeUuid(), null);
				petriNet.addArcFromTo(inv2, targetObject);
				transMap[flow.target].push(inv2);
				targetObject = inv2;
			}
			petriNet.addArcFromTo(sourceObject, flowPlace[flow]);
			petriNet.addArcFromTo(flowPlace[flow], targetObject);
		}
		
		// TODO: extra management of inclusiveGateways
		
		let acceptingPetriNet = new AcceptingPetriNet(petriNet, im, fm);
		
		if (reduce) {
			PetriNetReduction.apply(acceptingPetriNet, false);
		}
		
		Pm4JS.registerObject(acceptingPetriNet, "Accepting Petri Net (converted from BPMN)");

		if (returnFlowPlace) {
			return [acceptingPetriNet, flowPlace, transMap];
		}
		
		return acceptingPetriNet;
	}
}

try {
	require('../../../pm4js.js');
	require('../../bpmn/bpmn_graph.js');
	require('../../petri_net/petri_net.js');
	require('../../petri_net/util/reduction.js');
	module.exports = {BpmnToPetriNetConverter: BpmnToPetriNetConverter};
	global.BpmnToPetriNetConverter = BpmnToPetriNetConverter;
}
catch (err) {
	//console.log(err);
	// not in Node
}

Pm4JS.registerAlgorithm("BpmnToPetriNetConverter", "apply", ["BpmnGraph"], "AcceptingPetriNet", "Convert BPMN graph to an Accepting Petri Net", "Alessandro Berti");
