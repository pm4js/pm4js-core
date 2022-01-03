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
		for (let k in links) {
			links[k] = Object.keys(links[k]);
		}
		return links;
	}
	
	static filterLinksByTimestamp(ocel, eveLinks) {
		let links = {};
		let events = ocel["ocel:events"];
		for (let k in eveLinks) {
			let tk = events[k]["ocel:timestamp"];
			for (let k2 of eveLinks[k]) {
				let tk2 = events[k2]["ocel:timestamp"];
				if (tk < tk2) {
					if (!(k in links)) {
						links[k] = [];
					}
					links[k].push(k2);
				}
			}
		}
		return links;
	}
	
	static filterFirstLink(ocel, eveLinks) {
		let links = {};
		for (let k in eveLinks) {
			links[k] = [eveLinks[k][0]];
		}
		return links;
	}
	
	static linksToFinalForm(ocel, eveLinks) {
		let links = [];
		let events = ocel["ocel:events"];
		for (let k in eveLinks) {
			for (let k2 of eveLinks[k]) {
				links.push([events[k], events[k2]]);
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
