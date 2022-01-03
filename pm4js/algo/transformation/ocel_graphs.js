class OcelGraphs {
	static objectInteractionGraph(ocel) {
		let ret = {};
		let events = ocel["ocel:events"];
		let objects = ocel["ocel:objects"];
		let evIds = Object.keys(events);
		for (let evId of evIds) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				for (let objId2 of eve["ocel:omap"]) {
					if (objId != objId2) {
						ret[[objId, objId2]] = 0;
					}
				}
			}
		}
		return Object.keys(ret);
	}
	
	static objectDescendantsGraph(ocel) {
		let ret = {};
		let events = ocel["ocel:events"];
		let objects = ocel["ocel:objects"];
		let evIds = Object.keys(events);
		let seenObjects = {};
		for (let evId of evIds) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				if (objId in seenObjects) {
					for (let objId2 of eve["ocel:omap"]) {
						if (!(objId2 in seenObjects)) {
							ret[[objId, objId2]] = 0;
						}
					}
				}
			}
			for (let objId of eve["ocel:omap"]) {
				if (!(objId in seenObjects)) {
					seenObjects[objId] = 0;
				}
			}
		}
		return Object.keys(ret);
	}
	
	static objectCobirthGraph(ocel) {
		let ret = {};
		let events = ocel["ocel:events"];
		let objects = ocel["ocel:objects"];
		let evIds = Object.keys(events);
		let seenObjects = {};
		for (let evId of evIds) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				if (!(objId in seenObjects)) {
					for (let objId2 of eve["ocel:omap"]) {
						if (!(objId2 in seenObjects)) {
							if (objId != objId2) {
								ret[[objId, objId2]] = 0;
							}
						}
					}
				}
			}
			for (let objId of eve["ocel:omap"]) {
				if (!(objId in seenObjects)) {
					seenObjects[objId] = 0;
				}
			}
		}
		return Object.keys(ret);
	}
	
	static objectCodeathGraph(ocel) {
		let ret = {};
		let events = ocel["ocel:events"];
		let objects = ocel["ocel:objects"];
		let evIds = Object.keys(events).reverse();
		let seenObjects = {};
		for (let evId of evIds) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				if (!(objId in seenObjects)) {
					for (let objId2 of eve["ocel:omap"]) {
						if (!(objId2 in seenObjects)) {
							if (objId != objId2) {
								ret[[objId, objId2]] = 0;
							}
						}
					}
				}
			}
			for (let objId of eve["ocel:omap"]) {
				if (!(objId in seenObjects)) {
					seenObjects[objId] = 0;
				}
			}
		}
		return Object.keys(ret);
	}
	
	static objectInheritanceGraph(ocel) {
		let ret = {};
		let events = ocel["ocel:events"];
		let objects = ocel["ocel:objects"];
		let evIds = Object.keys(events).reverse();
		let lastEventLifecycle = {};
		for (let evId of evIds) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				if (!(objId in lastEventLifecycle)) {
					lastEventLifecycle[objId] = evId;
				}
			}
		}
		evIds = evIds.reverse();
		let seenObjects = {};
		for (let evId of evIds) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				if (objId in lastEventLifecycle && lastEventLifecycle[objId] == evId) {
					for (let objId2 of eve["ocel:omap"]) {
						if (objId != objId2) {
							if (!(objId2 in seenObjects)) {
								ret[[objId, objId2]] = 0;
							}
						}
					}
				}
			}
			for (let objId of eve["ocel:omap"]) {
				seenObjects[objId] = 0;
			}
		}
		return Object.keys(ret);
	}
}

try {
	require('../../pm4js.js');
	module.exports = {OcelGraphs: OcelGraphs};
	global.OcelGraphs = OcelGraphs;
}
catch (err) {
	// not in node
	//console.log(err);
}