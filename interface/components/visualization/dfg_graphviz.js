class DfgGraphvizComponent {
	static showFrequencyDfg(frequencyDfg, component) {
		let gv = FrequencyDfgGraphvizVisualizer.apply(frequencyDfg);
		let svgXml = Viz(gv, { format: "svg"});
		document.getElementById(component).innerHTML = svgXml;
	}
	
	static showPerformanceDfg(performanceDfg, component) {
		let gv = PerformanceDfgGraphvizVisualizer.apply(performanceDfg);
		let svgXml = Viz(gv, { format: "svg"});
		document.getElementById(component).innerHTML = svgXml;
	}
}

Pm4JS.registerVisualizer("DfgGraphvizComponent", "showFrequencyDfg", "FrequencyDfg", "Show Frequency DFG (Graphviz)", "Alessandro Berti");
Pm4JS.registerVisualizer("DfgGraphvizComponent", "showPerformanceDfg", "PerformanceDfg", "Show Performance DFG (Graphviz)", "Alessandro Berti");
