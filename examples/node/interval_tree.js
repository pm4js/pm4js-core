var fs = require('fs');
require('../../init.js');

fs.readFile('../input_data/receipt.xes', {encoding: 'utf-8'}, (err, data) => {
	let log = XesImporter.apply(data);
	let tree = new IntervalTree();
	let activities = GeneralLogStatistics.getAttributeValues(log, "concept:name");
	activities = Object.keys(activities);
	let cases = [];
	let everepr = [];
	for (let trace of log.traces) {
		let caseId = trace.attributes["concept:name"].value;
		cases.push(caseId);
		let i = 0;
		while (i < trace.events.length - 1) {
			let eve1 = trace.events[i];
			let eve2 = trace.events[i+1];
			everepr.push([eve1.attributes["time:timestamp"].value.getTime()/1000.0, eve2.attributes["time:timestamp"].value.getTime()/1000.0, activities.indexOf(eve1.attributes["concept:name"].value), activities.indexOf(eve2.attributes["concept:name"].value), cases.length - 1]);
			i++;
		}
	}
	for (let eve of everepr) {
		tree.insert(eve[0], eve[1], [eve[2], eve[3], eve[4]]);
	}
	let mintime = null;
	for (let n of tree.ascending()) {
		mintime = n.low;
		break;
	}
	let maxtime = null;
	for (let n of tree.descending()) {
		maxtime = n.high;
		break;
	}
	// query the interval tree at regular points and see how many 'intervals'
	// intersect in the given point.
	let i = 0;
	let summ = 0;
	while (i < 50) {
		let thisPoint = mintime + i/50 * (maxtime - mintime);
		let contained = tree.queryPoint(thisPoint);
		let count = 0;
		for (let p of contained) {
			count++;
			summ++;
		}
		console.log(thisPoint+" "+count);
		i++;
	}
});