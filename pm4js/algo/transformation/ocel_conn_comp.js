class OcelConnectedComponents {
	static findConnCompEvIds(ocel) {
		let evRelGraph = OcelGraphs.eventsRelationGraph(ocel);
		let connComp = {};
		let count = 0;
		for (let evId in ocel["ocel:events"]) {
			connComp[evId] = count;
			count++;
		}
		let cont = true;
		while (cont) {
			cont = false;
			for (let evId in evRelGraph) {
				for (let evId2 in evRelGraph[evId]) {
					if (connComp[evId] != connComp[evId2]) {
						let cc = Math.min(connComp[evId], connComp[evId2]);
						connComp[evId] = cc;
						connComp[evId2] = cc;
						cont = true;
					}
				}
			}
		}
		let connComp1 = {};
		for (let evId in connComp) {
			let cc = connComp[evId];
			if (!(cc in connComp1)) {
				connComp1[cc] = [];
			}
			connComp1[cc].push(evId);
		}
		return connComp1;
	}
	
	
}

try {
	require('../../pm4js.js');
	module.exports = {OcelConnectedComponents: OcelConnectedComponents};
	global.OcelConnectedComponents = OcelConnectedComponents;
}
catch (err) {
	// not in node
	//console.log(err);
}