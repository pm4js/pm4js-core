class PetriNetFrequencyVisualizer {
	static rgbColor(percent) {
		return [255 * percent, 255 * (1 - percent), 255 * (1 - percent)];
	}

	static hexFromRGB(r, g, b) {
		var hex = [
			Math.floor(r).toString( 16 ),
			Math.floor(g).toString( 16 ),
			Math.floor(b).toString( 16 )
		];
		let i = 0;
		while (i < hex.length) {
			if (hex[i].length == 1) {
				hex[i] = "0" + hex[i];
			}
			i++;
		}
		return "#" + hex.join( "" ).toLowerCase();
	}

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
		let transMaxFrequency = -1;
		let arcMaxFrequency = -1;
		for (let trans in tbrResult.transExecutions) {
			transMaxFrequency = Math.max(tbrResult.transExecutions[trans], transMaxFrequency);
		}
		for (let arc in tbrResult.arcExecutions) {
			arcMaxFrequency = Math.max(tbrResult.arcExecutions[arc], arcMaxFrequency);
		}
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
			let perc = (1.0 - tbrResult.transExecutions[trans] / transMaxFrequency);
			let rgb = PetriNetFrequencyVisualizer.rgbColor(perc);
			let rgbHex = PetriNetFrequencyVisualizer.hexFromRGB(rgb[0], rgb[1], rgb[2]);
			let nUid = PetriNetFrequencyVisualizer.nodeUuid();
			if (trans.label != null) {
				ret.push(nUid+" [shape=box, label=\""+trans.label+"\n("+tbrResult.transExecutions[trans]+")\"; style=filled, fillcolor=\""+rgbHex+"\"]");
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
			let penwidth = 0.5 + Math.log10(1 + tbrResult.arcExecutions[arcKey]);
			ret.push(uid1+" -> "+uid2+" [label=\""+tbrResult.arcExecutions[arcKey]+"\", penwidth=\""+penwidth+"\"]");
		}
		ret.push("}");
		return ret.join('\n');
	}
}

try {
	module.exports = {PetriNetFrequencyVisualizer: PetriNetFrequencyVisualizer};
	global.PetriNetFrequencyVisualizer = PetriNetFrequencyVisualizer;
}
catch (err) {
	// not in node
}