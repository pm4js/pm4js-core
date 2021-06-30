class EventLog {
	constructor() {
		this.attributes = {};
		this.traces = [];
		this.extensions = {};
		this.globals = {};
		this.classifiers = {};
	}
}

class Trace {
	constructor() {
		this.attributes = {};
		this.events = [];
	}
}

class Event {
	constructor() {
		this.attributes = {};
	}
}

class LogGlobal {
	constructor() {
		this.attributes = {};
	}
}

class Attribute {
	constructor(value) {
		this.value = value;
		this.attributes = [];
	}
}


try {
	require('../../pm4js.js');
	module.exports = {EventLog: EventLog, Trace: Trace, Event: Event, LogGlobal: LogGlobal, Attribute: Attribute};
	global.EventLog = EventLog;
	global.Trace = Trace;
	global.Event = Event;
	global.LogGlobal = LogGlobal;
	global.Attribute = Attribute;
}
catch (err) {
	// not in node
}