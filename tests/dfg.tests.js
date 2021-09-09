require("../init.js");
var fs = require('fs');
const os = require('os');

test("DFG slider reviewing (activities)", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let frequencyDfg = FrequencyDfgDiscovery.apply(eventLog, "@@classifier");
	let filteredDfg = DfgSliders.filterDfgOnPercActivities(frequencyDfg, 0.2);
});

test("DFG slider reviewing (paths)", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let frequencyDfg = FrequencyDfgDiscovery.apply(eventLog, "@@classifier");
	let filteredDfg = DfgSliders.filterDfgOnPercPaths(frequencyDfg, 0.2);
});

test("DFG alignments reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let frequencyDfg = FrequencyDfgDiscovery.apply(eventLog, "@@classifier");
	let alignedTraces = DfgAlignments.apply(eventLog, frequencyDfg, "@@classifier");
});

test("DFG slider reviewing (paths) + Capacity Maximization", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let frequencyDfg = FrequencyDfgDiscovery.apply(eventLog, "@@classifier");
	let filteredDfg = DfgSliders.filterDfgOnPercPaths(frequencyDfg, 0.2);
	filteredDfg = FilteredDfgMaximization.apply(filteredDfg);
});

test("DFG playout reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let frequencyDfg = FrequencyDfgDiscovery.apply(eventLog, "@@classifier");
	let simulatedLog = DfgPlayout.apply(filteredDfg, 100, "concept:name");
});

test("Performance DFG discovery", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let performanceDfg = PerformanceDfgDiscovery.apply(eventLog, "@@classifier");
	let filteredDfg = DfgSliders.filterDfgOnPercPaths(performanceDfg, 0.2);
});
