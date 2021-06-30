function startExportingObj(ev, obj) {
	objectToConsider = obj;
	operation = "exporting";
	document.getElementById("level1Title").innerHTML = "<h3>Select the exporter among the available ones</h3>";
	populateLevel(document.getElementById("availableMethods"), 1, getAvailableExporters(obj));
	$('#pm4jsAlgoPopup').show();
	ev.preventDefault();
}

function getAvailableExporters(obj) {
	let ret = [];
	for (let method of Pm4JS.exporters) {
		if (method["exportedObjType"] == obj["object"].constructor.name) {
			ret.push(method);
		}
	}
	return ret;
}

function level1ApplyExporting() {
	try {
		let selectedObject = objectToConsider;
		let availableMethods = getAvailableExporters(selectedObject);
		let selectedMethod = availableMethods[levelsSelected["1"][0]];
		let args = '...args';
		let body = 'let [a]= args; return '+selectedMethod['className']+"."+selectedMethod['methodName']+'(a)';
		myFunc = new Function(args, body);
		let expString = myFunc(selectedObject["object"]);
		DownloadUtility.download(expString, "prova."+selectedMethod['extension'], selectedMethod['mimeType']);
	}
	catch (err) {
		alert("Export failed");
	}
}