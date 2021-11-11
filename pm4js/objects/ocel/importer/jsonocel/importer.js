class JsonOcelImporter {
	static apply(jsonString) {
		return JsonOcelImporter.importLog(jsonString);
	}
	
	static importLog(jsonString) {
		let ret = JSON.parse(jsonString);
		for (let evId in ret["ocel:events"]) {
			ret["ocel:events"][evId]["ocel:timestamp"] = new Date(ret["ocel:events"][evId]["ocel:timestamp"]);
		}
		return ret;
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
