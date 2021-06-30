var inputContent = null;
var extension = null;
var operation = null;
var levelsSelected = {"0": [], "1": []};
var wizardCallback = null;
var objectToConsider = null;
var selectedObjects = null;

function objectRegisteredCallback() {
	updateObjects();
}

function updateObjects() {
	populateLevel(document.getElementById("availableObjects"), 0, Pm4JS.objects);
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
			let visAlg = getAvailableVisualizers(method);
			if (visAlg.length > 0) {
				let butt = document.createElement("button");
				butt.innerHTML = "Visualize";
				butt.addEventListener("click", function(ev) { startVisualizingObj(ev, method); });
				methodDiv.appendChild(butt);
			}
		}
		container.appendChild(methodDiv);
		count++;
	}
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

function level1Apply() {
	if (levelsSelected["1"].length > 0) {
		$('#pm4jsAlgoPopup').hide();
		if (operation == "importing") {
			level1ApplyImporting();
		}
		else if (operation == "exporting") {
			level1ApplyExporting();
		}
		else if (operation == "visualising") {
			level1ApplyVisualization();
		}
		else if (operation == "algorithm") {
			level1ApplyAlgorithm();
		}
		resetSelection("0");
		resetSelection("1");
	}
}

function level1Cancel() {
	$('#pm4jsAlgoPopup').hide();
}

Pm4JS.registerCallback(objectRegisteredCallback);
document.getElementById('pm4jsMainApplication').style.display = '';

$('#pm4jsAlgoPopupClose').click(function(){
	$('#pm4jsAlgoPopup').hide();
});