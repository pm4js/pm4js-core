class DfgAlignmentsResults {
}

class DfgAlignments {
	static apply(log, frequencyDfg0, activityKey="concept:name", syncCosts=null, modelMoveCosts=null, logMoveCosts=null) {
		let logActivities = GeneralLogStatistics.getAttributeValues(log, activityKey);
		let frequencyDfg = frequencyDfg0.getArtificialDfg();
		let outgoing = {};
		for (let arc0 in frequencyDfg[1]) {
			let arc = arc0.split(",");
			if (!(arc[0] in outgoing)) {
				outgoing[arc[0]] = [];
			}
			outgoing[arc[0]].push(arc[1]);
		}
		if (syncCosts == null) {
			syncCosts = {};
			for (let act in frequencyDfg[0]) {
				syncCosts[act] = 0;
			}
		}
		if (modelMoveCosts == null) {
			modelMoveCosts = {};
			for (let act in frequencyDfg[0]) {
				modelMoveCosts[act] = 10000;
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
		let count = 0;
		for (let trace of log.traces) {
			let listAct = [];
			for (let eve of trace.events) {
				listAct.push(eve.attributes[activityKey].value);
			}
			if (!(listAct in alignedTraces)) {
				alignedTraces[listAct] = DfgAlignments.applyTrace(listAct, frequencyDfg, outgoing, syncCosts, modelMoveCosts, logMoveCosts, comparator);
			}
			res.push(alignedTraces[listAct]);
			count++;
		}
	}
	
	static checkClosed(closedSet, tup) {
		if (tup[3] in closedSet) {
			if (tup[1] <= closedSet[tup[3]]) {
				return true;
			}
		}
		return false;
	}
	
	static closeTuple(closedSet, tup) {
		closedSet[tup[3]] = tup[1];
	}
	
	static applyTrace(listAct, frequencyDfg, outgoing, syncCosts, modelMoveCosts, logMoveCosts, comparator) {
		let queue = new PriorityQueue(comparator);
		
		//queue.push([0, 0, 0, im, false, null, null]);
		
		return null;
	}
}

try {
	require('../../../../pm4js.js');
	require('../heapq.js');
	require('../../../../statistics/log/general.js');
	module.exports = {DfgAlignments: DfgAlignments, DfgAlignmentsResults: DfgAlignmentsResults};
	global.DfgAlignments = DfgAlignments;
	global.DfgAlignmentsResults = DfgAlignmentsResults;
}
catch (err) {
	// not in Node
	console.log(err);
}