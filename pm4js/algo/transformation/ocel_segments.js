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
			ocel["ocel:events"][eveId]["ocel:typedOmap"] = [... ocel["ocel:events"][eveId]["ocel:typedOmap"]];
		}

		for (let objId in ocel["ocel:objects"]) {
			ocel["ocel:objects"][objId] = {... ocel["ocel:objects"][objId]};
			ocel["ocel:objects"][objId]["ocel:ovmap"] = {... ocel["ocel:objects"][objId]["ocel:ovmap"]};
		}

		return ocel;
	}

    static buildParentsDictionary(ocel, leadObjType, childObjType, objectsPerType, objTypeDictio) {
		let childToParent = {};

        let objectInteractionGraph = OcelGraphs.objectInteractionGraph(ocel);

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

    static segmentGivenEvIds(ocel0, leadObjectType, segmentsPrefix, objLifecycle, segmentsEvIds1) {
        let segmentOt = "SEGMENT_" + segmentsPrefix;

		let ocel = OcelSegments.cloneOcel(ocel0);
		ocel["ocel:global-log"]["ocel:object-types"].push(segmentOt);

        let objTypeDictio = OcelSegments.getObjectTypeDictio(ocel);
		let dictioIntervalTrees = OcelIntervalTree.buildIntervalTreeDictioPerObject(ocel, null, objLifecycle);

        let counter = {};

        for (let seg of segmentsEvIds1) {
            let objId = seg[0];
            if (!(objId in counter)) {
                counter[objId] = 1;
            }
            else {
                counter[objId] += 1;
            }
            
            let lif = objLifecycle[objId];

            let timeFirst = lif[seg[1]]["ocel:timestamp"].getTime() / 1000.0;
            let timeLast = lif[seg[3]]["ocel:timestamp"].getTime() / 1000.0;

            let includedEvs = {};
            let referencedObjects = {};

            let z = seg[1];
            while (z <= seg[3]) {
                includedEvs[z] = 0;
                let eve = lif[z];
                for (let objId of eve["ocel:omap"]) {
                    referencedObjects[objId] = 0;
                }
                z++;
            }

            for (let otherObjId in referencedObjects) {
                if (otherObjId in dictioIntervalTrees) {
                    let otherObjType = objTypeDictio[otherObjId];
                    if (!(otherObjType.startsWith("SEGMENT_"))) {
                        let intervals = dictioIntervalTrees[otherObjId].queryInterval(timeFirst, timeLast);
                        for (let inte of intervals) {
                            let eve = inte.value;
                            includedEvs[eve["ocel:eid"]] = 0;
                        }
                    }
                }
            }

            let segmentObjectId = segmentOt+"_"+objId+"_"+counter[objId];
            ocel["ocel:objects"][segmentObjectId] = {"ocel:type": segmentOt, "ocel:ovmap": {... ocel["ocel:objects"][objId]["ocel:ovmap"]}};

            for (let evId in includedEvs) {
                let eve = ocel["ocel:events"][evId];

                eve["ocel:omap"].push(segmentObjectId);
                eve["ocel:typedOmap"].push({"ocel:oid": segmentObjectId, "qualifier": "EMPTY"});
            }
        }

        return ocel;
    }

    static segmentBetween(ocel0, leadObjectType, activity1, activity2, segmentsPrefix) {
        let objectsPerType = OcelSegments.collectObjectsPerType(ocel0);
		let objLifecycle = OcelIntervalTree.getObjectsLifecycle(ocel0);

        let segmentsEvIds1 = [];

        for (let objId of objectsPerType[leadObjectType]) {
            let lif = objLifecycle[objId];
            
            if (lif.length > 0) {
                let i = 0;
                while (i < lif.length) {
                    if (lif[i]["ocel:activity"] == activity1) {
                        let j = i + 1;
                        let isFound = false;
                        while (j < lif.length) {
                            if (lif[j]["ocel:activity"] == activity2) {
                                isFound = true;
                                break;
                            }
                            else if (lif[j]["ocel:activity"] == activity1) {
                                isFound = false;
                                break;
                            }
                            j++;
                        }
                        if (isFound) {
                            segmentsEvIds1.push([objId, i, lif[i]["ocel:activity"], j, lif[j]["ocel:activity"]]);
                            i++;
                            continue;
                        }
                    }
                    i++;
                }
            }
        }

        return OcelSegments.segmentGivenEvIds(ocel0, leadObjectType, segmentsPrefix, objLifecycle, segmentsEvIds1);
    }

    static segmentFromOrTo(ocel0, leadObjectType, activity, segmentsPrefix, isFrom) {
        let objectsPerType = OcelSegments.collectObjectsPerType(ocel0);
		let objLifecycle = OcelIntervalTree.getObjectsLifecycle(ocel0);

        let segmentsEvIds1 = [];

        for (let objId of objectsPerType[leadObjectType]) {
            let lif = objLifecycle[objId];
            
            if (lif.length > 0) {
                if (isFrom) {
                    let i = 0;
                    while (i < lif.length) {
                        if (lif[i]["ocel:activity"] == activity) {
                            let j = i+1;
                            while (j < lif.length) {
                                if (lif[j]["ocel:activity"] == activity) {
                                    break;
                                }
                                j++;
                            }
                            segmentsEvIds1.push([objId, i, lif[i]["ocel:activity"], j-1, lif[j-1]["ocel:activity"]]);
                        }
                        i++;
                    }
                }
                else {
                    let i = 0;
                    while (i < lif.length) {
                        if (lif[i]["ocel:activity"] == activity) {
                            let j = i - 1;
                            while (j >= 0) {
                                if (lif[j]["ocel:activity"] == activity) {
                                    break;
                                }
                                j--;
                            }
                            segmentsEvIds1.push([objId, j+1, lif[j+1]["ocel:activity"], i, lif[i]["ocel:activity"]]);
                        }
                        i++;
                    }
                }
            }
        }

        return OcelSegments.segmentGivenEvIds(ocel0, leadObjectType, segmentsPrefix, objLifecycle, segmentsEvIds1);
    }

	static segmentBasedOnChildObjType(ocel0, leadObjType, childObjType, segmentsPrefix) {
        let segmentOt = "SEGMENT_" + segmentsPrefix;

		let ocel = OcelSegments.cloneOcel(ocel0);
		ocel["ocel:global-log"]["ocel:object-types"].push(segmentOt);

        let objTypeDictio = OcelSegments.getObjectTypeDictio(ocel);
		let objectsPerType = OcelSegments.collectObjectsPerType(ocel);
		let objLifecycle = OcelIntervalTree.getObjectsLifecycle(ocel);
		let dictioIntervalTrees = OcelIntervalTree.buildIntervalTreeDictioPerObject(ocel, null, objLifecycle);

        let childToParent = OcelSegments.buildParentsDictionary(ocel, leadObjType, childObjType, objectsPerType, objTypeDictio);

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
                            let otherObjType = objTypeDictio[otherObjId];
                            if (!(otherObjType.startsWith("SEGMENT_"))) {
                                intervals = dictioIntervalTrees[otherObjId].queryInterval(timeFirst, timeLast);
                                for (let inte of intervals) {
                                    let eve = inte.value;
                                    includedEvs[eve["ocel:eid"]] = 0;
                                }
                            }
                        }
                    }
                }

                let segmentObjectId = segmentOt+"_"+childId;
                ocel["ocel:objects"][segmentObjectId] = {"ocel:type": segmentOt, "ocel:ovmap": {... ocel["ocel:objects"][parentId]["ocel:ovmap"]}};

                for (let evId in includedEvs) {
                    let eve = ocel["ocel:events"][evId];

                    eve["ocel:omap"].push(segmentObjectId);
                    eve["ocel:typedOmap"].push({"ocel:oid": segmentObjectId, "qualifier": "EMPTY"});
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
