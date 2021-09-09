require("../init.js");
var fs = require('fs');
const os = require('os');

test("TBR fitness reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier");
	let acceptingPetriNet = ProcessTreeToPetriNetConverter.apply(processTree);
	let fitnessTbr = TbrFitness.apply(eventLog, acceptingPetriNet, "@@classifier");
});

test("Alignments fitness reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier");
	let acceptingPetriNet = ProcessTreeToPetriNetConverter.apply(processTree);
	let fitnessAli = AlignmentsFitness.apply(eventLog, acceptingPetriNet, "@@classifier");
});

test("TBR generalization reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier");
	let acceptingPetriNet = ProcessTreeToPetriNetConverter.apply(processTree);
	let generalization = GeneralizationTbr.apply(eventLog, acceptingPetriNet, "@@classifier");
});

test("TBR simplicity reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier");
	let acceptingPetriNet = ProcessTreeToPetriNetConverter.apply(processTree);
	let simplicity = SimplicityArcDegree.apply(acceptingPetriNet);
});

test("ETConformance precision running-example", () => {
	let data = fs.readFileSync('examples/input_data/running-example.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	let processTree = InductiveMiner.apply(eventLog);
	let acceptingPetriNet = ProcessTreeToPetriNetConverter.apply(processTree);
	let precision = ETConformance.apply(eventLog, acceptingPetriNet);
});