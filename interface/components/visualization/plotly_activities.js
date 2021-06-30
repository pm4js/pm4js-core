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
}

Pm4JS.registerVisualizer("PlotlyActivities", "plotBarChar", "EventLog", "Plot Events per Activity", "Alessandro Berti");
