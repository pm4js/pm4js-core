class InductiveMiner {
	static apply(eventLog, activityKey="concept:name", removeNoise=false, threshold=0.0) {
		return InductiveMiner.inductiveMiner(eventLog, null, activityKey, removeNoise, threshold); 
	}
	
		
	static inductiveMiner(log, treeParent, activityKey, removeNoise, threshold) {
		let emptyTraces = InductiveMiner.countEmptyTraces(log);
		if (emptyTraces > 0) {
			let xor = new ProcessTree(treeParent, ProcessTreeOperator.EXCLUSIVE, null);
			let skip = new ProcessTree(xor, null, null);
			xor.children.push(InductiveMiner.inductiveMiner(InductiveMiner.filterNonEmptyTraces(log), xor, activityKey, false, threshold));
			xor.children.push(skip);
			return xor;
		}
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
		let xorCut = InductiveMinerExclusiveCutDetector.detect(log, freqDfg, activityKey, removeNoise, threshold);
		if (xorCut != null) {
			let logs = InductiveMinerExclusiveCutDetector.project(log, xorCut, activityKey);
			let xorNode = new ProcessTree(treeParent, ProcessTreeOperator.EXCLUSIVE, null);
			for (let sublog of logs) {
				let child = InductiveMiner.inductiveMiner(sublog, xorNode, activityKey, false, threshold);
				xorNode.children.push(child);
			}
			return xorNode;
		}
		let andCut = InductiveMinerParallelCutDetector.detect(log, freqDfg, activityKey, removeNoise, threshold);
		if (andCut != null) {
			let logs = InductiveMinerParallelCutDetector.project(log, andCut, activityKey);
			let parNode = new ProcessTree(treeParent, ProcessTreeOperator.PARALLEL, null);
			for (let sublog of logs) {
				let child = InductiveMiner.inductiveMiner(sublog, parNode, activityKey, false, threshold);
				parNode.children.push(child);
			}
			return parNode;
		}
		let loopCut = InductiveMinerLoopCutDetector.detect(log, freqDfg, activityKey, removeNoise, threshold);
		if (loopCut != null) {
			let logs = InductiveMinerLoopCutDetector.project(log, loopCut, activityKey);
			let loopNode = new ProcessTree(treeParent, ProcessTreeOperator.LOOP, null);
			loopNode.children.push(InductiveMiner.inductiveMiner(logs[0], loopNode, activityKey, false, threshold));
			loopNode.children.push(InductiveMiner.inductiveMiner(logs[1], loopNode, activityKey, false, threshold));
			return loopNode;
		}
		if (Object.keys(freqDfg.pathsFrequency).length == 0) {
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
			return new ProcessTree(treeParent, null, null);
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
	
	static countEmptyTraces(eventLog) {
		let ret = 0;
		for (let trace of eventLog.traces) {
			if (trace.events.length == 0) {
				ret++;
			}
		}
		return ret;
	}
	
	static filterNonEmptyTraces(eventLog) {
		let filteredLog = new EventLog();
		for (let trace of eventLog.traces) {
			if (trace.events.length > 0) {
				filteredLog.traces.push(trace);
			}
		}
		return filteredLog;
	}
}

class InductiveMinerSequenceCutDetector {
    // Basic Steps:
    // 1. create a group per activity
    // 2. merge pairwise reachable nodes (based on transitive relations)
    // 3. merge pairwise unreachable nodes (based on transitive relations)
    // 4. sort the groups based on their reachability
	static detect(log, freqDfg, activityKey, removeNoise, threshold) {
		let actReach = InductiveMinerGeneralUtilities.activityReachability(freqDfg);
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

class InductiveMinerLoopCutDetector {
	// 1. merge all start and end activities in one group ('do' group)
    // 2. remove start/end activities from the dfg
    // 3. detect connected components in (undirected representative) of the reduced graph
    // 4. check if each component meets the start/end criteria of the loop cut definition (merge with the 'do' group if not)
    // 5. return the cut if at least two groups remain
	static detect(log, freqDfg0, activityKey, removeNoise, threshold) {
		let freqDfg = Object();
		freqDfg.pathsFrequency = {};
		for (let path in freqDfg0.pathsFrequency) {
			let act1 = path.split(",")[0];
			let act2 = path.split(",")[1];
			if (!(act1 in freqDfg0.startActivities || act2 in freqDfg0.startActivities || act1 in freqDfg0.endActivities || act2 in freqDfg0.endActivities)) {
				freqDfg.pathsFrequency[path] = freqDfg0.pathsFrequency[path];
			}
		}
		let doPart = [];
		let redoPart = [];
		let remainingActivities = {};
		for (let act in freqDfg0.activities) {
			if (act in freqDfg0.startActivities || act in freqDfg0.endActivities) {
				doPart.push(act);
			}
			else {
				remainingActivities[act] = freqDfg0.activities[act];
			}
		}
		freqDfg.activities = remainingActivities;
		let connComp = InductiveMinerGeneralUtilities.getConnectedComponents(freqDfg);
		for (let conn of connComp) {
			let isRedo = true;
			for (let act of conn) {
				for (let sa in freqDfg0.startActivities) {
					if (!([act, sa] in freqDfg0.pathsFrequency)) {
						isRedo = false;
						break;
					}
				}
				/*for (let ea in freqDfg0.endActivities) {
					if (!([ea, act] in freqDfg0.pathsFrequency)) {
						isRedo = false;
						break;
					}
				}*/
			}
			for (let act of conn) {
				if (isRedo) {
					redoPart.push(act);
				}
				else {
					doPart.push(act);
				}
			}
		}
		if (redoPart.length > 0) {
			return [doPart, redoPart];
		}
		return null;
	}
	
	static project(log, groups, activityKey) {
		let sublogs = [new EventLog(), new EventLog()];
		for (let trace of log.traces) {
			let i = 0;
			let j = 0;
			let subtraceDo = new Trace();
			let subtraceRedo = new Trace();
			while (i < trace.events.length) {
				let thisAct = trace.events[i].attributes[activityKey].value;
				if (groups[0].includes(thisAct)) {
					if (j == 1) {
						sublogs[1].traces.push(subtraceRedo);
						subtraceRedo = new Trace();
					}
					j = 0;
					
				}
				else {
					if (j == 0) {
						sublogs[0].traces.push(subtraceDo);
						subtraceDo = new Trace();
					}
					j = 1;
				}
				if (j == 0) {
					subtraceDo.events.push(trace.events[i]);
				}
				else {
					subtraceRedo.events.push(trace.events[i]);
				}
				i++;
			}
			if (j == 0) {
				sublogs[0].traces.push(subtraceDo);
			}
		}
		return sublogs;
	}
}

class InductiveMinerParallelCutDetector {
	static detect(log, freqDfg, activityKey, removeNoise, threshold) {
		let ret = [];
		for (let act in freqDfg.activities) {
			ret.push([act]);
		}
		let cont = true;
		while (cont) {
			cont = false;
			let i = 0;
			while (i < ret.length) {
				let j = i + 1;
				while (j < ret.length) {
					for (let act1 of ret[i]) {
						if (ret[j] != null) {
							for (let act2 of ret[j]) {
								if ((!([act1, act2] in freqDfg.pathsFrequency)) || (!([act2, act1] in freqDfg.pathsFrequency))) {
									ret[i] = [...ret[i], ...ret[j]];
									ret.splice(j, 1);
									cont = true;
									break;
								}
							}
							if (cont) {
								break;
							}
						}
					}
					j++;
				}
				i++;
			}
		}
		ret.sort(function(a, b) {
			if (a.length < b.length) {
				return -1;
			}
			else if (a.length > b.length) {
				return 1;
			}
			return 0;
		});
		if (ret.length > 1) {
			let i = 0;
			while (i < ret.length) {
				let containsSa = false;
				let containsEa = false;
				for (let sa in freqDfg.startActivities) {
					if (ret[i].includes(sa)) {
						containsSa = true;
						break;
					}
				}
				for (let ea in freqDfg.endActivities) {
					if (ret[i].includes(ea)) {
						containsEa = true;
						break;
					}
				}
				if (!(containsSa && containsEa)) {
					let targetIdx = i-1;
					if (targetIdx < 0) {
						targetIdx = i+1;
					}
					if (targetIdx < groups.length) {
						groups[targetIdx] = [...groups[i], ...groups[i+1]];
					}
					groups.splice(i, 1);
					continue;
				}
				i++;
			}
			if (ret.length > 1) {
				return ret;
			}
		}
		return null;
	}
	
	static project(log, groups, activityKey) {
		let ret = [];
		for (let g of groups) {
			ret.push(LogGeneralFiltering.filterEventsHavingEventAttributeValues(log, g, true, true, activityKey));
		}
		return ret;
	}
}

class InductiveMinerExclusiveCutDetector {
	static detect(log, freqDfg, activityKey, removeNoise, threshold) {
		let connComp = InductiveMinerGeneralUtilities.getConnectedComponents(freqDfg);
		if (connComp.length > 1) {
			return connComp;
		}
		return null;
	}
	
	static project(log, groups, activityKey) {
		let ret = [];
		for (let g of groups) {
			ret.push(new EventLog());
		}
		for (let trace of log.traces) {
			let activ = [];
			for (let eve of trace.events) {
				activ.push(eve.attributes[activityKey].value);
			}
			let i = 0;
			while (i < groups.length) {
				for (let act of groups[i]) {
					if (activ.includes(act)) {
						ret[i].traces.push(trace);
						break;
					}
				}
				i++;
			}
		}
		return ret;
	}
}

class InductiveMinerGeneralUtilities {
	static activityReachability(freqDfg) {
		let ret = {};
		for (let act in freqDfg.activities) {
			ret[act] = {};
		}
		for (let rel in freqDfg.pathsFrequency) {
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
	
	static getConnectedComponents(freqDfg) {
		let ret = [];
		for (let act in freqDfg.activities) {
			ret.push([act]);
		}
		let cont = true;
		while (cont) {
			cont = false;
			let i = 0;
			while (i < ret.length) {
				let j = i + 1;
				while (j < ret.length) {
					for (let act1 of ret[i]) {
						if (ret[j] != null) {
							for (let act2 of ret[j]) {
								if ([act1, act2] in freqDfg.pathsFrequency || [act2, act1] in freqDfg.pathsFrequency) {
									ret[i] = [...ret[i], ...ret[j]];
									ret.splice(j, 1);
									cont = true;
									break;
								}
							}
							if (cont) {
								break;
							}
						}
					}
					j++;
				}
				i++;
			}
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
