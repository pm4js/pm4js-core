class PtmlGraphvizVanilla {
	static applyVanilla(processTree, component) {
		let gv = ProcessTreeVanillaVisualizer.apply(processTree);
		let svgXml = Viz(gv, { format: "svg"});
		document.getElementById(component).innerHTML = svgXml;
	}
}

Pm4JS.registerVisualizer("PtmlGraphvizVanilla", "applyVanilla", "ProcessTree", "Visualize Process Tree", "Alessandro Berti");
