class LogSamplingWithInputBox {
	static getRandomSubarray(arr, size) {
		var shuffled = arr.slice(0), i = arr.length, temp, index;
		while (i--) {
			index = Math.floor((i + 1) * Math.random());
			temp = shuffled[index];
			shuffled[index] = shuffled[i];
			shuffled[i] = temp;
		}
		return shuffled.slice(0, size);
	}

	static apply(log) {
		let numTraces = parseInt(prompt("Insert the number of cases to sample"));
		let caseIdxs = [];
		for (let traceIdx in log.traces) {
			caseIdxs.push(traceIdx);
		}
		let caseIdxsSubarray = LogSamplingWithInputBox.getRandomSubarray(caseIdxs, numTraces);
		let newLog = new EventLog();
		for (let idx of caseIdxsSubarray) {
			newLog.traces.push(log.traces[idx]);
		}
		Pm4JS.registerObject(newLog, "Sampled Log ("+numTraces+" cases)");
		return newLog;
	}
}

//	static registerAlgorithm(className, methodName, inputs, outputs, description=null, authors=null) {

Pm4JS.registerAlgorithm("LogSamplingWithInputBox", "apply", ["EventLog"], "EventLog", "Sample Event Log (JS prompt)", "Alessandro Berti");
