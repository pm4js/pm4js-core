class LogGeneralFiltering {
	static filterStartActivities(log, activitiesArray, positive=true, activityKey="concept:name") {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			if (trace.events.length > 0) {
				let bo = activitiesArray.includes(trace.events[0].attributes[activityKey].value);
				if ((bo && positive) || (!bo && !positive)) {
					filteredLog.traces.push(trace);
				}
			}
		}
		return filteredLog;
	}
	
	static filterEndActivities(log, activitiesArray, positive=true, activityKey="concept:name") {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			if (trace.events.length > 0) {
				let bo = activitiesArray.includes(trace.events[trace.events.length - 1].attributes[activityKey].value);
				if ((bo && positive) || (!bo && !positive)) {
					filteredLog.traces.push(trace);
				}
			}
		}
		return filteredLog;
	}
	
	static filterVariants(log, variantsArray, positive=true, activityKey="concept:name") {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			let varArray = [];
			for (let eve of trace.events) {
				if (activityKey in eve.attributes) {
					varArray.push(eve.attributes[activityKey].value);
				}
			}
			varArray = varArray.toString();
			let bo = variantsArray.includes(varArray);
			if ((bo && positive) || (!bo && !positive)) {
				filteredLog.traces.push(trace);
			}
		}
		return filteredLog;
	}
	
	static filterCaseSize(log, minSize, maxSize) {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			if (minSize <= trace.events.length && trace.events.length <= maxSize) {
				filteredLog.traces.push(trace);
			}
		}
		return filteredLog;
	}
	
	static filterCaseDuration(log, minDuration, maxDuration, timestamp_key="time:timestamp") {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			if (trace.events.length > 0) {
				let st = trace.events[0].attributes[timestamp_key].value.getTime();
				let et = trace.events[trace.events.length-1].attributes[timestamp_key].value.getTime();
				let diff = (et - st) / 1000;
				if (minDuration <= diff && diff <= maxDuration) {
					filteredLog.traces.push(trace);
				}
			}
		}
		return filteredLog;
	}
	
	static filterCasesHavingEventAttributeValue(log, valuesArray, positive=true, attributeKey="concept:name") {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			let bo = false;
			for (let eve of trace.events) {
				if (attributeKey in eve.attributes) {
					let val = eve.attributes[attributeKey].value;
					bo = bo || valuesArray.includes(val);
				}
			}
			if ((bo && positive) || (!bo && !positive)) {
				filteredLog.traces.push(trace);
			}
		}
		return filteredLog;
	}
	
	static filterEventsHavingEventAttributeValues(log, valuesArray, addEvenIfEmpty=false, positive=true, attributeKey="concept:name") {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			let newTrace = new Trace();
			for (let eve of trace.events) {
				if (attributeKey in eve.attributes) {
					let val = eve.attributes[attributeKey].value;
					let bo = valuesArray.includes(val);
					if ((bo && positive) || (!bo && !positive)) {
						newTrace.events.push(eve);
					}
				}
			}
			if (addEvenIfEmpty || newTrace.events.length > 0) {
				filteredLog.traces.push(newTrace);
			}
		}
		return filteredLog;
	}
	
	static filterRework(log, activity, minOccurrences, activityKey="concept:name") {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			let actOcc = {};
			for (let eve of trace.events) {
				let act = eve.attributes[activityKey];
				if (act != null) {
					act = act.value;
					if (!(act in actOcc)) {
						actOcc[act] = 0;
					}
					actOcc[act] += 1;
				}
			}
			if (activity in actOcc && actOcc[activity] >= minOccurrences) {
				filteredLog.traces.push(trace);
			}
		}
		return filteredLog;
	}
	
	static filterBetween(log, activity1, activity2, activityKey="concept:name") {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			let a1Idx = -1;
			let i = 0;
			while (i < trace.events.length) {
				let eve = trace.events[i];
				let act = eve.attributes[activityKey];
				if (act != null) {
					act = act.value;
					if (act == activity1) {
						a1Idx = i;
					}
					else if (act == activity2 && a1Idx > -1) {
						let newTrace = new Trace();
						let j = a1Idx;
						while (j <= i) {
							newTrace.events.push(trace.events[j]);
							j++;
						}
						filteredLog.traces.push(newTrace);
						a1Idx = -1;
					}
				}
				i++;
			}
		}
		return filteredLog;
	}
	
	static filterPrefixes(log, activity, strict=true, activityKey="concept:name") {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			let activities = [];
			for (let eve of trace.events) {
				if (activityKey in eve.attributes) {
					activities.push(eve.attributes[activityKey].value);
				}
			}
			let idx = activities.indexOf(activity);
			if (idx > -1) {
				if (strict) {
					idx--;
				}
				let filteredTrace = new Trace();
				let i = 0;
				while (i <= idx) {
					filteredTrace.events.push(trace.events[i]);
					i++;
				}
				filteredLog.traces.push(filteredTrace);
			}
		}
		return filteredLog;
	}
	
	static filterSuffixes(log, activity, strict=true, activityKey="concept:name") {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			let activities = [];
			for (let eve of trace.events) {
				if (activityKey in eve.attributes) {
					activities.push(eve.attributes[activityKey].value);
				}
			}
			let idx = activities.lastIndexOf(activity);
			if (idx > -1) {
				if (strict) {
					idx++;
				}
				let filteredTrace = new Trace();
				let i = idx;
				while (i < trace.events.length) {
					filteredTrace.events.push(trace.events[i]);
					i++;
				}
				filteredLog.traces.push(filteredTrace);
			}
		}
		return filteredLog;
	}
	
	static filterFullTextEvents(log, attribute, searchString) {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			let filteredTrace = new Trace();
			for (let eve of trace.events) {
				if (attribute in eve.attributes) {
					let value = eve.attributes[attribute].value;
					if (value.indexOf(searchString) > -1) {
						filteredTrace.events.push(eve);
					}
				}
			}
			if (filteredTrace.events.length > 0) {
				filteredLog.traces.push(filteredTrace);
			}
		}
		return filteredLog;
	}
	
	static filterFullTextCases(log, attribute, searchString) {
		let filteredLog = new EventLog();
		for (let trace of log.traces) {
			let toInclude = false;
			for (let eve of trace.events) {
				if (attribute in eve.attributes) {
					let value = eve.attributes[attribute].value;
					if (value.indexOf(searchString) > -1) {
						toInclude = true;
					}
				}
			}
			if (toInclude) {
				filteredLog.traces.push(trace);
			}
		}
		return filteredLog;
	}
}

try {
	module.exports = {LogGeneralFiltering: LogGeneralFiltering};
	global.LogGeneralFiltering = LogGeneralFiltering;
}
catch (err) {
	// not in Node
}