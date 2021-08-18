class GeneralizationTbrResults {
	constructor(value) {
		this.value = value;
	}
}

class GeneralizationTbr {
	static apply(tbrResults) {
		let invSqOccSum = 0.0
		for (let trans in tbrResults.transExecutions) {
			let thisTerm = 1.0 / Math.sqrt(Math.max(tbrResults.transExecutions[trans], 1));
			invSqOccSum += thisTerm;
		}
		let ret = new GeneralizationTbrResults(1.0 - invSqOccSum/(Object.keys(tbrResults.transExecutions).length));
		Pm4JS.registerObject(ret, "Generalization Results");
		return ret;
	}
}

try {
	require("../../../../pm4js.js");
	require("../../../conformance/tokenreplay/algorithm.js");
	module.exports = {GeneralizationTbr: GeneralizationTbr, GeneralizationTbrResults: GeneralizationTbrResults};
	global.GeneralizationTbr = GeneralizationTbr;
	global.GeneralizationTbrResults = GeneralizationTbrResults;
}
catch (err) {
	// not in Node
	console.log(err);
}

Pm4JS.registerAlgorithm("GeneralizationTbr", "apply", ["TokenBasedReplayResult"], "GeneralizationTbrResults", "Calculate Generalization", "Alessandro Berti");
