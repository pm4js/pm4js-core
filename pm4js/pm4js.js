class Pm4JS {
	static registerObject(obj) {
		Pm4JS.objects.push([obj, new Date().getTime()]);
	}
	
	static registerAlgorithm(className, methodName, inputs, outputs, description=null) {
		if (description == null) {
			description = className+"."+methodName;
		}
		Pm4JS.algorithms.push([className, methodName, inputs, outputs, description]);
	}
}

Pm4JS.registrationEnabled = true;
Pm4JS.objects = [];
Pm4JS.algorithms = [];
Pm4JS.importers = [];
Pm4JS.exporters = [];
Pm4JS.visualizers = [];

try {
	module.exports = {Pm4JS: Pm4JS};
	global.Pm4JS = Pm4JS;
}
catch (err) {
	// not in node
}