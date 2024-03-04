class SqliteOcel2Importer {
	static apply(content) {
		return SqliteOcel2Importer.importLog(content);
	}
	
	static inferType(stru) {
		try {
			Double.parseDouble(stru);
			return "float";
		}
		catch (err) {
			let thisDate = Date.parse(stru);
			
			if (isNaN(thisDate) || (""+thisDate).startsWith("-")) {
				return "string";
			}
			
			return "date";
		}
	}
	
	static importLog(content) {
		let db = new SQL.Database(content);
		let events0 = db.exec("SELECT * FROM event");
		let objects0 = db.exec("SELECT * FROM object");
		let eventObject0 = db.exec("SELECT * FROM event_object");
		let objectObject0 = db.exec("SELECT * FROM object_object");
		let eventMapType0 = db.exec("SELECT * FROM event_map_type");
		let objectMapType0 = db.exec("SELECT * FROM object_map_type");

		let eventMapType1 = {};
		let objectMapType1 = {};

		let typeColumn = eventMapType0[0].columns.indexOf("ocel_type");
		let typeMapColumn = eventMapType0[0].columns.indexOf("ocel_type_map");

		for (let el of eventMapType0[0].values) {
			eventMapType1[el[typeColumn]] = el[typeMapColumn];
		}

		typeColumn = eventMapType0[0].columns.indexOf("ocel_type");
		typeMapColumn = eventMapType0[0].columns.indexOf("ocel_type_map");

		for (let el of objectMapType0[0].values) {
			objectMapType1[el[typeColumn]] = el[typeMapColumn];
		}

		let eventsMap1 = {};
		let objectsMap1 = {};


		let events = {};
		let objects = {};
		let eventTypes = {};
		let objectTypes = {};
		let objectChanges = [];
		let attributeNames = {};

		for (let evType in eventMapType1) {
			eventTypes[evType] = {};
			
			let typeMap = eventMapType1[evType];

			let res = db.exec("SELECT * FROM event_"+typeMap);
			let columns = res[0].columns;
			let idIdx = columns.indexOf("ocel_id");

			let dictio = {};
			for (let el of res[0].values) {
				dictio = null;
				dictio = {};
				let idx = 0;
				for (let col of columns) {
					dictio[col] = el[idx];
					idx++;
				}
				eventsMap1[el[idIdx]] = dictio;
			}
			
			for (let col of columns) {
				if (!(col.startsWith("ocel_"))) {
					attributeNames[col] = 0;
					if (!(col in eventTypes[evType])) {
						eventTypes[evType][col] = SqliteOcel2Importer.inferType(dictio[col]);
					}
				}
			}
		}

		for (let objType in objectMapType1) {
			objectTypes[objType] = {};
			
			let typeMap = objectMapType1[objType];

			let res = db.exec("SELECT * FROM object_"+typeMap);
			let columns = res[0].columns;
			let idIdx = columns.indexOf("ocel_id");

			let dictio = {};
			for (let el of res[0].values) {
				dictio = null;
				dictio = {};
				
				let idx = 0;
				for (let col of columns) {
					dictio[col] = el[idx];
					idx++;
				}
				let thisId = el[idIdx];
				
				if (!(thisId in objectsMap1)) {
					objectsMap1[thisId] = [];
				}
				objectsMap1[thisId].push(dictio);
			}
			
			for (let col of columns) {
				if (!(col.startsWith("ocel_"))) {
					attributeNames[col] = 0;
					if (!(col in objectTypes[objType])) {
						objectTypes[objType][col] = SqliteOcel2Importer.inferType(dictio[col]);
					}
				}
			}
		}
		
		let eventObject1 = {};
		let objectObject1 = {};
		
		let columns = eventObject0[0].columns;
		let idIdx = columns.indexOf("ocel_event_id");
		
		for (let el of eventObject0[0].values) {
			let sourceId = el[idIdx];
			let dictio = {};
			let idx = 0;
			for (let col of columns) {
				dictio[col] = el[idx];
				idx++;
			}
			if (!(sourceId in eventObject1)) {
				eventObject1[sourceId] = [];
			}
			eventObject1[sourceId].push(dictio);
		}
		
		columns = objectObject0[0].columns;
		idIdx = columns.indexOf("ocel_source_id");
		
		for (let el of objectObject0[0].values) {
			let sourceId = el[idIdx];
			let dictio = {};
			let idx = 0;
			for (let col of columns) {
				dictio[col] = el[idx];
				idx++;
			}
			if (!(sourceId in objectObject1)) {
				objectObject1[sourceId] = [];
			}
			objectObject1[sourceId].push(dictio);
		}
		
		columns = events0[0].columns;
		idIdx = columns.indexOf("ocel_id");
		
		for (let el of events0[0].values) {
			let eveId = el[idIdx];
			let corr = eventsMap1[eveId];
			let relobjs = eventObject1[eveId];
			
			let dictio = {};
			dictio["ocel:activity"] = el[columns.indexOf("ocel_type")];
			dictio["ocel:timestamp"] = new Date(corr["ocel_time"]);
			let vmap = {};
			let typedOmap = [];
			let omap = [];
						
			if (relobjs != null) {
				for (let relobj of relobjs) {
					let objId = relobj["ocel_object_id"];
					let thisDct = {"ocel:oid": objId, "ocel:qualifier": relobj["ocel_qualifier"]};
					typedOmap.push(thisDct);
					if (!(omap.includes(objId))) {
						omap.push(objId);
					}
				}
			}
			
			for (let attr in corr) {
				if (!(attr.startsWith("ocel_"))) {
					vmap[attr] = corr[attr];
				}
			}
			
			dictio["ocel:vmap"] = vmap;
			dictio["ocel:typedOmap"] = typedOmap;
			dictio["ocel:omap"] = omap;
			
			events[eveId] = dictio;
		}
		
		columns = objects0[0].columns;
		idIdx = columns.indexOf("ocel_id");
		
		for (let el of objects0[0].values) {
			let objId = el[idIdx];
			let corrs = objectsMap1[objId];
			let relobjs = objectObject1[objId];
			
			let dictio = {};
			dictio["ocel:type"] = el[columns.indexOf("ocel_type")];
			
			let ovmap = {};
			let o2o = [];
			
			if (relobjs != null) {
				for (let relobj of relobjs) {
					let targetObjId = relobj["ocel_target_id"];
					let thisDct = {"ocel:oid": targetObjId, "ocel:qualifier": relobj["ocel_qualifier"]};
					o2o.push(thisDct);
				}
			}
			
			if (corrs != null) {
				for (let corr of corrs) {
					let time = corr["ocel_time"];
					if (time == "1970-01-01 00:00:00" || time == "1970-01-01 01:00:00") {
						for (let attr in corr) {
							if (!(attr.startsWith("ocel_"))) {
								ovmap[attr] = corr[attr];
							}
						}
					}
					else {
						for (let attr in corr) {
							if (!(attr.startsWith("ocel_"))) {
								objectChanges.push({"ocel:oid": objId, "ocel:name": attr, "ocel:timestamp": new Date(time), "ocel:value": corr[attr]});
							}
						}
					}

				}
			}
			
			dictio["ocel:o2o"] = o2o;
			dictio["ocel:ovmap"] = ovmap;
			objects[objId] = dictio;
		}
		
		let ocel = {};
		ocel["ocel:global-event"] = {};
		ocel["ocel:global-object"] = {};
		ocel["ocel:global-log"] = {};
		ocel["ocel:global-log"]["ocel:attribute-names"] = Object.keys(attributeNames);
		ocel["ocel:global-log"]["ocel:object-types"] = Object.keys(objectTypes);
		ocel["ocel:global-log"]["ocel:version"] = "1.0";
		ocel["ocel:global-log"]["ocel:ordering"] = "timestamp";
		ocel["ocel:events"] = events;
		ocel["ocel:objects"] = objects;
		ocel["ocel:objectTypes"] = objectTypes;
		ocel["ocel:eventTypes"] = eventTypes;
		ocel["ocel:objectChanges"] = objectChanges;

		ocel = Ocel20FormatFixer.apply(ocel);
				
		return ocel;
	}
}

try {
	module.exports = {SqliteOcel2Importer: SqliteOcel2Importer};
	global.SqliteOcel2Importer = SqliteOcel2Importer;
}
catch (err) {
	// not in node
	//console.log(err);
}
