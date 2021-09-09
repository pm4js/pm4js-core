require("../init.js");
var fs = require('fs');
const os = require('os');

test("Start activities reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier");
	let stat = GeneralLogStatistics.getStartActivities(eventLog, "@@classifier");
});

test("End activities reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier");
	let stat = GeneralLogStatistics.getEndActivities(eventLog, "@@classifier");
});

test("Attribute values reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier");
	let stat = GeneralLogStatistics.getAttributeValues(eventLog, "@@classifier");
});

test("Trace attribute values receipt", () => {
	let data = fs.readFileSync('examples/input_data/receipt.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier");
	let stat = GeneralLogStatistics.getTraceAttributeValues(eventLog, "department");
});

test("Variants reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier");
	let stat = GeneralLogStatistics.getVariants(eventLog, "@@classifier");
});

test("Event attributes list reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier");
	let stat = GeneralLogStatistics.getEventAttributesList(eventLog);
});

test("Trace attributes list reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier");
	let stat = GeneralLogStatistics.getCaseAttributesList(eventLog);
});

test("Event attributes list reviewing + Type", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier");
	let stat = GeneralLogStatistics.getEventAttributesWithType(eventLog);
});

test("Trace attributes list reviewing + Type", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier");
	let stat = GeneralLogStatistics.getTraceAttributesWithType(eventLog);
});

test("Number of events (reviewing)", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier");
	let stat = GeneralLogStatistics.numEvents(eventLog);
});

test("Average sojourn time (reviewing)", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier");
	let stat = GeneralLogStatistics.getAverageSojournTime(eventLog, "@@classifier");
});