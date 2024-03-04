class XmlOcelImporter {
	static apply(xmlString) {
		return XmlOcelImporter.importLog(xmlString);
	}
	
	static importLog(xmlString) {
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(xmlString, "text/xml");
		let xmlLog = xmlDoc.getElementsByTagName("log")[0];
		let ocel = {};
		XmlOcelImporter.parseXmlObj(xmlLog, ocel);
		ocel = Ocel20FormatFixer.apply(ocel);
		return ocel;
	}
	
	static parseXmlObj(xmlObj, target) {
		for (let childId in xmlObj.childNodes) {
			let child = xmlObj.childNodes[childId];
			if (child.tagName == "event") {
				let eveId = null;
				let eveActivity = null;
				let eveTimestamp = null;
				let eveOmap = [];
				let eveVmap = {};
				for (let childId2 in child.childNodes) {
					let child2 = child.childNodes[childId2];
					if (child2.tagName != null) {
						if (child2.getAttribute("key") == "id") {
							eveId = child2.getAttribute("value");
						}
						else if (child2.getAttribute("key") == "activity") {
							eveActivity = child2.getAttribute("value");
						}
						else if (child2.getAttribute("key") == "timestamp") {
							eveTimestamp = new Date(child2.getAttribute("value"));
						}
						else if (child2.getAttribute("key") == "omap") {
							for (let childId3 in child2.childNodes) {
								let child3 = child2.childNodes[childId3];
								if (child3.tagName != null) {
									eveOmap.push(child3.getAttribute("value"));
								}
							}
						}
						else if (child2.getAttribute("key") == "vmap") {
							for (let childId3 in child2.childNodes) {
								let child3 = child2.childNodes[childId3];
								if (child3.tagName != null) {
									XmlOcelImporter.parseAttribute(child3, eveVmap);
								}
							}
						}
					}
				}
				target[eveId] = {"ocel:activity": eveActivity, "ocel:timestamp": eveTimestamp, "ocel:omap": eveOmap, "ocel:vmap": eveVmap};
			}
			else if (child.tagName == "object") {
				let objId = null;
				let objType = null;
				let objOvmap = {};
				for (let childId2 in child.childNodes) {
					let child2 = child.childNodes[childId2];
					if (child2.tagName != null) {
						if (child2.getAttribute("key") == "id") {
							objId = child2.getAttribute("value");
						}
						else if (child2.getAttribute("key") == "type") {
							objType = child2.getAttribute("value");
						}
						else if (child2.getAttribute("key") == "ovmap") {
							for (let childId3 in child2.childNodes) {
								let child3 = child2.childNodes[childId3];
								if (child3.tagName != null) {
									XmlOcelImporter.parseAttribute(child3, objOvmap);
								}
							}
						}
					}
				}
				target[objId] = {"ocel:type": objType, "ocel:ovmap": objOvmap};
			}
			else if (child.tagName == "events") {
				target["ocel:events"] = {};
				XmlOcelImporter.parseXmlObj(child, target["ocel:events"]);
			}
			else if (child.tagName == "objects") {
				target["ocel:objects"] = {};
				XmlOcelImporter.parseXmlObj(child, target["ocel:objects"]);
			}
			else if (child.tagName == "global") {
				if (child.getAttribute("scope") == "event") {
					target["ocel:global-event"] = {};
					for (let childId2 in child.childNodes) {
						let child2 = child.childNodes[childId2];
						if (child2.tagName != null) {
							XmlOcelImporter.parseAttribute(child2, target["ocel:global-event"]);
						}
					}
				}
				else if (child.getAttribute("scope") == "object") {
					target["ocel:global-object"] = {};
					for (let childId2 in child.childNodes) {
						let child2 = child.childNodes[childId2];
						if (child2.tagName != null) {
							XmlOcelImporter.parseAttribute(child2, target["ocel:global-object"]);
						}
					}
				}
				else if (child.getAttribute("scope") == "log") {
					target["ocel:global-log"] = {"ocel:attribute-names": [], "ocel:object-types": []};
					for (let childId2 in child.childNodes) {
						let child2 = child.childNodes[childId2];
						if (child2.tagName != null) {
							if (child2.getAttribute("key") == "attribute-names") {
								for (let childId3 in child2.childNodes) {
									let child3 = child2.childNodes[childId3];
									if (child3.tagName != null) {
										target["ocel:global-log"]["ocel:attribute-names"].push(child3.getAttribute("value"));
									}
								}
							}
							else if (child2.getAttribute("key") == "object-types") {
								for (let childId3 in child2.childNodes) {
									let child3 = child2.childNodes[childId3];
									if (child3.tagName != null) {
										target["ocel:global-log"]["ocel:object-types"].push(child3.getAttribute("value"));
									}
								}
							}
						}
					}
				}
			}
		}
	}
	
	static parseAttribute(xmlObj, target) {
		let attName = xmlObj.getAttribute("key");
		let attValue = xmlObj.getAttribute("value");
		if (xmlObj.tagName == "string") {
			target[attName] = attValue;
		}
		else if (xmlObj.tagName == "date") {
			target[attName] = attValue;
		}
		else {
			target[attName] = ""+attValue;
		}
	}
}

try {
	module.exports = {XmlOcelImporter: XmlOcelImporter};
	global.XmlOcelImporter = XmlOcelImporter;
	global.DOMParser = require('xmldom').DOMParser;
}
catch (err) {
	// not in node
	//console.log(err);
}
