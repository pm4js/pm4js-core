require("../init.js");
var fs = require('fs');
const os = require('os');

test("Inductive Miner + Alignments reviewing (IM)", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier");
	let acceptingPetriNet = ProcessTreeToPetriNetConverter.apply(processTree);
	let alignedTraces = PetriNetAlignments.apply(eventLog, acceptingPetriNet, "@@classifier");
});


test("Inductive Miner + TBR reviewing (IM)", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let processTree = InductiveMiner.apply(eventLog, "@@classifier");
	let acceptingPetriNet = ProcessTreeToPetriNetConverter.apply(processTree);
	let replayedTraces = TokenBasedReplay.apply(eventLog, acceptingPetriNet, "@@classifier");
});
