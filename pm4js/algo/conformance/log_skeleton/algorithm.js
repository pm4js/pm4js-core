class LogSkeletonConformanceChecking {
	static apply(log, skeleton0, noiseThreshold=0.0, activityKey="concept:name") {
		let skeleton = skeleton0.filterOnNoiseThreshold(noiseThreshold);
		let results = [];
		for (let trace of log.traces) {
			results.push(LogSkeletonConformanceChecking.applyTrace(trace, skeleton, activityKey));
		}
		return results;
	}
	
	static applyTrace(trace, skeleton, activityKey) {
		let res = {};
		//LogSkeletonConformanceChecking.applyEquivalence(trace, skeleton.equivalence, activityKey, res);
		//LogSkeletonConformanceChecking.applyAlwaysAfter(trace, skeleton.alwaysAfter, activityKey, res);
		//LogSkeletonConformanceChecking.applyAlwaysBefore(trace, skeleton.alwaysBefore, activityKey, res);
		return res;
	}
	
	static applyEquivalence(trace, skeletonEquivalence, activityKey, res) {
		let actCounter = {};
		for (let eve of trace.events) {
			let act = eve.attributes[activityKey].value;
			if (!(act in actCounter)) {
				actCounter[act] = 1;
			}
			else {
				actCounter[act] += 1;
			}
		}
		for (let cou0 in skeletonEquivalence) {
			let cou = cou0.split(",");
			if (cou[0] in actCounter && cou[1] in actCounter && actCounter[cou[0]] != actCounter[cou[1]]) {
				res[["equivalence", cou]] = 0;
			}
		}
	}
	
	static applyAlwaysAfter(trace, skeletonAlwaysAfter, activityKey, res) {
		let i = 0;
		while (i < trace.events.length - 1) {
			let acti = trace.events[i].attributes[activityKey].value;
			let afterActivities = [];
			for (let cou0 in skeletonAlwaysAfter) {
				let cou = cou0.split(",");
				if (cou[0] == acti) {
					afterActivities.push(cou[1]);
				}
			}
			let followingActivities = {};
			let j = i + 1;
			while (j < trace.events.length) {
				let actj = trace.events[j].attributes[activityKey].value;
				followingActivities[actj] = 0;
				j++;
			}
			for (let act of afterActivities) {
				if (!(act in followingActivities)) {
					res[["alwaysAfter", acti, act]] = 0;
				}
			}
			i++;
		}
	}
	
	static applyAlwaysBefore(trace, skeletonAlwaysBefore, activityKey, res) {
		let i = 1;
		while (i < trace.events.length) {
			let acti = trace.events[i].attributes[activityKey].value;
			let beforeActivities = [];
			for (let cou0 in skeletonAlwaysBefore) {
				let cou = cou0.split(",");
				if (cou[0] == acti) {
					beforeActivities.push(cou[1]);
				}
			}
			let precedingActivities = {};
			let j = i - 1;
			while (j >= 0) {
				let actj = trace.events[j].attributes[activityKey].value;
				precedingActivities[actj] = 0;
				j--;
			}
			console.log(" ");
			console.log(beforeActivities);
			console.log(precedingActivities);
			for (let act of beforeActivities) {
				if (!(act in precedingActivities)) {
					res[["alwaysBefore", acti, act]] = 0;
				}
			}
			i++;
		}
	}
}

try {
	require('../../../pm4js.js');
	module.exports = {LogSkeletonConformanceChecking: LogSkeletonConformanceChecking};
	global.LogSkeletonConformanceChecking = LogSkeletonConformanceChecking;
}
catch (err) {
	// not in Node
	console.log(err);
}