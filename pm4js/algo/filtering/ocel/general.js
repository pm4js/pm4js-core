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
}

try {
	require('../../../pm4js.js');
	module.exports = {OcelGeneralFiltering: OcelGeneralFiltering};
	global.OcelGeneralFiltering = OcelGeneralFiltering;
}
catch (err) {
	// not in Node
}
