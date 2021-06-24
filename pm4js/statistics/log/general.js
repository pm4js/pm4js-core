class GeneralLogStatistics {
	static getStartActivities(log, activity_key="concept:name") {
		let ret = {};
		for (let trace of log.traces) {
			if (trace.events.length > 0) {
				let act = trace.events[0].attributes[activity_key].value;
				let count = ret[act]
				if (count == null) {
					ret[act] = 1;
				}
				else {
					ret[act] = count + 1;
				}
			}
		}
		return ret;
	}
	
	static getEndActivities(log, activity_key="concept:name") {
		let ret = {};
		for (let trace of log.traces) {
			if (trace.events.length > 0) {
				let act = trace.events[trace.events.length-1].attributes[activity_key].value;
				let count = ret[act]
				if (count == null) {
					ret[act] = 1;
				}
				else {
					ret[act] = count + 1;
				}
			}
		}
		return ret;
	}
	
	static getAttributeValues(log, attribute_key) {
		let ret = {};
		for (let trace of log.traces) {
			for (let eve of trace.events) {
				let val = eve.attributes[attribute_key].value;
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
	
	static getVariants(log, activity_key="concept:name") {
		let ret = {};
		for (let trace of log.traces) {
			let activities = [];
			for (let eve of trace.events) {
				let act = eve.attributes[activity_key].value;
				activities.push(act);
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
}

try {
	module.exports = {GeneralLogStatistics: GeneralLogStatistics};
	global.GeneralLogStatistics = GeneralLogStatistics;
}
catch (err) {
	// not in node
	console.log(err);
}
