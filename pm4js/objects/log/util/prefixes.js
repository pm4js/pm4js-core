class EventLogPrefixes {
	static apply(eventLog, activityKey="concept:name") {
		let prefixes = {};
		let i = 0;
		for (let trace of eventLog.traces) {
			i = 0;
			let actArray = [];
			while (i < trace.events.length - 1) {
				let act = trace.events[i].attributes[activityKey].value;
				let nextAct = trace.events[i+1].attributes[activityKey].value;
				actArray.push(act);
				if (!(actArray in prefixes)) {
					prefixes[actArray] = {};
				}
				if (!(nextAct in prefixes[actArray])) {
					prefixes[actArray][nextAct] = 0;
				}
				prefixes[actArray][nextAct] += 1;
				i++;
			}
		}
		return prefixes;
	}
}

try {
	module.exports = {EventLogPrefixes: EventLogPrefixes};
	global.EventLogPrefixes = EventLogPrefixes;
}
catch (err) {
	// not in node
	//console.log(err);
}
