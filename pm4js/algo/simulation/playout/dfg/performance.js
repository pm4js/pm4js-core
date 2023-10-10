class PerformanceDfgSimulation {
	static choiceFromProbDct(dct) {
		let choices = [];
		let prob = [];
		let cumprob = 0.0;
		for (let k in dct) {
			choices.push(k);
			cumprob += dct[k];
			prob.push(cumprob);
		}
		let rr = Math.random();
		let i = 0;
		while (i < choices.length) {
			if (prob[i] > rr) {
				return choices[i];
			}
			i++;
		}
	}
	
	static apply(performanceDfg, numDesideredTraces=1000, activityKey="concept:name", timestampKey="time:timestamp", caseArrivalRate=1) {
		let artificialDfg = performanceDfg.getArtificialDfg();
		let outgoing = {};
		for (let path0 in artificialDfg[1]) {
			let path = path0.split(",");
			if (!(path[0] in outgoing)) {
				outgoing[path[0]] = {};
			}
			outgoing[path[0]][path[1]] = artificialDfg[1][path0] / artificialDfg[0][path[0]];
		}
		let eventLog = new EventLog();
		let timestamp = 10000000;
		let i = 0;
		while (i < numDesideredTraces) {
			timestamp += 1;
			let currTraceTimestampTrace = 0 + timestamp;
			let trace = new Trace();
			eventLog.traces.push(trace);
			let currActivity = "▶";
			while (currActivity != "■") {
				let nextActivity = PerformanceDfgSimulation.choiceFromProbDct(outgoing[currActivity]);
				if (currActivity != "▶" && nextActivity != "■") {
					let path = [currActivity, nextActivity];
					let pathPerformance = performanceDfg.pathsPerformance[path];
					if (pathPerformance > 0) {
						let exp = new ExponentialRandomVariable(1.0 / pathPerformance);
						currTraceTimestampTrace += exp.getValue();
					}
				}
				if (nextActivity != "■") {
					let eve = new Event();
					eve.attributes[activityKey] = new Attribute(nextActivity);
					eve.attributes[timestampKey] = new Attribute(new Date(currTraceTimestampTrace*1000));
					trace.events.push(eve);
				}
				currActivity = nextActivity;
			}
			i++;
		}
		Pm4JS.registerObject(eventLog, "Simulated Event log (performance simulation from DFG)");
		return eventLog;
	}
}

try {
	module.exports = {PerformanceDfgSimulation: PerformanceDfgSimulation};
	global.PerformanceDfgSimulation = PerformanceDfgSimulation;
}
catch (err) {
	// not in Node
}

Pm4JS.registerAlgorithm("PerformanceDfgSimulation", "apply", ["PerformanceDfg"], "EventLog", "Perform Playout on a Performance DFG (performance simulation)", "Alessandro Berti");
