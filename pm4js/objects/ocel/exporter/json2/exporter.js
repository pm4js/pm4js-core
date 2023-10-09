class JsonOcel2Exporter {
	static apply(ocel) {
		ocel = Ocel20FormatFixer.apply(ocel);
		
		let jsonObj = {};
		jsonObj["objectTypes"] = [];
		jsonObj["eventTypes"] = [];
		jsonObj["objects"] = [];
		jsonObj["events"] = [];
		
		for (let ot in ocel["ocel:objectTypes"]) {
			let attrs = ocel["ocel:objectTypes"][ot];
			let descr = {"name": ot, "attributes": []};
			for (let attr in attrs) {
				let attr_type = attrs[attr];
				descr["attributes"].push({"name": attr, "type": attr_type});
			}
			jsonObj["objectTypes"].push(descr);
		}
		
		for (let et in ocel["ocel:eventTypes"]) {
			let attrs = ocel["ocel:eventTypes"][et];
			let descr = {"name": et, "attributes": []};
			for (let attr in attrs) {
				let attr_type = attrs[attr];
				descr["attributes"].push({"name": attr, "type": attr_type});
			}
			jsonObj["eventTypes"].push(descr);
		}
		
		let objIdx = {};
		let i = 0;
		for (let objId in ocel["ocel:objects"]) {
			let obj = ocel["ocel:objects"][objId];
			let descr = {"id": objId, "type": obj["ocel:type"]};
			
			if ("ocel:ovmap" in obj) {
				if (Object.keys(obj["ocel:ovmap"]).length > 0) {
					descr["attributes"] = [];
					for (let k in obj["ocel:ovmap"]) {
						let v = obj["ocel:ovmap"][k];
						descr["attributes"].push({"name": k, "time": "1970-01-01T00:00:00Z", "value": v});
					}
				}
			}
			
			if ("ocel:o2o" in obj) {
				if (obj["ocel:o2o"].length > 0) {
					descr["relationships"] = [];
					for (let v of obj["ocel:o2o"]) {
						descr["relationships"].push({"objectId": v["ocel:oid"], "qualifier": v["ocel:qualifier"]});
					}
				}
			}
			
			jsonObj["objects"].push(descr);
			objIdx[objId] = i;
			i++;
		}
		
		let eveIdx = {};
		i = 0;
		for (let evId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][evId];
			let descr = {"id": evId, "type": eve["ocel:activity"], "time": eve["ocel:timestamp"]};
			
			if ("ocel:vmap" in eve) {
				if (Object.keys(eve["ocel:vmap"]).length > 0) {
					descr["attributes"] = [];
					for (let k in eve["ocel:vmap"]) {
						let v = eve["ocel:vmap"][k];
						descr["attributes"].push({"name": k, "value": v});
					}
				}
			}
			
			if ("ocel:typedOmap" in eve) {
				if (eve["ocel:typedOmap"].length > 0) {
					descr["relationships"] = [];
					for (let v of eve["ocel:typedOmap"]) {
						descr["relationships"].push({"objectId": v["ocel:oid"], "qualifier": v["ocel:qualifier"]});
					}
				}
			}
			jsonObj["events"].push(descr);
			eveIdx[evId] = i;
			i++;
		}
		
		for (let change of ocel["ocel:objectChanges"]) {
			let oid = change["ocel:oid"];
			let obj = jsonObj["objects"][objIdx[oid]];
			
			obj["attributes"].push({"name": change["ocel:name"], "time": change["ocel:timestamp"], "value": change["ocel:value"]});
			
			jsonObj["objects"][objIdx[oid]] = obj;
		}
		
		return JSON.stringify(jsonObj);
	}
}

try {
	require('../../../../pm4js.js');
	module.exports = {JsonOcel2Exporter: JsonOcel2Exporter};
	global.JsonOcel2Exporter = JsonOcel2Exporter;
}
catch (err) {
	// not in node
	//console.log(err);
}

