class Xml2OcelExporter {
	static apply(ocel) {
		return Xml2OcelExporter.exportLog(ocel);
	}
	
	static exportLog(ocel) {
		ocel = Ocel20FormatFixer.apply(ocel);
		let xmlDocument = document.createElement("log");
		let objectTypes = document.createElement("object-types");
		let eventTypes = document.createElement("event-types");
		let events = document.createElement("events");
		let objects = document.createElement("objects");
		xmlDocument.appendChild(objectTypes);
		xmlDocument.appendChild(eventTypes);
		xmlDocument.appendChild(objects);
		xmlDocument.appendChild(events);
		for (let ot in ocel["ocel:objectTypes"]) {
			let xmlOt = document.createElement("object-type");
			xmlOt.setAttribute("name", ot);
			objectTypes.appendChild(xmlOt);
			let attributes = document.createElement("attributes");
			xmlOt.appendChild(attributes);
			for (let att in ocel["ocel:objectTypes"][ot]) {
				let attribute = document.createElement("attribute");
				attribute.setAttribute("name", att);
				attribute.setAttribute("type", ocel["ocel:objectTypes"][ot][att]);
				attributes.appendChild(attribute);
			}
		}
		for (let et in ocel["ocel:eventTypes"]) {
			let xmlEt = document.createElement("event-type");
			xmlEt.setAttribute("name", et);
			eventTypes.appendChild(xmlEt);
			let attributes = document.createElement("attributes");
			xmlEt.appendChild(attributes);
			for (let att in ocel["ocel:eventTypes"][et]) {
				let attribute = document.createElement("attribute");
				attribute.setAttribute("name", att);
				attribute.setAttribute("type", ocel["ocel:eventTypes"][et][att]);
				attributes.appendChild(attribute);
			}
		}
		for (let objId in ocel["ocel:objects"]) {
			let obj = ocel["ocel:objects"][objId];
			let xmlObj = document.createElement("object");
			xmlObj.setAttribute("id", objId);
			xmlObj.setAttribute("type", obj["ocel:type"]);
			let attributes = document.createElement("attributes");
			let innerObjects = document.createElement("objects");
			for (let entry of obj["ocel:o2o"]) {
				let objId = entry["ocel:oid"];
				let qualifier = entry["ocel:qualifier"];
				let xmlObj = document.createElement("relationship");
				xmlObj.setAttribute("object-id", objId);
				xmlObj.setAttribute("qualifier", qualifier);
				innerObjects.appendChild(xmlObj);
			}
			for (let att in obj["ocel:ovmap"]) {
				let attValue = obj["ocel:ovmap"][att];
				let attType = ocel["ocel:objectTypes"][obj["ocel:type"]][att];
				
				if (attType == "date") {
					attValue = attValue.toISOString();
				}
				else {
					attValue = ""+attValue;
				}
				
				let xmlAtt = document.createElement("attribute");
				attributes.appendChild(xmlAtt);
				xmlAtt.setAttribute("name", att);
				xmlAtt.setAttribute("time", "1970-01-01T00:00:00Z");
				xmlAtt.innerHTML = attValue;
			}
			
			for (let entry of ocel["ocel:objectChanges"]) {
				let noid = entry["ocel:oid"];
				if (objId == noid) {
					let att = entry["ocel:name"];
					let attValue = entry["ocel:value"];
					let attTimestamp = entry["ocel:timestamp"].toISOString();
					let attType = ocel["ocel:objectTypes"][obj["ocel:type"]][att];
					
					if (attType == "date") {
						attValue = attValue.toISOString();
					}
					else {
						attValue = ""+attValue;
					}
										
					let xmlAtt = document.createElement("attribute");
					attributes.appendChild(xmlAtt);
					xmlAtt.setAttribute("name", att);
					xmlAtt.setAttribute("time", attTimestamp);
					xmlAtt.innerHTML = attValue;
				}
			}
			xmlObj.appendChild(attributes);
			xmlObj.appendChild(innerObjects);
			objects.appendChild(xmlObj);
		}
		for (let evId in ocel["ocel:events"]) {
			let ev = ocel["ocel:events"][evId];
			let xmlEv = document.createElement("event");
			xmlEv.setAttribute("id", evId);
			xmlEv.setAttribute("type", ev["ocel:activity"]);
			xmlEv.setAttribute("time", ev["ocel:timestamp"].toISOString());
			let attributes = document.createElement("attributes");
			let innerObjects = document.createElement("objects");
			for (let entry of ev["ocel:typedOmap"]) {
				let objId = entry["ocel:oid"];
				let qualifier = entry["ocel:qualifier"];
				let xmlObj = document.createElement("relationship");
				xmlObj.setAttribute("object-id", objId);
				xmlObj.setAttribute("qualifier", qualifier);
				innerObjects.appendChild(xmlObj);
			}
			for (let att in ev["ocel:vmap"]) {
				let attValue = ev["ocel:vmap"][att];
				let attType = ocel["ocel:eventTypes"][ev["ocel:activity"]][att];

				if (attType == "date") {
					attValue = attValue.toISOString();
				}
				else {
					attValue = ""+attValue;
				}
				
				let xmlAtt = document.createElement("attribute");
				attributes.appendChild(xmlAtt);
				xmlAtt.setAttribute("name", att);
				xmlAtt.innerHTML = attValue;
			}
			xmlEv.appendChild(attributes);
			xmlEv.appendChild(innerObjects);
			events.appendChild(xmlEv);
		}
		
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
}

try {
	require('../../../../pm4js.js');
	module.exports = {Xml2OcelExporter: Xml2OcelExporter};
	global.Xml2OcelExporter = Xml2OcelExporter;
	const jsdom = require("jsdom");
	const { JSDOM } = jsdom;
	global.dom = new JSDOM('<!doctype html><html><body></body></html>');
	global.window = dom.window;
	global.document = dom.window.document;
	global.navigator = global.window.navigator;
}
catch (err) {
	// not in node
	//console.log(err);
}

