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

    static buildParentsDictionary(ocel, leadObjType, childObjType, objectsPerType) {
		let childToParent = {};

        let objectInteractionGraph = OcelGraphs.objectInteractionGraph(ocel);
        let objTypeDictio = OcelSegments.getObjectTypeDictio(ocel);

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

        return childToParent;
    }

	static segmentBasedOnChildObjType(ocel0, leadObjType, childObjType, segmentOt) {
		let ocel = OcelSegments.cloneOcel(ocel0);

		ocel["ocel:global-log"]["ocel:object-types"].push(segmentOt);

		let objectsPerType = OcelSegments.collectObjectsPerType(ocel);
		let objLifecycle = OcelIntervalTree.getObjectsLifecycle(ocel);
		let dictioIntervalTrees = OcelIntervalTree.buildIntervalTreeDictioPerObject(ocel, null, objLifecycle);

        let childToParent = OcelSegments.buildParentsDictionary(ocel, leadObjType, childObjType, objectsPerType);

		for (let childId of objectsPerType[childObjType]) {
            let parentId = childToParent[childId];

            if (parentId != null) {
                let lif = objLifecycle[childId];
                let includedEvs = {};
                let referencedObjects = {};
                referencedObjects[childId] = 0;
                referencedObjects[parentId] = 0;

                for (let eve of lif) {
                    includedEvs[eve["ocel:eid"]] = 0;
                }

                let timeFirst = lif[0]["ocel:timestamp"].getTime() / 1000.0;
                let timeLast = lif[lif.length - 1]["ocel:timestamp"].getTime() / 1000.0;

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
                        if (otherObjId in dictioIntervalTrees) {
                            intervals = dictioIntervalTrees[otherObjId].queryInterval(timeFirst, timeLast);
                            for (let inte of intervals) {
                                let eve = inte.value;
                                includedEvs[eve["ocel:eid"]] = 0;
                            }
                        }
                    }
                }

                let segmentObjectId = segmentOt+"_"+childId;
                ocel["ocel:objects"][segmentObjectId] = {"ocel:type": segmentOt, "ocel:ovmap": {... ocel["ocel:objects"][parentId]["ocel:ovmap"]}};

                for (let evId in includedEvs) {
                    let eve = ocel["ocel:events"][evId];

                    eve["ocel:omap"].push(segmentObjectId);
                    eve["ocel:typedOmap"][segmentObjectId] = segmentOt;
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
