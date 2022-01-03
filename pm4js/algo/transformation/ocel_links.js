class OcelLinkAnalysis {
	static linkEventsWithObjGraph(ocel, objGraph) {
		let relEvs = {};
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				if (!(objId in relEvs)) {
					relEvs[objId] = [];
				}
				relEvs[objId].push(evId);
			}
		}
		let links = {};
		for (let k in objGraph) {
			for (let k2 of objGraph[k]) {
				for (let e1 of relEvs[k]) {
					for (let e2 of relEvs[k2]) {
						if (!(e1 in links)) {
							links[e1] = {};
						}
						links[e1][e2] = 0;
					}
				}
			}
		}
		return links;
	}
}

try {
	require('../../pm4js.js');
	module.exports = {OcelLinkAnalysis: OcelLinkAnalysis};
	global.OcelLinkAnalysis = OcelLinkAnalysis;
}
catch (err) {
	// not in node
	//console.log(err);
}
