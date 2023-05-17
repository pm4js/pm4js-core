class SqliteOcel2Importer {
	static apply(content) {
		return SqliteOcel2Importer.importLog(content);
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
		let objectChanges = {};
		let attributeNames = {};

		for (let evType in eventMapType1) {
			eventTypes[evType] = [];
			
			let typeMap = eventMapType1[evType];

			let res = db.exec("SELECT * FROM event_"+typeMap);
			let columns = res[0].columns;
			let idIdx = columns.indexOf("ocel_id");
				
			for (let col of columns) {
				if (!(col.startsWith("ocel_"))) {
					attributeNames[col] = 0;
					if (!(eventTypes[evType].includes(col))) {
						eventTypes[evType].push(col);
					}
				}
			}

			for (let el of res[0].values) {
				let dictio = {};
				let idx = 0;
				for (let col of columns) {
					dictio[col] = el[idx];
					idx++;
				}
				eventsMap1[el[idIdx]] = dictio;
			}
		}

		for (let objType in objectMapType1) {
			objectTypes[objType] = [];
			
			let typeMap = objectMapType1[objType];

			let res = db.exec("SELECT * FROM object_"+typeMap);
			let columns = res[0].columns;
			let idIdx = columns.indexOf("ocel_id");

			for (let col of columns) {
				if (!(col.startsWith("ocel_"))) {
					attributeNames[col] = 0;
					if (!(objectTypes[objType].includes(col))) {
						objectTypes[objType].push(col);
					}
				}
			}

			for (let el of res[0].values) {
				let dictio = {};
				let idx = 0;
				for (let col of columns) {
					dictio[col] = el[idx];
					idx++;
				}
				objectsMap1[el[idIdx]] = dictio;
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
			let eveId = el[idIdx]
			let corr = eventsMap1[eveId];
			let relobjs = eventObject1[eveId];
			
			let dictio = {};
			dictio["ocel:activity"] = el[columns.indexOf("ocel_type")];
			dictio["ocel:timestamp"] = new Date(corr["ocel_time"]);
			let vmap = {};
			let typedOmap = [];
			let omap = [];
						
			for (let relobj of relobjs) {
				let objId = relobj["ocel_object_id"];
				let thisDct = {"ocel:oid": objId, "ocel:qualifier": relobj["ocel_qualifier"]};
				typedOmap.push(thisDct);
				if (!(omap.includes(objId))) {
					omap.push(objId);
				}
			}
			
			dictio["ocel:vmap"] = vmap;
			dictio["ocel:typedOmap"] = typedOmap;
			dictio["ocel:omap"] = omap;
			
			events[eveId] = dictio;
		}
		
		console.log(events);
				
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
		
		return ocel;
	}
}

try {
	require('../../../../pm4js.js');
	module.exports = {SqliteOcel2Importer: SqliteOcel2Importer};
	global.SqliteOcel2Importer = SqliteOcel2Importer;
	global.DOMParser = require('xmldom').DOMParser;
}
catch (err) {
	// not in node
	//console.log(err);
}
