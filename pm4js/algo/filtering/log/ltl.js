class LtlFiltering {
	static fourEyesPrinciple(log0, activity1, activity2, positive=false, activityKey="concept:name", resourceKey="org:resource") {
		let log = LogGeneralFiltering.filterEventsHavingEventAttributeValues(log0, [activity1, activity2], true, true, activityKey);
		let filteredLog = new EventLog();
		let j = 0;
		while (j < log0.traces.length) {
			let trace = log.traces[j];
			let i = 0;
			let bo = false;
			while (i < trace.events.length - 1) {
				if (trace.events[i].attributes[activityKey].value == activity1 && trace.events[i+1].attributes[activityKey].value == activity2) {
					if (!(positive) && (trace.events[i].attributes[resourceKey].value == trace.events[i+1].attributes[resourceKey].value)) {
						bo = true;
					}
					else if (positive && (trace.events[i].attributes[resourceKey].value != trace.events[i+1].attributes[resourceKey].value)) {
						bo = true;
					}
				}
				i++;
			}
			if (bo) {
				filteredLog.traces.push(log0.traces[j]);
			}
			j++;
		}
		return filteredLog;
	}
	
	static eventuallyFollowsFilter(log0, activities, positive=true, activityKey="concept:name") {
		let activitiesJoin = activities.join(",");
		let log = LogGeneralFiltering.filterEventsHavingEventAttributeValues(log0, activities, true, true, activityKey);
		let filteredLog = new EventLog();
		let j = 0;
		while (j < log0.traces.length) {
			let trace = log.traces[j];
			let i = 0;
			let bo = false;
			while (i < trace.events.length - activities.length + 1) {
				let currActivities = [];
				let z = i;
				while (z < trace.events.length) {
					currActivities.push(trace.events[z].attributes[activityKey].value);
					z++;
				}
				let currActivitiesJoin = currActivities.join(",");
				if (activitiesJoin == currActivitiesJoin) {
					bo = true;
					break;
				}
				i++;
			}
			if ((positive && bo) || !(positive || bo)) {
				filteredLog.traces.push(log0.traces[j]);
			}
			j++;
		}
		return filteredLog;
	}
	
	static directlyFollowsFilter(log0, activities, positive=true, activityKey="concept:name") {
		let activitiesJoin = activities.join(",");
		let log = log0;
		let filteredLog = new EventLog();
		let j = 0;
		while (j < log0.traces.length) {
			let trace = log.traces[j];
			let i = 0;
			let bo = false;
			while (i < trace.events.length - activities.length + 1) {
				let currActivities = [];
				let z = i;
				while (z < trace.events.length) {
					currActivities.push(trace.events[z].attributes[activityKey].value);
					z++;
				}
				let currActivitiesJoin = currActivities.join(",");
				if (activitiesJoin == currActivitiesJoin) {
					bo = true;
					break;
				}
				i++;
			}
			if ((positive && bo) || !(positive || bo)) {
				filteredLog.traces.push(log0.traces[j]);
			}
			j++;
		}
		return filteredLog;
	}
	
	static activityDoneDifferentResources(log0, activity, positive=true, activityKey="concept:name", resourceKey="org:resource") {
		let log = LogGeneralFiltering.filterEventsHavingEventAttributeValues(log0, [activity], true, true, activityKey);
		let filteredLog = new EventLog();
		let j = 0;
		while (j < log0.traces.length) {
			let trace = log.traces[j];
			let i = 0;
			let bo = false;
			while (i < trace.events.length - 1) {
				if (trace.events[i].attributes[resourceKey].value != trace.events[i+1].attributes[resourceKey].value) {
					bo = true;
					break;
				}
				i++;
			}
			if ((positive && bo) || !(positive || bo)) {
				filteredLog.traces.push(log0.traces[j]);
			}
			j++;
		}
		return filteredLog;
	}
}

try {
	module.exports = {LtlFiltering: LtlFiltering};
	global.LtlFiltering = LtlFiltering;
}
catch (err) {
	// not in Node
}
