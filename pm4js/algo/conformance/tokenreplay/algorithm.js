class TokenBasedReplayResult {
	constructor(result) {
		this.result = result;
		this.totalConsumed = 0;
		this.totalProduced = 0;
		this.totalMissing = 0;
		this.totalRemaining = 0;
		this.totalTraces = this.result.length;
		this.fitTraces = 0;
		this.logFitness = 0.0;
		this.compute();
	}
	
	compute() {
		for (let res of this.result) {
			if (res["isFit"]) {
				this.fitTraces++;
			}
			this.totalConsumed += res["consumed"];
			this.totalProduced += res["produced"];
			this.totalMissing += res["missing"];
			this.totalRemaining += res["remaining"];
			let fitMC = 0.0;
			let fitRP = 0.0;
			if (this.totalConsumed > 0) {
				fitMC = 1.0 - this.totalMissing / this.totalConsumed;
			}
			if (this.totalProduced > 0) {
				fitRP = 1.0 - this.totalRemaining / this.totalProduced;
			}
			this.logFitness = 0.5*fitMC + 0.5*fitRP;
		}
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
		for (let place in acceptingPetriNet.im.tokens) {
			produced += acceptingPetriNet.im.tokens[place];
		}
		for (let place in acceptingPetriNet.fm.tokens) {
			consumed += acceptingPetriNet.fm.tokens[place];
		}
		let visitedTransitions = [];
		let visitedMarkings = [];
		let missingActivitiesInModel = [];
		for (let act of activities) {
			if (act in transitionsMap) {
				let trans = transitionsMap[act];
				let transPreMarking = trans.getPreMarking();
				let transPostMarking = trans.getPostMarking();
				let enabled = marking.getEnabledTransitions();
				if (!(enabled.includes(trans))) {
					let internalMarking = marking.copy();
					let internalConsumed = consumed;
					let internalProduced = produced;
					while (!(enabled.includes(trans))) {
						let transList = TokenBasedReplay.enableTransThroughInvisibles(marking, transPreMarking, invisibleChain);
						if (transList == null) {
							break;
						}
						else {
							for (let internalTrans of transList) {
								let internalTransPreMarking = internalTrans.getPreMarking();
								let internalTransPostMarking = internalTrans.getPostMarking();
								internalMarking = internalMarking.execute(internalTrans);
								if (internalMarking == null) {
									break;
								}
								// counts consumed and produced tokens
								for (let place in internalTransPreMarking) {
									internalConsumed += internalTransPreMarking[place];
								}
								for (let place in internalTransPostMarking) {
									internalProduced += internalTransPostMarking[place];
								}
							}
							enabled = internalMarking.getEnabledTransitions();
						}
					}
					if (enabled.includes(trans)) {
						marking = internalMarking;
						consumed = internalConsumed;
						produced = internalProduced;
					}
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
				// counts consumed and produced tokens
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
			else if (!(act in missingActivitiesInModel)) {
				missingActivitiesInModel.push(act);
			}
		}
		if (!(acceptingPetriNet.fm.equals(marking))) {
			let internalMarking = marking.copy();
			let internalConsumed = consumed;
			let internalProduced = produced;
			while (!(acceptingPetriNet.fm.equals(internalMarking))) {
				let transList = TokenBasedReplay.reachFmThroughInvisibles(internalMarking, acceptingPetriNet.fm, invisibleChain);
				if (transList == null) {
					break;
				}
				else {
					for (let internalTrans of transList) {
						let internalTransPreMarking = internalTrans.getPreMarking();
						let internalTransPostMarking = internalTrans.getPostMarking();
						internalMarking = internalMarking.execute(internalTrans);
						if (internalMarking == null) {
							break;
						}
						// counts consumed and produced tokens
						for (let place in internalTransPreMarking) {
							internalConsumed += internalTransPreMarking[place];
						}
						for (let place in internalTransPostMarking) {
							internalProduced += internalTransPostMarking[place];
						}
					}
				}
			}
			if (acceptingPetriNet.fm.equals(internalMarking)) {
				marking = internalMarking;
				consumed = internalConsumed;
				produced = internalProduced;
			}
		}
		for (let place in marking.tokens) {
			if (!(place in acceptingPetriNet.fm.tokens)) {
				remaining += marking.tokens[place];
			}
			else if (marking.tokens[place] > acceptingPetriNet.fm.tokens[place]) {
				remaining += marking.tokens[place] - acceptingPetriNet.fm.tokens[place];
			}
		}
		let fitMC = 0.0;
		let fitRP = 0.0;
		if (consumed > 0) {
			fitMC = 1.0 - missing / consumed;
		}
		if (produced > 0) {
			fitRP = 1.0 - remaining / produced;
		}
		let fitness = 0.5*fitMC + 0.5*fitRP;
		let isFit = (Object.keys(missingActivitiesInModel).length == 0) && (missing == 0);
		return {"consumed": consumed, "produced": produced, "missing": missing, "remaining": remaining, "visitedTransitions": visitedTransitions, "visitedMarkings": visitedMarkings, "missingActivitiesInModel": missingActivitiesInModel, "fitness": fitness, "isFit": isFit};
	}
	
	static enableTransThroughInvisibles(marking, transPreMarking, invisibleChain) {
		let diff1 = [];
		let diff2 = [];
		for (let place in marking.tokens) {
			if (!(place in transPreMarking)) {
				diff1.push(place);
			}
		}
		for (let place in transPreMarking) {
			if ((!(place in marking.tokens)) || marking.tokens[place] < transPreMarking[place]) {
				diff2.push(place);
			}
		}
		for (let place of diff1) {
			if (place in invisibleChain) {
				for (let place2 of diff2) {
					if (place2 in invisibleChain[place]) {
						return invisibleChain[place][place2];
					}
				}
			}
		}
		return null;
	}
	
	static reachFmThroughInvisibles(marking, finalMarking, invisibleChain) {
		let diff1 = [];
		let diff2 = [];
		for (let place in marking.tokens) {
			if (!(place in finalMarking.tokens)) {
				diff1.push(place);
			}
		}
		for (let place in finalMarking.tokens) {
			if ((!(place in marking.tokens)) || marking.tokens[place] < finalMarking.tokens[place]) {
				diff2.push(place);
			}
		}
		for (let place of diff1) {
			if (place in invisibleChain) {
				for (let place2 of diff2) {
					if (place2 in invisibleChain[place]) {
						return invisibleChain[place][place2];
					}
				}
			}
		}
		return null;
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
		return invisibleChain;
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
