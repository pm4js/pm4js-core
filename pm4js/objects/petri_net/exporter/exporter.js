class PnmlExporter {
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static apply(acceptingPetriNet) {
		let xmlDoc = document.createElement("pnml");
		let domNet = document.createElement("net");
		xmlDoc.appendChild(domNet);
		domNet.setAttribute("id", acceptingPetriNet.net.name);
		domNet.setAttribute("type", "http://www.pnml.org/version-2009/grammar/pnmlcoremodel");
		let page = document.createElement("page");
		page.setAttribute("id", PnmlExporter.uuidv4());
		domNet.appendChild(page);
		PnmlExporter.exportXmlObjToDom(acceptingPetriNet, page);
		let fm0Dom = document.createElementNS("", "finalMarkings");
		domNet.appendChild(fm0Dom);
		let fmDom = document.createElement("marking");
		fm0Dom.appendChild(fmDom);
		for (let placeId in acceptingPetriNet.fm.tokens) {
			let place = acceptingPetriNet.net.places[placeId];
			let placeDom = document.createElement("place");
			placeDom.setAttribute("idref", place.name);
			fmDom.appendChild(placeDom);
			let placeText = document.createElement("text");
			placeDom.appendChild(placeText);
			placeText.textContent = acceptingPetriNet.fm.tokens[placeId];
		}
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
		for (let placeId in obj.net.places) {
			let place = obj.net.places[placeId];
			let domPlace = document.createElement("place");
			domPlace.setAttribute("id", place.name);
			dom.appendChild(domPlace);
			let placeName = document.createElement("name");
			domPlace.appendChild(placeName);
			let placeNameText = document.createElement("text");
			placeName.appendChild(placeNameText);
			placeNameText.textContent = place.name;
			if (place in obj.im.tokens) {
				let initialMarking = document.createElementNS("", "initialMarking");
				domPlace.appendChild(initialMarking);
				let initialMarkingText = document.createElement("text");
				initialMarking.appendChild(initialMarkingText);
				initialMarkingText.textContent = obj.im.tokens[place];
			}
		}
		for (let transId in obj.net.transitions) {
			let trans = obj.net.transitions[transId];
			let domTrans = document.createElement("transition");
			domTrans.setAttribute("id", trans.name);
			dom.appendChild(domTrans);
			let transName = document.createElement("name");
			domTrans.appendChild(transName);
			let transNameText = document.createElement("text");
			transName.appendChild(transNameText);
			if (trans.label == null) {
				transNameText.textContent = trans.name;
			}
			else {
				transNameText.textContent = trans.label;
			}
			if (trans.label == null) {
				let toolSpecific = document.createElement("toolspecific");
				domTrans.appendChild(toolSpecific);
				toolSpecific.setAttribute("activity", "$invisible$");
				toolSpecific.setAttribute("tool", "ProM");
				toolSpecific.setAttribute("version", "6.4");
				toolSpecific.setAttribute("localNodeID", PnmlExporter.uuidv4());
			}
		}
		for (let arcId in obj.net.arcs) {
			let arc = obj.net.arcs[arcId];
			let domArc = document.createElement("arc");
			domArc.setAttribute("source", arc.source.name);
			domArc.setAttribute("target", arc.target.name);
			domArc.setAttribute("id", PnmlExporter.uuidv4());
			dom.appendChild(domArc);
			let inscription = document.createElement("inscription");
			domArc.appendChild(inscription);
			let inscriptionText = document.createElement("text");
			inscription.appendChild(inscriptionText);
			inscriptionText.textContent = arc.weight;
		}
	}
}

try {
	require('../../../pm4js.js');
	require('../petri_net.js');
	module.exports = {PnmlExporter: PnmlExporter};
	global.PnmlExporter = PnmlExporter;
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

Pm4JS.registerExporter("PnmlExporter", "apply", "AcceptingPetriNet", "pnml", "text/xml", "Petri net Exporter (.pnml)", "Alessandro Berti");
