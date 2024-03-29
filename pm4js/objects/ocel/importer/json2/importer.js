class JsonOcel2Importer {
	static apply(jsonString) {
		let jsonObj = JSON.parse(jsonString);
		
		let legacyObj = {};
		legacyObj["ocel:events"] = {};
		legacyObj["ocel:objects"] = {};
		legacyObj["ocel:objectChanges"] = [];
		legacyObj["ocel:global-log"] = {};
		legacyObj["ocel:global-event"] = {};
		legacyObj["ocel:global-object"] = {};
		
		let objectTypes = {};
		let attributeNames = {};

		
		for (let eve of jsonObj["events"]) {
			let dct = {};
			dct["ocel:activity"] = eve["type"];
			dct["ocel:timestamp"] = new Date(eve["time"]);
			dct["ocel:vmap"] = {};
			if ("attributes" in eve) {
				if (eve["attributes"].length > 0) {
					for (let v of eve["attributes"]) {
						dct["ocel:vmap"][v["name"]] = v["value"];
						
						attributeNames[v["name"]] = 0;
					}
				}
			}
			dct["ocel:typedOmap"] = [];
			dct["ocel:omap"] = [];
			if ("relationships" in eve) {
				if (eve["relationships"].length > 0) {
					for (let v of eve["relationships"]) {
						dct["ocel:typedOmap"].push({"ocel:oid": v["objectId"], "ocel:qualifier": v["qualifier"]});
						if (!(dct["ocel:omap"].includes(v["objectId"]))) {
							dct["ocel:omap"].push(v["objectId"]);
						}
					}
				}
			}
			legacyObj["ocel:events"][eve["id"]] = dct;
		}
		
		for (let obj of jsonObj["objects"]) {
			let dct = {};
			dct["ocel:type"] = obj["type"];
			
			objectTypes[obj["type"]] = 0;
			
			dct["ocel:ovmap"] = {};
			if ("attributes" in obj) {
				if (obj["attributes"].length > 0) {
					for (let x of obj["attributes"]) {
						attributeNames[x["name"]] = 0;

						if (x["name"] in dct["ocel:ovmap"]) {
							legacyObj["ocel:objectChanges"].push({"ocel:oid": obj["id"], "ocel:type": obj["type"], "ocel:name": x["name"], "ocel:value": x["value"], "ocel:timestamp": new Date(x["time"])});
						}
						else {
							dct["ocel:ovmap"][x["name"]] = x["value"];
						}
					}
				}
			}
			dct["ocel:o2o"] = [];
			if ("relationships" in obj) {
				if (obj["relationships"].length > 0) {
					for (let x of obj["relationships"]) {
						dct["ocel:o2o"].push({"ocel:oid": x["objectId"], "ocel:qualifier": x["qualifier"]});
					}
				}
			}
			legacyObj["ocel:objects"][obj["id"]] = dct;
		}
		
		legacyObj["ocel:global-log"]["ocel:object-types"] = Object.keys(objectTypes);
		legacyObj["ocel:global-log"]["ocel:attribute-names"] = Object.keys(attributeNames);
		
		legacyObj = Ocel20FormatFixer.apply(legacyObj);
		
		return legacyObj;
	}
}

try {
	module.exports = {JsonOcel2Importer: JsonOcel2Importer};
	global.JsonOcel2Importer = JsonOcel2Importer;
}
catch (err) {
	// not in node
	//console.log(err);
}
