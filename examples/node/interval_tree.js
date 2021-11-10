var fs = require('fs');
require('../../init.js');

fs.readFile('../input_data/receipt.xes', {encoding: 'utf-8'}, (err, data) => {
	let log = XesImporter.apply(data);
	let tree = IntervalTreeBuilder.apply(log);
	// query the interval tree at regular points and see how many 'intervals'
	// intersect in the given point.
	let i = 0;
	let summ = 0;
	while (i < 50) {
		let thisPoint = tree.mintime + i/50 * (tree.maxtime - tree.mintime);
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