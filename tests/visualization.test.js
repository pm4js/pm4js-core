require("../init.js");
var fs = require('fs');
const os = require('os');

test("frequency DFG visualization reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let frequencyDfg = FrequencyDfgDiscovery.apply(eventLog);
	let gv = FrequencyDfgGraphvizVisualizer.apply(frequencyDfg);
});

test("performance DFG visualization reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let performanceDfg = PerformanceDfgDiscovery.apply(eventLog);
	let gv = PerformanceDfgGraphvizVisualizer.apply(performanceDfg);
});

test("process tree visualization reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier");
	let gv = ProcessTreeVanillaVisualizer.apply(processTree);
});

test("Petri visualization reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier");
	let acceptingPetriNet = ProcessTreeToPetriNetConverter.apply(processTree);
	let gv = PetriNetVanillaVisualizer.apply(acceptingPetriNet);
});

test("Petri visualization reviewing - Frequency decoration", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier");
	let acceptingPetriNet = ProcessTreeToPetriNetConverter.apply(processTree);
	let tbrResults = TokenBasedReplay.apply(eventLog, acceptingPetriNet, "@@classifier");
	let gv = PetriNetFrequencyVisualizer.apply(acceptingPetriNet, tbrResults);
});