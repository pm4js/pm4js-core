class PerformanceDfg {
	constructor(activities, startActivities, endActivities, pathsFrequency, pathsPerformance, sojournTimes) {
		this.activities = activities;
		this.startActivities = startActivities;
		this.endActivities = endActivities;
		this.pathsFrequency = pathsFrequency;
		this.pathsPerformance = pathsPerformance;
		this.sojournTimes = sojournTimes;
	}
}

try {
	require("../../../pm4js.js");
	module.exports = {PerformanceDfg: PerformanceDfg};
	global.PerformanceDfg = PerformanceDfg;
}
catch (err) {
	// not in Node
}
