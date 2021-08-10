class PetriNetAlignments {
	static apply(log, acceptingPetriNet, activityKey="concept:name", syncCosts=null, modelMoveCosts=null, logMoveCosts=null) {
		let logActivities = GeneralLogStatistics.getAttributeValues(log, activityKey);
		if (syncCosts == null) {
			syncCosts = {};
			for (let transId in acceptingPetriNet.net.transitions) {
				syncCosts[transId] = 0;
			}
		}
		if (modelMoveCosts == null) {
			modelMoveCosts = {};
			for (let transId in acceptingPetriNet.net.transitions) {
				let trans = acceptingPetriNet.net.transitions[transId];
				if (trans.label == null) {
					modelMoveCosts[transId] = 1;
				}
				else {
					modelMoveCosts[transId] = 10000;
				}
			}
		}
		if (logMoveCosts == null) {
			logMoveCosts = {};
			for (let act in logActivities) {
				logMoveCosts[act] = 10000;
			}
		}
		let comparator = function(a, b) {
			let ret = false;
			if (a[0] < b[0]) {
				ret = true;
			}
			else if (a[0] > b[0]) {
				ret = false;
			}
			else {
				if (a[1] > b[1]) {
					ret = true;
				}
				else if (a[1] < b[1]) {
					ret = false;
				}
				else {
					if (a[2] < b[2]) {
						ret = true;
					}
					else if (a[2] > b[2]) {
						ret = false;
					}
				}
			}
			return ret;
		};
		let alignedTraces = {};
		let res = [];
		for (let trace of log.traces) {
			let listAct = [];
			for (let eve of trace.events) {
				listAct.push(eve.attributes[activityKey].value);
			}
			if (!(listAct in alignedTraces)) {
				alignedTraces[listAct] = PetriNetAlignments.applyTrace(listAct, acceptingPetriNet.net, acceptingPetriNet.im, acceptingPetriNet.fm, syncCosts, modelMoveCosts, logMoveCosts, comparator);
			}
			res.push(alignedTraces[listAct]);
		}
		return res;
	}
	
	static applyTrace(listAct, net, im, fm, syncCosts, modelMoveCosts, logMoveCosts, comparator) {
		let queue = new PriorityQueue(comparator);
		queue.push([0, 0, 0, im, false, null, null]);
		let count = 0;
		while (true) {
			count++;
			let tup = queue.pop();
			if (tup[0] >= 10000) {
				throw "Ciao";
			}
			if (tup == null) {
				return null;
			}
			else if (tup[3].equals(fm) && tup[1] == listAct.length + 1) {
				return tup;
			}
			else {
				if (!(tup[3].equals(fm))) {
					let enabledTransitions = tup[3].getEnabledTransitions();
					for (let trans of enabledTransitions) {
						let newTup = null;
						if (trans.label == listAct[tup[1]]) {
							// sync move
							newTup = [tup[0] + syncCosts[trans.toString()], tup[1] + 1, count, tup[3].execute(trans), false, trans, tup];
						}
						else {
							// move on model
							newTup = [tup[0] + modelMoveCosts[trans.toString()], tup[1], count, tup[3].execute(trans), true, trans, tup];
						}
						queue.push(newTup);
					}
				}
			}
		}
	}
}

try {
	require('../../../pm4js.js');
	require('./heapq.js');
	require('../../../statistics/log/general.js');
	module.exports = {PetriNetAlignments: PetriNetAlignments};
	global.PetriNetAlignments = PetriNetAlignments;
}
catch (err) {
	// not in Node
	console.log(err);
}
