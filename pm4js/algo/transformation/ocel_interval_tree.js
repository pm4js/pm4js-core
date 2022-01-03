class OcelIntervalTree {
	static buildEventTimestampIntervalTree(ocel) {
		let events = ocel["ocel:events"];
		let tree = new IntervalTree();
		for (let evId in events) {
			let eve = events[evId];
			let evTimest = eve["ocel:timestamp"].getTime() / 1000.0;
			tree.insert(evTimest-0.00001, evTimest+0.00001, eve);
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
	
	static getObjectsLifecycle(ocel) {
		let lif = {};
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				if (!(objId in lif)) {
					lif[objId] = [];
				}
				lif[objId].push(eve);
			}
		}
		return lif;
	}
	
	static buildObjectLifecycleTimestampIntervalTree(ocel) {
		let objects = ocel["ocel:objects"];
		let objLifecycle = OcelIntervalTree.getObjectsLifecycle(ocel);
		let tree = new IntervalTree();
		for (let objId in objects) {
			let obj = objects[objId];
			let lif = objLifecycle[objId];
			let st = lif[0]["ocel:timestamp"].getTime() / 1000.0;
			let et = lif[lif.length - 1]["ocel:timestamp"].getTime() / 1000.0;
			tree.insert(st-0.00001, et+0.00001, [obj, lif]);
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
	module.exports = {OcelIntervalTree: OcelIntervalTree};
	global.OcelIntervalTree = OcelIntervalTree;
}
catch (err) {
	// not in node
	//console.log(err);
}