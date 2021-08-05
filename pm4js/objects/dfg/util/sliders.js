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
	
	static filterDfgOnPercActivities(dfg, perc) {
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
		return dfg.unrollArtificialDfg([artAct, artDfg]);
	}
}

try {
	require("../../../pm4js.js");
	module.exports = {DfgSliders: DfgSliders};
	global.DfgSliders = DfgSliders;
}
catch (err) {
	// not in Node
}
