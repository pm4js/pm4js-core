class FrequencyDfg {
	constructor(activities, start_activities, end_activities, paths_frequency) {
		this.activities = activities;
		this.start_activities = start_activities;
		this.end_activities = end_activities;
		this.paths_frequency = paths_frequency;
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
