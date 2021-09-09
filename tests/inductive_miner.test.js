require("../init.js");
var fs = require('fs');
const os = require('os');

test("Inductive Miner reviewing (IM)", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier");
	let acceptingPetriNet = ProcessTreeToPetriNetConverter.apply(processTree);
	let xmlString = PnmlExporter.apply(acceptingPetriNet);
	acceptingPetriNet = PnmlImporter.apply(xmlString);
});

test("Inductive Miner reviewing (IMd)", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let frequencyDfg = FrequencyDfgDiscovery.apply(eventLog, "@@classifier");
	let processTree = InductiveMiner.apply(null, null, 0.2, frequencyDfg);
	let acceptingPetriNet = ProcessTreeToPetriNetConverter.apply(processTree);
	let xmlString = PnmlExporter.apply(acceptingPetriNet);
	acceptingPetriNet = PnmlImporter.apply(xmlString);
});

test("Inductive Miner reviewing (IMf)", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier", 0.5);
	let acceptingPetriNet = ProcessTreeToPetriNetConverter.apply(processTree);
	let xmlString = PnmlExporter.apply(acceptingPetriNet);
	acceptingPetriNet = PnmlImporter.apply(xmlString);
});

test("Inductive Miner receipt (IM)", () => {
	let data = fs.readFileSync('examples/input_data/receipt.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier");
	let acceptingPetriNet = ProcessTreeToPetriNetConverter.apply(processTree);
	let xmlString = PnmlExporter.apply(acceptingPetriNet);
	acceptingPetriNet = PnmlImporter.apply(xmlString);
});