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
		//LogSkeletonConformanceChecking.applyNeverTogether(trace, skeleton.neverTogether, activityKey, res);
		LogSkeletonConformanceChecking.applyActCounter(trace, skeleton.actCounter, activityKey, res);
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
			for (let act of beforeActivities) {
				if (!(act in precedingActivities)) {
					res[["alwaysBefore", acti, act]] = 0;
				}
			}
			i++;
		}
	}
	
	static applyNeverTogether(trace, skeletonNeverTogether, activityKey, res) {
		let traceActivities = {};
		for (let eve of trace.events) {
			let acti = eve.attributes[activityKey].value;
			traceActivities[acti] = 0;
		}
		traceActivities = Object.keys(traceActivities);
		let i = 0;
		while (i < traceActivities.length-1) {
			let j = i + 1;
			while (j < traceActivities.length) {
				let cou = [traceActivities[i], traceActivities[j]].sort();
				if (cou in skeletonNeverTogether) {
					res[["neverTogether", cou]] = 0;
				}
				j++;
			}
			i = i + 1;
		}
	}
	
	static applyActCounter(trace, skeletonActCounter, activityKey, res) {
		let traceActivities = {};
		for (let eve of trace.events) {
			let acti = eve.attributes[activityKey].value;
			if (!(acti in traceActivities)) {
				traceActivities[acti] = 1;
			}
			else {
				traceActivities[acti] += 1;
			}
		}
		for (let act in traceActivities) {
			if (act in skeletonActCounter) {
				if (!(traceActivities[act] in skeletonActCounter[act])) {
					res[["actCounter", act, traceActivities[act]]] = 0;
				}
			}
		}
		for (let act in skeletonActCounter) {
			if (!(act in traceActivities)) {
				res[["actCounter", act, 0]] = 0;
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