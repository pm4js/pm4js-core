class EventLogToStream {
	static shallowCopy(eve0) {
		let eve = new Event();
		for (let attr in eve0.attributes) {
			eve.attributes[attr] = eve0.attributes[attr];
		}
		return eve;
	}
	
	static apply(eventLog, sortingAttribute="time:timestamp", casePrefix="case:") {
		let stream = [];
		for (let trace of eventLog.traces) {
			for (let eve0 of trace.events) {
				let eve = EventLogToStream.shallowCopy(eve0);
				for (let traceAttr in trace.attributes) {
					let traceAttrValue = trace.attributes[traceAttr];
					eve.attributes[casePrefix+traceAttr] = traceAttrValue;
				}
				stream.push(eve);
			}
		}
		stream.sort((a, b) => { return a.attributes[sortingAttribute].value - b.attributes[sortingAttribute].value });
		return stream;
	}
}

try {
	module.exports = {EventLogToStream: EventLogToStream};
	global.EventLogToStream = EventLogToStream;
}
catch (err) {
	// not in node
	//console.log(err);
}
