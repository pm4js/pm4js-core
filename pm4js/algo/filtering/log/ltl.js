class LtlFiltering {
	static fourEyesPrinciple(log, activity1, activity2, positive=false, activityKey="concept:name", resourceKey="org:resource") {
		log = LogGeneralFiltering.filterEventsHavingEventAttributeValues(log, [activity1, activity2], false, true, activityKey);
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			let i = 0;
			let bo = false;
			while (i < trace.events.length - 1) {
				if (trace.events[i].attributes[activityKey].value == activity1 && trace.events[i+1].attributes[activityKey].value == activity2) {
					if (!(positive) && (trace.events[i].attributes[resourceKey].value == trace.events[i+1].attributes[resourceKey].value)) {
						bo = true;
					}
					else if (positive && (trace.events[i].attributes[resourceKey].value != trace.events[i+1].attributes[resourceKey].value)) {
						bo = true;
					}
				}
				i++;
			}
			if (bo) {
				filteredLog.traces.push(trace);
			}
		}
		return filteredLog;
	}
}

try {
	require('../../../pm4js.js');
	module.exports = {LtlFiltering: LtlFiltering};
	global.LtlFiltering = LtlFiltering;
}
catch (err) {
	// not in Node
}
