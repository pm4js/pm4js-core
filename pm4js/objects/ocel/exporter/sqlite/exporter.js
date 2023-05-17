class SqliteOcel2Exporter {
	static apply(ocel) {
		return SqliteOcel2Exporter.exportLog(ocel);
	}
	
	static exportLog(ocel) {
		ocel = Ocel20FormatFixer.apply(ocel);
		let db = new SQL.Database();
		
		db.run("CREATE TABLE test (col1, col2);");
		db.run("INSERT INTO test VALUES (?, ?)", ['Hello', 'World']);

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
