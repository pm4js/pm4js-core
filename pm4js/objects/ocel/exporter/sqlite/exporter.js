class SqliteOcel2Exporter {
	static apply(ocel) {
		return SqliteOcel2Exporter.exportLog(ocel);
	}
	
	static exportLog(ocel) {
		ocel = Ocel20FormatFixer.apply(ocel);
		let db = new SQL.Database();
		
		let sqls = [];
		
		sqls.push("CREATE TABLE event_object (ocel_event_id, ocel_object_id, ocel_qualifier)");
		sqls.push("CREATE TABLE object_object (ocel_source_id, ocel_target_id, ocel_qualifier)");
		sqls.push("CREATE TABLE event_map_type (ocel_type, ocel_type_map)");
		sqls.push("CREATE TABLE object_map_type (ocel_type, ocel_type_map)");
		sqls.push("CREATE TABLE event (ocel_id, ocel_type)");
		sqls.push("CREATE TABLE object (ocel_id, ocel_type)");
		
		let eventMapType = {};
		let objectMapType = {};
		
		for (let evType in ocel["ocel:eventTypes"]) {
			eventMapType[evType] = evType.replaceAll(/[^0-9a-z]/gi, '');
		}
		
		for (let objType in ocel["ocel:objectTypes"]) {
			objectMapType[objType] = objType.replaceAll(/[^0-9a-z]/gi, '');
		}
		
		let eventMapTypeList = {};
		let objectMapTypeList = {};
		
		for (let evType in eventMapType) {
			let evTypeAttrs = Object.keys(ocel["ocel:eventTypes"][evType]);
			eventMapTypeList[evType] = evTypeAttrs;
			let stru = "CREATE TABLE event_"+eventMapType[evType]+" (ocel_id, ocel_time";
			for (let attr of evTypeAttrs) {
				stru += ", "+attr;
			}
			stru += ")";
			sqls.push(stru);
			sqls.push("INSERT INTO event_map_type VALUES ('"+evType+"', '"+eventMapType[evType]+"')");
		}
		
		for (let objType in objectMapType) {
			let objTypeAttrs = Object.keys(ocel["ocel:objectTypes"][objType]);
			objectMapTypeList[objType] = objTypeAttrs;
			let stru = "CREATE TABLE object_"+objectMapType[objType]+" (ocel_id, ocel_time, ocel_changed_field";
			for (let attr of objTypeAttrs) {
				stru += ", "+attr;
			}
			stru += ")";
			sqls.push(stru);
			sqls.push("INSERT INTO object_map_type VALUES ('"+objType+"', '"+objectMapType[objType]+"')");
		}
		
		for (let evId in ocel["ocel:events"]) {
			let ev = ocel["ocel:events"][evId];
			sqls.push("INSERT INTO event VALUES ('"+evId+"', '"+ev["ocel:activity"]+"')");
			for (let relobj of ev["ocel:typedOmap"]) {
				sqls.push("INSERT INTO event_object VALUES ('"+evId+"', '"+relobj["ocel:oid"]+"', '"+relobj["ocel:qualifier"]+"')");
			}
			let thisTypeMap = eventMapTypeList[ev["ocel:activity"]];
			let thisTypeCorr = eventMapType[ev["ocel:activity"]];
			let columns = ["ocel_id", "ocel_time"];
			let values = [evId, ev["ocel:timestamp"].toISOString()];
			
			for (let attr of thisTypeMap) {
				if (attr in ev["ocel:vmap"]) {
					columns.push(attr);
					values.push(ev["ocel:vmap"][attr]);
				}
				
			}
			
			let stru = "INSERT INTO event_"+thisTypeCorr+" ("+columns.join(", ")+") VALUES ('"+values.join("', '")+"')";

			sqls.push(stru);
		}
		
		for (let objId in ocel["ocel:objects"]) {
			let obj = ocel["ocel:objects"][objId];
			sqls.push("INSERT INTO object VALUES ('"+objId+"', '"+obj["ocel:type"]+"')");
			for (let relobj of obj["ocel:o2o"]) {
				sqls.push("INSERT INTO object_object VALUES ('"+objId+"', '"+relobj["ocel:oid"]+"', '"+relobj["ocel:qualifier"]+"')");
			}
			let thisTypeMap = objectMapTypeList[obj["ocel:type"]];
			let thisTypeCorr = objectMapType[obj["ocel:type"]];
			let columns = ["ocel_id", "ocel_time"];
			let values = [objId, "1970-01-01T01:00:00"];
			
			for (let attr of thisTypeMap) {
				if (attr in obj["ocel:ovmap"]) {
					columns.push(attr);
					values.push(obj["ocel:ovmap"][attr]);
				}
			}
			
			let stru = "INSERT INTO object_"+thisTypeCorr+" ("+columns.join(", ")+") VALUES ('"+values.join("', '")+"')";
			sqls.push(stru);
		}
		
		for (let obj2 of ocel["ocel:objectChanges"]) {
			let objId = obj2["ocel:oid"];
			let obj = ocel["ocel:objects"][objId];
			if (obj != null) {
				let thisTypeCorr = objectMapType[obj["ocel:type"]];
				
				let columns = ["ocel_id", "ocel_time", "ocel_changed_field", obj2["ocel:name"]];
				let values = [obj2["ocel:oid"], obj2["ocel:timestamp"].toISOString(), obj2["ocel:name"], obj2["ocel:value"]];
				
				let stru = "INSERT INTO object_"+thisTypeCorr+" ("+columns.join(", ")+") VALUES ('"+values.join("', '")+"')";
				
				sqls.push(stru);
			}
		}
		
		db.exec(sqls.join(";"));

		let binaryArray = db.export();
		return binaryArray;
	}
}

try {
	module.exports = {SqliteOcel2Exporter: SqliteOcel2Exporter};
	global.SqliteOcel2Exporter = SqliteOcel2Exporter;
}
catch (err) {
	// not in node
	//console.log(err);
}
