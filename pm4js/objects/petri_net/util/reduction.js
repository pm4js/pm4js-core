class PetriNetReduction {
	static apply(acceptingPetriNet, asPlugin=true) {
		PetriNetReduction.reduceSingleEntryTransitions(acceptingPetriNet.net);
		PetriNetReduction.reduceSingleExitTransitions(acceptingPetriNet.net);
		if (asPlugin) {
			Pm4JS.registerObject(acceptingPetriNet, "Accepting Petri Net (reduced)");
		}
		return acceptingPetriNet;
	}
	
	static reduceSingleEntryTransitions(net) {
		let cont = true;
		while (cont) {
			cont = false;
			let singleEntryInvisibleTransitions = [];
			for (let transId in net.transitions) {
				let trans = net.transitions[transId];
				if (trans.label == null && Object.keys(trans.inArcs).length == 1) {
					singleEntryInvisibleTransitions.push(trans);
				}
			}
			for (let trans of singleEntryInvisibleTransitions) {
				let sourcePlace = null;
				let targetPlaces = [];
				for (let arcId in trans.inArcs) {
					let arc = trans.inArcs[arcId];
					sourcePlace = arc.source;
				}
				for (let arcId in trans.outArcs) {
					let arc = trans.outArcs[arcId];
					targetPlaces.push(arc.target);
				}
				if (Object.keys(sourcePlace.inArcs).length == 1 && Object.keys(sourcePlace.outArcs).length == 1) {
				//if (Object.keys(sourcePlace.inArcs).length > 0 && Object.keys(sourcePlace.outArcs).length == 1) {
					for (let arcId in sourcePlace.inArcs) {
						let sourceTransition = sourcePlace.inArcs[arcId].source;
						for (let p of targetPlaces) {
							net.addArcFromTo(sourceTransition, p);
						}
					}
					net.removeTransition(trans);
					net.removePlace(sourcePlace);
					cont = true;
					break;
				}
			}
		}
	}
	
	static reduceSingleExitTransitions(net) {
		let cont = true;
		while (cont) {
			cont = false;
			let singleExitInvisibleTransitions = [];
			for (let transId in net.transitions) {
				let trans = net.transitions[transId];
				if (trans.label == null && Object.keys(trans.outArcs).length == 1) {
					singleExitInvisibleTransitions.push(trans);
				}
			}
			for (let trans of singleExitInvisibleTransitions) {
				let targetPlace = null;
				let sourcePlaces = [];
				for (let arcId in trans.outArcs) {
					let arc = trans.outArcs[arcId];
					targetPlace = arc.target;
				}
				for (let arcId in trans.inArcs) {
					let arc = trans.inArcs[arcId];
					sourcePlaces.push(arc.source);
				}
				if (Object.keys(targetPlace.inArcs).length == 1 && Object.keys(targetPlace.outArcs).length == 1) {
				//if (Object.keys(targetPlace.inArcs).length == 1 && Object.keys(targetPlace.outArcs).length > 0) {
					for (let arcId in targetPlace.outArcs) {
						let targetTransition = targetPlace.outArcs[arcId].target;
						for (let p of sourcePlaces) {
							net.addArcFromTo(p, targetTransition);
						}
					}
					net.removeTransition(trans);
					net.removePlace(targetPlace);
					cont = true;
					break;
				}
			}
		}
	}
}

try {
	module.exports = {PetriNetReduction: PetriNetReduction};
	global.PetriNetReduction = PetriNetReduction;
}
catch (err) {
	//console.log(err);
	// not in Node
}

Pm4JS.registerAlgorithm("PetriNetReduction", "apply", ["AcceptingPetriNet"], "AcceptingPetriNet", "SESE Reduction of Accepting Petri Net", "Alessandro Berti");
