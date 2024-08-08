class OcelSegments {
	static collectObjectsPerType(ocel) {
		let dictio = {};

		for (let objId in ocel["ocel:objects"]) {
			let obj = ocel["ocel:objects"][objId];
			let objType = obj["ocel:type"];

			if (!(objType in dictio)) {
				dictio[objType] = [];
			}

			dictio[objType].push(objId);
		}

		return dictio;
	}

	static getObjectTypeDictio(ocel) {
		let dictio = {};

		for (let objId in ocel["ocel:objects"]) {
			let obj = ocel["ocel:objects"][objId];
			let objType = obj["ocel:type"];

			dictio[objId] = objType;
		}

		return dictio;
	}

	static cloneOcel(ocel0) {
		let ocel = {};
		ocel["ocel:global-event"] = ocel["ocel:global-event"];
		ocel["ocel:global-object"] = ocel["ocel:global-object"];
		ocel["ocel:global-log"] = {};
		ocel["ocel:global-log"]["ocel:attribute-names"] = [... ocel0["ocel:global-log"]["ocel:attribute-names"]];
		ocel["ocel:global-log"]["ocel:object-types"] = [... ocel0["ocel:global-log"]["ocel:object-types"]];
		ocel["ocel:events"] = {... ocel0["ocel:events"]};
		ocel["ocel:objects"] = {... ocel0["ocel:objects"]};

		for (let eveId in ocel["ocel:events"]) {
			ocel["ocel:events"][eveId] = {... ocel["ocel:events"][eveId]};
			ocel["ocel:events"][eveId]["ocel:omap"] = [... ocel["ocel:events"][eveId]["ocel:omap"]];
			ocel["ocel:events"][eveId]["ocel:typedOmap"] = {... ocel["ocel:events"][eveId]["ocel:typedOmap"]};
		}

		for (let objId in ocel["ocel:objects"]) {
			ocel["ocel:objects"][objId] = {... ocel["ocel:objects"][objId]};
			ocel["ocel:objects"][objId]["ocel:ovmap"] = {... ocel["ocel:objects"][objId]["ocel:ovmap"]};
		}

		return ocel;
	}

	static segmentBasedOnChildObjType(ocel0, leadObjType, childObjType, segmentOt) {
		let ocel = OcelSegments.cloneOcel(ocel0);

		ocel["ocel:global-log"]["ocel:object-types"].push(segmentOt);

		let objTypeDictio = OcelSegments.getObjectTypeDictio(ocel);
		let objectsPerType = OcelSegments.collectObjectsPerType(ocel);
		let objLifecycle = OcelIntervalTree.getObjectsLifecycle(ocel);
		let dictioIntervalTrees = OcelIntervalTree.buildIntervalTreeDictioPerObject(ocel, null, objLifecycle);

		let objectInteractionGraph = OcelGraphs.objectInteractionGraph(ocel);

		let childToParent = {};

		for (let childId of objectsPerType[childObjType]) {
			let interacting = objectInteractionGraph[childId];
			let i = 0;
			while (i < interacting.length) {
				if (objTypeDictio[interacting[i]] == leadObjType) {
					childToParent[childId] = interacting[i];
				}
				i++;
			}
		}

		for (let childId of objectsPerType[childObjType]) {
			let lif = objLifecycle[childId];
			let includedEvs = {};
			let referencedObjects = {};

			for (let eve of lif) {
				includedEvs[eve["ocel:eid"]] = 0;
			}

			let timeFirst = lif[0]["ocel:timestamp"].getTime() / 1000.0;
			let timeLast = lif[lif.length - 1]["ocel:timestamp"].getTime() / 1000.0;

			let parentId = childToParent[childId];
			let intervals = dictioIntervalTrees[parentId].queryInterval(timeFirst, timeLast);

			for (let inte of intervals) {
				let eve = inte.value;
				includedEvs[eve["ocel:eid"]] = 0;
				for (let objId of eve["ocel:omap"]) {
					referencedObjects[objId] = 0;
				}
			}

			for (let otherObjId in referencedObjects) {
				if (otherObjId != childId && otherObjId != parentId) {
					intervals = dictioIntervalTrees[otherObjId].queryInterval(timeFirst, timeLast);
					for (let inte of intervals) {
						let eve = inte.value;
						includedEvs[eve["ocel:eid"]] = 0;
					}
				}
			}
		}

		return ocel;
	}
}

try {
	module.exports = {OcelSegments: OcelSegments};
	global.OcelSegments = OcelSegments;
}
catch (err) {
	// not in node
	//console.log(err);
}
