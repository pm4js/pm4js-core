class GeneralLogStatistics {
	static getStartActivities(log, activityKey="concept:name") {
		let ret = {};
		for (let trace of log.traces) {
			if (trace.events.length > 0) {
				if (activityKey in trace.events[0].attributes) {
					let act = trace.events[0].attributes[activityKey].value;
					let count = ret[act]
					if (count == null) {
						ret[act] = 1;
					}
					else {
						ret[act] = count + 1;
					}
				}
			}
		}
		return ret;
	}
	
	static getEndActivities(log, activityKey="concept:name") {
		let ret = {};
		for (let trace of log.traces) {
			if (trace.events.length > 0) {
				if (activityKey in trace.events[trace.events.length-1].attributes) {
					let act = trace.events[trace.events.length-1].attributes[activityKey].value;
					let count = ret[act]
					if (count == null) {
						ret[act] = 1;
					}
					else {
						ret[act] = count + 1;
					}
				}
			}
		}
		return ret;
	}
	
	static getAttributeValues(log, attributeKey) {
		let ret = {};
		for (let trace of log.traces) {
			for (let eve of trace.events) {
				if (attributeKey in eve.attributes) {
					let val = eve.attributes[attributeKey].value;
					let count = ret[val];
					if (count == null) {
						ret[val] = 1;
					}
					else {
						ret[val] = count + 1;
					}
				}
			}
		}
		return ret;
	}
	
	static getTraceAttributeValues(log, attributeKey) {
		let ret = {};
		for (let trace of log.traces) {
			if (attributeKey in trace.attributes) {
				let val = trace.attributes[attributeKey].value;
				let count = ret[val];
				if (count == null) {
					ret[val] = 1;
				}
				else {
					ret[val] = count + 1;
				}
			}
		}
		return ret;
	}
	
	static getVariants(log, activityKey="concept:name") {
		let ret = {};
		for (let trace of log.traces) {
			let activities = [];
			for (let eve of trace.events) {
				if (activityKey in eve.attributes) {
					let act = eve.attributes[activityKey].value;
					activities.push(act);
				}
			}
			activities = activities.toString();
			let count = ret[activities];
			if (count == null) {
				ret[activities] = 1
			}
			else {
				ret[activities] = count + 1;
			}
		}
		return ret;
	}
	
	static getEventAttributesList(log) {
		let ret = {};
		for (let trace of log.traces) {
			for (let eve of trace.events) {
				for (let attr in eve.attributes) {
					ret[attr] = 0;
				}
			}
		}
		return Object.keys(ret);
	}
	
	static getCaseAttributesList(log) {
		let ret = {};
		for (let trace of log.traces) {
			for (let attr in trace.attributes) {
				ret[attr] = 0;
			}
		}
		return Object.keys(ret);
	}
	
	static getEventAttributesWithType(log) {
		let ret = {};
		for (let trace of log.traces) {
			for (let eve of trace.events) {
				for (let attr in eve.attributes) {
					if (!(attr in ret)) {
						ret[attr] = typeof eve.attributes[attr].value;
					}
				}
			}
		}
		return ret;
	}
	
	static getTraceAttributesWithType(log) {
		let ret = {};
		for (let trace of log.traces) {
			for (let attr in trace.attributes) {
				ret[attr] = typeof trace.attributes[attr].value;
			}
		}
		return ret;
	}
	
	static numEvents(log) {
		let ret = 0;
		for (let trace of log.traces) {
			ret += trace.events.length;
		}
		return ret;
	}
	
	static getAverageSojournTime(log, activityKey="concept:name", completeTimestamp="time:timestamp", startTimestamp="time:timestamp") {
		let sojTime = {}
		for (let trace of log.traces) {
			for (let eve of trace.events) {
				if (activityKey in eve.attributes && startTimestamp in eve.attributes && completeTimestamp in eve.attributes) {
					let acti = eve.attributes[activityKey].value;
					if (!(acti in sojTime)) {
						sojTime[acti] = [];
					}
					let st = eve.attributes[startTimestamp].value;
					let et = eve.attributes[completeTimestamp].value;
					let diff = 0;
					if (BusinessHours.ENABLED) {
						diff = BusinessHours.apply(st, et);
					}
					else {
						st = st.getTime();
						et = et.getTime();
						diff = (et - st)*1000;
					}
					sojTime[acti].push(diff);
				}
			}
		}
		for (let acti in sojTime) {
			let sum = 0.0;
			for (let val of sojTime[acti]) {
				sum += val;
			}
			sojTime[acti] = sum / sojTime[acti].length;
		}
		return sojTime;
	}
	
	static resourceActivityPattern(eventLog, activityKey="concept:name", resourceKey="org:resource") {
		let activities = Object.keys(GeneralLogStatistics.getAttributeValues(eventLog, activityKey));
		let resources = Object.keys(GeneralLogStatistics.getAttributeValues(eventLog, resourceKey));
		let resActPatt = {};
		for (let res of resources) {
			resActPatt[res] = [];
			for (let act of activities) {
				resActPatt[res].push(0);
			}
		}
		for (let trace of eventLog.traces) {
			for (let eve of trace.events) {
				let act = eve.attributes[activityKey];
				let res = eve.attributes[resourceKey];
				if (act != null && res != null) {
					act = act.value;
					res = res.value;
					resActPatt[res][activities.indexOf(act)] += 1;
				}
			}
		}
		return {"resActPatt": resActPatt, "activities": activities};
	}
	
	static activityResourcePattern(eventLog, activityKey="concept:name", resourceKey="org:resource") {
		let activities = Object.keys(GeneralLogStatistics.getAttributeValues(eventLog, activityKey));
		let resources = Object.keys(GeneralLogStatistics.getAttributeValues(eventLog, resourceKey));
		let actResPatt = {};
		for (let act of activities) {
			actResPatt[act] = [];
			for (let res of resources) {
				actResPatt[act].push(0);
			}
		}
		for (let trace of eventLog.traces) {
			for (let eve of trace.events) {
				let act = eve.attributes[activityKey];
				let res = eve.attributes[resourceKey];
				if (act != null && res != null) {
					act = act.value;
					res = res.value;
					actResPatt[act][resources.indexOf(res)] += 1;
				}
			}
		}
		return {"actResPatt": actResPatt, "resources": resources}
	}
	
	static subcontracting(eventLog, resourceKey="org:resource") {
		let subc = {};
		for (let trace of eventLog.traces) {
			let i = 0;
			while (i < trace.events.length - 2) {
				let ri = trace.events[i].attributes[resourceKey];
				let ri1 = trace.events[i+1].attributes[resourceKey];
				let ri2 = trace.events[i+2].attributes[resourceKey];
				if (ri != null && ri1 != null && ri2 != null) {
					ri = ri.value;
					ri1 = ri1.value;
					ri2 = ri2.value;
					if (ri != ri1 && ri == ri2) {
						// subcontracting happens
						if (!(ri in subc)) {
							subc[ri] = {};
						}
						if (!(ri1 in subc[ri])) {
							subc[ri][ri1] = [];
						}
						subc[ri][ri1].push([trace, i, i+2]);
					}
				}
				i++;
			}
		}
		return subc;
	}
	
	static workingTogether(eventLog, resourceKey="org:resource") {
		let wt = {};
		for (let trace of eventLog.traces) {
			let originators = {};
			for (let eve of trace.events) {
				let res = eve.attributes[resourceKey];
				if (res != null) {
					res = res.value;
					originators[res] = 0;
				}
			}
			for (let res1 in originators) {
				for (let res2 in originators) {
					if (res1 != res2) {
						if (!(res1 in wt)) {
							wt[res1] = {};
						}
						if (!(res2 in wt)) {
							wt[res2] = {};
						}
						if (!(res2 in wt[res1])) {
							wt[res1][res2] = 0;
						}
						if (!(res1 in wt[res2])) {
							wt[res2][res1] = 0;
						}
						wt[res1][res2] += 1;
						wt[res2][res1] += 1;
					}
				}
			}
		}
		return wt;
	}
	
	static activitiesOccurrencesPerCase(eventLog, activityKey="concept:name") {
		let activities = Object.keys(GeneralLogStatistics.getAttributeValues(eventLog, activityKey));
		let occurrences = {};
		for (let act of activities) {
			occurrences[act] = [];
		}
		for (let trace of eventLog.traces) {
			let occ = {};
			for (let eve of trace.events) {
				let activity = eve.attributes[activityKey];
				if (activity != null) {
					activity = activity.value;
					if (!(activity in occ)) {
						occ[activity] = 0;
					}
					occ[activity] += 1;
				}
			}
			for (let act of activities) {
				if (act in occ) {
					occurrences[act].push(occ[act]);
				}
				else {
					occurrences[act].push(0);
				}
			}
		}
		return occurrences;
	}
	
	static projectOnAttributeValues(eventLog, attributeKey="concept:name") {
		let ret = [];
		for (let trace of eventLog.traces) {
			let arr = [];
			for (let eve of trace.events) {
				let val = eve.attributes[attributeKey];
				if (val != null) {
					arr.push(val.value);
				}
				else {
					arr.push(null);
				}
			}
			ret.push(arr);
		}
		return ret;
	}
}

try {
	module.exports = {GeneralLogStatistics: GeneralLogStatistics};
	global.GeneralLogStatistics = GeneralLogStatistics;
}
catch (err) {
	// not in node
	//console.log(err);
}
