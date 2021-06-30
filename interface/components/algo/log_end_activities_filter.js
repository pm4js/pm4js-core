class LogEndActivitiesFilter {
	static apply(log) {
		let endActivities = GeneralLogStatistics.getEndActivities(log, "concept:name");
		document.getElementById("wizardTitle").innerHTML = "Filter End Activities";
		let container = document.getElementById("wizardContent");
		container.innerHTML = "";
		let explanation = document.createElement("div");
		explanation.innerHTML = "Please select the allowed end activities";
		container.appendChild(explanation);
		let selection = document.createElement("select");
		selection.setAttribute("id", "endActivitiesFilterSelect");
		selection.setAttribute("multiple", "");
		container.appendChild(selection);
		for (let act in endActivities) {
			let count = endActivities[act];
			let opt = document.createElement("option");
			opt.value = act;
			opt.innerHTML = act+" ("+count+")";
			opt.selected = true;
			selection.appendChild(opt);
		}
		wizardCallback = function() { LogEndActivitiesFilter.applyFilterAfterSelection(log); };
		$('#wizardPopup').show();
	}
	
	static applyFilterAfterSelection(log) {
		let selectedEndActivities = [];
		for (let opt of document.getElementById("endActivitiesFilterSelect").childNodes) {
			console.log(opt);
			if (opt.selected) {
				selectedEndActivities.push(opt.value);
			}
		}
		let newLog = new EventLog();
		for (let trace of log.traces) {
			if (trace.events.length > 0) {
				let evs = trace.events;
				if (selectedEndActivities.includes(evs[evs.length-1].attributes["concept:name"].value)) {
					newLog.traces.push(trace);
				}
			}
		}
		Pm4JS.registerObject(newLog, "Filtered Log ("+newLog.traces.length+" cases)");
		return newLog;
	}
}

Pm4JS.registerAlgorithm("LogEndActivitiesFilter", "apply", ["EventLog"], "EventLog", "Filter by End Activities", "Alessandro Berti");
