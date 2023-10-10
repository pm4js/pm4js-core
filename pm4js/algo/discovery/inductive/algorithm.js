class InductiveMiner {
	static applyPlugin(eventLog, activityKey="concept:name", threshold=0.0, removeNoise=false) {
		return InductiveMiner.apply(eventLog, activityKey, threshold, null, removeNoise);
	}
	
	static applyPluginDFG(frequencyDfg, activityKey="concept:name", threshold=0.0, removeNoise=false) {
		return InductiveMiner.apply(null, activityKey, threshold, frequencyDfg, removeNoise);
	}
	
	static applyDfg(frequencyDfg, threshold=0.0, removeNoise=false) {
		return InductiveMiner.apply(null, null, threshold, frequencyDfg, removeNoise);
	}
	
	static apply(eventLog, activityKey="concept:name", threshold=0.0, freqDfg=null, removeNoise=false, variantsFiltering=false) {
		if (variantsFiltering) {
			if (threshold > 0.0) {
				let variants = GeneralLogStatistics.getVariants(eventLog);
				let variants2 = [];
				let totalCount = 0;
				for (let k in variants) {
					let v = variants[k];
					variants2.push([k, v]);
					totalCount += 1;
				}
				variants2.sort((a, b) => b[1] - a[1]);
				let includedVariants = [];
				let i = 0;
				let partialSum = 0;
				while (i < variants2.length) {
					if (partialSum <= totalCount * (1 - threshold)) {
						includedVariants.push(variants2[i][0]);
					}
					partialSum += variants2[i][1];
					i++;
				}
				eventLog = LogGeneralFiltering.filterVariants(eventLog, includedVariants);
			}
		}
		let tree = InductiveMiner.inductiveMiner(eventLog, null, activityKey, removeNoise, threshold, freqDfg);
		if (eventLog == null) {
			Pm4JS.registerObject(tree, "Process Tree (Inductive Miner DFG)");
		}
		else {
			Pm4JS.registerObject(tree, "Process Tree (Inductive Miner)");
		}
		return tree;
	}
	
	static keepOneTracePerVariant(log, activityKey) {
		let newEventLog = new EventLog();
		let variants = GeneralLogStatistics.getVariants(log, activityKey);
		for (let vari in variants) {
			let activ = vari.split(",");
			let newTrace = new Trace();
			for (let act of activ) {
				if (act.length > 0) {
					let newEvent = new Event();
					newEvent.attributes[activityKey] = new Attribute(act);
					newTrace.events.push(newEvent);
				}
			}
			newEventLog.traces.push(newTrace);
		}
		return newEventLog;
	}
		
	static inductiveMiner(log, treeParent, activityKey, removeNoise, threshold, freqDfg=null, skippable=false) {
		if (log != null) {
			if (threshold == 0) {
				log = InductiveMiner.keepOneTracePerVariant(log, activityKey);
			}
			freqDfg = FrequencyDfgDiscovery.apply(log, activityKey);
			if (threshold > 0 && removeNoise) {
				freqDfg = InductiveMiner.removeNoiseFromDfg(freqDfg, threshold);
			}
			let emptyTraces = InductiveMiner.countEmptyTraces(log);
			if (emptyTraces > threshold * log.traces.length) {
				let xor = new ProcessTree(treeParent, ProcessTreeOperator.EXCLUSIVE, null);
				let skip = new ProcessTree(xor, null, null);
				xor.children.push(InductiveMiner.inductiveMiner(InductiveMiner.filterNonEmptyTraces(log), xor, activityKey, false, threshold));
				xor.children.push(skip);
				return xor;
			}
		}
		else if (threshold > 0 && removeNoise) {
			freqDfg = InductiveMiner.removeNoiseFromDfg(freqDfg, threshold);
		}
		if (skippable) {
			let xor = new ProcessTree(treeParent, ProcessTreeOperator.EXCLUSIVE, null);
			let skip = new ProcessTree(xor, null, null);
			xor.children.push(InductiveMiner.inductiveMiner(null, xor, activityKey, false, threshold, freqDfg));
			xor.children.push(skip);
			return xor;
		}
		if (Object.keys(freqDfg.pathsFrequency).length == 0) {
			return InductiveMiner.baseCase(freqDfg, treeParent);
		}
		let detectedCut = InductiveMiner.detectCut(log, freqDfg, treeParent, activityKey, threshold);
		if (detectedCut != null) {
			return detectedCut;
		}
		if (!(removeNoise)) {
			if (threshold > 0) {
				let detectedCut = InductiveMiner.inductiveMiner(log, treeParent, activityKey, true, threshold, freqDfg, skippable);
				if (detectedCut != null) {
					return detectedCut;
				}
			}
			let detectedFallthrough = null;
			if (log != null) {
				detectedFallthrough = InductiveMiner.detectFallthroughs(log, freqDfg, treeParent, activityKey, threshold);
			}
			else {
				detectedFallthrough = InductiveMiner.detectFallthroughsDfg(freqDfg, treeParent, threshold);
			}
			if (detectedFallthrough != null) {
				return detectedFallthrough;
			}
		}
		return InductiveMiner.mineFlower(freqDfg, treeParent);
	}
	
	static removeNoiseFromDfg(freqDfg, threshold) {
		let maxPerActivity = {};
		for (let ea in freqDfg.endActivities) {
			maxPerActivity[ea] = freqDfg.endActivities[ea];
		}
		for (let path in freqDfg.pathsFrequency) {
			let pf = freqDfg.pathsFrequency[path];
			let act1 = path.split(",")[0];
			if (!(act1 in maxPerActivity)) {
				maxPerActivity[act1] = pf;
			}
			else {
				maxPerActivity[act1] = Math.max(pf, maxPerActivity[act1]);
			}
		}
		for (let path in freqDfg.pathsFrequency) {
			let pf = freqDfg.pathsFrequency[path];
			let act1 = path.split(",")[0];
			if (pf < (1 - threshold)*maxPerActivity[act1]) {
				delete freqDfg.pathsFrequency[path];
			}
		}
		return freqDfg;
	}
	
	static detectCut(log, freqDfg, treeParent, activityKey, threshold) {
		if (freqDfg == null) {
			freqDfg = FrequencyDfgDiscovery.apply(log, activityKey);
		}
		let seqCut = InductiveMinerSequenceCutDetector.detect(freqDfg, activityKey);
		let vect = null;
		let subdfgs = null;
		let skippable = null;
		if (seqCut != null) {
			//console.log("InductiveMinerSequenceCutDetector");
			let seqNode = new ProcessTree(treeParent, ProcessTreeOperator.SEQUENCE, null);
			vect = InductiveMinerSequenceCutDetector.projectDfg(freqDfg, seqCut);
			subdfgs = vect[0];
			skippable = vect[1];
			if (log != null) {
				let logs = InductiveMinerSequenceCutDetector.project(log, seqCut, activityKey);
				for (let sublog of logs) {
					let child = InductiveMiner.inductiveMiner(sublog, seqNode, activityKey, false, threshold);
					seqNode.children.push(child);
				}
			}
			else {
				for (let idx in subdfgs) {
					let child = InductiveMiner.inductiveMiner(null, seqNode, activityKey, false, threshold, subdfgs[idx], skippable[idx]);
					seqNode.children.push(child);
				}
			}
			return seqNode;
		}
		let xorCut = InductiveMinerExclusiveCutDetector.detect(freqDfg, activityKey);
		if (xorCut != null) {
			//console.log("InductiveMinerExclusiveCutDetector");
			let xorNode = new ProcessTree(treeParent, ProcessTreeOperator.EXCLUSIVE, null);
			vect = InductiveMinerExclusiveCutDetector.projectDfg(freqDfg, xorCut);
			subdfgs = vect[0];
			skippable = vect[1];
			if (log != null) {
				let logs = InductiveMinerExclusiveCutDetector.project(log, xorCut, activityKey);
				for (let sublog of logs) {
					let child = InductiveMiner.inductiveMiner(sublog, xorNode, activityKey, false, threshold);
					xorNode.children.push(child);
				}
			}
			else {
				for (let idx in subdfgs) {
					let child = InductiveMiner.inductiveMiner(null, xorNode, activityKey, false, threshold, subdfgs[idx], skippable[idx]);
					xorNode.children.push(child);
				}
			}
			return xorNode;
		}
		let andCut = InductiveMinerParallelCutDetector.detect(freqDfg, activityKey);
		if (andCut != null) {
			//console.log("InductiveMinerParallelCutDetector");
			let parNode = new ProcessTree(treeParent, ProcessTreeOperator.PARALLEL, null);
			vect = InductiveMinerParallelCutDetector.projectDfg(freqDfg, andCut);
			subdfgs = vect[0];
			skippable = vect[1];
			if (log != null) {
				let logs = InductiveMinerParallelCutDetector.project(log, andCut, activityKey);
				for (let sublog of logs) {
					let child = InductiveMiner.inductiveMiner(sublog, parNode, activityKey, false, threshold);
					parNode.children.push(child);
				}
			}
			else {
				for (let idx in subdfgs) {
					let child = InductiveMiner.inductiveMiner(null, parNode, activityKey, false, threshold, subdfgs[idx], skippable[idx]);
					parNode.children.push(child);
				}
			}
			return parNode;
		}
		let loopCut = InductiveMinerLoopCutDetector.detect(freqDfg, activityKey);
		if (loopCut != null) {
			//console.log("InductiveMinerLoopCutDetector");
			let loopNode = new ProcessTree(treeParent, ProcessTreeOperator.LOOP, null);
			vect = InductiveMinerLoopCutDetector.projectDfg(freqDfg, loopCut);
			subdfgs = vect[0];
			skippable = vect[1];
			if (log != null) {
				let logs = InductiveMinerLoopCutDetector.project(log, loopCut, activityKey);
				loopNode.children.push(InductiveMiner.inductiveMiner(logs[0], loopNode, activityKey, false, threshold));
				loopNode.children.push(InductiveMiner.inductiveMiner(logs[1], loopNode, activityKey, false, threshold));
			}
			else {
				loopNode.children.push(InductiveMiner.inductiveMiner(null, loopNode, activityKey, false, threshold, subdfgs[0], skippable[0]));
				loopNode.children.push(InductiveMiner.inductiveMiner(null, loopNode, activityKey, false, threshold, subdfgs[1], skippable[1]));
			}
			return loopNode;
		}
		return null;
	}
	
	static detectFallthroughsDfg(freqDfg, treeParent, threshold) {
		let activityConcurrentCut = InductiveMinerActivityConcurrentFallthroughDFG.detect(freqDfg, threshold);
		if (activityConcurrentCut != null) {
			let parNode = new ProcessTree(treeParent, ProcessTreeOperator.PARALLEL, null);
			let xorWithSkipsNode = new ProcessTree(treeParent, ProcessTreeOperator.EXCLUSIVE, null);
			parNode.children.push(xorWithSkipsNode);
			let actNode = new ProcessTree(xorWithSkipsNode, null, activityConcurrentCut[0]);
			let skipNode = new ProcessTree(xorWithSkipsNode, null, null);
			xorWithSkipsNode.children.push(actNode);
			xorWithSkipsNode.children.push(skipNode);
			let xorWithSkipsNode2 = new ProcessTree(parNode, ProcessTreeOperator.EXCLUSIVE, null);
			let skipNode2 = new ProcessTree(xorWithSkipsNode2, null, null);
			xorWithSkipsNode2.children.push(activityConcurrentCut[1]);
			xorWithSkipsNode2.children.push(skipNode2);
			activityConcurrentCut[1].parentNode = xorWithSkipsNode2;
			parNode.children.push(xorWithSkipsNode2);
			parNode.properties["concurrentActivity"] = activityConcurrentCut[0];
			return parNode;
		}
	}
	
	static detectFallthroughs(log, freqDfg, treeParent, activityKey, threshold) {
		let activityOncePerTraceCandidate = InductiveMinerActivityOncePerTraceFallthrough.detect(log, freqDfg, activityKey);
		if (activityOncePerTraceCandidate != null) {
			//console.log("InductiveMinerActivityOncePerTraceFallthrough");
			let sublog = InductiveMinerActivityOncePerTraceFallthrough.project(log, activityOncePerTraceCandidate, activityKey);
			let parNode = new ProcessTree(treeParent, ProcessTreeOperator.PARALLEL, null);
			let actNode = new ProcessTree(parNode, null, activityOncePerTraceCandidate);
			parNode.children.push(actNode);
			parNode.children.push(InductiveMiner.inductiveMiner(sublog, parNode, activityKey, false, threshold));
			return parNode;
		}
		let activityConcurrentCut = InductiveMinerActivityConcurrentFallthrough.detect(log, freqDfg, activityKey, threshold);
		if (activityConcurrentCut != null) {
			//console.log("InductiveMinerActivityConcurrentFallthrough");
			let parNode = new ProcessTree(treeParent, ProcessTreeOperator.PARALLEL, null);
			let filteredLog = LogGeneralFiltering.filterEventsHavingEventAttributeValues(log, [activityConcurrentCut[0]], true, true, activityKey);
			parNode.children.push(InductiveMiner.inductiveMiner(filteredLog, parNode, activityKey, false, threshold));
			activityConcurrentCut[1].parentNode = parNode;
			parNode.children.push(activityConcurrentCut[1]);
			parNode.properties["concurrentActivity"] = activityConcurrentCut[0];
			return parNode;
		}
		let strictTauLoop = InductiveMinerStrictTauLoopFallthrough.detect(log, freqDfg, activityKey);
		if (strictTauLoop != null) {
			//console.log("InductiveMinerStrictTauLoopFallthrough");
			let loop = new ProcessTree(treeParent, ProcessTreeOperator.LOOP, null);
			let redo = new ProcessTree(loop, null, null);
			loop.children.push(InductiveMiner.inductiveMiner(strictTauLoop, loop, activityKey, false, threshold));
			loop.children.push(redo);
			return loop;
		}
		let tauLoop = InductiveMinerTauLoopFallthrough.detect(log, freqDfg, activityKey);
		if (tauLoop != null) {
			//console.log("InductiveMinerTauLoopFallthrough");
			let loop = new ProcessTree(treeParent, ProcessTreeOperator.LOOP, null);
			let redo = new ProcessTree(loop, null, null);
			loop.children.push(InductiveMiner.inductiveMiner(tauLoop, loop, activityKey, false, threshold));
			loop.children.push(redo);
			return loop;
		}
		return null;
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
	static detect(freqDfg, activityKey) {
		let actReach = InductiveMinerGeneralUtilities.activityReachability(freqDfg);
		let groups = [];
		for (let act in actReach) {
			groups.push([act]);
		}
		let groupsSize = null;
		while (groupsSize != groups.length) {
			groupsSize = groups.length;
			groups = InductiveMinerSequenceCutDetector.mergeGroups(groups, actReach);
		}
		groups = InductiveMinerSequenceCutDetector.sortBasedOnReachability(groups, actReach);
		if (groups.length > 1) {
			return groups;
		}
		return null;
	}
	
	static mergeGroups(groups, actReach) {
		let i = 0;
		while (i < groups.length) {
			let j = i + 1;
			while (j < groups.length) {
				if (InductiveMinerSequenceCutDetector.checkMergeCondition(groups[i], groups[j], actReach)) {
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
	
	static checkMergeCondition(g1, g2, actReach) {
		for (let a1 of g1) {
			for (let a2 of g2) {
				if ((a2 in actReach[a1] && a1 in actReach[a2]) || (!(a2 in actReach[a1]) && !(a1 in actReach[a2]))) {
					return true;
				}
			}
		}
		return false;
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
						if (cont) {
							break;
						}
					}
					if (cont) {
						break;
					}
					j++;
				}
				if (cont) {
					break;
				}
				i++;
			}
		}
		return groups;
	}
	
	static projectDfg(dfg, groups) {
		let startActivities = [];
		let endActivities = [];
		let activities = [];
		let dfgs = [];
		let skippable = [];
		for (let g of groups) {
			skippable.push(false);
		}
		let activitiesIdx = {};
		for (let gind in groups) {
			let g = groups[gind]
			for (let act of g) {
				activitiesIdx[act] = parseInt(gind);
			}
		}
		let i = 0;
		while (i < groups.length) {
			let toSuccArcs = {};
			let fromPrevArcs = {};
			if (i < groups.length - 1) {
				for (let arc0 in dfg.pathsFrequency) {
					let arc = arc0.split(",");
					if (groups[i].includes(arc[0]) && groups[i+1].includes(arc[1])) {
						if (!(arc[0] in toSuccArcs)) {
							toSuccArcs[arc[0]] = 0;
						}
						toSuccArcs[arc[0]] += dfg.pathsFrequency[arc0];
					}
				}
			}
			if (i > 0) {
				for (let arc0 in dfg.pathsFrequency) {
					let arc = arc0.split(",");
					if (groups[i-1].includes(arc[0]) && groups[i].includes(arc[1])) {
						if (!(arc[1] in fromPrevArcs)) {
							fromPrevArcs[arc[1]] = 0;
						}
						fromPrevArcs[arc[1]] += dfg.pathsFrequency[arc0];
					}
				}
			}
			
			if (i == 0) {
				startActivities.push({});
				for (let act in dfg.startActivities) {
					if (groups[i].includes(act)) {
						startActivities[i][act] = dfg.startActivities[act];
					}
					else {
						let j = i;
						while (j < activitiesIdx[act]) {
							skippable[j] = true;
							j++;
						}
					}
				}
			}
			else {
				startActivities.push(fromPrevArcs);
			}
			
			if (i == groups.length - 1) {
				endActivities.push({});
				for (let act in dfg.endActivities) {
					if (groups[i].includes(act)) {
						endActivities[i][act] = dfg.endActivities[act];
					}
					else {
						let j = activitiesIdx[act] + 1;
						while (j <= i) {
							skippable[j] = true;
							j++;
						}
					}
				}
			}
			else {
				endActivities.push(toSuccArcs);
			}
			activities.push({});
			for (let act of groups[i]) {
				activities[i][act] = dfg.activities[act];
			}
			dfgs.push({});
			for (let arc0 in dfg.pathsFrequency) {
				let arc = arc0.split(",");
				if (groups[i].includes(arc[0]) && groups[i].includes(arc[1])) {
					dfgs[i][arc0] = dfg.pathsFrequency[arc0];
				}
			}
			i++;
		}
		i = 0;
		while (i < dfgs.length) {
			dfgs[i] = new FrequencyDfg(activities[i], startActivities[i], endActivities[i], dfgs[i]);
			i++;
		}
		for (let arc0 in dfg.pathsFrequency) {
			let arc = arc0.split(",");
			let z = activitiesIdx[arc[1]];
			let j = activitiesIdx[arc[0]] + 1;
			while (j < z) {
				skippable[j] = false;
				j++;
			}
		}
		return [dfgs, skippable];
	}
	
	static project(log, groups, activityKey) {
		let logs = [];
		for (let g of groups) {
			logs.push(new EventLog());
		}
		for (let trace of log.traces) {
			let i = 0;
			let splitPoint = 0;
			let actUnion = [];
			while (i < groups.length) {
				let newSplitPoint = InductiveMinerSequenceCutDetector.findSplitPoint(trace, groups[i], splitPoint, actUnion, activityKey);
				let tracei = new Trace();
				let j = splitPoint;
				while (j < newSplitPoint) {
					if (groups[i].includes(trace.events[j].attributes[activityKey].value)) {
						tracei.events.push(trace.events[j]);
					}
					j++;
				}
				logs[i].traces.push(tracei);
				splitPoint = newSplitPoint;
				for (let act of groups[i]) {
					actUnion.push(act);
				}
				i++;
			}
		}
		return logs;
	}
	
	static findSplitPoint(trace, group, start, ignore, activityKey) {
		let leastCost = 0
		let positionWithLeastCost = start;
		let cost = 0;
		let i = start;
		while (i < trace.events.length) {
			if (group.includes(trace.events[i].attributes[activityKey].value)) {
				cost = cost - 1
			}
			else if (!(ignore.includes(trace.events[i].attributes[activityKey].value))) {
				cost = cost + 1
			}
			if (cost < leastCost) {
				leastCost = cost;
				positionWithLeastCost = i + 1;
			}
			i++;
		}
		return positionWithLeastCost;
	}
}

class InductiveMinerLoopCutDetector {
	// 1. merge all start and end activities in one group ('do' group)
    // 2. remove start/end activities from the dfg
    // 3. detect connected components in (undirected representative) of the reduced graph
    // 4. check if each component meets the start/end criteria of the loop cut definition (merge with the 'do' group if not)
    // 5. return the cut if at least two groups remain
	static detect(freqDfg0, activityKey) {
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
		let actReach = InductiveMinerGeneralUtilities.activityReachability(freqDfg0);
		let connComp = InductiveMinerGeneralUtilities.getConnectedComponents(freqDfg);
		for (let conn of connComp) {
			let isRedo = true;
			for (let act in freqDfg0.startActivities) {
				for (let act2 of conn) {
					if (!(act2 in actReach[act])) {
						isRedo = false;
						break;
					}
				}
			}
			if (isRedo) {
				for (let act in freqDfg0.endActivities) {
					for (let act2 of conn) {
						if (!(act2 in actReach[act])) {
							isRedo = false;
							break;
						}
					}
				}
			}
			if (isRedo) {
				for (let act of conn) {
					for (let sa in freqDfg0.startActivities) {
						if (!(sa in freqDfg0.endActivities)) {
							if (!([act, sa] in freqDfg0.pathsFrequency)) {
								isRedo = false;
								break;
							}
						}
					}
				}
			}
			if (isRedo) {
				for (let act of conn) {
					for (let ea in freqDfg0.endActivities) {
						if (!(ea in freqDfg0.startActivities)) {
							if (!([ea, act] in freqDfg0.pathsFrequency)) {
								isRedo = false;
								break;
							}
						}
					}
				}
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
				else if (groups[1].includes(thisAct)) {
					if (j == 0) {
						sublogs[0].traces.push(subtraceDo);
						subtraceDo = new Trace();
					}
					j = 1;
				}
				else {
					i++;
					continue;
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
	
	static projectDfg(frequencyDfg, groups) {
		let dfgs = [];
		let skippable = [false, false];
		for (let gind in groups) {
			let g = groups[gind];
			let activities = {};
			let startActivities = {};
			let endActivities = {};
			let pathsFrequency = {};
			for (let act in frequencyDfg.activities) {
				if (g.includes(act)) {
					activities[act] = frequencyDfg.activities[act];
				}
			}
			for (let arc0 in frequencyDfg.pathsFrequency) {
				let arc = arc0.split(",");
				if (g.includes(arc[0]) && g.includes(arc[1])) {
					pathsFrequency[arc0] = frequencyDfg.pathsFrequency[arc0];
				}
				if (arc[1] in frequencyDfg.startActivities && arc[0] in frequencyDfg.endActivities) {
					skippable[1] = true;
				}
			}
			if (gind == 0) {
				for (let act in frequencyDfg.startActivities) {
					if (g.includes(act)) {
						startActivities[act] = frequencyDfg.startActivities[act];
					}
					else {
						skippable[0] = true;
					}
				}
				for (let act in frequencyDfg.endActivities) {
					if (g.includes(act)) {
						endActivities[act] = frequencyDfg.endActivities[act];
					}
					else {
						skippable[0] = true;
					}
				}
			}
			else if (gind == 1) {
				for (let act of g) {
					startActivities[act] = 1;
					endActivities[act] = 1;
				}
			}
			dfgs.push(new FrequencyDfg(activities, startActivities, endActivities, pathsFrequency));
		}
		return [dfgs, skippable];
	}
}

class InductiveMinerParallelCutDetector {
	static detect(freqDfg, activityKey) {
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
					if (cont) {
						break;
					}
					j++;
				}
				if (cont) {
					break;
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
					if (targetIdx < ret.length) {
						ret[targetIdx] = [...ret[targetIdx], ...ret[i]];
					}
					ret.splice(i, 1);
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
	
	static projectDfg(frequencyDfg, groups) {
		let dfgs = [];
		let skippable = [];
		for (let gind in groups) {
			let g = groups[gind];
			let startActivities = {};
			let endActivities = {};
			let activities = {};
			let pathsFrequency = {};
			for (let act in frequencyDfg.startActivities) {
				if (g.includes(act)) {
					startActivities[act] = frequencyDfg.startActivities[act];
				}
			}
			for (let act in frequencyDfg.endActivities) {
				if (g.includes(act)) {
					endActivities[act] = frequencyDfg.endActivities[act];
				}
			}
			for (let act in frequencyDfg.activities) {
				if (g.includes(act)) {
					activities[act] = frequencyDfg.activities[act];
				}
			}
			for (let arc0 in frequencyDfg.pathsFrequency) {
				let arc = arc0.split(",");
				if (g.includes(arc[0]) && g.includes(arc[1])) {
					pathsFrequency[arc0] = frequencyDfg.pathsFrequency[arc0];
				}
			}
			dfgs.push(new FrequencyDfg(activities, startActivities, endActivities, pathsFrequency));
			skippable.push(false);
		}
		return [dfgs, skippable];
	}
}

class InductiveMinerExclusiveCutDetector {
	static detect(freqDfg, activityKey) {
		let connComp = InductiveMinerGeneralUtilities.getConnectedComponents(freqDfg);
		if (connComp.length > 1) {
			return connComp;
		}
		return null;
	}
	
	static projectDfg(frequencyDfg, groups) {
		let dfgs = [];
		let skippable = [];
		for (let gind in groups) {
			let g = groups[gind];
			let startActivities = {};
			let endActivities = {};
			let activities = {};
			let pathsFrequency = {};
			for (let act in frequencyDfg.startActivities) {
				if (g.includes(act)) {
					startActivities[act] = frequencyDfg.startActivities[act];
				}
			}
			for (let act in frequencyDfg.endActivities) {
				if (g.includes(act)) {
					endActivities[act] = frequencyDfg.endActivities[act];
				}
			}
			for (let act in frequencyDfg.activities) {
				if (g.includes(act)) {
					activities[act] = frequencyDfg.activities[act];
				}
			}
			for (let arc0 in frequencyDfg.pathsFrequency) {
				let arc = arc0.split(",");
				if (g.includes(arc[0]) && g.includes(arc[1])) {
					pathsFrequency[arc0] = frequencyDfg.pathsFrequency[arc0];
				}
			}
			dfgs.push(new FrequencyDfg(activities, startActivities, endActivities, pathsFrequency));
			skippable.push(false);
		}
		return [dfgs, skippable];
	}
	
	static project(log, groups, activityKey) {
		let ret = [];
		for (let g of groups) {
			ret.push(new EventLog());
		}
		for (let trace of log.traces) {
			let gc = {};
			let i = 0;
			while (i < groups.length) {
				gc[i] = 0;
				i++;
			}
			let activ = [];
			for (let eve of trace.events) {
				activ.push(eve.attributes[activityKey].value);
			}
			let maxv = -1;
			let maxi = 0;
			i = 0;
			while (i < groups.length) {
				for (let act of groups[i]) {
					if (activ.includes(act)) {
						gc[i]++;
						if (gc[i] > maxv) {
							maxv = gc[i];
							maxi = i;
						}
					}
				}
				i++;
			}
			let projectedTrace = new Trace();
			for (let eve of trace.events) {
				let act = eve.attributes[activityKey].value;
				if (groups[maxi].includes(act)) {
					projectedTrace.events.push(eve);
				}
			}
			ret[maxi].traces.push(projectedTrace);
		}
		return ret;
	}
}

class InductiveMinerActivityOncePerTraceFallthrough {
	static detect(log, freqDfg, activityKey) {
		if (Object.keys(freqDfg.activities).length > 1) {
			let inte = null;
			for (let trace of log.traces) {
				let activities = {};
				for (let eve of trace.events) {
					let act = eve.attributes[activityKey].value;
					if (!(act in activities)) {
						activities[act] = 1;
					}
					else {
						activities[act] += 1;
					}
				}
				if (inte != null) {
					for (let act in activities) {
						if (!(act in inte) || activities[act] > 1) {
							delete activities[act];
						}
					}
				}
				inte = activities;
			}
			if (inte != null) {
				inte = Object.keys(inte);
				if (inte.length > 0) {
					return inte[0];
				}
			}
		}
		return null;
	}
	
	static project(log, act, activityKey) {
		return LogGeneralFiltering.filterEventsHavingEventAttributeValues(log, [act], true, false, activityKey);
	}
}

class InductiveMinerActivityConcurrentFallthrough {
	static detect(log, freqDfg, activityKey, threshold) {
		if (Object.keys(freqDfg.activities).length > 1) {
			for (let act in freqDfg.activities) {
				let sublog = LogGeneralFiltering.filterEventsHavingEventAttributeValues(log, [act], true, false, activityKey);
				let detectedCut = InductiveMiner.detectCut(sublog, null, null, activityKey, threshold);
				if (detectedCut != null) {
					return [act, detectedCut];
				}
			}
		}
		return null;
	}
	
	static project(log, act, activityKey) {
		return LogGeneralFiltering.filterEventsHavingEventAttributeValues(log, [act], true, false, activityKey);
	}
}

class InductiveMinerActivityConcurrentFallthroughDFG {
	static removeActFromDFG(freqDfg, activity) {
		let activities = {};
		let startActivities = {};
		let endActivities = {};
		let pathsFrequency = {};
		for (let act in freqDfg.activities) {
			if (act != activity) {
				activities[act] = freqDfg.activities[act];
			}
		}
		for (let act in freqDfg.startActivities) {
			if (act != activity) {
				startActivities[act] = freqDfg.startActivities[act];
			}
		}
		for (let act in freqDfg.endActivities) {
			if (act != activity) {
				endActivities[act] = freqDfg.endActivities[act];
			}
		}
		for (let path0 in freqDfg.pathsFrequency) {
			let path = path0.split(",");
			if (path[0] != activity && path[1] != activity) {
				pathsFrequency[path0] = freqDfg.pathsFrequency[path0];
			}
		}
		return new FrequencyDfg(activities, startActivities, endActivities, pathsFrequency);
	}
	
	static detect(freqDfg, threshold) {
		for (let act in freqDfg.activities) {
			let subdfg = InductiveMinerActivityConcurrentFallthroughDFG.removeActFromDFG(freqDfg, act);
			let detectedCut = InductiveMiner.detectCut(null, subdfg, null, null, threshold);
			if (detectedCut != null) {
				return [act, detectedCut];
			}
		}
		return null;
	}
	
	static projectDfg(frequencyDfg, act) {
		return InductiveMinerActivityConcurrentFallthroughDFG.removeActFromDFG(freqDfg, act);
	}
}

class InductiveMinerStrictTauLoopFallthrough {
	static detect(log, freqDfg, activityKey) {
		let proj = new EventLog();
		for (let trace of log.traces) {
			let x = 0;
			let i = 1;
			while (i < trace.events.length) {
				let act_curr = trace.events[i].attributes[activityKey].value;
				let act_prev = trace.events[i-1].attributes[activityKey].value;
				if (act_curr in freqDfg.startActivities && act_prev in freqDfg.endActivities) {
					let subtrace = new Trace();
					let j = x;
					while (j < i) {
						subtrace.events.push(trace.events[j]);
						j++;
					}
					proj.traces.push(subtrace);
					x = i;
				}
				i++;
			}
			let j = x;
			let subtrace = new Trace();
			while (j < trace.events.length) {
				subtrace.events.push(trace.events[j]);
				j++;
			}
			proj.traces.push(subtrace);
		}
		if (proj.traces.length > log.traces.length) {
			return proj;
		}
		return null;
	}
}

class InductiveMinerTauLoopFallthrough {
	static detect(log, freqDfg, activityKey) {
		let proj = new EventLog();
		for (let trace of log.traces) {
			let x = 0;
			let i = 1;
			while (i < trace.events.length) {
				let act_curr = trace.events[i].attributes[activityKey].value;
				if (act_curr in freqDfg.startActivities) {
					let subtrace = new Trace();
					let j = x;
					while (j < i) {
						subtrace.events.push(trace.events[j]);
						j++;
					}
					proj.traces.push(subtrace);
					x = i;
				}
				i++;
			}
			let j = x;
			let subtrace = new Trace();
			while (j < trace.events.length) {
				subtrace.events.push(trace.events[j]);
				j++;
			}
			proj.traces.push(subtrace);
		}
		if (proj.traces.length > log.traces.length) {
			return proj;
		}
		return null;
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
					if (cont) {
						break;
					}
					j++;
				}
				if (cont) {
					break;
				}
				i++;
			}
		}
		return ret;
	}
}

try {
	module.exports = {InductiveMiner: InductiveMiner, InductiveMinerSequenceCutDetector: InductiveMinerSequenceCutDetector};
	global.InductiveMiner = InductiveMiner;
	global.InductiveMinerSequenceCutDetector = InductiveMinerSequenceCutDetector;
}
catch (err) {
	// not in Node
	//console.log(err);
}

Pm4JS.registerAlgorithm("InductiveMiner", "applyPlugin", ["EventLog"], "ProcessTree", "Mine a Process Tree using the Inductive Miner", "Alessandro Berti");
Pm4JS.registerAlgorithm("InductiveMiner", "applyPluginDFG", ["FrequencyDfg"], "ProcessTree", "Mine a Process Tree using the Inductive Miner Directly-Follows", "Alessandro Berti");
Pm4JS.registerAlgorithm("InductiveMiner", "applyPluginDFG", ["PerformanceDfg"], "ProcessTree", "Mine a Process Tree using the Inductive Miner Directly-Follows", "Alessandro Berti");
