var fs = require('fs');
require('../../pm4js/objects/log/importer/xes/importer.js');
require('../../pm4js/statistics/log/general.js');
fs.readFile('../input_data/receipt.xes', {encoding: 'utf-8'}, (err, data) => {
	var eventLog = XesImporter.apply(data);
	console.log("start activities = ");
	console.log(GeneralLogStatistics.getStartActivities(eventLog));
	console.log("end activites = ");
	console.log(GeneralLogStatistics.getEndActivities(eventLog));
	console.log("activities = ");
	console.log(GeneralLogStatistics.getAttributeValues(eventLog, "concept:name"));
	console.log("variants = ");
	console.log(GeneralLogStatistics.getVariants(eventLog));
	console.log("attributes at the trace level = ");
	console.log(GeneralLogStatistics.getCaseAttributesList(eventLog));
	console.log("attributes at the event level = ");
	console.log(GeneralLogStatistics.getEventAttributesList(eventLog));
});