class OcelParentChildrenAttribute {
	static apply(ocel, childOt, parentOt) {
		let objTypes = {};
		for (let objId in ocel["ocel:objects"]) {
			let obj = ocel["ocel:objects"][objId];
			objTypes[objId] = obj["ocel:type"];
		}
		let parents = {};
		for (let evId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][evId];
			for (let objId of eve["ocel:omap"]) {
				if (objTypes[objId] == childOt) {
					for (let objId2 of eve["ocel:omap"]) {
						if (objTypes[objId2] == parentOt) {
							parents[objId] = objId2;
						}
					}
				}
			}
		}
		
		for (let childId in parents) {
			ocel["ocel:objects"][childId]["ocel:ovmap"][parentOt+"ID"] = parents[childId];
		}
		return ocel;
	}
}

try {
	require('../../../pm4js.js');
	module.exports = {OcelParentChildrenAttribute: OcelParentChildrenAttribute};
	global.OcelParentChildrenAttribute = OcelParentChildrenAttribute;
}
catch (err) {
	// not in node
	//console.log(err);
}
