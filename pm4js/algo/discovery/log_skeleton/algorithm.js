class LogSkeletonDiscovery {
	static apply(eventLog, activityKey="concept:name") {
		let activities = GeneralLogStatistics.getAttributeValues(eventLog, activityKey);
		let neverTogether = {};
		let equivalence = {};
		let equivalenceTotCases = {};
		let alwaysAfter = {};
		let alwaysBefore = {};
		let directlyFollows = {};
		let actCounter = {};
		for (let trace of eventLog.traces) {
			let activitiesCounter = {};
			for (let eve of trace.events) {
				let act = eve.attributes[activityKey].value;
				if (!(act in activitiesCounter)) {
					activitiesCounter[act] = 1;
				}
				else {
					activitiesCounter[act] += 1;
				}
			}
			for (let act in activitiesCounter) {
				if (!(act in actCounter)) {
					actCounter[act] = {};
				}
				if (!(activitiesCounter[act] in actCounter[act])) {
					actCounter[act][activitiesCounter[act]] = 0;
				}
				actCounter[act][activitiesCounter[act]] += 1;
				for (let act2 in activities) {
					let cou = [act, act2].sort();
					if (!(act2 in activitiesCounter)) {
						if (!(cou in neverTogether)) {
							neverTogether[cou] = 1;
						}
						else {
							neverTogether[cou] += 1;
						}
					}
					else if (act2 != act) {
						if (!(cou in equivalenceTotCases)) {
							equivalenceTotCases[cou] = 0;
						}
						equivalenceTotCases[cou] += 1;
						if (activitiesCounter[act] == activitiesCounter[act2]) {
							if (!(cou in equivalence)) {
								equivalence[cou] = 0;
							}
							equivalence[cou] += 1;
						}
					}
				}
			}
			let i = 0;
			while (i < trace.events.length - 1) {
				let acti = trace.events[i].attributes[activityKey].value;
				let met = [];
				let j = i + 1;
				while (j < trace.events.length) {
					let actj = trace.events[j].attributes[activityKey].value;
					if (!(met.includes(actj))) {
						let cou1 = [acti, actj];
						let cou2 = [actj, acti];
						if (!(cou1 in alwaysAfter)) {
							alwaysAfter[cou1] = 0;
						}
						if (!(cou2 in alwaysBefore)) {
							alwaysBefore[cou2] = 0;
						}
						alwaysAfter[cou1] += 1;
						alwaysBefore[cou2] += 1;
						if (j == i+1) {
							if (!(cou1 in directlyFollows)) {
								directlyFollows[cou1] = 0;
							}
							directlyFollows[cou1] += 1;
						}
						met.push(actj);
					}
					j++;
				}
				i++;
			}
		}
		// normalize the output before returning
		for (let cou in neverTogether) {
			neverTogether[cou] = (0.0 + neverTogether[cou]) / eventLog.traces.length;
		}
		for (let act in actCounter) {
			let intSum = 0;
			for (let actc in actCounter[act]) {
				intSum += actCounter[act][actc];
				actCounter[act][actc] = (0.0 + actCounter[act][actc]) / eventLog.traces.length;
			}
			if (eventLog.traces.length > intSum) {
				actCounter[act]["0"] = (0.0 + eventLog.traces.length - intSum) / eventLog.traces.length;
			}
		}
		for (let cou in equivalence) {
			equivalence[cou] = [(0.0 + equivalence[cou]) / equivalenceTotCases[cou], equivalence[cou]];
		}
		for (let path0 in alwaysAfter) {
			let path = path0.split(",");
			alwaysAfter[path0] = alwaysAfter[path0] / activities[path[0]];
		}
		for (let path0 in directlyFollows) {
			let path = path0.split(",");
			directlyFollows[path0] = directlyFollows[path0] / activities[path[0]];
		}
		for (let path0 in alwaysBefore) {
			let path = path0.split(",");
			alwaysBefore[path0] = alwaysBefore[path0] / activities[path[0]];
		}
		return new LogSkeleton(equivalence, neverTogether, alwaysAfter, alwaysBefore, directlyFollows, actCounter);
	}
}

try {
	require('../../../pm4js.js');
	require('../../../objects/log/log.js');
	require('../../../objects/skeleton/log_skeleton.js');
	require('../../../statistics/log/general.js');
	module.exports = {LogSkeletonDiscovery: LogSkeletonDiscovery};
	global.LogSkeletonDiscovery = LogSkeletonDiscovery;
}
catch (err) {
	// not in Node
	console.log(err);
}
