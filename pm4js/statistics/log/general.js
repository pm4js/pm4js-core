class GeneralLogStatistics {
	static getStartActivities(log, activityKey="concept:name") {
		let ret = {};
		for (let trace of log.traces) {
			if (trace.events.length > 0) {
				if (activityKey in trace.events[0].attributes) {
					let act = trace.events[0].attributes[activityKey].value;
					let count = ret[act]
					if (count == null) {
						ret[act] = 1;
					}
					else {
						ret[act] = count + 1;
					}
				}
			}
		}
		return ret;
	}
	
	static getEndActivities(log, activityKey="concept:name") {
		let ret = {};
		for (let trace of log.traces) {
			if (trace.events.length > 0) {
				if (activityKey in trace.events[trace.events.length-1].attributes) {
					let act = trace.events[trace.events.length-1].attributes[activityKey].value;
					let count = ret[act]
					if (count == null) {
						ret[act] = 1;
					}
					else {
						ret[act] = count + 1;
					}
				}
			}
		}
		return ret;
	}
	
	static getAttributeValues(log, attributeKey) {
		let ret = {};
		for (let trace of log.traces) {
			for (let eve of trace.events) {
				if (attributeKey in eve.attributes) {
					let val = eve.attributes[attributeKey].value;
					let count = ret[val];
					if (count == null) {
						ret[val] = 1;
					}
					else {
						ret[val] = count + 1;
					}
				}
			}
		}
		return ret;
	}
	
	static getTraceAttributeValues(log, attributeKey) {
		let ret = {};
		for (let trace of log.traces) {
			if (attributeKey in trace.attributes) {
				let val = trace.attributes[attributeKey].value;
				let count = ret[val];
				if (count == null) {
					ret[val] = 1;
				}
				else {
					ret[val] = count + 1;
				}
			}
		}
		return ret;
	}
	
	static getVariants(log, activityKey="concept:name") {
		let ret = {};
		for (let trace of log.traces) {
			let activities = [];
			for (let eve of trace.events) {
				if (activityKey in eve.attributes) {
					let act = eve.attributes[activityKey].value;
					activities.push(act);
				}
			}
			activities = activities.toString();
			let count = ret[activities];
			if (count == null) {
				ret[activities] = 1
			}
			else {
				ret[activities] = count + 1;
			}
		}
		return ret;
	}
	
	static getEventAttributesList(log) {
		let ret = {};
		for (let trace of log.traces) {
			for (let eve of trace.events) {
				for (let attr in eve.attributes) {
					ret[attr] = 0;
				}
			}
		}
		return Object.keys(ret);
	}
	
	static getCaseAttributesList(log) {
		let ret = {};
		for (let trace of log.traces) {
			for (let attr in trace.attributes) {
				ret[attr] = 0;
			}
		}
		return Object.keys(ret);
	}
	
	static getEventAttributesWithType(log) {
		let ret = {};
		for (let trace of log.traces) {
			for (let eve of trace.events) {
				for (let attr in eve.attributes) {
					if (!(attr in ret)) {
						ret[attr] = typeof eve.attributes[attr].value;
					}
				}
			}
		}
		return ret;
	}
	
	static getTraceAttributesWithType(log) {
		let ret = {};
		for (let trace of log.traces) {
			for (let attr in trace.attributes) {
				ret[attr] = typeof trace.attributes[attr].value;
			}
		}
		return ret;
	}
	
	static numEvents(log) {
		let ret = 0;
		for (let trace of log.traces) {
			ret += trace.events.length;
		}
		return ret;
	}
	
	static getAverageSojournTime(log, activityKey="concept:name", completeTimestamp="time:timestamp", startTimestamp="time:timestamp") {
		let sojTime = {}
		for (let trace of log.traces) {
			for (let eve of trace.events) {
				if (activityKey in eve.attributes && startTimestamp in eve.attributes && completeTimestamp in eve.attributes) {
					let acti = eve.attributes[activityKey].value;
					if (!(acti in sojTime)) {
						sojTime[acti] = [];
					}
					let st = eve.attributes[startTimestamp].value.getTime();
					let et = eve.attributes[completeTimestamp].value.getTime();
					let diff = (et - st)*1000;
					sojTime[acti].push(diff);
				}
			}
		}
		for (let acti in sojTime) {
			let sum = 0.0;
			for (let val of sojTime[acti]) {
				sum += val;
			}
			sojTime[acti] = sum / sojTime[acti].length;
		}
		return sojTime;
	}
}

try {
	require('../../pm4js.js');
	module.exports = {GeneralLogStatistics: GeneralLogStatistics};
	global.GeneralLogStatistics = GeneralLogStatistics;
}
catch (err) {
	// not in node
	console.log(err);
}
