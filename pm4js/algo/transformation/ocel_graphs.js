class OcelGraphs {
	static getObjectsLifecycle(ocel) {
		let lif = {};
		let objects = ocel["ocel:objects"];
		for (let objId in objects) {
			lif[objId] = [];
		}
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				lif[objId].push(evId);
			}
		}
		return lif;
	}
	
	static eventsRelationGraph(ocel) {
		let lif = OcelGraphs.getObjectsLifecycle(ocel);
		let eveRelGraph = {};
		for (let evId in ocel["ocel:events"]) {
			eveRelGraph[evId] = {};
		}
		for (let objId in lif) {
			let objLif = lif[objId];
			let i = 0;
			while (i < objLif.length - 1) {
				let j = i + 1;
				while (j < objLif.length) {
					eveRelGraph[objLif[i]][objLif[j]] = 0;
					eveRelGraph[objLif[j]][objLif[i]] = 0;
					j++;
				}
				i++;
			}
		}
		return eveRelGraph;
	}
	
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
		return OcelGraphs.transformArrayToDictArray(Object.keys(ret));
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
		return OcelGraphs.transformArrayToDictArray(Object.keys(ret));
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
		return OcelGraphs.transformArrayToDictArray(Object.keys(ret));
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
		return OcelGraphs.transformArrayToDictArray(Object.keys(ret));
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
		return OcelGraphs.transformArrayToDictArray(Object.keys(ret));
	}
	
	static graphFindInterrupts(ocel) {
		let objInteractionGraph = OcelGraphs.objectInteractionGraph(ocel);
		let objects = ocel["ocel:objects"];
		let objTypes = {};
		for (let objId in objects) {
			let objType = objects[objId]["ocel:type"];
			objTypes[objId] = objType;
		}
		let lifecycleObj = OcelObjectFeatures.getObjectsLifecycle(ocel);
		let lifecycleStartEnd = {};
		for (let objId in lifecycleObj) {
			lifecycleStartEnd[objId] = [lifecycleObj[objId][0]["ocel:timestamp"].getTime()/1000.0, lifecycleObj[objId][lifecycleObj[objId].length-1]["ocel:timestamp"].getTime()/1000.0];
		}
		let interrupts = {};
		for (let objId in objInteractionGraph) {
			let lifse = lifecycleStartEnd[objId];
			for (let objId2 of objInteractionGraph[objId]) {
				if (objTypes[objId2] != objTypes[objId]) {
					let lifse2 = lifecycleStartEnd[objId2];
					if (lifse[0] > lifse2[0] && lifse[1] < lifse2[1]) {
						let lif = lifecycleObj[objId];
						let lif2 = lifecycleObj[objId2];
						let isOk = true;
						let i = 0;
						while (i < lif2.length) {
							let currTime = lif2[i]["ocel:timestamp"].getTime()/1000.0;
							if (currTime > lifse[0] && currTime < lifse[1]) {
								if (!(lif.includes(lif2[i]))) {
									isOk = false;
									break;
								}
							}
							i++;
						}
						if (isOk) {
							if (!(objId in interrupts)) {
								interrupts[objId] = [];
							}
							interrupts[objId].push(objId2);
						}
					}
				}
			}
		}
		return interrupts;
	}
	
	
	
	static graphFindParents(ocel) {
		let objInteractionGraph = OcelGraphs.objectInteractionGraph(ocel);
		let objects = ocel["ocel:objects"];
		let objTypes = {};
		for (let objId in objects) {
			let objType = objects[objId]["ocel:type"];
			objTypes[objId] = objType;
		}
		let lifecycleObj = OcelObjectFeatures.getObjectsLifecycle(ocel);
		let lifecycleStartEnd = {};
		for (let objId in lifecycleObj) {
			lifecycleStartEnd[objId] = [lifecycleObj[objId][0]["ocel:timestamp"].getTime()/1000.0, lifecycleObj[objId][lifecycleObj[objId].length-1]["ocel:timestamp"].getTime()/1000.0];
		}
		let interactionDivided = {};
		for (let objId in objInteractionGraph) {
			interactionDivided[objId] = {};
			for (let objId2 of objInteractionGraph[objId]) {
				let objType = objTypes[objId2];
				if (!(objType in interactionDivided[objId])) {
					interactionDivided[objId][objType] = [];
				}
				interactionDivided[objId][objType].push(objId2);
			}
		}
		let parents = {};
		for (let objId in interactionDivided) {
			let currType = objTypes[objId];
			for (let objType in interactionDivided[objId]) {
				if (objType != currType) {
					if (interactionDivided[objId][objType].length == 1) {
						let objId2 = interactionDivided[objId][objType][0];
						let lif = lifecycleStartEnd[objId];
						let lif2 = lifecycleStartEnd[objId2];
						if (lif[0] >= lif2[0] && lif[1] <= lif2[1]) {
							parents[objId] = objId2;
						}
					}
				}
			}
		}
		return parents;
	}
	
	static graphFindChildren(ocel) {
		let parents = OcelGraphs.graphFindParents(ocel);
		let children = {};
		for (let child in parents) {
			let par = parents[child];
			if (!(par in children)) {
				children[par] = [];
			}
			children[par].push(child);
		}
		return children;
	}
	
	static transformArrayToDictArray(arr) {
		let dl = {};
		let i = 0;
		while (i < arr.length) {
			let spli = arr[i].split(",");
			if (!(spli[0] in dl)) {
				dl[spli[0]] = [];
			}
			dl[spli[0]].push(spli[1]);
			i++;
		}
		return dl;
	}
	
	static expandGraph(graph0) {
		let graph = {};
		for (let k in graph0) {
			graph[k] = {};
			for (let k2 of graph0[k]) {
				graph[k][k2] = 0;
			}
		}
		let toVisit = {};
		let invGraph = {};
		for (let k in graph) {
			if (!(k in invGraph)) {
				invGraph[k] = [];
			}
			for (let k2 in graph[k]) {
				if (!(k2 in invGraph)) {
					invGraph[k2] = {};
				}
				invGraph[k2][k] = 0;
			}
		}
		for (let k in graph) {
			toVisit[k] = 0;
		}
		while (true) {
			let newToVisit = {};
			for (let k2 in toVisit) {
				for (let k in invGraph[k2]) {
					let newGraph = Object.assign({}, graph[k]);
					for (let k3 in graph[k2]) {
						newGraph[k3] = 0;
					}
					if (Object.keys(newGraph).length > Object.keys(graph[k]).length) {
						graph[k] = newGraph;
						newToVisit[k] = 0;
					}
				}
			}
			if (Object.keys(newToVisit).length == 0) {
				break;
			}
			toVisit = newToVisit;
		}
		for (let k in graph) {
			graph[k] = Object.keys(graph[k]);
		}
		return graph;
	}
	
	static connectedComponents(graph) {
		let allNodes = {};
		for (let k in graph) {
			allNodes[k] = 0;
			for (let k2 of graph[k]) {
				allNodes[k2] = 0;
			}
		}
		let count = 0;
		for (let k in allNodes) {
			allNodes[k] = count;
			count = count + 1;
		}
		let changed = true;
		while (changed) {
			changed = false;
			for (let k in graph) {
				for (let k2 of graph[k]) {
					let v1 = allNodes[k];
					let v2 = allNodes[k2];
					if (v1 != v2) {
						changed = true;
						let v3 = Math.min(v1, v2);
						allNodes[k] = v3;
						allNodes[k2] = v3;
					}
				}
			}
		}
		let nodesGrouping = {};
		for (let k in allNodes) {
			let v = allNodes[k];
			if (!(v in nodesGrouping)) {
				nodesGrouping[v] = [];
			}
			nodesGrouping[v].push(k);
		}
		return Object.values(nodesGrouping);
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