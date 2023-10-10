class DfgSliders {
	static checkStartReachability(dfg, mustKeepActivities) {
		let outgoing = {};
		for (let path in dfg) {
			let acts = path.split(",");
			if (!(acts[0] in outgoing)) {
				outgoing[acts[0]] = {};
			}
			outgoing[acts[0]][acts[1]] = 0;
		}
		let visited = {};
		let toVisit = ["▶"];
		if (!("▶" in outgoing)) {
			return false;
		}
		while (toVisit.length > 0) {
			let currAct = toVisit.shift();
			if (!(currAct in visited)) {
				for (let otherAct in outgoing[currAct]) {
					if (!(otherAct in visited)) {
						toVisit.push(otherAct);
					}
				}
				visited[currAct] = 0;
			}
		}
		for (let act of mustKeepActivities) {
			if (!(act in visited)) {
				return false;
			}
		}
		return true;
	}
	
	static checkEndReachability(dfg, mustKeepActivities) {
		let ingoing = {};
		for (let path in dfg) {
			let acts = path.split(",");
			if (!(acts[1] in ingoing)) {
				ingoing[acts[1]] = {};
			}
			ingoing[acts[1]][acts[0]] = 0;
		}
		if (!("■" in ingoing)) {
			return false;
		}
		let visited = {};
		let toVisit = ["■"];
		while (toVisit.length > 0) {
			let currAct = toVisit.shift();
			if (!(currAct in visited)) {
				for (let otherAct in ingoing[currAct]) {
					if (!(otherAct in visited)) {
						toVisit.push(otherAct);
					}
				}
				visited[currAct] = 0;
			}
		}
		for (let act of mustKeepActivities) {
			if (!(act in visited)) {
				return false;
			}
		}
		return true;
	}
	
	static filterDfgOnPercActivities(dfg, perc=0.2) {
		let art = dfg.getArtificialDfg();
		let artAct = art[0];
		let artDfg = art[1];
		let artActArray = [];
		for (let act in artAct) {
			if (!(act == "▶" || act == "■")) {
				artActArray.push([act, artAct[act]]);
			}
		}
		artActArray.sort((a, b) => a[1] - b[1]);
		let idx = Math.floor((artActArray.length - 1.0) * (1.0 - perc));
		let activitiesToKeep = [];
		let i = idx;
		while (i < artActArray.length) {
			activitiesToKeep.push(artActArray[i][0]);
			i++;
		}
		i = 0;
		while (i < artActArray.length) {
			let thisAct = artActArray[i][0];
			if (activitiesToKeep.includes(thisAct)) {
				break;
			}
			if (!(thisAct == "▶" || thisAct == "■")) {
				let newDfg = {};
				for (let path in artDfg) {
					let acts = path.split(",");
					if (!(acts[0] == thisAct || acts[1] == thisAct)) {
						newDfg[path] = artDfg[path];
					}
				}
				if (DfgSliders.checkStartReachability(newDfg, activitiesToKeep)) {
					if (DfgSliders.checkEndReachability(newDfg, activitiesToKeep)) {
						artDfg = newDfg;
						delete artAct[thisAct];
					}
				}
			}
			i++;
		}
		let ret = dfg.unrollArtificialDfg([artAct, artDfg]);
		Pm4JS.registerObject(ret, "DFG (activity sliding)");
		return ret;
	}
	
	static filterDfgOnPercPaths(dfg, perc=0.2, keepAllActivities=false) {
		let art = dfg.getArtificialDfg();
		let artAct = art[0];
		let artDfg = art[1];
		let pathsArray = [];
		for (let path in artDfg) {
			pathsArray.push([path, artDfg[path]]);
		}
		pathsArray.sort((a, b) => a[1] - b[1]);
		let idx = Math.floor((pathsArray.length - 1.0) * (1.0 - perc));
		let pathsToKeep = [];
		let i = idx;
		while (i < pathsArray.length) {
			pathsToKeep.push(pathsArray[i][0]);
			i++;
		}
		let activitiesToKeep = [];
		if (keepAllActivities) {
			for (let act in artAct) {
				activitiesToKeep.push(act);
			}
		}
		else {
			for (let path0 of pathsToKeep) {
				let path = path0.split(",");
				if (!(path[0] in activitiesToKeep)) {
					activitiesToKeep.push(path[0]);
				}
				if (!(path[1] in activitiesToKeep)) {
					activitiesToKeep.push(path[1]);
				}
			}
		}
		i = 0;
		while (i < pathsArray.length) {
			let newDfg = {};
			Object.assign(newDfg, artDfg);
			delete newDfg[pathsArray[i][0]];
			if (DfgSliders.checkStartReachability(newDfg, activitiesToKeep)) {
				if (DfgSliders.checkEndReachability(newDfg, activitiesToKeep)) {
					artDfg = newDfg;
					
					let newArtAct = {};
					for (let path in artDfg) {
						let acts = path.split(",");
						newArtAct[acts[0]] = artAct[acts[0]];
						newArtAct[acts[1]] = artAct[acts[1]];
					}
					artAct = newArtAct;
				}
			}
			i++;
		}
		let ret = dfg.unrollArtificialDfg([artAct, artDfg]);
		Pm4JS.registerObject(ret, "DFG (paths sliding)");
		return ret;
	}
}

try {
	module.exports = {DfgSliders: DfgSliders};
	global.DfgSliders = DfgSliders;
}
catch (err) {
	// not in Node
}

Pm4JS.registerAlgorithm("DfgSliders", "filterDfgOnPercActivities", ["FrequencyDfg"], "FrequencyDfg", "Slide DFG on activities", "Alessandro Berti");
Pm4JS.registerAlgorithm("DfgSliders", "filterDfgOnPercActivities", ["PerformanceDfg"], "PerformanceDfg", "Slide DFG on activities", "Alessandro Berti");
Pm4JS.registerAlgorithm("DfgSliders", "filterDfgOnPercPaths", ["FrequencyDfg"], "FrequencyDfg", "Slide DFG on paths", "Alessandro Berti");
Pm4JS.registerAlgorithm("DfgSliders", "filterDfgOnPercPaths", ["PerformanceDfg"], "PerformanceDfg", "Slide DFG on paths", "Alessandro Berti");
