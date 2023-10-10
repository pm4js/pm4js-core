class TemporalProfileConformanceResults {
	constructor(results) {
		this.results = results;
	}
}

class TemporalProfileConformance {
	static getAnalysis(eventLog, temporalProfile, activityKey="concept:name", timestampKey="time:timestamp", startTimestampKey="time:timestamp") {
		let confResults = [];
		for (let trace of eventLog.traces) {
			confResults.push([])
			let i = 0;
			while (i < trace.events.length - 1) {
				let act_i = trace.events[i].attributes[activityKey].value;
				let j = i + 1;
				while (j < trace.events.length) {
					let act_j = trace.events[j].attributes[activityKey].value;
					let ts1 = trace.events[i].attributes[timestampKey].value;
					let ts2 = trace.events[j].attributes[startTimestampKey].value;
					let diff = 0;
					if (BusinessHours.ENABLED) {
						diff = BusinessHours.apply(ts1, ts2);
					}
					else {
						ts1 = ts1.getTime();
						ts2 = ts2.getTime();
						diff = (ts2 - ts1)/1000;
					}
					let cou = [act_i, act_j];
					if (cou in temporalProfile.temporalProfile) {
						let avg = temporalProfile.temporalProfile[cou][0];
						let stdev = temporalProfile.temporalProfile[cou][1] + 0.0000001;
						let k = Math.abs(avg - diff) / stdev;
						confResults[confResults.length - 1].push([act_i, act_j, diff, k]);
					}
					j++;
				}
				i++;
			}
		}
		return confResults;
	}
	
	static apply(eventLog, temporalProfile, zeta, activityKey="concept:name", timestampKey="time:timestamp", startTimestampKey="time:timestamp", addObject=false) {
		let analysis = TemporalProfileConformance.getAnalysis(eventLog, temporalProfile, activityKey, timestampKey, startTimestampKey);
		let result = [];
		for (let trace of analysis) {
			result.push([]);
			for (let cou of trace) {
				if (cou[cou.length - 1] > zeta) {
					result[result.length - 1].push(cou);
				}
			}
		}
		return new TemporalProfileConformanceResults(result);
	}
}

try {
	module.exports = {TemporalProfileConformance: TemporalProfileConformance};
	global.TemporalProfileConformance = TemporalProfileConformance;
}
catch (err) {
	// not in Node.JS
}
