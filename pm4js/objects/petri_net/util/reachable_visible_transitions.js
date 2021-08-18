class PetriNetReachableVisibleTransitions {
	static apply(net, marking) {
		let reachableVisibleTransitions = {};
		let visited = {};
		let toVisit = [];
		toVisit.push(marking);
		while (toVisit.length > 0) {
			//console.log(reachableVisibleTransitions);
			let currMarking = toVisit.shift();
			if (currMarking in visited) {
				continue;
			}
			visited[currMarking] = 0;
			let enabledTransitions = currMarking.getEnabledTransitions();
			for (let trans of enabledTransitions) {
				if (trans.label != null) {
					reachableVisibleTransitions[trans.label] = 0;
				}
				else {
					let newMarking = currMarking.execute(trans);
					if (!(newMarking in visited)) {
						toVisit.push(newMarking);
					}
				}
			}
		}
		return Object.keys(reachableVisibleTransitions);
	}
}

try {
	require('../../../pm4js.js');
	require('../petri_net.js');
	module.exports = {PetriNetReachableVisibleTransitions: PetriNetReachableVisibleTransitions};
	global.PetriNetReachableVisibleTransitions = PetriNetReachableVisibleTransitions;
}
catch (err) {
	console.log(err);
	// not in Node
}
