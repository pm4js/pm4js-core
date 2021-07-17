class GeneralizationTbrVisualization {
	static apply(generalizationResult, component0) {
		let component = document.getElementById(component0);
		let generalizationSpan = document.createElement("span");
		generalizationSpan.innerHTML = "Generalization value: ";
		let generalizationValue = document.createElement("span");
		generalizationValue.innerHTML = generalizationResult.value;
		component.appendChild(generalizationSpan);
		component.appendChild(generalizationValue);
	}
}

Pm4JS.registerVisualizer("GeneralizationTbrVisualization", "apply", "GeneralizationTbrResults", "Show the Generalization", "Alessandro Berti");
