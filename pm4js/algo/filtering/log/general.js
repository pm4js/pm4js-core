class LogGeneralFiltering {
	static filterStartActivities(log, activities_array, activity_key="concept:name", positive=true) {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			if (trace.events.length > 0) {
				let bo = activities_array.includes(trace.events[0].attributes[activity_key].value);
				if ((bo && positive) || (!bo && !positive)) {
					filteredLog.traces.push(trace);
				}
			}
		}
		return filteredLog;
	}
	
	static filterEndActivities(log, activities_array, activity_key="concept:name", positive=true) {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			if (trace.events.length > 0) {
				let bo = activities_array.includes(trace.events[trace.events.length - 1].attributes[activity_key].value);
				if ((bo && positive) || (!bo && !positive)) {
					filteredLog.traces.push(trace);
				}
			}
		}
		return filteredLog;
	}
	
	static filterVariants(log, variants_array, activity_key="concept:name", positive=true) {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			let varArray = [];
			for (let eve of trace.events) {
				varArray.push(eve.attributes[activity_key].value);
			}
			varArray = varArray.toString();
			let bo = variants_array.includes(varArray);
			if ((bo && positive) || (!bo && !positive)) {
				filteredLog.traces.push(trace);
			}
		}
		return filteredLog;
	}
	
	static filterCaseSize(log, minSize, maxSize) {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			if (minSize <= trace.events.length && trace.events.length <= maxSize) {
				filteredLog.traces.push(trace);
			}
		}
		return filteredLog;
	}
}

try {
	require('../../../pm4js.js');
	module.exports = {LogGeneralFiltering: LogGeneralFiltering};
	global.LogGeneralFiltering = LogGeneralFiltering;
}
catch (err) {
	// not in Node
}