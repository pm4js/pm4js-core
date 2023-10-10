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

class IntervalTreeAlgorithms {
	static resourceWorkload(tree, pointOfTime=null, resourceKey="org:resource") {
		if (pointOfTime == null) {
			pointOfTime = (tree.mintime + tree.maxtime) / 2.0;
		}
		let contained = tree.queryPoint(pointOfTime);
		let returned = {};
		for (let p of contained) {
			let trace = p.value[0];
			let idx = p.value[1];
			let eve = trace.events[idx+1];
			let res = eve.attributes[resourceKey].value;
			if (!(res in returned)) {
				returned[res] = 1;
			}
			else {
				returned[res] += 1;
			}
		}
		return returned;
	}
	
	static targetActivityWorkload(tree, pointOfTime=null, activityKey="concept:name") {
		if (pointOfTime == null) {
			pointOfTime = (tree.mintime + tree.maxtime) / 2.0;
		}
		let contained = tree.queryPoint(pointOfTime);
		let returned = {};
		for (let p of contained) {
			let trace = p.value[0];
			let idx = p.value[1];
			let eve = trace.events[idx+1];
			let act = eve.attributes[activityKey].value;
			if (!(act in returned)) {
				returned[act] = 1;
			}
			else {
				returned[act] += 1;
			}
		}
		return returned;
	}
	
	static sourceActivityWorkload(tree, pointOfTime=null, activityKey="concept:name") {
		if (pointOfTime == null) {
			pointOfTime = (tree.mintime + tree.maxtime) / 2.0;
		}
		let contained = tree.queryPoint(pointOfTime);
		let returned = {};
		for (let p of contained) {
			let trace = p.value[0];
			let idx = p.value[1];
			let eve = trace.events[idx];
			let act = eve.attributes[activityKey].value;
			if (!(act in returned)) {
				returned[act] = 1;
			}
			else {
				returned[act] += 1;
			}
		}
		return returned;
	}
	
	static queryInterval(tree, st, et) {
		let afterIntersectingObjects0 = tree.queryAfterPoint(st);
		let beforeIntersectingObjects0 = tree.queryBeforePoint(et);
		let afterIntersectingObjects = [];
		let beforeIntersectingObjects = [];
		for (let obj of afterIntersectingObjects0) {
			afterIntersectingObjects.push(obj);
		}
		for (let obj of beforeIntersectingObjects0) {
			beforeIntersectingObjects.push(obj);
		}
		let intersectionAfterBefore = [];
		for (let obj of afterIntersectingObjects) {
			if (beforeIntersectingObjects.includes(obj)) {
				intersectionAfterBefore.push(obj);
			}
		}
		return intersectionAfterBefore;
	}
}

try {
	module.exports = {IntervalTreeBuilder: IntervalTreeBuilder, IntervalTreeAlgorithms: IntervalTreeAlgorithms};
	global.IntervalTreeBuilder = IntervalTreeBuilder;
	global.IntervalTreeAlgorithms = IntervalTreeAlgorithms;
}
catch (err) {
	// not in node
	//console.log(err);
}
