require("../init.js");
var fs = require('fs');
const os = require('os');

test("log skeleton - receipt - 0% noise", () => {
	let data = fs.readFileSync('examples/input_data/receipt.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let skeleton = LogSkeletonDiscovery.apply(eventLog, "@@classifier");
	let skeletonConf = LogSkeletonConformanceChecking.apply(eventLog, skeleton, 0.0, "@@classifier");
});

test("log skeleton - receipt - 5% noise", () => {
	let data = fs.readFileSync('examples/input_data/receipt.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let skeleton = LogSkeletonDiscovery.apply(eventLog, "@@classifier");
	let skeletonConf = LogSkeletonConformanceChecking.apply(eventLog, skeleton, 0.05, "@@classifier");
});
