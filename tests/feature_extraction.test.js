require("../init.js");
var fs = require('fs');
const os = require('os');

test("feature extraction - receipt - automatic", () => {
	let data = fs.readFileSync('examples/input_data/receipt.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let features = CaseFeatures.apply(eventLog, "@@classifier", "concept:name");
});

test("feature extraction - receipt - manual", () => {
	let data = fs.readFileSync('examples/input_data/receipt.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let features = CaseFeatures.apply(eventLog, "@@classifier", "concept:name", ["concept:name", "org:resource"], [], [], [], ["concept:name"]);
});
