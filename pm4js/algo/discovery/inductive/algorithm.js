class InductiveMiner {
	static apply(eventLog, activityKey="concept:name", removeNoise=false, threshold=0.0) {
		return InductiveMiner.inductiveMiner(eventLog, null, activityKey, removeNoise, threshold); 
	}
	
		
	static inductiveMiner(log, treeParent, activityKey, removeNoise, threshold) {
		let freqDfg = FrequencyDfgDiscovery.apply(log, activityKey);
		let seqCut = InductiveMinerSequenceCutDetector.detect(log, freqDfg, activityKey, removeNoise, threshold);
		if (seqCut != null) {
			let logs = InductiveMinerSequenceCutDetector.project(log, seqCut, activityKey);
			let seqNode = new ProcessTree(treeParent, ProcessTreeOperator.SEQUENCE, null);
			for (let sublog of logs) {
				let child = InductiveMiner.inductiveMiner(sublog, seqNode, activityKey, false, threshold);
				seqNode.children.push(child);
			}
			return seqNode;
		}
		if (Object.keys(freqDfg.paths_frequency).length == 0) {
			return InductiveMiner.baseCase(freqDfg, treeParent);
		}
		return InductiveMiner.mineFlower(freqDfg, treeParent);
	}
	
	static mineFlower(freqDfg, treeParent) {
		let loop = new ProcessTree(treeParent, ProcessTreeOperator.LOOP, null);
		let xor = new ProcessTree(loop, ProcessTreeOperator.EXCLUSIVE, null);
		let redo = new ProcessTree(loop, null, null);
		loop.children.push(xor);
		loop.children.push(redo);
		for (let act in freqDfg.activities) {
			let actNode = new ProcessTree(xor, null, act);
			xor.children.push(actNode);
		}
		return loop;
	}
	
	static baseCase(freqDfg, treeParent) {
		if (Object.keys(freqDfg.activities).length == 0) {
			return new ProcesTree(treeParent, null, null);
		}
		else if (Object.keys(freqDfg.activities).length == 1) {
			let activities = Object.keys(freqDfg.activities);
			return new ProcessTree(treeParent, null, activities[0]);
		}
		else {
			let xor = new ProcessTree(treeParent, ProcessTreeOperator.EXCLUSIVE, null);
			for (let act in freqDfg.activities) {
				let actNode = new ProcessTree(xor, null, act);
				xor.children.push(actNode);
			}
			return xor;
		}
	}
}

class InductiveMinerSequenceCutDetector {
	static detect(log, freqDfg, activityKey, removeNoise, threshold) {
		let actReach = InductiveMinerSequenceCutDetector.activityReachability(freqDfg);
		let groups = [];
		for (let act in actReach) {
			groups.push([act]);
		}
		groups = InductiveMinerSequenceCutDetector.mergePairwiseReachableGroups(groups, actReach);
		groups = InductiveMinerSequenceCutDetector.mergePairwiseUnreachableGroups(groups, actReach);
		groups = InductiveMinerSequenceCutDetector.sortBasedOnReachability(groups, actReach);
		if (groups.length > 1) {
			return groups;
		}
		return null;
	}
	
	static activityReachability(freqDfg) {
		let ret = {};
		for (let act in freqDfg.activities) {
			ret[act] = {};
		}
		for (let rel in freqDfg.paths_frequency) {
			let act1 = rel.split(",")[0];
			let act2 = rel.split(",")[1];
			ret[act1][act2] = 0;
		}
		let cont = true;
		while (cont) {
			cont = false;
			for (let act in ret) {
				for (let act2 in ret[act]) {
					for (let act3 in ret[act2]) {
						if (!(act3 in ret[act])) {
							ret[act][act3] = 0;
							cont = true;
						}
					}
				}
			}
		}
		return ret;
	}
	
	static mergePairwiseReachableGroups(groups, actReach) {
		let i = 0;
		while (i < groups.length) {
			let j = i + 1;
			while (j < groups.length) {
				if (InductiveMinerSequenceCutDetector.isPairwiseReachable(groups[i], groups[j], actReach)) {
					groups[i] = [...groups[i], ...groups[j]];
					groups.splice(j, 1);
					continue;
				}
				j++;
			}
			i++;
		}
		return groups;
	}
	
	static isPairwiseReachable(g1, g2, actReach) {
		for (let act of g1) {
			for (let act2 of g2) {
				if (act2 in actReach[act] && act in actReach[act2]) {
					return true;
				}
			}
		}
		return false;
	}
	
	static mergePairwiseUnreachableGroups(groups, actReach) {
		let i = 0;
		while (i < groups.length) {
			let j = i + 1;
			while (j < groups.length) {
				if (InductiveMinerSequenceCutDetector.isPairwiseUnreachable(groups[i], groups[j], actReach)) {
					groups[i] = [...groups[i], ...groups[j]];
					groups.splice(j, 1);
					continue;
				}
				j++;
			}
			i++;
		}
		return groups;
	}
	
	static isPairwiseUnreachable(g1, g2, actReach) {
		for (let act of g1) {
			for (let act2 of g2) {
				if (act2 in actReach[act] || act in actReach[act2]) {
					return false;
				}
			}
		}
		return true;
	}
	
	static sortBasedOnReachability(groups, actReach) {
		let cont = true;
		while (cont) {
			cont = false;
			let i = 0;
			while (i < groups.length) {
				let j = i + 1;
				while (j < groups.length) {
					for (let act1 of groups[i]) {
						for (let act2 of groups[j]) {
							if (act1 in actReach[act2]) {
								let temp = groups[i];
								groups[i] = groups[j];
								groups[j] = temp;
								cont = true;
								break;
							}
						}
					}
					j++;
				}
				i++;
			}
		}
		return groups;
	}
	
	static project(log, groups, activityKey) {
		let ret = [];
		for (let g of groups) {
			ret.push(LogGeneralFiltering.filterEventsHavingEventAttributeValues(log, g, true, true, activityKey));
		}
		return ret;
	}
}

try {
	require('../../../pm4js.js');
	require('../../../objects/log/log.js');
	require('../../../objects/process_tree/process_tree.js');
	require('../../../objects/dfg/frequency/obj.js');
	require('../../../algo/discovery/dfg/algorithm.js');
	require('../../../statistics/log/general.js');
	module.exports = {InductiveMiner: InductiveMiner, InductiveMinerSequenceCutDetector: InductiveMinerSequenceCutDetector};
	global.InductiveMiner = InductiveMiner;
	global.InductiveMinerSequenceCutDetector = InductiveMinerSequenceCutDetector;
}
catch (err) {
	// not in Node
	console.log(err);
}

Pm4JS.registerAlgorithm("InductiveMiner", "apply", ["EventLog"], "ProcessTree", "Mine a Process Tree using the Inductive Miner", "Alessandro Berti");
