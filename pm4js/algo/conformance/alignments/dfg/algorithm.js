class DfgAlignmentsResults {
	constructor(logActivities, frequencyDfg, overallResult) {
		this.logActivities = logActivities;
		this.overallResult = overallResult;
		this.frequencyDfg = frequencyDfg;
		this.movesUsage = {};
		this.fitTraces = 0;
		this.totalCost = 0;
		for (let alTrace of this.overallResult) {
			for (let move of alTrace["alignment"].split(",")) {
				if (!(move in this.movesUsage)) {
					this.movesUsage[move] = 1;
				}
				else {
					this.movesUsage[move] += 1;
				}
			}
			if (alTrace["cost"] < 10000) {
				this.fitTraces += 1;
			}
			this.totalCost += alTrace["cost"];
		}
	}
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
				if (act == "■") {
					modelMoveCosts[act] = 0;
				}
				else {
					modelMoveCosts[act] = 10000;
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
		let ret = new DfgAlignmentsResults(logActivities, frequencyDfg0, res);
		Pm4JS.registerObject(ret, "DFG Alignments Result");
		return ret;
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
		queue.push([0, 0, 0, "▶", false, null, null]);
		let count = 0;
		let closedSet = {};
		while (true) {
			count++;
			let tup = queue.pop();
			if (tup == null) {
				return null;
			}
			else if (tup[3] == "■" && tup[1] == listAct.length) {
				return DfgAlignments.formAlignment(listAct, tup);
			}
			else if (DfgAlignments.checkClosed(closedSet, tup)) {
				continue;
			}
			else {
				DfgAlignments.closeTuple(closedSet, tup);
				if (tup[3] != "■") {
					let enabledTransitions = outgoing[tup[3]];
					for (let trans of enabledTransitions) {
						let newTup = null;
						if (tup[1] < listAct.length && trans == listAct[tup[1]]) {
							// sync move
							newTup = [tup[0] + syncCosts[trans], tup[1] + 1, count, trans, false, trans, tup];
							if (!(DfgAlignments.checkClosed(closedSet, newTup))) {
								queue.push(newTup);
							}
						}
						else {
							// move on model
							newTup = [tup[0] + modelMoveCosts[trans], tup[1], count, trans, true, trans, tup];
							if (!(DfgAlignments.checkClosed(closedSet, newTup))) {
								queue.push(newTup);
							}
						}
					}
				}
				if (tup[1] < listAct.length && !(tup[4])) {
					// move on log
					let newTup = [tup[0] + logMoveCosts[listAct[tup[1]]], tup[1] + 1, count, tup[3], false, null, tup];
					if (!(DfgAlignments.checkClosed(closedSet, newTup))) {
						queue.push(newTup);
					}
				}
			}
		}
		return null;
	}
	
	static formAlignment(listAct, tup) {
		let ret = [];
		let cost = tup[0];
		let closedStates = tup[2];
		tup = tup[6];
		while (tup[6] != null) {
			let isMM = tup[4];
			let currTrans = tup[5];
			if (currTrans == null) {
				// lm
				ret.push("("+listAct[tup[1]-1]+";>>)")
			}
			else if (isMM) {
				ret.push("(>>;"+currTrans+")")
			}
			else {
				ret.push("("+listAct[tup[1]-1]+";"+currTrans+")")
			}
			tup = tup[6];
		}
		ret.reverse();
		return {"alignment": ret.join(","), "cost": cost, "closedStates": closedStates}
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
	//console.log(err);
}

Pm4JS.registerAlgorithm("DfgAlignments", "apply", ["EventLog", "FrequencyDfg"], "DfgAlignmentsResults", "Perform Alignments on DFG", "Alessandro Berti");
