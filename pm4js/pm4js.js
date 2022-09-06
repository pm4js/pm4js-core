class Pm4JS {
	// version >= 0.0.20: license BSD-3-Clause
	
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
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
	
	static startAlgorithm(details) {
		let uuid = Pm4JS.uuidv4();
		Pm4JS.runningAlgorithms[uuid] = details;
		for (let obs of Pm4JS.runningAlgorithmsObservers) {
			obs.algorithmStarted(uuid, details);
		}
		return uuid;
	}
	
	static updateAlgorithmStatus(uuid, details) {
		let oldDetails = Pm4JS.runningAlgorithms[uuid];
		Pm4JS.runningAlgorithms[uuid] = details;
		for (let obs of Pm4JS.runningAlgorithmsObservers) {
			obs.algorithmStatusUpdated(uuid, oldDetails, details);
		}
		return uuid;
	}
	
	static stopAlgorithm(uuid, details) {
		for (let obs of Pm4JS.runningAlgorithmsObservers) {
			obs.algorithmStopped(uuid, details);
		}
		delete Pm4JS.runningAlgorithms[uuid];
		return uuid;
	}
	
	static registerObserver(observer) {
		Pm4JS.runningAlgorithmsObservers.push(observer);
	}
}

class Pm4JSObserverExample {
	algorithmStarted(uuid, details) {
		console.log("algorithm started! " + uuid);
	}
	
	algorithmStatusUpdated(uuid, oldDetails, details) {
		console.log("algorithm status updated! " + uuid);
	}
	
	algorithmStopped(uuid, details) {
		console.log("algorithm stopped! " + uuid);
	}
}

Pm4JS.VERSION = "0.0.28";
Pm4JS.registrationEnabled = false;
Pm4JS.objects = [];
Pm4JS.algorithms = [];
Pm4JS.importers = [];
Pm4JS.exporters = [];
Pm4JS.visualizers = [];
Pm4JS.objectsCallbacks = [];
Pm4JS.runningAlgorithms = {};
Pm4JS.runningAlgorithmsObservers = [];
Pm4JS.latestIssuedUuid = "";

try {
	module.exports = {Pm4JS: Pm4JS, Pm4JSObserverExample: Pm4JSObserverExample};
	global.Pm4JS = Pm4JS;
	global.Pm4JSObserverExample = Pm4JSObserverExample;
}
catch (err) {
	// not in node
}