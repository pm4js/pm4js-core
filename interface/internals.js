var inputContent = null;
var extension = null;
var operation = null;
var levelsSelected = {"0": [], "1": []};
var wizardCallback = null;
var objectToConsider = null;

function objectRegisteredCallback() {
	updateObjects();
}

function handleFileSelect(evt) {
	var files = evt.target.files; // FileList object
	// use the 1st file from the list
	f = files[0];
	var reader = new FileReader();
	reader.onload = function(e) {
		inputContent = e.target.result;
		extension = f.name.split('.').pop();
		operation = "importing";
		document.getElementById("level1Title").innerHTML = "<h3>Select the importer among the available ones</h3>";
		populateLevel(document.getElementById("availableMethods"), 1, getAvailableImportersGivenExtension(extension));
		document.getElementById("uploadHidden").value = "";
		$('#pm4jsAlgoPopup').show();
	}
	reader.readAsText(f);
}

function populateLevel(container, level, methods) {
	container.innerHTML = "";
	let count = 0;
	for (let method of methods) {
		let thisId = "methodDiv_"+level+"_"+count
		let methodDiv = document.createElement("div");
		methodDiv.classList.add("methodDiv");
		methodDiv.classList.add("methodDiv_"+level);
		methodDiv.classList.add("methodDiv_unselected");
		methodDiv.setAttribute("id", thisId);
		methodDiv.setAttribute("level", level);
		methodDiv.setAttribute("count", count);
		methodDiv.addEventListener("click", function(ev) { manageClickOnElement(ev, thisId); });
		let innerHTML = "<span><h3>"+method["description"]+"</h3></span>";
		if (level == 1) {
			innerHTML += "<br /><span>"+method["authors"]+"</span>";
		}
		methodDiv.innerHTML = innerHTML;
		if (level == 0) {
			// objects
			let exp = getAvailableExporters(method);
			if (exp.length > 0) {
				let butt = document.createElement("button");
				butt.innerHTML = "Export";
				butt.addEventListener("click", function(ev) { startExportingObj(ev, method); });
				methodDiv.appendChild(butt);
			}
		}
		container.appendChild(methodDiv);
		count++;
	}
}

function startExportingObj(ev, obj) {
	objectToConsider = obj;
	operation = "exporting";
	document.getElementById("level1Title").innerHTML = "<h3>Select the exporter among the available ones</h3>";
	populateLevel(document.getElementById("availableMethods"), 1, getAvailableExporters(obj));
	$('#pm4jsAlgoPopup').show();
	ev.preventDefault();
}

function resetSelection(level) {
	for (let otherEl of document.getElementsByClassName("methodDiv_"+level)) {
		otherEl.classList.remove("methodDiv_selected");
		otherEl.classList.add("methodDiv_unselected");
		levelsSelected[level] = null;
		levelsSelected[level] = [];
	}
}

function manageClickOnElement(ev, eleString) {
	let eleDom = document.getElementById(eleString);
	let level = parseInt(eleDom.getAttribute("level"));
	let count = parseInt(eleDom.getAttribute("count"));
	if (level == 1) {
		resetSelection("1");
	}
	if (eleDom.classList.contains("methodDiv_selected")) {
		eleDom.classList.remove("methodDiv_selected");
		eleDom.classList.add("methodDiv_unselected");
		levelsSelected[level].splice(levelsSelected[level].indexOf(count), 1);
	}
	else {
		eleDom.classList.remove("methodDiv_unselected");
		eleDom.classList.add("methodDiv_selected");
		levelsSelected[level].push(count);
	}
}

function getAvailableImportersGivenExtension(extension) {
	let ret = [];
	for (let method of Pm4JS.importers) {
		if (method["extensions"].includes(extension)) {
			ret.push(method);
		}
	}
	return ret;
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

function updateObjects() {
	populateLevel(document.getElementById("availableObjects"), 0, Pm4JS.objects);
}

function level1Apply() {
	if (levelsSelected["1"].length > 0) {
		$('#pm4jsAlgoPopup').hide();
		if (operation == "importing") {
			let availableMethods = getAvailableImportersGivenExtension(extension);
			let selectedMethod = availableMethods[levelsSelected["1"][0]];
			try {
				let args = '...args';
				let body = 'let [a] = args;return '+selectedMethod['className']+"."+selectedMethod['methodName']+'(a)';
				myFunc = new Function(args, body);
				myFunc(inputContent);
			}
			catch (err) {
				alert("Import failed");
			}
		}
		else if (operation == "exporting") {
			try {
				let selectedObject = objectToConsider;
				let availableMethods = getAvailableExporters(selectedObject);
				let selectedMethod = Pm4JS.exporters[levelsSelected["1"][0]];
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
		resetSelection("0");
		resetSelection("1");
		//$('#wizardPopup').show();
	}
}

function wizardApply() {
	wizardCallback();
	$('#wizardPopup').hide();
}

function wizardCancel() {
	$('#wizardPopup').hide();
}

function level1Cancel() {
	$('#pm4jsAlgoPopup').hide();
}

function applyAlgorithm() {
	
}

Pm4JS.registerCallback(objectRegisteredCallback);
document.getElementById('uploadHidden').addEventListener('change', handleFileSelect, false);
document.getElementById('pm4jsMainApplication').style.display = '';
/*$('.hover_bkgr_fricc').click(function(){
	$('.hover_bkgr_fricc').hide();
});*/
$('#pm4jsAlgoPopupClose').click(function(){
	$('#pm4jsAlgoPopup').hide();
});
$('#pm4jsWizardPopupClose').click(function(){
	$('#wizardPopup').hide();
});
$('#visualizationPopupClose').click(function(){
	$('#visualizationPopup').hide();
});