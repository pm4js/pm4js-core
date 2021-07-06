class TokenBasedReplayResult {
	constructor(result) {
		this.result = result;
	}
}

class TokenBasedReplay {
	static apply(eventLog, acceptingPetriNet, activityKey="concept:name") {
		let invisibleChain = TokenBasedReplay.buildInvisibleChain(acceptingPetriNet.net);
		let transitionsMap = {};
		for (let transId in acceptingPetriNet.net.transitions) {
			let trans = acceptingPetriNet.net.transitions[transId];
			if (trans.label != null) {
				transitionsMap[trans.label] = trans;
			}
		}
		let dictioResultsVariant = {};
		let ret = [];
		for (let trace of eventLog.traces) {
			let arrActivities = TokenBasedReplay.getArrActivities(trace, activityKey);
			if (arrActivities in dictioResultsVariant) {
				ret.push(dictioResultsVariant[arrActivities]);
			}
			else {
				let thisRes = TokenBasedReplay.performTbr(arrActivities, transitionsMap, acceptingPetriNet, invisibleChain);
				dictioResultsVariant[arrActivities] = thisRes;
				ret.push(thisRes);
			}
		}
		return new TokenBasedReplayResult(ret);
	}
	
	static performTbr(activities, transitionsMap, acceptingPetriNet, invisibleChain) {
		let marking = acceptingPetriNet.im.copy();
		let consumed = 0;
		let produced = 0;
		let missing = 0;
		let remaining = 0;
		let visitedTransitions = [];
		let visitedMarkings = [];
		let missingActivitiesInModel = [];
		for (let act of activities) {
			if (act in transitionsMap) {
				let trans = transitionsMap[act];
				let transPreMarking = trans.getPreMarking();
				let transPostMarking = trans.getPostMarking();
				let enabled = marking.getEnabledTransitions();
				while (!(enabled.includes(trans))) {
					break;
				}
				if (!(enabled.includes(trans))) {
					// inserts missing tokens
					for (let place in transPreMarking) {
						let diff = transPreMarking[place];
						if (place in marking.tokens) {
							diff -= marking.tokens[place];
						}
						marking.tokens[place] = diff;
						missing += diff;
					}
				}
				for (let place in transPreMarking) {
					consumed += transPreMarking[place];
				}
				for (let place in transPostMarking) {
					produced += transPostMarking[place];
				}
				marking = marking.execute(trans);
				visitedMarkings.push(marking);
				visitedTransitions.push(trans);
			}
		}
		return {"consumed": consumed, "produced": produced, "missing": missing, "remaining": remaining, "visitedTransitions": visitedTransitions, "visitedMarkings": visitedMarkings, "missingActivitiesInModel": missingActivitiesInModel};
	}
	
	static enableTransThroughInvisibles() {
	}
	
	static getArrActivities(trace, activityKey) {
		let ret = [];
		for (let eve of trace.events) {
			ret.push(eve.attributes[activityKey].value);
		}
		return ret;
	}
	
	static buildInvisibleChain(net) {
		let initialDictio = TokenBasedReplay.buildInvisibleChainInitial(net);
		let changedPlaces = Object.keys(initialDictio);
		let invisibleChain = {};
		Object.assign(invisibleChain, initialDictio);
		while (changedPlaces.length > 0) {
			let newChanges = [];
			for (let place in invisibleChain) {
				for (let place2 in invisibleChain[place]) {
					if (changedPlaces.includes(place2)) {
						if (place2 in invisibleChain) {
							for (let place3 in invisibleChain[place2]) {
								if (!(place3 in invisibleChain[place])) {
									invisibleChain[place][place3] = [ ...invisibleChain[place][place2], ...invisibleChain[place2][place3] ];
									newChanges.push(place);
								}
							}
						}
					}
				}
			}
			changedPlaces = newChanges;
		}
	}
	
	static buildInvisibleChainInitial(net) {
		let initialDictio = {};
		for (let placeId in net.places) {
			let place = net.places[placeId];
			initialDictio[place] = {};
			for (let arcId in place.outArcs) {
				let trans = place.outArcs[arcId].target;
				if (trans.label == null) {
					for (let arcId2 in trans.outArcs) {
						let place2 = trans.outArcs[arcId2].target;
						initialDictio[place][place2] = [trans];
					}
				}
			}
			if (Object.keys(initialDictio[place]).length == 0) {
				delete initialDictio[place];
			}
		}
		return initialDictio;
	}
}

try {
	require('../../../pm4js.js');
	module.exports = {TokenBasedReplay: TokenBasedReplay};
	global.TokenBasedReplay = TokenBasedReplay
}
catch (err) {
	// not in Node
	console.log(err);
}
