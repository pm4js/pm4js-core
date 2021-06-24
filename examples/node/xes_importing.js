var fs = require('fs');
require('../../pm4js/objects/log/importer/importer.js');
fs.readFile('../input_data/running-example.xes', {encoding: 'utf-8'}, (err, data) => {
	var eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		console.log("case "+trace.attributes["concept:name"].value);
		for (let eve of trace.events) {
			console.log("\tevent (activity: "+eve.attributes["concept:name"].value+"; timestamp: "+eve.attributes["time:timestamp"].value);
		}
	}
});