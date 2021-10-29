class JsonOcelImporter {
	static apply(jsonString) {
		return JsonOcelImporter.importLog(jsonString);
	}
	
	static importLog(jsonString) {
		return JSON.parse(jsonString);
	}
}

try {
	require('../../../../pm4js.js');
	module.exports = {JsonOcelImporter: JsonOcelImporter};
	global.JsonOcelImporter = JsonOcelImporter;
}
catch (err) {
	// not in node
	//console.log(err);
}
