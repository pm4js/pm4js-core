require("../init.js");
var fs = require('fs');
const os = require('os');

test("CSV importing running-example", () => {
	let data = fs.readFileSync('examples/input_data/running-example.csv', {encoding: 'utf-8'});
	let eventLog = CsvImporter.apply(data);
});

test("CSV importing running-example_unchanged - CSV exporting", () => {
	let data = fs.readFileSync('examples/input_data/running-example_unchanged.csv', {encoding: 'utf-8'});
	let eventLog = CsvImporter.apply(data, ";", '"', "case_id", "activity", "timestamp");
	data = CsvExporter.apply(eventLog);
	let fileName = os.tmpdir() + "/" + "running-example.csv";
	fs.writeFileSync(fileName, data);
});

test("CSV importing running-example_unchanged - XES exporting", () => {
	let data = fs.readFileSync('examples/input_data/running-example_unchanged.csv', {encoding: 'utf-8'});
	let eventLog = CsvImporter.apply(data, ";", '"', "case_id", "activity", "timestamp");
	data = XesExporter.apply(eventLog);
	let fileName = os.tmpdir() + "/" + "running-example.xes";
	fs.writeFileSync(fileName, data);
});

test("XES importing running-example - XES exporting", () => {
	let data = fs.readFileSync('examples/input_data/running-example.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	data = CsvExporter.apply(eventLog);
	let fileName = os.tmpdir() + "/" + "running-example2.csv";
	fs.writeFileSync(fileName, data);
});
