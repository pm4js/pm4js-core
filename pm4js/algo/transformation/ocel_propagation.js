class OcelAttributePropagation {
	static propagateObjectAttributes(ocel0, referenceObjectType) {
		let ocel = OcelSegments.cloneOcel(ocel0);

		let objectInteractionGraph = OcelGraphs.objectInteractionGraph(ocel);
		let objectsPerType = OcelSegments.collectObjectsPerType(ocel);

		for (let objId of objectsPerType[referenceObjectType]) {
			let object = ocel["ocel:objects"][objId];
			let objAttrs = object["ocel:ovmap"];

			let allValues = {};

			if (objId in objectInteractionGraph) {
				for (let otherObjectId of objectInteractionGraph[objId]) {
					let otherObj = ocel["ocel:objects"][otherObjectId];

					for (let attr in otherObj["ocel:ovmap"]) {
						if (!(attr in objAttrs)) {
							if (!(attr in allValues)) {
								allValues[attr] = [];
							}
							allValues[attr].push(otherObj["ocel:ovmap"][attr]);
						}
					}
				}
			}

			for (let attr in allValues) {
				let values = allValues[attr];

				let allStrings = true;
				let allNumbers = true;

				for (let val of values) {
					if (typeof val != 'string') {
						allStrings = false;
					}
					if (typeof val != 'number') {
						allNumbers = false;
					}
					if (!(allStrings || allNumbers)) {
						break;
					}
				}

				if (allStrings) {
					ocel["ocel:objects"][objId]["ocel:ovmap"]["PROP_"+attr+"_FIRST"] = values[0];
				}
				else if (allNumbers) {
					ocel["ocel:objects"][objId]["ocel:ovmap"]["PROP_"+attr+"_MIN"] = Math.min(...values);
					ocel["ocel:objects"][objId]["ocel:ovmap"]["PROP_"+attr+"_MAX"] = Math.max(...values);
				}
			}
		}
	}
}

try {
	module.exports = {OcelAttributePropagation: OcelAttributePropagation};
	global.OcelAttributePropagation = OcelAttributePropagation;
}
catch (err) {
	// not in node
	//console.log(err);
}
