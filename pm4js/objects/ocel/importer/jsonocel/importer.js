class JsonOcelImporter {
	static apply(jsonString) {
		return JsonOcelImporter.importLog(jsonString);
	}
	
	static importLog(jsonString) {
		let ret = JSON.parse(jsonString);
		if ("ocel:objects" in ret) {
			// OCEL 1.0 specification
			for (let evId in ret["ocel:events"]) {
				ret["ocel:events"][evId]["ocel:timestamp"] = new Date(ret["ocel:events"][evId]["ocel:timestamp"]);
			}
			ret = Ocel20FormatFixer.apply(ret);
			return ret;
		}
		else {
			return JsonOcel2Importer.apply(jsonString);
		}
	}
}

try {
	module.exports = {JsonOcelImporter: JsonOcelImporter};
	global.JsonOcelImporter = JsonOcelImporter;
}
catch (err) {
	// not in node
	//console.log(err);
}
