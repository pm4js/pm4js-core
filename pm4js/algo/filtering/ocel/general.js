class OcelGeneralFiltering {
	static filterRelatedEvents(ocel, relObj) {
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
	
	static filterNonRelatedEvents(ocel, relObj) {
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
	
	static filterOtMinOccActivities(ocel, minCount) {
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
}

try {
	require('../../../pm4js.js');
	module.exports = {OcelGeneralFiltering: OcelGeneralFiltering};
	global.OcelGeneralFiltering = OcelGeneralFiltering;
}
catch (err) {
	// not in Node
}
