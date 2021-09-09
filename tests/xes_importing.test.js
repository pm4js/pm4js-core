require("../init.js");
var fs = require('fs');

test("XES importing running-example", () => {
	fs.readFile('examples/input_data/running-example.xes', {encoding: 'utf-8'}, (err, data) => {
		let eventLog = XesImporter.apply(data);
	});
});