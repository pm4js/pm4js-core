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
}

try {
	require('../../../pm4js.js');
	module.exports = {LogGeneralFiltering: LogGeneralFiltering};
	global.LogGeneralFiltering = LogGeneralFiltering;
}
catch (err) {
	// not in Node
}