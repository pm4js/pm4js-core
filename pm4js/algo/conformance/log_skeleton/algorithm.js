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
		LogSkeletonConformanceChecking.applyEquivalence(trace, skeleton.equivalence, activityKey, res);
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