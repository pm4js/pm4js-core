class PetriNet {
	constructor(name="") {
		this.name = name;
		this.places = {};
		this.transitions = {};
		this.arcs = {};
	}
	
	addPlace(name) {
		let place = new PetriNetPlace(name);
		this.places[place] = place;
		return place;
	}
	
	addTransition(name, label) {
		let trans = new PetriNetTransition(name, label);
		this.transitions[trans] = trans;
		return trans;
	}
	
	addArcFromTo(source, target, weight=1) {
		if (source.constructor.name == target.constructor.name) {
			throw 'Petri nets are bipartite graphs';
		}
		let arc = new PetriNetArc(source, target, weight);
		source.outArcs[arc] = arc;
		target.inArcs[arc] = arc;
		this.arcs[arc] = arc;
		return arc;
	}
	
	toString() {
		return "petriNet@@"+this.name;
	}
}

class PetriNetPlace {
	constructor(name) {
		this.name = name;
		this.inArcs = {};
		this.outArcs = {};
		this.properties = {};
	}
	
	toString() {
		return "place@@"+this.name;
	}
}

class PetriNetTransition {
	constructor(name, label) {
		this.name = name;
		this.label = label;
		this.inArcs = {};
		this.outArcs = {};
		this.properties = {};
	}
	
	toString() {
		return "transition@@"+this.name;
	}
	
	getPreMarking() {
		let preMarking = {}
		for (let arcKey in this.inArcs) {
			let arc = this.inArcs[arcKey];
			let sourcePlace = arc.source;
			preMarking[sourcePlace] = arc.weight;
		}
		return preMarking;
	}
	
	getPostMarking() {
		let postMarking = {};
		for (let arcKey in this.outArcs) {
			let arc = this.outArcs[arcKey];
			let targetPlace = arc.target;
			postMarking[targetPlace] = arc.weight;
		}
		return postMarking;
	}
	
	checkPreset(marking) {
		let preMarking = this.getPreMarking();
		for (let place in preMarking) {
			if (!(place in marking.tokens) || (marking.tokens[place] < preMarking[place])) {
				return false;
			}
		}
		return true;
	}
}


class PetriNetArc {
	constructor(source, target, weight=1) {
		this.source = source;
		this.target = target;
		this.weight = weight;
		this.properties = {};
	}
	
	toString() {
		return "arc@@"+this.source+"@@"+this.target;
	}
}

class Marking {
	constructor(net) {
		this.net = net;
		this.tokens = {};
	}
	
	toString() {
		let ret = "marking@@";
		let orderedKeys = Object.keys(this.tokens).sort();
		for (let place of orderedKeys) {
			ret += place + "=" + this.tokens[place] + ";"
		}
	}
	
	setTokens(place, tokens) {
		this.tokens[place] = tokens;
	}
	
	getEnabledTransitions() {
		let ret = [];
		for (let transKey in this.net.transitions) {
			let trans = this.net.transitions[transKey];
			if (trans.checkPreset(this)) {
				ret.push(trans);
			}
		}
		return ret;
	}
	
	execute(transition) {
		let newMarking = new Marking(this.net);
		for (let place in this.tokens) {
			newMarking.setTokens(place, this.tokens[place]);
		}
		let preMarking = transition.getPreMarking();
		let postMarking = transition.getPostMarking();
		for (let place in preMarking) {
			newMarking.tokens[place] -= preMarking[place];
		}
		for (let place in postMarking) {
			if (!(place in newMarking)) {
				newMarking.tokens[place] = postMarking[place];
			}
			else {
				newMarking.tokens[place] += postMarking[place];
			}
		}
		for (let place in newMarking.tokens) {
			if (newMarking.tokens[place] == 0) {
				delete newMarking.tokens[place];
			}
		}
		return newMarking;
	}
}

class AcceptingPetriNet {
	constructor(net, im, fm) {
		this.net = net;
		this.im = im;
		this.fm = fm;
	}
}

try {
	require('../../pm4js.js');
	module.exports = {PetriNet: PetriNet, PetriNetPlace: PetriNetPlace, PetriNetTransition: PetriNetTransition, PetriNetArc: PetriNetArc, Marking: Marking, AcceptingPetriNet: AcceptingPetriNet};
	global.PetriNet = PetriNet;
	global.PetriNetPlace = PetriNetPlace;
	global.PetriNetTransition = PetriNetTransition;
	global.PetriNetArc = PetriNetArc;
	global.Marking = Marking;
	global.AcceptingPetriNet = AcceptingPetriNet;
}
catch (err) {
	// not in node
}