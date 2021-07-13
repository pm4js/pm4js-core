class FrequencyDfg {
	constructor(activities, startActivities, endActivities, pathsFrequency) {
		this.activities = activities;
		this.startActivities = startActivities;
		this.endActivities = endActivities;
		this.pathsFrequency = pathsFrequency;
	}
}

try {
	require("../../../pm4js.js");
	module.exports = {FrequencyDfg: FrequencyDfg};
	global.FrequencyDfg = FrequencyDfg;
}
catch (err) {
	// not in Node
}
