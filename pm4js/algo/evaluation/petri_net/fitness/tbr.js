class TbrFitness {
	static apply(eventLog, acceptingPetriNet) {
		return TokenBasedReplay.apply(eventLog, acceptingPetriNet);
	}
	
	static evaluate(tbrResults) {
		return tbrResults;
	}
}

try {
	require("../../../../pm4js.js");
	require("../../../conformance/tokenreplay/algorithm.js");
	module.exports = {TbrFitness: TbrFitness};
	global.TbrFitness = TbrFitness;
}
catch (err) {
	// not in Node
	//console.log(err);
}
