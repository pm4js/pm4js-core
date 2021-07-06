function startVisualizingObj(ev, obj) {
	objectToConsider = obj;
	operation = "visualising";
	document.getElementById("level1Title").innerHTML = "<h3>Select the visualizer among the available ones</h3>";
	populateLevel(document.getElementById("availableMethods"), 1, getAvailableVisualizers(obj));
	$('#pm4jsAlgoPopup').show();
	ev.preventDefault();
}

function getAvailableVisualizers(obj) {
	let ret = [];
	for (let method of Pm4JS.visualizers) {
		if (method["input"] == obj["object"].constructor.name) {
			ret.push(method);
		}
	}
	return ret;
}

function level1ApplyVisualization() {
	try {
		let selectedObject = objectToConsider;
		let availableMethods = getAvailableVisualizers(selectedObject);
		let selectedMethod = availableMethods[levelsSelected["1"][0]];
		let args = '...args';
		let body = 'let [a,b]= args; return '+selectedMethod['className']+"."+selectedMethod['methodName']+'(a, b)';
		myFunc = new Function(args, body);
		document.getElementById("visualizationContent").innerHTML = "";
		myFunc(selectedObject["object"], "visualizationContent");
		$('#visualizationPopup').show();
	}
	catch (err) {
		alert("Visualization failed");
		console.log(err);
	}
}

$('#visualizationPopupClose').click(function(){
	$('#visualizationPopup').hide();
});
