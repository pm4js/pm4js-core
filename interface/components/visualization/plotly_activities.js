class PlotlyActivities {
	static plotBarChar(event_log, component) {
		let xy = GeneralLogStatistics.getAttributeValues(event_log, "concept:name");
		let x = [];
		let y = [];
		for (let act in xy) {
			x.push(act);
			y.push(xy[act]);
		}
		var data = [{x: x, y: y, type: 'bar'}];
		var layout = {title: "Events per Activity", width: 1000, height: 400};
		Plotly.newPlot(component, data, layout);
	}
	
	static plotBarCharEndActivities(event_log, component) {
		let xy = GeneralLogStatistics.getEndActivities(event_log, "concept:name");
		let x = [];
		let y = [];
		for (let act in xy) {
			x.push(act);
			y.push(xy[act]);
		}
		var data = [{x: x, y: y, type: 'bar'}];
		var layout = {title: "End Activities (n. cases)", width: 1000, height: 400};
		Plotly.newPlot(component, data, layout);
	}
	
	static plotBarCharStartActivities(event_log, component) {
		let xy = GeneralLogStatistics.getStartActivities(event_log, "concept:name");
		let x = [];
		let y = [];
		for (let act in xy) {
			x.push(act);
			y.push(xy[act]);
		}
		var data = [{x: x, y: y, type: 'bar'}];
		var layout = {title: "Start Activities (n. cases)", width: 1000, height: 400};
		Plotly.newPlot(component, data, layout);
	}
}

Pm4JS.registerVisualizer("PlotlyActivities", "plotBarChar", "EventLog", "Plot Events per Activity", "Alessandro Berti");
Pm4JS.registerVisualizer("PlotlyActivities", "plotBarCharEndActivities", "EventLog", "Plot End Activities", "Alessandro Berti");
Pm4JS.registerVisualizer("PlotlyActivities", "plotBarCharStartActivities", "EventLog", "Plot Start Activities", "Alessandro Berti");
