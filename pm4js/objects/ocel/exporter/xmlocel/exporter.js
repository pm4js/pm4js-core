class XmlOcelExporter {
	static apply(ocel) {
		return XmlOcelExporter.exportLog(ocel);
	}
	
	static exportLog(ocel) {
		let xmlDocument = document.createElement("log");
		let globalLog = document.createElement("global");
		globalLog.setAttribute("scope", "log");
		let globalObject = document.createElement("global");
		globalObject.setAttribute("scope", "object");
		let globalEvent = document.createElement("global");
		globalEvent.setAttribute("scope", "event");
		let events = document.createElement("events");
		let objects = document.createElement("objects");
		xmlDocument.appendChild(globalLog);
		xmlDocument.appendChild(globalObject);
		xmlDocument.appendChild(globalEvent);
		xmlDocument.appendChild(events);
		xmlDocument.appendChild(objects);
		
		XmlOcelExporter.exportGlobalLog(ocel, globalLog);
		XmlOcelExporter.exportGlobalObject(ocel, globalObject);
		XmlOcelExporter.exportGlobalEvent(ocel, globalEvent);
		XmlOcelExporter.exportEvents(ocel, events);
		XmlOcelExporter.exportObjects(ocel, objects);

		let serializer = null;
		try {
			serializer = new XMLSerializer();
		}
		catch (err) {
			serializer = require('xmlserializer');
		}
		const xmlStr = serializer.serializeToString(xmlDocument);
		return xmlStr;
	}
	
	static exportEvents(ocel, xmlEvents) {
		for (let evId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][evId];
			let xmlEvent = document.createElement("event");
			xmlEvents.appendChild(xmlEvent);
			let eveId = document.createElement("string");
			eveId.setAttribute("key", "id");
			eveId.setAttribute("value", evId);
			xmlEvent.appendChild(eveId);
			let eveActivity = document.createElement("string");
			eveActivity.setAttribute("key", "activity");
			eveActivity.setAttribute("value", eve["ocel:activity"]);
			xmlEvent.appendChild(eveActivity);
			let eveTimestamp = document.createElement("date");
			eveTimestamp.setAttribute("key", "timestamp");
			eveTimestamp.setAttribute("value", eve["ocel:timestamp"]);
			xmlEvent.appendChild(eveTimestamp);
			let xmlOmap = document.createElement("list");
			xmlOmap.setAttribute("key", "omap");
			xmlEvent.appendChild(xmlOmap);
			for (let relObj of eve["ocel:omap"]) {
				let xmlObj = document.createElement("string");
				xmlObj.setAttribute("key", "object-id");
				xmlObj.setAttribute("value", relObj);
				xmlOmap.appendChild(xmlObj);
			}
			let xmlVmap = document.createElement("list");
			xmlVmap.setAttribute("key", "vmap");
			xmlEvent.appendChild(xmlVmap);
			for (let att in eve["ocel:vmap"]) {
				XmlOcelExporter.exportAttribute(att, eve["ocel:vmap"][att], xmlEvent);
			}
		}
	}
	
	static exportObjects(ocel, xmlObjects) {
		for (let objId in ocel["ocel:objects"]) {
			let obj = ocel["ocel:objects"][objId];
			let xmlObj = document.createElement("object");
			xmlObjects.appendChild(xmlObj);
			let xmlObjId = document.createElement("string");
			xmlObjId.setAttribute("key", "id");
			xmlObjId.setAttribute("value", objId);
			xmlObj.appendChild(xmlObjId);
			let xmlObjType = document.createElement("string");
			xmlObjType.setAttribute("key", "type")
			xmlObjType.setAttribute("value", obj["ocel:type"]);
			xmlObj.appendChild(xmlObjType);
			let xmlObjOvmap = document.createElement("list");
			xmlObjOvmap.setAttribute("key", "ovmap");
			xmlObj.appendChild(xmlObjOvmap);
			for (let att in obj["ocel:ovmap"]) {
				XmlOcelExporter.exportAttribute(att, obj["ocel:ovmap"][att], xmlObj);
			}
		}
	}
	
	static exportGlobalLog(ocel, globalLog) {
		let attributeNames = document.createElement("list");
		globalLog.appendChild(attributeNames);
		attributeNames.setAttribute("key", "attribute-names");
		let objectTypes = document.createElement("list");
		globalLog.appendChild(objectTypes);
		objectTypes.setAttribute("key", "object-types");
		for (let att of ocel["ocel:global-log"]["ocel:attribute-names"]) {
			let xmlAttr = document.createElement("string");
			xmlAttr.setAttribute("key", "attribute-name");
			xmlAttr.setAttribute("value", att);
			attributeNames.appendChild(xmlAttr);
		}
		for (let ot of ocel["ocel:global-log"]["ocel:object-types"]) {
			let xmlOt = document.createElement("string");
			xmlOt.setAttribute("key", "object-type");
			xmlOt.setAttribute("value", ot);
			objectTypes.appendChild(xmlOt);
		}
	}
	
	static exportGlobalEvent(ocel, globalEvent) {
		for (let att in ocel["ocel:global-event"]) {
			XmlOcelExporter.exportAttribute(att, ocel["ocel:global-event"][att], globalEvent);
		}
	}
	
	static exportGlobalObject(ocel, globalObject) {
		for (let att in ocel["ocel:global-object"]) {
			XmlOcelExporter.exportAttribute(att, ocel["ocel:global-object"][att], globalObject);
		}
	}
	
	static exportAttribute(attName, attValue, parentObj) {
		let xmlTag = null;
		let value = null;
			if (typeof attValue == "string") {
				xmlTag = "string";
				value = attValue;
			}
			else if (typeof attValue == "object") {
				xmlTag = "date";
				console.log(attValue);
				value = attValue.toISOString();
			}
			else if (typeof attValue == "number") {
				xmlTag = "float";
				value = ""+attValue;
			}
			
			if (value != null) {
				let thisAttribute = document.createElement(xmlTag);
				thisAttribute.setAttribute("key", attName);
				thisAttribute.setAttribute("value", value);
				parentObj.appendChild(thisAttribute);
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
	require('../../../../pm4js.js');
	module.exports = {XmlOcelExporter: XmlOcelExporter};
	global.XmlOcelExporter = XmlOcelExporter;
}
catch (err) {
	// not in node
	//console.log(err);
}
