class PnmlGraphvizVanilla {
	static applyVanilla(acceptingPetriNet, component) {
		let gv = PetriNetVanillaVisualizer.apply(acceptingPetriNet);
		let svgXml = Viz(gv, { format: "svg"});
		document.getElementById(component).innerHTML = svgXml;
	}
	
	static applyFrequency(tbrResults, component) {
		let gv = PetriNetFrequencyVisualizer.apply(tbrResults.acceptingPetriNet, tbrResults);
		let svgXml = Viz(gv, { format: "svg"});
		document.getElementById(component).innerHTML = svgXml;
	}
}

Pm4JS.registerVisualizer("PnmlGraphvizVanilla", "applyVanilla", "AcceptingPetriNet", "Show Accepting Petri Net (Graphviz; vanilla)", "Alessandro Berti");
Pm4JS.registerVisualizer("PnmlGraphvizVanilla", "applyFrequency", "TokenBasedReplayResult", "Show Accepting Petri net decorated with TBR results", "Alessandro Berti");
