class TokenBasedReplayResult {
	constructor(result, acceptingPetriNet) {
		this.acceptingPetriNet = acceptingPetriNet;
		this.result = result;
		this.totalConsumed = 0;
		this.totalProduced = 0;
		this.totalMissing = 0;
		this.totalRemaining = 0;
		this.transExecutions = {};
		this.arcExecutions = {};
		this.totalConsumedPerPlace = {};
		this.totalProducedPerPlace = {};
		this.totalMissingPerPlace = {};
		this.totalRemainingPerPlace = {};
		for (let t in acceptingPetriNet.net.transitions) {
			this.transExecutions[t] = 0;
		}
		for (let a in acceptingPetriNet.net.arcs) {
			this.arcExecutions[a] = 0;
		}
		for (let p in acceptingPetriNet.net.places) {
			this.totalConsumedPerPlace[p] = 0;
			this.totalProducedPerPlace[p] = 0;
			this.totalMissingPerPlace[p] = 0;
			this.totalRemainingPerPlace[p] = 0;
		}
		this.totalTraces = this.result.length;
		this.fitTraces = 0;
		this.logFitness = 0.0;
		this.averageTraceFitness = 0.0;
		this.percentageFitTraces = 0.0;
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
			for (let t of res["visitedTransitions"]) {
				this.transExecutions[t]++;
				for (let a in t.inArcs) {
					this.arcExecutions[a]++;
				}
				for (let a in t.outArcs) {
					this.arcExecutions[a]++;
				}
			}
			for (let p in this.acceptingPetriNet.net.places) {
				this.totalConsumedPerPlace[p] += res["consumedPerPlace"][p];
				this.totalProducedPerPlace[p] += res["producedPerPlace"][p];
				this.totalMissingPerPlace[p] += res["missingPerPlace"][p];
				this.totalRemainingPerPlace[p] += res["remainingPerPlace"][p];
			}
			this.averageTraceFitness += res["fitness"];
		}
		let fitMC = 0.0;
		let fitRP = 0.0;
		if (this.totalConsumed > 0) {
			fitMC = 1.0 - this.totalMissing / this.totalConsumed;
		}
		if (this.totalProduced > 0) {
			fitRP = 1.0 - this.totalRemaining / this.totalProduced;
		}
		this.logFitness = 0.5*fitMC + 0.5*fitRP;
		this.averageTraceFitness = this.averageTraceFitness / this.result.length;
		this.percentageFitTraces = this.fitTraces / this.totalTraces;
	}
}

class TokenBasedReplay {
	static apply(eventLog, acceptingPetriNet, activityKey="concept:name", reachFm=true, oneReplayPerTrace=true, timestampKey="time:timestamp") {
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
			let arrTimestamp = TokenBasedReplay.getArrTimestamp(trace, timestampKey);
			if (oneReplayPerTrace && arrActivities in dictioResultsVariant) {
				ret.push(dictioResultsVariant[arrActivities]);
			}
			else {
				let thisRes = TokenBasedReplay.performTbr(arrActivities, transitionsMap, acceptingPetriNet, invisibleChain, reachFm, arrTimestamp);
				dictioResultsVariant[arrActivities] = thisRes;
				ret.push(thisRes);
			}
		}
		let finalResult = new TokenBasedReplayResult(ret, acceptingPetriNet);
		
		Pm4JS.registerObject(finalResult, "Token-Based Replay Result");
		
		return finalResult;
	}
	
	static applyListListAct(listListActivities, acceptingPetriNet, reachFm=true, retMarking=false) {
		let invisibleChain = TokenBasedReplay.buildInvisibleChain(acceptingPetriNet.net);
		let transitionsMap = {};
		for (let transId in acceptingPetriNet.net.transitions) {
			let trans = acceptingPetriNet.net.transitions[transId];
			if (trans.label != null) {
				transitionsMap[trans.label] = trans;
			}
		}
		let ret = [];
		for (let activities of listListActivities) {
			let arrTimestamp = [];
			for (let act of activities) {
				arrTimestamp.push(0);
			}
			let tbrResult = TokenBasedReplay.performTbr(activities.split(","), transitionsMap, acceptingPetriNet, invisibleChain, reachFm, arrTimestamp);
			if (retMarking) {
				let isFit = tbrResult.isFit;
				tbrResult = tbrResult.visitedMarkings;
				tbrResult = tbrResult[tbrResult.length - 1];
				tbrResult.isFit = isFit;
			}
			ret.push(tbrResult);
		}
		return ret;
	}
	
	static performTbr(activities, transitionsMap, acceptingPetriNet, invisibleChain, reachFm, arrTimestamp) {
		let marking = acceptingPetriNet.im.copy();
		let currTimestamp = arrTimestamp[0];
		if (arrTimestamp.length > 0) {
			marking.setAssociatedTimest(currTimestamp);
		}
		let consumed = 0;
		let produced = 0;
		let missing = 0;
		let remaining = 0;
		let consumedPerPlace = {};
		let producedPerPlace = {};
		let missingPerPlace = {};
		let remainingPerPlace = {};
		for (let placeId in acceptingPetriNet.net.places) {
			consumedPerPlace[placeId] = 0;
			producedPerPlace[placeId] = 0;
			missingPerPlace[placeId] = 0;
			remainingPerPlace[placeId] = 0;
		}
		for (let place in acceptingPetriNet.im.tokens) {
			produced += acceptingPetriNet.im.tokens[place];
			producedPerPlace[place] += acceptingPetriNet.im.tokens[place];
		}
		for (let place in acceptingPetriNet.fm.tokens) {
			consumed += acceptingPetriNet.fm.tokens[place];
			consumedPerPlace[place] += acceptingPetriNet.fm.tokens[place];
		}
		let visitedTransitions = [];
		let visitedTimes = [];
		let visitedMarkings = [];
		let visitedMarkingsTimes = [];
		let missingActivitiesInModel = [];
		let mainidx = 0;
		visitedMarkings.push(marking);
		visitedMarkingsTimes.push(marking.getAssociatedTimest());
		while (mainidx < activities.length) {
			let act = activities[mainidx];
			if (act in transitionsMap) {
				currTimestamp = arrTimestamp[mainidx];
				let trans = transitionsMap[act];
				let transPreMarking = trans.getPreMarking();
				let transPostMarking = trans.getPostMarking();
				let enabled = marking.getEnabledTransitions();
				let newVisitedTransitions = [];
				let newVisitedTimes = [];
				let newVisitedMarkings = [];
				let newVisitedMarkingsTimes = [];
				for (let trans of visitedTransitions) {
					newVisitedTransitions.push(trans);
				}
				for (let time of visitedTimes) {
					newVisitedTimes.push(time);
				}
				for (let mark of visitedMarkings) {
					newVisitedMarkings.push(mark);
				}
				for (let time of visitedMarkingsTimes) {
					newVisitedMarkingsTimes.push(time);
				}
				if (!(enabled.includes(trans))) {
					let internalMarking = marking.copy();
					let internalConsumed = consumed;
					let internalProduced = produced;
					let internalConsumedPerPlace = {};
					let internalProducedPerPlace = {};
					Object.assign(internalConsumedPerPlace, consumedPerPlace);
					Object.assign(internalProducedPerPlace, producedPerPlace);
					while (!(enabled.includes(trans))) {
						let transList = TokenBasedReplay.enableTransThroughInvisibles(internalMarking, transPreMarking, invisibleChain);
						if (transList == null) {
							break;
						}
						else {
							for (let internalTrans of transList) {
								let internalTransPreMarking = internalTrans.getPreMarking();
								let internalTransPostMarking = internalTrans.getPostMarking();
								let internalEnabledTrans = internalMarking.getEnabledTransitions();
								if (internalEnabledTrans.includes(internalTrans)) {
									internalMarking = internalMarking.execute(internalTrans, currTimestamp);
									newVisitedTransitions.push(internalTrans);
									newVisitedTimes.push(internalTrans.associatedTime);
									newVisitedMarkings.push(internalMarking);
									newVisitedMarkingsTimes.push(internalMarking.getAssociatedTimest());

									// counts consumed and produced tokens
									for (let place in internalTransPreMarking) {
										internalConsumed += internalTransPreMarking[place];
										internalConsumedPerPlace[place] += internalTransPreMarking[place];
									}
									for (let place in internalTransPostMarking) {
										internalProduced += internalTransPostMarking[place];
										internalProducedPerPlace[place] += internalTransPostMarking[place];
									}
								}
								else {
									transList = null;
									break;
								}
							}
							if (transList == null) {
								break;
							}
							enabled = internalMarking.getEnabledTransitions();
						}
					}
					if (enabled.includes(trans)) {
						marking = internalMarking;
						consumed = internalConsumed;
						produced = internalProduced;
						visitedTransitions = newVisitedTransitions;
						visitedTimes = newVisitedTimes;
						consumedPerPlace = internalConsumedPerPlace;
						producedPerPlace = internalProducedPerPlace;
						visitedMarkings = newVisitedMarkings;
						visitedMarkingsTimes = newVisitedMarkingsTimes;
					}
				}
				if (!(enabled.includes(trans))) {
					// inserts missing tokens
					for (let place in transPreMarking) {
						let diff = transPreMarking[place];
						if (place in marking.tokens) {
							diff -= marking.tokens[place];
						}
						place.associatedTime = currTimestamp;
						marking.tokens[place] = diff;
						missing += diff;
						missingPerPlace[place] += diff;
					}
				}
				// counts consumed and produced tokens
				for (let place in transPreMarking) {
					consumed += transPreMarking[place];
					consumedPerPlace[place] += transPreMarking[place];
				}
				for (let place in transPostMarking) {
					produced += transPostMarking[place];
					producedPerPlace[place] += transPostMarking[place];
				}
				marking = marking.execute(trans, currTimestamp);
				visitedTransitions.push(trans);
				visitedTimes.push(trans.associatedTime);
				visitedMarkings.push(marking);
				visitedMarkingsTimes.push(marking.getAssociatedTimest());
			}
			else if (!(act in missingActivitiesInModel)) {
				missingActivitiesInModel.push(act);
			}
			mainidx++;
		}
		if (reachFm) {
			if (!(acceptingPetriNet.fm.equals(marking))) {
				let internalMarking = marking.copy();
				let internalConsumed = consumed;
				let internalProduced = produced;
				let internalConsumedPerPlace = {};
				let internalProducedPerPlace = {};
				Object.assign(internalConsumedPerPlace, consumedPerPlace);
				Object.assign(internalProducedPerPlace, producedPerPlace);
				let newVisitedTransitions = [];
				let newVisitedTimes = [];
				let newVisitedMarkings = [];
				let newVisitedMarkingsTimes = [];
				for (let trans of visitedTransitions) {
					newVisitedTransitions.push(trans);
				}
				for (let time of visitedTimes) {
					newVisitedTimes.push(time);
				}
				for (let mark of visitedMarkings) {
					newVisitedMarkings.push(mark);
				}
				for (let time of visitedMarkingsTimes) {
					newVisitedMarkingsTimes.push(time);
				}
				while (!(acceptingPetriNet.fm.equals(internalMarking))) {
					let transList = TokenBasedReplay.reachFmThroughInvisibles(internalMarking, acceptingPetriNet.fm, invisibleChain);
					if (transList == null) {
						break;
					}
					else {
						for (let internalTrans of transList) {
							let internalTransPreMarking = internalTrans.getPreMarking();
							let internalTransPostMarking = internalTrans.getPostMarking();
							let internalEnabledTrans = internalMarking.getEnabledTransitions();
							if (internalEnabledTrans.includes(internalTrans)) {
								internalMarking = internalMarking.execute(internalTrans, currTimestamp);
								newVisitedTransitions.push(internalTrans);
								newVisitedTimes.push(internalTrans.associatedTime);
								newVisitedMarkings.push(internalMarking);
								newVisitedMarkingsTimes.push(internalMarking.getAssociatedTimest());
								// counts consumed and produced tokens
								for (let place in internalTransPreMarking) {
									internalConsumed += internalTransPreMarking[place];
									internalConsumedPerPlace[place] += internalTransPreMarking[place];
								}
								for (let place in internalTransPostMarking) {
									internalProduced += internalTransPostMarking[place];
									internalProducedPerPlace[place] += internalTransPostMarking[place];
								}
							}
							else {
								transList = null;
								break;
							}
						}
						if (transList == null) {
							break;
						}
					}
				}
				if (acceptingPetriNet.fm.equals(internalMarking)) {
					marking = internalMarking;
					consumed = internalConsumed;
					produced = internalProduced;
					visitedTransitions = newVisitedTransitions;
					visitedTimes = newVisitedTimes;
					consumedPerPlace = internalConsumedPerPlace;
					producedPerPlace = internalProducedPerPlace;
					visitedMarkings = newVisitedMarkings;
					visitedMarkingsTimes = newVisitedMarkingsTimes;
				}
			}
			for (let place in acceptingPetriNet.fm.tokens) {
				if (!(place in marking.tokens)) {
					missing += acceptingPetriNet.fm.tokens[place];
					missingPerPlace[place] += acceptingPetriNet.fm.tokens[place];
				}
				else if (marking.tokens[place] < acceptingPetriNet.fm.tokens[place]) {
					missing += acceptingPetriNet.fm.tokens[place] - marking.tokens[place];
					missingPerPlace[place] += acceptingPetriNet.fm.tokens[place] - marking.tokens[place];
				}
			}
			for (let place in marking.tokens) {
				if (!(place in acceptingPetriNet.fm.tokens)) {
					remaining += marking.tokens[place];
					remainingPerPlace[place] += marking.tokens[place];
				}
				else if (marking.tokens[place] > acceptingPetriNet.fm.tokens[place]) {
					remaining += marking.tokens[place] - acceptingPetriNet.fm.tokens[place];
					remainingPerPlace[place] += marking.tokens[place] - acceptingPetriNet.fm.tokens[place];
				}
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
		return {"consumed": consumed, "produced": produced, "missing": missing, "remaining": remaining, "visitedTransitions": visitedTransitions, "visitedTransitionsTimes": visitedTimes, "visitedMarkings": visitedMarkings, "visitedMarkingsTimes": visitedMarkingsTimes, "missingActivitiesInModel": missingActivitiesInModel, "fitness": fitness, "isFit": isFit, "reachedMarking": marking, "consumedPerPlace": consumedPerPlace, "producedPerPlace": producedPerPlace, "missingPerPlace": missingPerPlace, "remainingPerPlace": remainingPerPlace};
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
	
	static getArrTimestamp(trace, timestampKey) {
		let ret = [];
		for (let eve of trace.events) {
			ret.push(eve.attributes[timestampKey].value.getTime() / 1000.0);
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
	//console.log(err);
}

Pm4JS.registerAlgorithm("TokenBasedReplay", "apply", ["EventLog", "AcceptingPetriNet"], "TokenBasedReplayResult", "Perform Token Based Replay", "Alessandro Berti");
