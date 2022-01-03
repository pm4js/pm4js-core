class EventLogToStream {
	static apply(eventLog, sortingAttribute="time:timestamp") {
		let stream = [];
		for (let trace of eventLog.traces) {
			for (let eve of trace.events) {
				stream.push(eve);
			}
		}
		stream.sort((a, b) => { return a.attributes[sortingAttribute].value - b.attributes[sortingAttribute].value });
		return stream;
	}
}

try {
	require('../../../pm4js.js');
	module.exports = {EventLogToStream: EventLogToStream};
	global.EventLogToStream = EventLogToStream;
}
catch (err) {
	// not in node
	//console.log(err);
}
