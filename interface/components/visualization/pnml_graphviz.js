class PnmlGraphvizVanilla {
	static applyVanilla(acceptingPetriNet, component) {
		let gv = PetriNetVanillaVisualizer.apply(acceptingPetriNet);
		let svgXml = Viz(gv, { format: "svg"});
		document.getElementById(component).innerHTML = svgXml;
	}
}

Pm4JS.registerVisualizer("PnmlGraphvizVanilla", "applyVanilla", "AcceptingPetriNet", "Show Accepting Petri Net (Graphviz; vanilla)", "Alessandro Berti");
