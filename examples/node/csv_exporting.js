var fs = require('fs');
require('../../pm4js/objects/log/importer/xes/importer.js');
require('../../pm4js/objects/log/exporter/csv/exporter.js');
fs.readFile('../input_data/running-example.xes', {encoding: 'utf-8'}, (err, data) => {
	var eventLog = XesImporter.apply(data);
	let txtStri = CsvExporter.apply(eventLog);
	fs.writeFile('temp_output_csv_exporting.csv', txtStri, function (err) {
		
	});
});
