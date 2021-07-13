class FrequencyDfgDiscovery {
	static apply(eventLog, activityKey="concept:name") {
		let sa = GeneralLogStatistics.getStartActivities(eventLog, activityKey);
		let ea = GeneralLogStatistics.getEndActivities(eventLog, activityKey);
		let activities = GeneralLogStatistics.getAttributeValues(eventLog, activityKey);
		let paths = {};
		for (let trace of eventLog.traces) {
			let i = 0;
			while (i < trace.events.length-1) {
				let act1 = trace.events[i].attributes[activityKey].value;
				let act2 = trace.events[i+1].attributes[activityKey].value;
				let path = act1+","+act2;
				let pathOcc = paths[path];
				if (pathOcc == null) {
					paths[path] = 1;
				}
				else {
					paths[path] = paths[path] + 1;
				}
				i++;
			}
		}
		return new FrequencyDfg(activities, sa, ea, paths);
	}
}

try {
	require("../../../pm4js.js");
	require("../../../statistics/log/general.js");
	require("../../../objects/dfg/frequency/obj.js");
	module.exports = {FrequencyDfgDiscovery: FrequencyDfgDiscovery};
	global.FrequencyDfgDiscovery = FrequencyDfgDiscovery;
}
catch (err) {
	// not in Node.JS
}