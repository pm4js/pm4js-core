class LogMerging {
	static apply(log1, log2) {
		let newEventLog = new EventLog();
		for (let trace of log1.traces) {
			newEventLog.traces.push(trace);
		}
		for (let trace of log2.traces) {
			newEventLog.traces.push(trace);
		}
		Pm4JS.registerObject(newEventLog, "Merged Log ("+newEventLog.traces.length+" cases)");
		return newEventLog;
	}
}

Pm4JS.registerAlgorithm("LogMerging", "apply", ["EventLog", "EventLog"], "EventLog", "Merge Event Logs", "Alessandro Berti");
