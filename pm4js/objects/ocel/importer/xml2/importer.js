class Xml2OcelImporter {
	static apply(xmlString) {
		return Xml2OcelImporter.importLog(xmlString);
	}
	
	static importLog(xmlString) {
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(xmlString, "text/xml");
		let xmlLog = xmlDoc.getElementsByTagName("log")[0];
		let ocel = {};
		Xml2OcelImporter.parseXmlObj(xmlLog, ocel, ocel);
		ocel = Ocel20FormatFixer.apply(ocel);
		return ocel;
	}

	static parseXmlObj(xmlObj, target, ocel) {
		let attributeNames = {};
		let objectTypes = {};
		let eventTypes = {};
		let events = {};
		let objects = {};
		let objectChanges = [];
		for (let childId in xmlObj.childNodes) {
			let child = xmlObj.childNodes[childId];
			if (child.tagName == "object-types") {
				for (let childId2 in child.childNodes) {
					let child2 = child.childNodes[childId2];
					if (child2.tagName != null) {
						objectTypes[child2.getAttribute("name")] = {};
						for (let childId3 in child2.childNodes) {
							let child3 = child2.childNodes[childId3];
							if (child3.tagName != null) {
								for (let childId4 in child3.childNodes) {
									let child4 = child3.childNodes[childId4];
									if (child4.tagName != null) {
										let attributeName = child4.getAttribute("name");
										let attributeType = child4.getAttribute("type");
										objectTypes[child2.getAttribute("name")][attributeName] = attributeType;
										attributeNames[attributeName] = 0;
									}
								}
							}
						}
					}
				}
			}
			else if (child.tagName == "event-types") {
				for (let childId2 in child.childNodes) {
					let child2 = child.childNodes[childId2];
					if (child2.tagName != null) {
						eventTypes[child2.getAttribute("name")] = {};
						for (let childId3 in child2.childNodes) {
							let child3 = child2.childNodes[childId3];
							if (child3.tagName != null) {
								for (let childId4 in child3.childNodes) {
									let child4 = child3.childNodes[childId4];
									if (child4.tagName != null) {
										let attributeName = child4.getAttribute("name");
										let attributeType = child4.getAttribute("type");
										eventTypes[child2.getAttribute("name")][attributeName] = attributeType;
										attributeNames[attributeName] = 0;
									}
								}
							}
						}
					}
				}
			}
			else if (child.tagName == "events") {
				for (let childId2 in child.childNodes) {
					let child2 = child.childNodes[childId2];
					if (child2.tagName != null) {
						let eventId = child2.getAttribute("id");
						let eventType = child2.getAttribute("type");
						let eventTime = child2.getAttribute("time");
						let eventsOmap = [];
						let eventsTypedOmap = [];
						let eventsVmap = {};
						for (let childId3 in child2.childNodes) {
							let child3 = child2.childNodes[childId3];
							if (child3.tagName == "objects") {
								for (let childId4 in child3.childNodes) {
									let child4 = child3.childNodes[childId4];
									if (child4.tagName != null) {
										let objectId = child4.getAttribute("object-id");
										let objectQualifier = child4.getAttribute("qualifier");
										if (!(eventsOmap.includes(objectId))) {
											eventsOmap.push(objectId);
										}
										eventsTypedOmap.push({"ocel:oid": objectId, "ocel:qualifier": objectQualifier});
									}
								}
							}
							else if (child3.tagName == "attributes") {
								for (let childId4 in child3.childNodes) {
									try {
										let child4 = child3.childNodes[childId4];
										if (child4.tagName != null) {
											let attributeName = child4.getAttribute("name");										
											let value = child4.lastChild.nodeValue;
											
											let attType = eventTypes[eventType][attributeName];
											
											if (attType == "float" || attType == "double") {
												value = parseFloat(value);
											}
											else if (attType == "int") {
												value = parseInt(value);
											}
											else if (attType == "date") {
												value = new Date(value);
											}
											eventsVmap[attributeName] = value;
										}
									}
									catch (err) {
									}
								}
							}
						}
						events[eventId] = {"ocel:activity": eventType, "ocel:timestamp": new Date(eventTime), "ocel:omap": eventsOmap, "ocel:typedOmap": eventsTypedOmap, "ocel:vmap": eventsVmap};
					}
				}
			}
			else if (child.tagName == "objects") {
				for (let childId2 in child.childNodes) {
					let child2 = child.childNodes[childId2];
					if (child2.tagName != null) {
						let objectId = child2.getAttribute("id");
						let objectType = child2.getAttribute("type");
						let objectO2O = [];
						let objectOvmap = {};
						for (let childId3 in child2.childNodes) {
							let child3 = child2.childNodes[childId3];
							if (child3.tagName == "objects") {
								for (let childId4 in child3.childNodes) {
									let child4 = child3.childNodes[childId4];
									if (child4.tagName != null) {
										let targetObjectId = child4.getAttribute("object-id");
										let qualifier = child4.getAttribute("qualifier");
										objectO2O.push({"ocel:oid": targetObjectId, "ocel:qualifier": qualifier});

									}
								}
							}
							else if (child3.tagName == "attributes") {
								for (let childId4 in child3.childNodes) {
									try {
										let child4 = child3.childNodes[childId4];
										if (child4.tagName != null) {
											let name = child4.getAttribute("name");
											let time = child4.getAttribute("time");
											let value = child4.lastChild.nodeValue;
											
											let attType = objectTypes[objectType][name];
											
											if (attType == "float" || attType == "double") {
												value = parseFloat(value);
											}
											else if (attType == "int") {
												value = parseInt(value);
											}
											else if (attType == "date") {
												value = new Date(value);
											}
											
											if (time == "0" || time.startsWith("1970-01-01T00:00:00")) {
												objectOvmap[name] = value;
											}
											else {
												objectChanges.push({"ocel:oid": objectId, "ocel:name": name, "ocel:timestamp": new Date(time), "ocel:value": value});
											}
										}
									}
									catch (err) {
									}
								}
							}
						}
						objects[objectId] = {"ocel:type": objectType, "ocel:ovmap": objectOvmap, "ocel:o2o": objectO2O};
					}
				}
			}
		}
		ocel["ocel:global-event"] = {};
		ocel["ocel:global-object"] = {};
		ocel["ocel:global-log"] = {};
		ocel["ocel:global-log"]["ocel:attribute-names"] = Object.keys(attributeNames);
		ocel["ocel:global-log"]["ocel:object-types"] = Object.keys(objectTypes);
		ocel["ocel:global-log"]["ocel:version"] = "1.0";
		ocel["ocel:global-log"]["ocel:ordering"] = "timestamp";
		ocel["ocel:events"] = events;
		ocel["ocel:objects"] = objects;
		ocel["ocel:objectTypes"] = objectTypes;
		ocel["ocel:eventTypes"] = eventTypes;
		ocel["ocel:objectChanges"] = objectChanges;
		
		ocel = Ocel20FormatFixer.apply(ocel);
	}
}

try {
	module.exports = {Xml2OcelImporter: Xml2OcelImporter};
	global.Xml2OcelImporter = Xml2OcelImporter;
	global.DOMParser = require('xmldom').DOMParser;
}
catch (err) {
	// not in node
	//console.log(err);
}
