class Pm4JS {
	// version >= 0.0.20: license BSD-3-Clause
	
	static registerObject(obj, description) {
		if (Pm4JS.registrationEnabled) {
			if (description == null) {
				description = obj.className;
			}
			Pm4JS.objects.push({"object": obj, "creationDate": new Date().getTime(), "description": description});
			for (let callback of Pm4JS.objectsCallbacks) {
				callback();
			}
		}
	}
	
	static registerAlgorithm(className, methodName, inputs, output, description=null, authors=null) {
		if (description == null) {
			description = className+"."+methodName;
		}
		if (authors == null) {
			authors = "";
		}
		Pm4JS.algorithms.push({"className": className, "methodName": methodName, "inputs": inputs, "output": output, "description": description, "authors": authors});
	}
	
	static registerImporter(className, methodName, extensions, description=null, authors=null) {
		if (description == null) {
			description = className+"."+methodName;
		}
		if (authors == null) {
			authors = "";
		}
		Pm4JS.importers.push({"className": className, "methodName": methodName, "extensions": extensions, "description": description, "authors": authors});
		for (let callback of Pm4JS.objectsCallbacks) {
			callback();
		}
	}
	
	static registerExporter(className, methodName, exportedObjType, extension, mimeType, description=null, authors=null) {
		if (description == null) {
			description = className+"."+methodName;
		}
		if (authors == null) {
			authors = "";
		}
		Pm4JS.exporters.push({"className": className, "methodName": methodName, "exportedObjType": exportedObjType, "extension": extension, "mimeType": mimeType, "description": description, "authors": authors});
	}
	
	static registerVisualizer(className, methodName, input, description=null, authors=null) {
		if (description == null) {
			description = className+"."+methodName;
		}
		if (authors == null) {
			authors = "";
		}
		Pm4JS.visualizers.push({"className": className, "methodName": methodName, "input": input, "description": description, "authors": authors});
	}
	
	static registerCallback(f) {
		Pm4JS.objectsCallbacks.push(f);
	}
}

Pm4JS.VERSION = "0.0.27";
Pm4JS.registrationEnabled = false;
Pm4JS.objects = [];
Pm4JS.algorithms = [];
Pm4JS.importers = [];
Pm4JS.exporters = [];
Pm4JS.visualizers = [];
Pm4JS.objectsCallbacks = [];

try {
	module.exports = {Pm4JS: Pm4JS};
	global.Pm4JS = Pm4JS;
}
catch (err) {
	// not in node
}