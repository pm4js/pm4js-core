class PetriNetFrequencyVisualizer {
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static nodeUuid() {
		let uuid = PetriNetFrequencyVisualizer.uuidv4();
		return "n"+uuid.replace(/-/g, "");
	}
	
	static apply(acceptingPetriNet, tbrResult) {
		let petriNet = acceptingPetriNet.net;
		let im = acceptingPetriNet.im;
		let fm = acceptingPetriNet.fm;
		let ret = [];
		let uidMap = {};
		ret.push("digraph G {");
		ret.push("rankdir=\"LR\"");
		for (let placeKey in petriNet.places) {
			let place = petriNet.places[placeKey];
			let nUid = PetriNetFrequencyVisualizer.nodeUuid();
			let fillColor = "white";
			if (place in im.tokens) {
				fillColor = "green";
			}
			else if (place in fm.tokens) {
				fillColor = "orange";
			}
			let placeLabel = "p="+tbrResult.totalProducedPerPlace[place]+";m="+tbrResult.totalMissingPerPlace[place]+"\nc="+tbrResult.totalConsumedPerPlace[place]+";r="+tbrResult.totalRemainingPerPlace[place];
			ret.push(nUid+" [shape=ellipse, label=\""+placeLabel+"\", style=filled, fillcolor="+fillColor+"]");
			uidMap[place] = nUid;
		}
		for (let transKey in petriNet.transitions) {
			let trans = petriNet.transitions[transKey];
			let nUid = PetriNetFrequencyVisualizer.nodeUuid();
			if (trans.label != null) {
				ret.push(nUid+" [shape=box, label=\""+trans.label+"\n("+tbrResult.transExecutions[trans]+")\"]");
			}
			else {
				ret.push(nUid+" [shape=box, label=\" \", style=filled, fillcolor=black]");
			}
			uidMap[trans] = nUid;
		}
		for (let arcKey in petriNet.arcs) {
			let arc = petriNet.arcs[arcKey];
			let uid1 = uidMap[arc.source];
			let uid2 = uidMap[arc.target];
			ret.push(uid1+" -> "+uid2+" [label=\""+tbrResult.arcExecutions[arcKey]+"\"]");
		}
		ret.push("}");
		return ret.join('\n');
	}
}

try {
	require('../../pm4js.js');
	module.exports = {PetriNetFrequencyVisualizer: PetriNetFrequencyVisualizer};
	global.PetriNetFrequencyVisualizer = PetriNetFrequencyVisualizer;
}
catch (err) {
	// not in node
}