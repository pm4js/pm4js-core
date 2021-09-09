require("../init.js");
var fs = require('fs');
const os = require('os');

test("XES importing running-example", () => {
	let data = fs.readFileSync('examples/input_data/running-example.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	let xmlStri = XesExporter.apply(eventLog);
	let fileName = os.tmpdir() + "/" + "running-example.xes";
	fs.writeFileSync(fileName, xmlStri);
	data = fs.readFileSync(fileName, {encoding: 'utf-8'});
	eventLog = XesImporter.apply(data);
});

test("XES importing receipt", () => {
	let data = fs.readFileSync('examples/input_data/receipt.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	let xmlStri = XesExporter.apply(eventLog);
	let fileName = os.tmpdir() + "/" + "receipt.xes";
	fs.writeFileSync(fileName, xmlStri);
	data = fs.readFileSync(fileName, {encoding: 'utf-8'});
	eventLog = XesImporter.apply(data);
});
