class SimplicityVisualization {
	static apply(simplicityResult, component0) {
		let component = document.getElementById(component0);
		let simplicitySpan = document.createElement("span");
		simplicitySpan.innerHTML = "Simplicity value: ";
		let simplicityValue = document.createElement("span");
		simplicityValue.innerHTML = simplicityResult.value;
		component.appendChild(simplicitySpan);
		component.appendChild(simplicityValue);
	}
}

Pm4JS.registerVisualizer("SimplicityVisualization", "apply", "SimplicityArcDegreeResults", "Show the Simplicity (Arc Degree)", "Alessandro Berti");
