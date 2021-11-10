class IntervalTreeBuilder {
	static apply(log, timestampKey="time:timestamp") {
		let tree = new IntervalTree();
		for (let trace of log.traces) {
			let i = 0;
			while (i < trace.events.length - 1) {
				let eve1 = trace.events[i];
				let eve2 = trace.events[i+1];
				tree.insert(eve1.attributes[timestampKey].value.getTime()/1000.0, eve2.attributes[timestampKey].value.getTime()/1000.0, [trace, i]);
				i++;
			}
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
		tree.mintime = mintime;
		tree.maxtime = maxtime;
		return tree;
	}
}

try {
	require('../../pm4js.js');
	module.exports = {IntervalTreeBuilder: IntervalTreeBuilder};
	global.IntervalTreeBuilder = IntervalTreeBuilder;
}
catch (err) {
	// not in node
	//console.log(err);
}
