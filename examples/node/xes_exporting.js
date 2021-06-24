var fs = require('fs');
require('../../pm4js/objects/log/importer/xes/importer.js');
require('../../pm4js/objects/log/exporter/xes/exporter.js');
fs.readFile('../input_data/running-example.xes', {encoding: 'utf-8'}, (err, data) => {
	var eventLog = XesImporter.apply(data);
	let xmlStri = XesExporter.apply(eventLog);
	fs.writeFile('temp_output_xes_exporting.xes', xmlStri, function (err) {
		
	});
});