class FilteredDfgMaximization {
	static apply(freqDfg) {
		let vect = freqDfg.getArtificialDfg();
		let activities = vect[0];
		let paths = vect[1];
		let activitiesKeys = Object.keys(activities);
		let ingoing = {};
		let outgoing = {};
		for (let act of activitiesKeys) {
			if (act != "▶") {
				ingoing[act] = {};
			}
			if (act != "■") {
				outgoing[act] = {};
			}
		}
		let pathsKeys = Object.keys(paths);
		for (let path0 of pathsKeys) {
			let path = path0.split(",");
			ingoing[path[1]][path[0]] = paths[path0];
			outgoing[path[0]][path[1]] = paths[path0];
		}
		let constraintMatrix = [];
		let constraintsVector = [];
		let numConstraints = pathsKeys.length + activitiesKeys.length + activitiesKeys.length;
		let zeroRow = [];
		let i = 0;
		while (i < numConstraints) {
			zeroRow.push(0);
			i++;
		}
		for (let pind in pathsKeys) {
			let constraintRow = zeroRow.slice();
			constraintRow[parseInt(pind)] = -1;
			constraintMatrix.push(constraintRow);
			constraintsVector.push(-paths[pathsKeys[parseInt(pind)]]);
		}
		for (let actInd in activitiesKeys) {
			let act = activitiesKeys[actInd];
			let constraintRow = zeroRow.slice();
			for (let act2 in ingoing[act]) {
				let path = [act2, act];
				let pind = pathsKeys.indexOf(path.toString());
				constraintRow[parseInt(pind)] = 1;
			}
			constraintRow[pathsKeys.length + parseInt(actInd)] = 1;
			constraintsVector.push(activities[act] + 0.5);
			constraintMatrix.push(constraintRow);
			constraintRow = zeroRow.slice();
			for (let act2 in ingoing[act]) {
				let path = [act2, act];
				let pind = pathsKeys.indexOf(path.toString());
				constraintRow[parseInt(pind)] = -1;
			}
			constraintRow[pathsKeys.length + parseInt(actInd)] = -1;
			constraintsVector.push(-activities[act] + 0.5);
			constraintMatrix.push(constraintRow);
			constraintRow = zeroRow.slice();
			constraintRow[pathsKeys.length + parseInt(actInd)] = -1;
			constraintsVector.push(0);
			constraintMatrix.push(constraintRow);
		}
		for (let actInd in activitiesKeys) {
			let act = activitiesKeys[actInd];
			let constraintRow = zeroRow.slice();
			for (let act2 in outgoing[act]) {
				let path = [act, act2];
				let pind = pathsKeys.indexOf(path.toString());
				constraintRow[parseInt(pind)] = 1;
			}
			constraintRow[pathsKeys.length + activitiesKeys.length + parseInt(actInd)] = 1;
			constraintsVector.push(activities[act] + 0.5);
			constraintMatrix.push(constraintRow);
			constraintRow = zeroRow.slice();
			for (let act2 in outgoing[act]) {
				let path = [act, act2];
				let pind = pathsKeys.indexOf(path.toString());
				constraintRow[parseInt(pind)] = -1;
			}
			constraintRow[pathsKeys.length + activitiesKeys.length + parseInt(actInd)] = -1;
			constraintsVector.push(-activities[act] + 0.5);
			constraintMatrix.push(constraintRow);
			constraintRow = zeroRow.slice();
			constraintRow[pathsKeys.length + activitiesKeys.length + parseInt(actInd)] = -1;
			constraintsVector.push(0);
			constraintMatrix.push(constraintRow);
		}
		let objective = zeroRow.slice();
		for (let actInd in activitiesKeys) {
			objective[pathsKeys.length + parseInt(actInd)] = 1;
			objective[pathsKeys.length + activitiesKeys.length + parseInt(actInd)] = 1;
		}
		var lp = numeric.solveLP(objective, constraintMatrix, constraintsVector);
		for (let pind in pathsKeys) {
			let val = Math.floor(lp.solution[pind]);
			if (val != paths[pathsKeys[pind]]) {
				paths[pathsKeys[pind]] = val;
			}
		}
		return freqDfg.unrollArtificialDfg([activities, paths]);
	}
}

try {
	require("../../../pm4js.js");
	module.exports = {FilteredDfgMaximization: FilteredDfgMaximization};
	global.FilteredDfgMaximization = FilteredDfgMaximization;
}
catch (err) {
	// not in Node
}
