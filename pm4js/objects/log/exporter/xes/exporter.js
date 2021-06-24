class XesExporter {
	static apply(eventLog) {
		let xmlDoc = document.createElement("log");
		XesExporter.exportXmlObjToDom(eventLog, xmlDoc);
		let serializer = null;
		try {
			serializer = new XMLSerializer();
		}
		catch (err) {
			serializer = require('xmlserializer');
		}
		const xmlStr = serializer.serializeToString(xmlDoc);
		return xmlStr;
	}
	
	static exportXmlObjToDom(obj, dom) {
		for (let att in obj.attributes) {
			let attValue = obj.attributes[att].value;
			let xmlTag = null;
			let value = null;
			if (typeof attValue == "string") {
				xmlTag = "string";
				value = attValue;
			}
			else if (typeof attValue == "object") {
				xmlTag = "date";
				value = attValue.toISOString();
			}
			else if (typeof attValue == "number") {
				xmlTag = "float";
				value = ""+attValue;
			}
			
			if (value != null) {
				let attr = document.createElement(xmlTag);
				dom.appendChild(attr);
				attr.setAttribute("key", att);
				attr.setAttribute("value", value);
				XesExporter.exportXmlObjToDom(obj.attributes[att], attr);
			}
		}
		if (obj.constructor.name == "EventLog") {
			for (let ext in obj.extensions) {
				let extValue = obj.extensions[ext];
				let xmlExtension = document.createElement("extension");
				dom.appendChild(xmlExtension);
				xmlExtension.setAttribute("name", ext);
				xmlExtension.setAttribute("prefix", extValue[0]);
				xmlExtension.setAttribute("uri", extValue[1]);
			}
			for (let scope in obj.globals) {
				let global = obj.globals[scope];
				let xmlGlobal = document.createElement("global");
				dom.appendChild(xmlGlobal);
				xmlGlobal.setAttribute("scope", scope);
				XesExporter.exportXmlObjToDom(global, xmlGlobal);
			}
			for (let classifier in obj.classifiers) {
				let xmlClassifier = document.createElement("classifier");
				dom.appendChild(xmlClassifier);
				xmlClassifier.setAttribute("name", classifier);
				xmlClassifier.setAttribute("keys", obj.classifiers[classifier]);
			}
			for (let trace of obj.traces) {
				let xmlTrace = document.createElement("trace");
				dom.appendChild(xmlTrace);
				XesExporter.exportXmlObjToDom(trace, xmlTrace);
			}
		}
		else if (obj.constructor.name == "Trace") {
			for (let eve of obj.events) {
				let xmlEvent = document.createElement("event");
				dom.appendChild(xmlEvent);
				XesExporter.exportXmlObjToDom(eve, xmlEvent);
			}
		}
	}
}

try {
	const jsdom = require("jsdom");
	const { JSDOM } = jsdom;
	global.dom = new JSDOM('<!doctype html><html><body></body></html>');
	global.window = dom.window;
	global.document = dom.window.document;
	global.navigator = global.window.navigator;
	require('../../log.js');
	module.exports = {XesExporter: XesExporter};
	global.XesExporter = XesExporter;
}
catch (err) {
	// not in node
	console.log(err);
}