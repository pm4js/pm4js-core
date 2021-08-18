class ETConformanceResult {
	constructor(activatedTransitions, escapingEdges, precision) {
		this.activatedTransitions = activatedTransitions;
		this.escapingEdges = escapingEdges;
		this.precision = precision;
	}
}

class ETConformance {
	static apply(eventLog, acceptingPetriNet, activityKey="concept:name") {
		let prefixes = EventLogPrefixes.apply(eventLog, activityKey);
		let prefixesKeys = Object.keys(prefixes);
		let ret = TokenBasedReplay.applyListListAct(prefixesKeys, acceptingPetriNet, false, true);
		let i = 0;
		let sum_at = 0;
		let sum_ee = 0;
		let logTransitions = Object.keys(GeneralLogStatistics.getStartActivities(eventLog, activityKey));
		let activatedTransitions = PetriNetReachableVisibleTransitions.apply(acceptingPetriNet.net, acceptingPetriNet.im);
		let escapingEdges = [];
		for (let at of activatedTransitions) {
			if (!(logTransitions.includes(at))) {
				escapingEdges.push(at);
			}
		}
		sum_at += activatedTransitions.length * eventLog.traces.length;
		sum_ee += escapingEdges.length * eventLog.traces.length;
		i = 0;
		while (i < prefixesKeys.length) {
			if (ret[i].isFit) {
				let activatedTransitions = PetriNetReachableVisibleTransitions.apply(acceptingPetriNet.net, ret[i]);
				let prefix = prefixesKeys[i];
				let logTransitions = Object.keys(prefixes[prefix]);
				let sumPrefix = 0;
				for (let transition of logTransitions) {
					sumPrefix += prefixes[prefix][transition];
				}
				let escapingEdges = [];
				for (let at of activatedTransitions) {
					if (!(logTransitions.includes(at))) {
						escapingEdges.push(at);
					}
				}
				sum_at += activatedTransitions.length * sumPrefix;
				sum_ee += escapingEdges.length * sumPrefix;
			}
			i++;
		}
		let precision = 1.0;
		if (sum_at > 0) {
			precision = 1.0 - (sum_ee / (0.0 + sum_at));
		}
		let ret = new ETConformanceResult(sum_at, sum_ee, precision);
		Pm4JS.registerObject(ret, "Precision Results");
		return ret;
	}
}

try {
	require("../../../../pm4js.js");
	require("../../../../objects/petri_net/petri_net.js");
	require("../../../../objects/petri_net/util/reachable_visible_transitions.js");
	require("../../../../statistics/log/general.js");
	module.exports = {ETConformance: ETConformance, ETConformanceResult: ETConformanceResult};
	global.ETConformance = ETConformance;
	global.ETConformanceResult = ETConformanceResult;
}
catch (err) {
	// not in Node
	//console.log(err);
}

Pm4JS.registerAlgorithm("ETConformance", "apply", ["EventLog", "AcceptingPetriNet"], "ETConformanceResult", "Calculate Precision (ETConformance based on TBR)", "Alessandro Berti");
