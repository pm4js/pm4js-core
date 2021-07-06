class ProcessTreeToPetriNetConverter {
	static apply(processTree) {
		let nodes = ProcessTreeToPetriNetConverter.orderBottomUpNodes(processTree);
		let petriNet = new PetriNet();
		let im = new Marking(petriNet);
		let fm = new Marking(petriNet);
		let sourcePlaces = {};
		let targetPlaces = {};
		let i = 0;
		while (i < nodes.length) {
			let source = petriNet.addPlace("source_"+nodes[i].id);
			let target = petriNet.addPlace("target_"+nodes[i].id);
			sourcePlaces[nodes[i].id] = source;
			targetPlaces[nodes[i].id] = target;
			if (nodes[i].label != null || nodes[i].operator == null) {
				// leaf node
				let addedTrans = petriNet.addTransition("trans_"+nodes[i].id, nodes[i].label);
				petriNet.addArcFromTo(source, addedTrans);
				petriNet.addArcFromTo(addedTrans, target);
			}
			else if (nodes[i].operator == ProcessTreeOperator.SEQUENCE) {
				let j = 0;
				let curr = source;
				while (j < nodes[i].children.length) {
					let thisNode = nodes[i].children[j];
					let thisSource = sourcePlaces[thisNode.id];
					let thisTarget = targetPlaces[thisNode.id];
					let inv1 = petriNet.addTransition("transSeq_"+nodes[i].id+"_"+j, null);
					petriNet.addArcFromTo(curr, inv1);
					petriNet.addArcFromTo(inv1, thisSource);
					curr = thisTarget;
					j++;
				}
				let inv1 = petriNet.addTransition("transSeq_"+nodes[i].id+"_last", null);
				petriNet.addArcFromTo(curr, inv1);
				petriNet.addArcFromTo(inv1, target);
			}
			else if (nodes[i].operator == ProcessTreeOperator.PARALLEL) {
				let j = 0;
				let inv1 = petriNet.addTransition("transParallel_"+nodes[i].id+"_first", null);
				let inv2 = petriNet.addTransition("transParallel_"+nodes[i].id+"_last", null);
				while (j < nodes[i].children.length) {
					let thisNode = nodes[i].children[j];
					let thisSource = sourcePlaces[thisNode.id];
					let thisTarget = targetPlaces[thisNode.id];
					petriNet.addArcFromTo(source, inv1);
					petriNet.addArcFromTo(inv1, thisSource);
					petriNet.addArcFromTo(thisTarget, inv2);
					petriNet.addArcFromTo(inv2, target);
					j++;
				}
			}
			else if (nodes[i].operator == ProcessTreeOperator.EXCLUSIVE) {
				let j = 0;
				while (j < nodes[i].children.length) {
					let thisNode = nodes[i].children[j];
					let thisSource = sourcePlaces[thisNode.id];
					let thisTarget = targetPlaces[thisNode.id];
					let inv1 = petriNet.addTransition("transXor_"+nodes[i].id+"_"+j+"_first", null);
					let inv2 = petriNet.addTransition("transXor_"+nodes[i].id+"_"+j+"_last", null);
					petriNet.addArcFromTo(source, inv1);
					petriNet.addArcFromTo(inv1, thisSource);
					petriNet.addArcFromTo(thisTarget, inv2);
					petriNet.addArcFromTo(inv2, target);
					j++;
				}
			}
			else if (nodes[i].operator == ProcessTreeOperator.LOOP) {
				let inv1 = petriNet.addTransition("transLoop_"+nodes[i].id+"_first", null);
				let inv2 = petriNet.addTransition("transLoop_"+nodes[i].id+"_last", null);
				let inv3 = petriNet.addTransition("transLoop_"+nodes[i].id+"_loop1", null);
				let inv4 = petriNet.addTransition("transLoop_"+nodes[i].id+"_loop2", null);
				let doNode = nodes[i].children[0];
				let doNodeSource = sourcePlaces[doNode.id];
				let doNodeTarget = targetPlaces[doNode.id];
				let redoNode = nodes[i].children[1];
				let redoNodeSource = sourcePlaces[redoNode.id];
				let redoNodeTarget = targetPlaces[redoNode.id];
				petriNet.addArcFromTo(source, inv1);
				petriNet.addArcFromTo(inv1, doNodeSource);
				petriNet.addArcFromTo(doNodeTarget, inv2);
				petriNet.addArcFromTo(inv2, target);
				petriNet.addArcFromTo(target, inv3);
				petriNet.addArcFromTo(inv3, redoNodeSource);
				petriNet.addArcFromTo(redoNodeTarget, inv4);
				petriNet.addArcFromTo(inv4, source);
			}
			i++;
		}
		im.setTokens(sourcePlaces[processTree.id], 1);
		fm.setTokens(targetPlaces[processTree.id], 1);
		let acceptingPetriNet = new AcceptingPetriNet(petriNet, im, fm);
		PetriNetReduction.apply(acceptingPetriNet, false);

		Pm4JS.registerObject(acceptingPetriNet, "Accepting Petri Net");

		return acceptingPetriNet;
	}
	
	static sortNodes(nodes) {
		let cont = true;
		while (cont) {
			cont = false;
			let i = 0;
			while (i < nodes.length - 1) {
				let j = i + 1;
				while (j < nodes.length) {
					if (nodes[j].parentNode == nodes[i]) {
						cont = true;
						let temp = nodes[i];
						nodes[i] = nodes[j];
						nodes[j] = temp;
					}
					j++;
				}
				i++;
			}
		}		
		return nodes;
	}
	
	static orderBottomUpNodes(processTree) {
		let descendants = {};
		ProcessTreeToPetriNetConverter.findAllDescendants(processTree, descendants);
		let nodes = Object.values(descendants);
		nodes = ProcessTreeToPetriNetConverter.sortNodes(nodes);
		return nodes;
	}
	
	static findAllDescendants(processTree, descendants) {
		descendants[processTree.id] = processTree;
		if (processTree.operator == ProcessTreeOperator.LOOP) {
			ProcessTreeToPetriNetConverter.findAllDescendants(processTree.children[0], descendants);
			ProcessTreeToPetriNetConverter.findAllDescendants(processTree.children[1], descendants);
		}
		else {
			for (let child of processTree.children) {
				ProcessTreeToPetriNetConverter.findAllDescendants(child, descendants);
			}
		}
	}
}

try {
	require('../../../pm4js.js');
	require('../../process_tree/process_tree.js');
	require('../../petri_net/petri_net.js');
	require('../../petri_net/reduction.js');
	module.exports = {ProcessTreeToPetriNetConverter: ProcessTreeToPetriNetConverter};
	global.ProcessTreeToPetriNetConverter = ProcessTreeToPetriNetConverter;
}
catch (err) {
	console.log(err);
	// not in Node
}

Pm4JS.registerAlgorithm("ProcessTreeToPetriNetConverter", "apply", ["ProcessTree"], "AcceptingPetriNet", "Convert Process Tree to an Accepting Petri Net", "Alessandro Berti");
