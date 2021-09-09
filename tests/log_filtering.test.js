require("../init.js");
var fs = require('fs');
const os = require('os');

test("Start activities filtering reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let filteredLog = LogGeneralFiltering.filterStartActivities(eventLog, ["invite reviewers+start"], true, "@@classifier");
});

test("End activities filtering reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let filteredLog = LogGeneralFiltering.filterEndActivities(eventLog, ["reject+complete"], true, "@@classifier");
});

test("Variants filtering reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let filteredLog = LogGeneralFiltering.filterVariants(eventLog, ["invite reviewers+start,invite reviewers+complete,time-out 3+complete,time-out 1+complete,get review 2+complete,collect reviews+start,collect reviews+complete,decide+start,decide+complete,invite additional reviewer+start,invite additional reviewer+complete,time-out X+complete,decide+start,decide+complete,invite additional reviewer+start,invite additional reviewer+complete,get review X+complete,decide+start,decide+complete,invite additional reviewer+start,invite additional reviewer+complete,time-out X+complete,decide+start,decide+complete,invite additional reviewer+start,invite additional reviewer+complete,get review X+complete,decide+start,decide+complete,invite additional reviewer+start,invite additional reviewer+complete,time-out X+complete,decide+start,decide+complete,invite additional reviewer+start,invite additional reviewer+complete,get review X+complete,decide+start,decide+complete,accept+start,accept+complete"], true, "@@classifier");
});

test("Case size reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let filteredLog = LogGeneralFiltering.filterCaseSize(eventLog, 20, 100);
});

test("Case duration reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let filteredLog = LogGeneralFiltering.filterCaseDuration(eventLog, 864000, 8640000);
});

test("Events attribute filtering - Keep cases - reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let filteredLog = LogGeneralFiltering.filterCasesHavingEventAttributeValue(eventLog, ["accept"]);
	let numEvents = GeneralLogStatistics.numEvents(filteredLog);
});

test("Events attribute filtering - Keep events - reviewing", () => {
	let data = fs.readFileSync('examples/input_data/reviewing.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	for (let trace of eventLog.traces) {
		for (let eve of trace.events) {
			eve.attributes["@@classifier"] = new Attribute(eve.attributes["concept:name"].value + "+" + eve.attributes["lifecycle:transition"].value);
		}
	}
	let filteredLog = LogGeneralFiltering.filterEventsHavingEventAttributeValues(eventLog, ["accept"]);
	let numEvents = GeneralLogStatistics.numEvents(filteredLog);
});