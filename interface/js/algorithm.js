function applyAlgorithm() {
	selectedObjects = null;
	selectedObjects = [];
	for (let objIdx of levelsSelected["0"]) {
		selectedObjects.push(Pm4JS.objects[objIdx]);
	}
	let availableAlgorithms = getAvailableAlgorithms();
	operation = "algorithm";
	document.getElementById("level1Title").innerHTML = "<h3>Select the algorithm among the available ones</h3>";
	populateLevel(document.getElementById("availableMethods"), 1, availableAlgorithms);
	$('#pm4jsAlgoPopup').show();
}

function getAvailableAlgorithms() {
	let selectedObjectsTypes = [];
	for (let obj of selectedObjects) {
		selectedObjectsTypes.push(obj["object"].constructor.name);
	}
	console.log(selectedObjectsTypes);
	let availableAlgorithms = [];
	for (let algo of Pm4JS.algorithms) {
		console.log(algo);
		if (algo["inputs"].toString() == selectedObjectsTypes.toString()) {
			availableAlgorithms.push(algo);
		}
	}
	return availableAlgorithms;
}

function level1ApplyAlgorithm() {
	try {
		let availableAlgorithms = getAvailableAlgorithms();
		let selectedMethod = availableAlgorithms[levelsSelected["1"][0]];
		let args = '...args';
		let intArgsStri = "";
		let i = 0;
		while (i < selectedObjects.length) {
			intArgsStri += "x["+i+"]";
			if (i < selectedObjects.length-1) {
				intArgsStri += ",";
			}
			i++;
		}
		let body = 'let [x]= args; return '+selectedMethod['className']+"."+selectedMethod['methodName']+'('+intArgsStri+')';
		myFunc = new Function(args, body);
		let selectedObjectsObjs = [];
		for (let obj of selectedObjects) {
			selectedObjectsObjs.push(obj["object"]);
		}
		myFunc(selectedObjectsObjs);
	}
	catch (err) {
		console.log(err);
	}
}
