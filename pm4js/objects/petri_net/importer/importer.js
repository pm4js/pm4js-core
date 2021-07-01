class PnmlImporter {
	static apply(xmlString) {
		let parser = new DOMParser();
		var xmlDoc = parser.parseFromString(xmlString, "text/xml");
		let xmlPnml = xmlDoc.getElementsByTagName("pnml")[0];
		let petriNet = new PetriNet();
		let im = new Marking(petriNet);
		let fm = new Marking(petriNet);
		PnmlImporter.importRecursive(xmlPnml, petriNet, im, fm, {});
		let acceptingPetriNet = new AcceptingPetriNet(petriNet, im, fm);
		Pm4JS.registerObject(acceptingPetriNet, "Accepting Petri Net imported from a PNML file");
		return acceptingPetriNet;
	}
	
	static importRecursive(pnmlObj, net, im, fm, objDict) {
		for (let childId in pnmlObj.childNodes) {
			let child = pnmlObj.childNodes[childId];
			if (child.tagName == "net" || child.tagName == "page") {
				PnmlImporter.importRecursive(child, net, im, fm, objDict);
			}
			else {
				if (child.tagName == "place") {
					let placeId = child.getAttribute("id");
					let placeName = placeId;
					let placeImOccurrences = 0;
					for (let child2Id in child.childNodes) {
						let child2 = child.childNodes[child2Id];
						if (child2.tagName == "name") {
							for (let child3Id in child2.childNodes) {
								let child3 = child2.childNodes[child3Id];
								if (child3.tagName == "text") {
									placeName = child3.textContent;
								}
							}
						}
						else if (child2.tagName != null && child2.tagName.toLowerCase() == "initialmarking") {
							for (let child3Id in child2.childNodes) {
								let child3 = child2.childNodes[child3Id];
								if (child3.tagName == "text") {
									placeImOccurrences = parseInt(child3.textContent);
								}
							}
						}
					}
					let place = net.addPlace(placeName);
					place.properties["id"] = placeId;
					if (placeImOccurrences > 0) {
						im.setTokens(place, placeImOccurrences);
					}
					objDict[placeId] = place;
				}
				else if (child.tagName == "transition") {
					let transId = child.getAttribute("id");
					let transLabel = transId;
					let visible = true;
					for (let child2Id in child.childNodes) {
						let child2 = child.childNodes[child2Id];
						if (child2.tagName == "name") {
							for (let child3Id in child2.childNodes) {
								let child3 = child2.childNodes[child3Id];
								if (child3.tagName == "text") {
									transLabel = child3.textContent;
								}
							}
						}
						else if (child2.tagName == "toolspecific") {
							if (child2.getAttribute("activity") == "$invisible$") {
								visible = false;
							}
						}
					}
					let trans = null;
					if (visible) {
						trans = net.addTransition(transId, transLabel);
					}
					else {
						trans = net.addTransition(transId, null);
					}
					objDict[transId] = trans;
				}
				else if (child.tagName == "arc") {
					let arcId = child.getAttribute("id");
					let arcSource = objDict[child.getAttribute("source")];
					let arcTarget = objDict[child.getAttribute("target")];
					let arcWeight = 1;
					for (let child2Id in child.childNodes) {
						let child2 = child.childNodes[child2Id];
						if (child2.tagName == "inscription") {
							for (let child3Id in child2.childNodes) {
								let child3 = child2.childNodes[child3Id];
								if (child3.tagName == "text") {
									arcWeight = parseInt(child3.textContent);
								}
							}
						}
					}
					net.addArcFromTo(arcSource, arcTarget, arcWeight);
				}
				else if (child.tagName == "finalmarkings") {
					for (let child2Id in child.childNodes) {
						let child2 = child.childNodes[child2Id];
						if (child2.tagName == "marking") {
							for (let child3Id in child2.childNodes) {
								let child3 = child2.childNodes[child3Id];
								if (child3.tagName == "place") {
									let placeId = child3.getAttribute("idref");
									let placeTokens = 0;
									for (let child4Id in child3.childNodes) {
										let child4 = child3.childNodes[child4Id];
										if (child4.tagName == "text") {
											placeTokens = parseInt(child4.textContent);
										}
									}
									let place = objDict[placeId];
									if (placeTokens > 0) {
										fm.setTokens(place, placeTokens);
									}
								}
							}
							break;
						}
					}
				}
			}
		}
	}
}

try {
	require('../../../pm4js.js');
	require('../petri_net.js');
	module.exports = {PnmlImporter: PnmlImporter};
	global.PnmlImporter = PnmlImporter;
	global.DOMParser = require('xmldom').DOMParser;
}
catch (err) {
}

Pm4JS.registerImporter("PnmlImporter", "apply", ["pnml"], "PNML Importer", "Alessandro Berti");
