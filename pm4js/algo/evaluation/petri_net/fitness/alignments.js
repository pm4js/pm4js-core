class AlignmentsFitness {
	static apply(eventLog, acceptingPetriNet) {
		return PetriNetAlignments.apply(eventLog, acceptingPetriNet);
	}
	
	static evaluate(alignResults) {
		return alignResults;
	}
}

try {
	require("../../../../pm4js.js");
	require("../../../conformance/alignments/petri_net/algorithm.js");
	module.exports = {AlignmentsFitness: AlignmentsFitness};
	global.AlignmentsFitness = AlignmentsFitness;
}
catch (err) {
	// not in Node
	//console.log(err);
}
