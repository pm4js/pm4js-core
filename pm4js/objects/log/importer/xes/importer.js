class XesImporter {
	static apply(xmlString) {
		let parser = new DOMParser();
		var xmlDoc = parser.parseFromString(xmlString, "text/xml");
		let xmlLog = xmlDoc.getElementsByTagName("log")[0];
		let eventLog = new EventLog();
		XesImporter.parseXmlObj(xmlLog, eventLog);
		return eventLog;
	}
	
	static parseXmlObj(xmlObj, target) {
		for (let childId in xmlObj.childNodes) {
			let child = xmlObj.childNodes[childId];
			if (child.tagName == "string") {
				let xmlAttr = new Attribute(child.getAttribute("value"));
				target.attributes[child.getAttribute("key")] = xmlAttr;
				XesImporter.parseXmlObj(child, xmlAttr);
			}
			else if (child.tagName == "date") {
				let xmlAttr = new Attribute(new Date(child.getAttribute("value")));
				target.attributes[child.getAttribute("key")] = xmlAttr;
				XesImporter.parseXmlObj(child, xmlAttr);
			}
			else if (child.tagName == "float") {
				let xmlAttr = new Attribute(parseFloat(child.getAttribute("value")));
				target.attributes[child.getAttribute("key")] = xmlAttr;
				XesImporter.parseXmlObj(child, xmlAttr);
			}
			else if (child.tagName == "event") {
				let eve = new Event();
				target.events.push(eve);
				XesImporter.parseXmlObj(child, eve);
			}
			else if (child.tagName == "trace") {
				let trace = new Trace();
				target.traces.push(trace);
				XesImporter.parseXmlObj(child, trace);
			}
			else if (child.tagName == "extension") {
				target.extensions[child.getAttribute("name")] = [child.getAttribute("prefix"), child.getAttribute("uri")];
			}
			else if (child.tagName == "global") {
				let targetObj = new LogGlobal();
				target.globals[child.getAttribute("scope")] = targetObj;
				XesImporter.parseXmlObj(child, targetObj);
			}
			else if (child.tagName == "classifier") {
				target.classifiers[child.getAttribute("name")] = child.getAttribute("keys");
			}
		}
	}
}

try {
	require('../../log.js');
	module.exports = {XesImporter: XesImporter};
	global.XesImporter = XesImporter;
	global.DOMParser = require('xmldom').DOMParser;
}
catch (err) {
}