class TbrFitness {
	static apply(eventLog, acceptingPetriNet, activityKey="concept:name") {
		return TokenBasedReplay.apply(eventLog, acceptingPetriNet, activityKey);
	}
	
	static evaluate(tbrResults) {
		return tbrResults;
	}
}

try {
	module.exports = {TbrFitness: TbrFitness};
	global.TbrFitness = TbrFitness;
}
catch (err) {
	// not in Node
	//console.log(err);
}
