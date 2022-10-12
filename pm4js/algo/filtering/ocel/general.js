class OcelGeneralFiltering {
	static filterRelatedEvents(ocel, relObjs) {
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = ocel["ocel:global-log"]["ocel:object-types"];
		filteredOcel["ocel:objects"] = {};
		filteredOcel["ocel:events"] = {};
		for (let eveId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][eveId];
			let inte = [];
			for (let objId of eve["ocel:omap"]) {
				if (relObjs.includes(objId)) {
					inte.push(objId);
				}
			}
			if (inte.length > 0) {
				for (let objId of eve["ocel:omap"]) {
					if (!(objId in filteredOcel["ocel:objects"])) {
						filteredOcel["ocel:objects"][objId] = ocel["ocel:objects"][objId];
					}
				}
				filteredOcel["ocel:events"][eveId] = eve;
			}
		}
		return filteredOcel;
	}
	
	static filterNonRelatedEvents(ocel, positive, negative) {
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = ocel["ocel:global-log"]["ocel:object-types"];
		filteredOcel["ocel:objects"] = {};
		filteredOcel["ocel:events"] = {};
		for (let eveId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][eveId];
			let inte = [];
			let inte2 = [];
			for (let objId of eve["ocel:omap"]) {
				if (positive.includes(objId)) {
					inte.push(objId);
				}
				if (negative.includes(objId)) {
					inte2.push(objId);
				}
			}
			if (inte.length > 0 && inte2.length == 0) {
				for (let objId of eve["ocel:omap"]) {
					if (!(objId in filteredOcel["ocel:objects"])) {
						filteredOcel["ocel:objects"][objId] = ocel["ocel:objects"][objId];
					}
				}
				filteredOcel["ocel:events"][eveId] = eve;
			}
		}
		return filteredOcel;
	}
	
	static filterObjectTypes(ocel, objTypes) {
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = objTypes;
		filteredOcel["ocel:objects"] = {};
		for (let objId in ocel["ocel:objects"]) {
			let obj = ocel["ocel:objects"][objId];
			if (objTypes.includes(obj["ocel:type"])) {
				filteredOcel["ocel:objects"][objId] = obj;
			}
		}
		filteredOcel["ocel:events"] = {};
		for (let eveId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][eveId];
			let relObj = [];
			for (let objId of eve["ocel:omap"]) {
				if (objId in filteredOcel["ocel:objects"]) {
					relObj.push(objId);
				}
			}
			if (relObj.length > 0) {
				let newEve = {};
				newEve["ocel:activity"] = eve["ocel:activity"];
				newEve["ocel:timestamp"] = eve["ocel:timestamp"];
				newEve["ocel:vmap"] = eve["ocel:vmap"];
				newEve["ocel:omap"] = relObj;
				filteredOcel["ocel:events"][eveId] = newEve;
			}
		}
		return filteredOcel;
	}
	
	static filterOtRateUniqueActivities(ocel, minRate) {
		let lif = {};
		let lifUnq = {};
		let objects = ocel["ocel:objects"];
		for (let objId in objects) {
			lif[objId] = [];
			lifUnq[objId] = {}
		}
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				lif[objId].push(eve["ocel:activity"]);
				lifUnq[objId][eve["ocel:activity"]] = 0;
			}
		}
		let objOt = {};
		let objectTypes = {};
		for (let objId in objects) {
			let obj = objects[objId];
			objOt[objId] = obj["ocel:type"];
			objectTypes[obj["ocel:type"]] = 0;
		}
		objectTypes = Object.keys(objectTypes);
		let otEvents = {};
		let otUnqAct = {}
		for (let objId in lif) {
			let ot = objOt[objId];
			if (!(ot in otEvents)) {
				otEvents[ot] = 0;
				otUnqAct[ot] = 0;
			}
			otEvents[ot] += lif[objId].length;
			otUnqAct[ot] += Object.keys(lifUnq[objId]).length;
		}
		let includedTypes = [];
		for (let ot of objectTypes) {
			let rate = otUnqAct[ot] / otEvents[ot];
			if (rate > minRate) {
				includedTypes.push(ot);
			}
		}
		return OcelGeneralFiltering.filterObjectTypes(ocel, includedTypes);
	}
	
	static filterOtMinNumRelatedEvents(ocel, minCount) {
		let relEveOt = GeneralOcelStatistics.eventsRelatedPerObjectTypeCount(ocel);
		let retTypes = [];
		for (let ot in relEveOt) {
			if (relEveOt[ot] >= minCount) {
				retTypes.push(ot);
			}
		}
		return OcelGeneralFiltering.filterObjectTypes(ocel, retTypes);
	}
	
	static filterOtMinNumRelatedObjects(ocel, minCount) {
		let relObjOt = GeneralOcelStatistics.objectsPerTypeCount(ocel);
		let retTypes = [];
		for (let ot in relObjOt) {
			if (relObjOt[ot] >= minCount) {
				retTypes.push(ot);
			}
		}
		return OcelGeneralFiltering.filterObjectTypes(ocel, retTypes);
	}
	
	static filterMinOccActivities(ocel, minCount) {
		let evPerActCount = GeneralOcelStatistics.eventsPerActivityCount(ocel);
		let keepActivities = [];
		for (let act in evPerActCount) {
			if (evPerActCount[act] >= minCount) {
				keepActivities.push(act);
			}
		}
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = ocel["ocel:global-log"]["ocel:object-types"];
		filteredOcel["ocel:objects"] = {};
		filteredOcel["ocel:events"] = {};
				
		for (let evId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][evId];
			if (keepActivities.includes(eve["ocel:activity"])) {
				filteredOcel["ocel:events"][evId] = eve;
				for (let objId of eve["ocel:omap"]) {
					filteredOcel["ocel:objects"][objId] = ocel["ocel:objects"][objId];
				}
			}
		}
		
		return filteredOcel;
	}
	
	static filterEssentialEvents(ocel) {
		let essentialEvents = GeneralOcelStatistics.getEssentialEventsWithCategorization(ocel);
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = ocel["ocel:global-log"]["ocel:object-types"];
		filteredOcel["ocel:objects"] = {};
		filteredOcel["ocel:events"] = {};
		
		for (let evId in ocel["ocel:events"]) {
			if (evId in essentialEvents) {
				let eve = ocel["ocel:events"][evId];
				filteredOcel["ocel:events"][evId] = eve;
				for (let objId of eve["ocel:omap"]) {
					filteredOcel["ocel:objects"][objId] = ocel["ocel:objects"][objId];
				}
			}
		}
		
		return filteredOcel;
	}
	
	static filterNonEssentialEvents(ocel) {
		let essentialEvents = GeneralOcelStatistics.getEssentialEventsWithCategorization(ocel);
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = ocel["ocel:global-log"]["ocel:object-types"];
		filteredOcel["ocel:objects"] = {};
		filteredOcel["ocel:events"] = {};
		
		for (let evId in ocel["ocel:events"]) {
			if (!(evId in essentialEvents)) {
				let eve = ocel["ocel:events"][evId];
				filteredOcel["ocel:events"][evId] = eve;
				for (let objId of eve["ocel:omap"]) {
					filteredOcel["ocel:objects"][objId] = ocel["ocel:objects"][objId];
				}
			}
		}
		
		return filteredOcel;
	}
	
	static filterEssentialEventsOrMinActCount(ocel, minCount) {
		let essentialEvents = GeneralOcelStatistics.getEssentialEventsWithCategorization(ocel);
		let evPerActCount = GeneralOcelStatistics.eventsPerActivityCount(ocel);
		let keepActivities = [];
		for (let act in evPerActCount) {
			if (evPerActCount[act] >= minCount) {
				keepActivities.push(act);
			}
		}
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = ocel["ocel:global-log"]["ocel:object-types"];
		filteredOcel["ocel:objects"] = {};
		filteredOcel["ocel:events"] = {};
		
		for (let evId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][evId];
			if (keepActivities.includes(eve["ocel:activity"]) || evId in essentialEvents) {
				filteredOcel["ocel:events"][evId] = eve;
				for (let objId of eve["ocel:omap"]) {
					filteredOcel["ocel:objects"][objId] = ocel["ocel:objects"][objId];
				}
			}
		}
		
		return filteredOcel;
	}
	
	static filterConnComp(ocel, connComp, selectedConnCompIdx) {
		let cc = connComp[selectedConnCompIdx];
		
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = ocel["ocel:global-log"]["ocel:object-types"];
		filteredOcel["ocel:objects"] = {};
		filteredOcel["ocel:events"] = {};
		
		for (let evId in ocel["ocel:events"]) {
			if (cc.includes(evId)) {
				let eve = ocel["ocel:events"][evId];
				filteredOcel["ocel:events"][evId] = eve;
				for (let objId of eve["ocel:omap"]) {
					filteredOcel["ocel:objects"][objId] = ocel["ocel:objects"][objId];
				}
			}
		}
		
		return filteredOcel;
	}
	
	static sampleEventLog(ocel, connComp) {
		let keys = Object.keys(connComp);
		let selectedKey = keys[ keys.length * Math.random() << 0];
		return OcelGeneralFiltering.filterConnComp(ocel, connComp, selectedKey);
	}
	
	static projectOnArrayObjects(ocel, robi) {
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = ocel["ocel:global-log"]["ocel:object-types"];
		filteredOcel["ocel:objects"] = {};
		filteredOcel["ocel:events"] = {};
		
		for (let evId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][evId];
			let roFound = false;
			for (let objId of eve["ocel:omap"]) {
				if (robi.includes(objId)) {
					roFound = true;
				}
			}
			if (roFound) {
				filteredOcel["ocel:events"][evId] = {"ocel:activity": eve["ocel:activity"], "ocel:timestamp": eve["ocel:timestamp"], "ocel:vmap": eve["ocel:vmap"], "ocel:omap": []};
				for (let objId of eve["ocel:omap"]) {
					if (robi.includes(objId)) {
						filteredOcel["ocel:events"][evId]["ocel:omap"].push(objId);
						filteredOcel["ocel:objects"][objId] = ocel["ocel:objects"][objId];
					}
				}
			}
		}
		
		return filteredOcel;
	}
	
	static filterActivityOtAssociation(ocel, actOtAssociation) {
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = ocel["ocel:global-log"]["ocel:object-types"];
		filteredOcel["ocel:objects"] = {};
		filteredOcel["ocel:events"] = {};
		let objOt = {};
		let objectTypes = {};
		for (let objId in ocel["ocel:objects"]) {
			let obj = ocel["ocel:objects"][objId];
			objOt[objId] = obj["ocel:type"];
			objectTypes[obj["ocel:type"]] = 0;
		}
		objectTypes = Object.keys(objectTypes);
		for (let evId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][evId];
			let newEve = {};
			let act = eve["ocel:activity"]
			newEve["ocel:activity"] = act;
			newEve["ocel:timestamp"] = eve["ocel:timestamp"];
			newEve["ocel:vmap"] = eve["ocel:vmap"];
			newEve["ocel:omap"] = [];
			for (let objId of eve["ocel:omap"]) {
				let ot = objOt[objId];
				if (act in actOtAssociation && actOtAssociation[act].includes(ot)) {
					let obj = ocel["ocel:objects"][objId];
					filteredOcel["ocel:objects"][objId] = obj;
					newEve["ocel:omap"].push(objId);
				}
			}
			
			if (newEve["ocel:omap"].length > 0) {
				filteredOcel["ocel:events"][evId] = newEve;
			}
		}
		return filteredOcel;
	}
	
	static eventBasedRandomSampling(ocel, p=0.5) {
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = ocel["ocel:global-log"]["ocel:object-types"];
		filteredOcel["ocel:objects"] = {};
		filteredOcel["ocel:events"] = {};
		
		for (let evId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][evId];
			let r = Math.random();
			if (r <= p) {
				filteredOcel["ocel:events"][evId] = eve;
				for (let objId of eve["ocel:omap"]) {
					filteredOcel["ocel:objects"][objId] = ocel["ocel:objects"][objId];
				}
			}
		}
		
		return filteredOcel;
	}
	
	static objectBasedRandomSampling(ocel, p=0.5) {
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = ocel["ocel:global-log"]["ocel:object-types"];
		filteredOcel["ocel:objects"] = {};
		filteredOcel["ocel:events"] = {};
		
		for (let objId in ocel["ocel:objects"]) {
			let r = Math.random();
			if (r <= p) {
				filteredOcel["ocel:objects"][objId] = ocel["ocel:objects"][objId];
			}
		}
		
		for (let evId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][evId];
			let newEve = {};
			let act = eve["ocel:activity"]
			newEve["ocel:activity"] = act;
			newEve["ocel:timestamp"] = eve["ocel:timestamp"];
			newEve["ocel:vmap"] = eve["ocel:vmap"];
			newEve["ocel:omap"] = [];
			for (let objId of eve["ocel:omap"]) {
				if (objId in filteredOcel["ocel:objects"]) {
					newEve["ocel:omap"].push(objId);
				}
			}
			if (newEve["ocel:omap"].length > 0) {
				filteredOcel["ocel:events"][evId] = newEve;
			}
		}
		
		return filteredOcel;
	}
	
	static objectTypeBasedRandomSampling(ocel, p=0.5) {
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:objects"] = {};
		filteredOcel["ocel:events"] = {};
		
		let objOt = {};
		let objectTypes = {};
		for (let objId in ocel["ocel:objects"]) {
			let obj = ocel["ocel:objects"][objId];
			objOt[objId] = obj["ocel:type"];
			objectTypes[obj["ocel:type"]] = 0;
		}
		objectTypes = Object.keys(objectTypes);
		
		let filteredObjectTypes = [];
		
		for (let ot of objectTypes) {
			let r = Math.random();
			if (r <= p) {
				filteredObjectTypes.push(ot);
			}
		}
		
		filteredOcel["ocel:global-log"]["ocel:object-types"] = filteredObjectTypes;
		
		for (let objId in ocel["ocel:objects"]) {
			let ot = objOt[objId];
			if (filteredObjectTypes.includes(ot)) {
				filteredOcel["ocel:objects"][objId] = ocel["ocel:objects"][objId];
			}
		}
		
		for (let evId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][evId];
			let newEve = {};
			let act = eve["ocel:activity"]
			newEve["ocel:activity"] = act;
			newEve["ocel:timestamp"] = eve["ocel:timestamp"];
			newEve["ocel:vmap"] = eve["ocel:vmap"];
			newEve["ocel:omap"] = [];
			for (let objId of eve["ocel:omap"]) {
				if (objId in filteredOcel["ocel:objects"]) {
					newEve["ocel:omap"].push(objId);
				}
			}
			if (newEve["ocel:omap"].length > 0) {
				filteredOcel["ocel:events"][evId] = newEve;
			}
		}
		
		return filteredOcel;
	}
	
	static automaticFilterActivityOtAssociation(ocel) {
		let essentialOcel = OcelGeneralFiltering.filterEssentialEvents(ocel);
		let nonEssentialOcel = OcelGeneralFiltering.filterNonEssentialEvents(ocel);
		let actOtMap = {};
		let otActEssOcel = GeneralOcelStatistics.objectsPerTypePerActivity(essentialOcel);
		let otActNonEssOcel = GeneralOcelStatistics.objectsPerTypePerActivity(nonEssentialOcel);
		for (let act in otActEssOcel) {
			for (let ot in otActEssOcel[act]) {
				if (!(act in actOtMap)) {
					actOtMap[act] = [];
				}
				actOtMap[act].push(ot);
			}
		}
		for (let act in otActNonEssOcel) {
			for (let ot in otActNonEssOcel[act]) {
				if (otActNonEssOcel[act][ot] <= 1) {
					// it does not cause convergence problems
					if (!(act in actOtMap)) {
						actOtMap[act] = [];
					}
					if (!(ot in actOtMap[act])) {
						actOtMap[act].push(ot);
					}
				}
			}
		}
		return OcelGeneralFiltering.filterActivityOtAssociation(ocel, actOtMap);
	}
	
	static filterObjects(ocel, allowedObjects) {
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = ocel["ocel:global-log"]["ocel:object-types"];
		filteredOcel["ocel:objects"] = {};
		for (let objId in ocel["ocel:objects"]) {
			if (objId in allowedObjects) {
				let obj = ocel["ocel:objects"][objId];
				filteredOcel["ocel:objects"][objId] = obj;
			}
		}
		filteredOcel["ocel:events"] = {};
		for (let eveId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][eveId];
			let relObj = [];
			for (let objId of eve["ocel:omap"]) {
				if (objId in allowedObjects) {
					relObj.push(objId);
				}
			}
			if (relObj.length > 0) {
				let newEve = {};
				newEve["ocel:activity"] = eve["ocel:activity"];
				newEve["ocel:timestamp"] = eve["ocel:timestamp"];
				newEve["ocel:vmap"] = eve["ocel:vmap"];
				newEve["ocel:omap"] = relObj;
				filteredOcel["ocel:events"][eveId] = newEve;
			}
		}
		return filteredOcel;
	}
	
	static stageBasedFiltering(ocel, ot1, ot2) {
		let objectsDescendantsGraph = OcelGraphs.objectDescendantsGraph(ocel);
		let objectsParents = OcelGraphs.graphFindParents(ocel);
		for (let child in objectsParents) {
			let pare = objectsParents[child];
			if (!(pare in objectsDescendantsGraph)) {
				objectsDescendantsGraph[pare] = [];
			}
			if (!(child in objectsDescendantsGraph[pare])) {
				objectsDescendantsGraph[pare].push(child);
			}
			if (!(child in objectsDescendantsGraph)) {
				objectsDescendantsGraph[child] = [];
			}
			if (!(pare in objectsDescendantsGraph[child])) {
				objectsDescendantsGraph[child].push(pare);
			}
		}
		let objTypesDct = {};
		for (let objId in ocel["ocel:objects"]) {
			let obj = ocel["ocel:objects"][objId];
			objTypesDct[objId] = obj["ocel:type"];
		}
		let expGraph = OcelGraphs.expandGraph(objectsDescendantsGraph);
		let expGraphKeys = Object.keys(expGraph);
		for (let o of expGraphKeys) {
			if (objTypesDct[o] == ot1) {
				continue;
			}
			let isOk = false;
			for (let o2 of expGraph[o]) {
				if (objTypesDct[o2] == ot2) {
					isOk = true;
					break;
				}
			}
			if (!(isOk)) {
				delete expGraph[o];
			}
		}
		let allowedObjects1 = Object.keys(expGraph);
		let allowedObjects2 = {};
		for (let o in expGraph) {
			if (objTypesDct[o] == ot1) {
				allowedObjects2[o] = 0;
				for (let o2 of expGraph[o]) {
					allowedObjects2[o2] = 0;
				}
			}
		}
		let allowedObjects = {};
		for (let objId in objTypesDct) {
			if (objTypesDct[objId] == ot2 || objTypesDct[objId] == ot1) {
				allowedObjects[objId] = 0;
			}
		}
		for (let obj of allowedObjects1) {
			if (obj in allowedObjects2) {
				allowedObjects[obj] = 0;
			}
		}
		console.log(allowedObjects);
		return OcelGeneralFiltering.filterObjects(ocel, allowedObjects);
	}
	
	static parentChildrenFiltering(ocel) {
		let parentsGraph = OcelGraphs.graphFindParents(ocel);
		let lifecycleObj = OcelObjectFeatures.getObjectsLifecycleId(ocel);
		let startEveObj = {};
		let endEveObj = {};
		for (let objId in lifecycleObj) {
			if (lifecycleObj[objId].length > 0) {
				startEveObj[objId] = lifecycleObj[objId][0];
				endEveObj[objId] = lifecycleObj[objId][lifecycleObj[objId].length - 1];
			}
		}
		let filteredOcel = {};
		filteredOcel["ocel:global-event"] = ocel["ocel:global-event"];
		filteredOcel["ocel:global-object"] = ocel["ocel:global-object"];
		filteredOcel["ocel:global-log"] = {};
		filteredOcel["ocel:global-log"]["ocel:attribute-names"] = ocel["ocel:global-log"]["ocel:attribute-names"];
		filteredOcel["ocel:global-log"]["ocel:object-types"] = ocel["ocel:global-log"]["ocel:object-types"];
		filteredOcel["ocel:objects"] = ocel["ocel:objects"];
		filteredOcel["ocel:events"] = {};
		
		let extendedChildrenMap = {};
		for (let o in ocel["ocel:objects"]) {
			extendedChildrenMap[o] = {};
		}
		for (let o in parentsGraph) {
			extendedChildrenMap[parentsGraph[o]][o] = 0;
		}
		console.log(extendedChildrenMap);
		
		for (let evId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][evId];
			let newEve = {};
			newEve["ocel:activity"] = eve["ocel:activity"];
			newEve["ocel:timestamp"] = eve["ocel:timestamp"];
			newEve["ocel:vmap"] = eve["ocel:vmap"];
			newEve["ocel:omap"] = [];
			
			let objectsMapParents = {};
			for (let o of eve["ocel:omap"]) {
				if (o in parentsGraph && eve["ocel:omap"].includes(parentsGraph[o])) {
					objectsMapParents[o] = parentsGraph[o];
				}
				else {
					objectsMapParents[o] = o
				}
			}
			let objectsMapChildren = {};
			for (let o of eve["ocel:omap"]) {
				if (o in parentsGraph && eve["ocel:omap"].includes(parentsGraph[o])) {
					let pare = parentsGraph[o];
					if (!(pare in objectsMapChildren)) {
						objectsMapChildren[pare] = {};
					}
					objectsMapChildren[pare][o] = 0;
				}
				
				if (!(o in objectsMapChildren)) {
					objectsMapChildren[o] = {};
				}
			}
			
			for (let o of eve["ocel:omap"]) {
				if (startEveObj[o] == evId || endEveObj[o] == evId) {
					newEve["ocel:omap"].push(o);
				}
				else if (objectsMapParents[o] == o && Object.keys(objectsMapChildren[o]).length == 0) {
					newEve["ocel:omap"].push(o);
				}
				else if (Object.keys(objectsMapChildren[o]).length == 0 && objectsMapParents[o] != o) {
					let pare = objectsMapParents[o];
					let inte = {};
					for (let o2 of eve["ocel:omap"]) {
						if (o2 in objectsMapChildren[pare]) {
							inte[o2] = 0;
						}
					}
					//if (Object.keys(inte).length < Object.keys(objectsMapChildren[pare]).length) {
					if (Object.keys(inte).length < Object.keys(extendedChildrenMap[pare]).length) {
						newEve["ocel:omap"].push(o);
					}
				}
				else if (objectsMapParents[o] == o && Object.keys(objectsMapChildren[o]).length > 0) {
					let inte = {};
					for (let o2 of eve["ocel:omap"]) {
						if (o2 in objectsMapChildren[o]) {
							inte[o2] = 0;
						}
					}
					//if (Object.keys(inte).length == Object.keys(objectsMapChildren[o]).length) {
					if (Object.keys(inte).length == Object.keys(extendedChildrenMap[o]).length) {
						newEve["ocel:omap"].push(o);
					}
				}
			}

			if (newEve["ocel:omap"].length > 0) {
				filteredOcel["ocel:events"][evId] = newEve;
			}
		}
		return filteredOcel;
	}
}

try {
	require('../../../pm4js.js');
	module.exports = {OcelGeneralFiltering: OcelGeneralFiltering};
	global.OcelGeneralFiltering = OcelGeneralFiltering;
}
catch (err) {
	// not in Node
}
