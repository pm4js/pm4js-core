require("../init.js");
var fs = require('fs');
const os = require('os');

test("BPMN to Petri net (running example) and exporting", () => {
	let data = fs.readFileSync('examples/input_data/running-example.bpmn', {encoding: 'utf-8'});
	let bpmnGraph = BpmnImporter.apply(data);
	let acceptingPetriNet = BpmnToPetriNetConverter.apply(data);
	BpmnExporter.apply(bpmnGraph);
	PnmlExporter.apply(acceptingPetriNet);
});

test("BPMN to Petri net (sepsis) and exporting", () => {
	let data = fs.readFileSync('examples/input_data/sepsis.bpmn', {encoding: 'utf-8'});
	let bpmnGraph = BpmnImporter.apply(data);
	let acceptingPetriNet = BpmnToPetriNetConverter.apply(data);
	BpmnExporter.apply(bpmnGraph);
	PnmlExporter.apply(acceptingPetriNet);
});

test("Petri net to BPMN (running example) and exporting", () => {
	let data = fs.readFileSync('examples/input_data/running-example.pnml', {encoding: 'utf-8'});
	let acceptingPetriNet = PnmlImporter.apply(data);
	let bpmnGraph = WfNetToBpmnConverter.apply(acceptingPetriNet);
	acceptingPetriNet = BpmnToPetriNetConverter.apply(bpmnGraph);
	BpmnExporter.apply(bpmnGraph);
	PnmlExporter.apply(acceptingPetriNet);
});

test("BPMN alignments", () => {
	let eventLog = XesImporter.apply(fs.readFileSync('examples/input_data/running-example.xes', {encoding: 'utf-8'}));
	let bpmnGraph = BpmnImporter.apply(fs.readFileSync('examples/input_data/running-example.bpmn', {encoding: 'utf-8'}));
	let acceptingPetriNet = BpmnToPetriNetConverter.apply(bpmnGraph);
	let alignedTraces = PetriNetAlignments.apply(eventLog, acceptingPetriNet);
});
