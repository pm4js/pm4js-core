class PetriNetAlignmentsResults {
	constructor(logActivities, acceptingPetriNet, overallResult) {
		this.logActivities = logActivities;
		this.overallResult = overallResult;
		this.acceptingPetriNet = acceptingPetriNet;
		this.movesUsage = {};
		this.totalTraces = this.overallResult.length;
		this.fitTraces = 0;
		this.totalCost = 0;
		this.totalBwc = 0;
		this.averageTraceFitness = 0;
		for (let alTrace of this.overallResult) {
			if (alTrace != null) {
				for (let move of alTrace["alignment"].split(",")) {
					if (!(move in this.movesUsage)) {
						this.movesUsage[move] = 1;
					}
					else {
						this.movesUsage[move] += 1;
					}
				}
				if (alTrace["cost"] < 1) {
					this.fitTraces += 1;
				}
				this.totalBwc += alTrace["bwc"];
				this.totalCost += alTrace["cost"];
				this.averageTraceFitness += alTrace["fitness"];
			}
		}
		this.averageTraceFitness = this.averageTraceFitness / this.overallResult.length;
		this.logFitness = 1.0 - (this.totalCost)/(this.totalBwc);
		this.percentageFitTraces = this.fitTraces / this.totalTraces;
	}
}

class PetriNetAlignments {
	static apply(log, acceptingPetriNet, activityKey="concept:name", maxExecutionTime=Number.MAX_VALUE, syncCosts=null, modelMoveCosts=null, logMoveCosts=null) {
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
					let prem = trans.getPreMarking();
					let mark = new Marking(acceptingPetriNet.net);
					for (let pl in prem) {
						mark.setTokens(pl, prem[pl]);
					}
					let thisEnabledTransitions = mark.getEnabledTransitions();
					let visibleEnabledTransitions = [];
					for (let trans of thisEnabledTransitions) {
						if (trans.label != null) {
							visibleEnabledTransitions.push(trans);
						}
					}
					if (thisEnabledTransitions.length == 0) {
						modelMoveCosts[transId] = 0;
					}
					else {
						modelMoveCosts[transId] = 1;
					}
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
		let count = 0;
		let minPathInModelCost = 0;
		try {
			minPathInModelCost = Math.floor(PetriNetAlignments.applyTrace([], acceptingPetriNet.net, acceptingPetriNet.im, acceptingPetriNet.fm, syncCosts, modelMoveCosts, logMoveCosts, comparator, maxExecutionTime)["cost"] / 10000);
		}
		catch (err) {
		}
		for (let trace of log.traces) {
			let bwc = trace.events.length + minPathInModelCost;
			let listAct = [];
			for (let eve of trace.events) {
				listAct.push(eve.attributes[activityKey].value);
			}
			if (!(listAct in alignedTraces)) {
				let ali = PetriNetAlignments.applyTrace(listAct, acceptingPetriNet.net, acceptingPetriNet.im, acceptingPetriNet.fm, syncCosts, modelMoveCosts, logMoveCosts, comparator, maxExecutionTime);
				let fitness = 1.0;
				if (ali != null) {
					let dividedCost = Math.floor(ali["cost"] / 10000);
					if (bwc > 0) {
						fitness = 1.0 - dividedCost / bwc;
					}
					ali["cost"] = dividedCost;
					ali["fitness"] = fitness;
					ali["bwc"] = bwc;
				}
				alignedTraces[listAct] = ali;
			}
			res.push(alignedTraces[listAct]);
			count++;
		}
		let ret = new PetriNetAlignmentsResults(logActivities, acceptingPetriNet, res);
		Pm4JS.registerObject(ret, "Petri nets Alignments Result");
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
	
	static applyTrace(listAct, net, im, fm, syncCosts, modelMoveCosts, logMoveCosts, comparator, maxExecutionTime) {
		let queue = new PriorityQueue(comparator);
		queue.push([0, 0, 0, im, false, null, null]);
		let count = 0;
		let closedSet = {};
		let startTime = (new Date()).getTime();
		while (true) {
			count++;
			let tup = queue.pop();
			if (tup == null) {
				return null;
			}
			else if (tup[3].equals(fm) && tup[1] == listAct.length) {
				return PetriNetAlignments.formAlignment(listAct, tup);
			}
			else if (PetriNetAlignments.checkClosed(closedSet, tup)) {
				continue;
			}
			else {
				let thisTime = (new Date()).getTime();
				if ((thisTime - startTime)/1000.0 > maxExecutionTime) {
					return null;
				}
				PetriNetAlignments.closeTuple(closedSet, tup);
				if (!(tup[3].equals(fm))) {
					let enabledTransitions = tup[3].getEnabledTransitions();
					for (let trans of enabledTransitions) {
						let newTup = null;
						if (tup[1] < listAct.length && trans.label == listAct[tup[1]]) {
							// sync move
							newTup = [tup[0] + syncCosts[trans.toString()], tup[1] + 1, count, tup[3].execute(trans), false, trans, tup];
							if (!(PetriNetAlignments.checkClosed(closedSet, newTup))) {
								queue.push(newTup);
							}
						}
						else {
							// move on model
							newTup = [tup[0] + modelMoveCosts[trans.toString()], tup[1], count, tup[3].execute(trans), true, trans, tup];
							if (!(PetriNetAlignments.checkClosed(closedSet, newTup))) {
								queue.push(newTup);
							}
						}
					}
				}
				if (tup[1] < listAct.length && !(tup[4])) {
					// move on log
					let newTup = [tup[0] + logMoveCosts[listAct[tup[1]]], tup[1] + 1, count, tup[3], false, null, tup];
					if (!(PetriNetAlignments.checkClosed(closedSet, newTup))) {
						queue.push(newTup);
					}
				}
			}
		}
	}
	
	static formAlignment(listAct, tup) {
		let ret = [];
		let cost = tup[0];
		let closedStates = tup[2];
		while (tup[6] != null) {
			let isMM = tup[4];
			let currTrans = tup[5];
			if (currTrans == null) {
				// lm
				ret.push("("+listAct[tup[1]-1]+";>>)")
			}
			else if (isMM) {
				ret.push("(>>;"+currTrans.name+")")
			}
			else {
				ret.push("("+listAct[tup[1]-1]+";"+currTrans.name+")")
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
	module.exports = {PetriNetAlignments: PetriNetAlignments, PetriNetAlignmentsResults: PetriNetAlignmentsResults};
	global.PetriNetAlignments = PetriNetAlignments;
	global.PetriNetAlignmentsResults = PetriNetAlignmentsResults;
}
catch (err) {
	// not in Node
	//console.log(err);
}

Pm4JS.registerAlgorithm("PetriNetAlignments", "apply", ["EventLog", "AcceptingPetriNet"], "PetriNetAlignmentsResults", "Perform Alignments on Petri nets", "Alessandro Berti");
