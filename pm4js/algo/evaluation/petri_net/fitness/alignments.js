class AlignmentsFitness {
	static apply(eventLog, acceptingPetriNet, activityKey="concept:name") {
		return PetriNetAlignments.apply(eventLog, acceptingPetriNet, activityKey);
	}
	
	static evaluate(alignResults) {
		return alignResults;
	}
}

try {
	module.exports = {AlignmentsFitness: AlignmentsFitness};
	global.AlignmentsFitness = AlignmentsFitness;
}
catch (err) {
	// not in Node
	//console.log(err);
}
