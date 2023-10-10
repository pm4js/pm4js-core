class PerformanceDfg {
	constructor(activities, startActivities, endActivities, pathsFrequency, pathsPerformance, sojournTimes) {
		this.activities = activities;
		this.startActivities = startActivities;
		this.endActivities = endActivities;
		this.pathsFrequency = pathsFrequency;
		this.pathsPerformance = pathsPerformance;
		this.sojournTimes = sojournTimes;
	}
	
	getArtificialDfg() {
		let artificialActivities = {};
		let artificialDfg = {};
		Object.assign(artificialDfg, this.pathsFrequency);
		Object.assign(artificialActivities, this.activities);
		let sumSa = 0;
		for (let sa in this.startActivities) {
			artificialDfg[["▶", sa]] = this.startActivities[sa];
			sumSa += this.startActivities[sa];
		}
		for (let ea in this.endActivities) {
			artificialDfg[[ea, "■"]] = this.endActivities[ea];
		}
		artificialActivities["▶"] = sumSa;
		artificialActivities["■"] = sumSa;
		return [artificialActivities, artificialDfg];
	}
	
	unrollArtificialDfg(vect) {
		let artificialActivities = vect[0];
		let artificialDfg = vect[1];
		let newActivities = {};
		let newPathsFrequency = {};
		let newStartActivities = {};
		let newEndActivities = {};
		let newPathsPerformance = {};
		let newSojournTimes = {};
		Object.assign(newActivities, artificialActivities);
		Object.assign(newPathsFrequency, artificialDfg);
		for (let el0 in artificialDfg) {
			let el = el0.split(",");
			if (el[0] == "▶") {
				newStartActivities[el[1]] = artificialDfg[el0];
				delete newPathsFrequency[el];
			}
			else if (el[1] == "■") {
				newEndActivities[el[0]] = artificialDfg[el0];
				delete newPathsFrequency[el];
			}
		}
		delete newActivities["▶"];
		delete newActivities["■"];
		for (let act in this.sojournTimes) {
			if (act in newActivities) {
				newSojournTimes[act] = this.sojournTimes[act];
			}
		}
		for (let path in this.pathsPerformance) {
			if (path in newPathsFrequency) {
				newPathsPerformance[path] = this.pathsPerformance[path];
			}
		}
		return new PerformanceDfg(newActivities, newStartActivities, newEndActivities, newPathsFrequency, newPathsPerformance, newSojournTimes);
	}
}

try {
	module.exports = {PerformanceDfg: PerformanceDfg};
	global.PerformanceDfg = PerformanceDfg;
}
catch (err) {
	// not in Node
}
