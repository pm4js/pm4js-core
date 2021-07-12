require('../../init.js');
var fs = require('fs');

fs.readFile('../input_data/receipt.xes', {encoding: 'utf-8'}, (err, data) => {
	let eventLog = XesImporter.apply(data);
	fs.readFile('../input_data/receipt_imf_prom.pnml', {encoding: 'utf-8'}, (err2, data2) => {
		let acceptingPetriNet = PnmlImporter.apply(data2);
		let replayResult = TokenBasedReplay.apply(eventLog, acceptingPetriNet);
		console.log("consumed tokens: "+replayResult["totalConsumed"]);
		console.log("produced tokens: "+replayResult["totalProduced"]);
		console.log("missing tokens: "+replayResult["totalMissing"]);
		console.log("remaining tokens: "+replayResult["totalRemaining"]);
		console.log("fit traces: "+replayResult["fitTraces"]+"/"+replayResult["totalTraces"]);
		console.log("log fitness: "+replayResult["logFitness"]);
	});
});
