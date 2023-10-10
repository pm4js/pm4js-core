class TemporalProfile {
	constructor(temporalProfile) {
		this.temporalProfile = temporalProfile;
	}
}

class TemporalProfileDiscovery {
	static getAvg(vect) {
		if (vect.length > 0) {
			let sum = 0.0;
			for (let el of vect) {
				sum += el;
			}
			return sum / vect.length;
		}
		return 0;
	}
	
	static getStdev(vect, avg) {
		if (vect.length > 0) {
			let sum = 0.0;
			for (let el of vect) {
				sum += (el - avg)*(el - avg);
			}
			return Math.sqrt(sum / vect.length);
		}
		return 0;
	}
	
	static apply(eventLog, activityKey="concept:name", timestampKey="time:timestamp", startTimestampKey="time:timestamp", addObject=false) {
		let actCouplesTimes = {};
		let temporalProfile = {};
		for (let trace of eventLog.traces) {
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
					if (!([act_i, act_j] in actCouplesTimes)) {
						actCouplesTimes[[act_i, act_j]] = [];
					}
					actCouplesTimes[[act_i, act_j]].push(diff);
					j++;
				}
				i++;
			}
		}
		for (let cou in actCouplesTimes) {
			let vect = actCouplesTimes[cou]
			let avg = TemporalProfileDiscovery.getAvg(vect);
			let stdev = TemporalProfileDiscovery.getStdev(vect, avg);
			temporalProfile[cou] = [avg, stdev];
		}
		return new TemporalProfile(temporalProfile);
	}
}

try {
	module.exports = {TemporalProfileDiscovery: TemporalProfileDiscovery};
	global.TemporalProfileDiscovery = TemporalProfileDiscovery;
}
catch (err) {
	// not in Node.JS
}