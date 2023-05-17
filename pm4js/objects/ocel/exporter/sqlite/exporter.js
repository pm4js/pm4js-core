class SqliteOcel2Exporter {
	static apply(ocel) {
		return SqliteOcel2Exporter.exportLog(ocel);
	}
	
	static exportLog(ocel) {
		ocel = Ocel20FormatFixer.apply(ocel);
		let db = new SQL.Database();
		
		db.run("CREATE TABLE event_object (ocel_event_id, ocel_object_id, ocel_qualifier)");
		db.run("CREATE TABLE object_object (ocel_source_id, ocel_target_id, ocel_qualifier)");
		db.run("CREATE TABLE event_map_type (ocel_type, ocel_type_map)");
		db.run("CREATE TABLE object_map_type (ocel_type, ocel_type_map)");
		db.run("CREATE TABLE event (ocel_id, ocel_type)");
		db.run("CREATE TABLE object (ocel_id, ocel_type)");
		
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
			db.run(stru);
			db.run("INSERT INTO event_map_type VALUES ('"+evType+"', '"+eventMapType[evType]+"')");
		}
		
		for (let objType in objectMapType) {
			let objTypeAttrs = Object.keys(ocel["ocel:objectTypes"][objType]);
			objectMapTypeList[objType] = objTypeAttrs;
			let stru = "CREATE TABLE object_"+objectMapType[objType]+" (ocel_id, ocel_time, ocel_changed_field";
			for (let attr of objTypeAttrs) {
				stru += ", "+attr;
			}
			stru += ")";
			db.run(stru);
			db.run("INSERT INTO object_map_type VALUES ('"+objType+"', '"+objectMapType[objType]+"')");
		}
		
		for (let evId in ocel["ocel:events"]) {
			let ev = ocel["ocel:events"][evId];
			db.run("INSERT INTO event VALUES ('"+evId+"', '"+ev["ocel:activity"]+"')");
			for (let relobj in ev["ocel:typedOmap"]) {
				db.run("INSERT INTO event_object VALUES ('"+evId+"', '"+relobj["ocel:oid"]+"', '"+relobj["ocel:qualifier"]+"')");
			}
		}
		
		for (let objId in ocel["ocel:objects"]) {
			let obj = ocel["ocel:objects"][objId];
			db.run("INSERT INTO object VALUES ('"+objId+"', '"+obj["ocel:type"]+"')");
			for (let relobj in obj["ocel:o2o"]) {
				db.run("INSERT INTO object_object VALUES ('"+objId+"', '"+relobj["ocel:oid"]+"', '"+relobj["ocel:qualifier"]+"')");
			}
		}
		

		let binaryArray = db.export();
		return binaryArray;
	}
}

try {
	require('../../../../pm4js.js');
	module.exports = {SqliteOcel2Exporter: SqliteOcel2Exporter};
	global.SqliteOcel2Exporter = SqliteOcel2Exporter;
}
catch (err) {
	// not in node
	//console.log(err);
}
