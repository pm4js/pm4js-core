class Pm4JS {
	static registerObject(obj) {
		Pm4JS.objects.push([obj, new Date().getTime()]);
	}
	
	static registerAlgorithm(className, methodName, inputs, outputs, description=null, authors=null) {
		if (description == null) {
			description = className+"."+methodName;
		}
		Pm4JS.algorithms.push([className, methodName, inputs, outputs, description, authors]);
	}
	
	static registerImporter(className, methodName, extensions, description=null, authors=null) {
		if (description == null) {
			description = className+"."+methodName;
		}
		Pm4JS.importers.push([className, methodName, extensions, description, authors]);
		for (let callback of Pm4JS.objectsCallbacks) {
			callback();
		}
	}
	
	static registerExporter(className, methodName, extension, description=null, authors=null) {
		if (description == null) {
			description = className+"."+methodName;
		}
		Pm4JS.exporters.push([className, methodName, extension, description, authors]);
	}
	
	static registerVisualizer(className, methodName, inputs, description=null, authors=null) {
		if (description == null) {
			description = className+"."+methodName;
		}
		Pm4JS.visualizers.push([className, methodName, inputs, description, authors]);
	}
	
	static registerCallback(f) {
		Pm4JS.objectsCallbacks.push(f);
	}
}

Pm4JS.registrationEnabled = true;
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