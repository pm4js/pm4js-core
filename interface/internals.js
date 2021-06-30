var inputContent = null;
var outputContent = null;
var extension = null;
var operation = null;
var subwindowTitle = null;
var levelsSelected = {"0": [], "1": []};

function objectRegisteredCallback() {
	console.log(Pm4JS.objects);
}

function handleFileSelect(evt) {
	var files = evt.target.files; // FileList object
	// use the 1st file from the list
	f = files[0];
	var reader = new FileReader();
	reader.onload = function(e) {
		inputContent = e.target.result;
		extension = f.name.split('.').pop();
		//console.log(getAvailableImportersGivenExtension(extension));
		populateLevel(document.getElementById("availableMethods"), 1, getAvailableImportersGivenExtension(extension));
		$('.hover_bkgr_fricc').show();
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
		methodDiv.addEventListener("click", function() { manageClickOnElement(thisId); });
		methodDiv.innerHTML = method["description"];
		container.appendChild(methodDiv);
		count++;
	}
}

function manageClickOnElement(eleString) {
	let eleDom = document.getElementById(eleString);
	let level = parseInt(eleDom.getAttribute("level"));
	let count = parseInt(eleDom.getAttribute("count"));
	if (level == 1) {
		for (let otherEl of document.getElementsByClassName("methodDiv_"+level)) {
			otherEl.classList.remove("methodDiv_unselected");
			otherEl.classList.add("methodDiv_selected");
		}
		levelsSelected[level] = [];
	}
	eleDom.classList.add("methodDiv_selected");
	levelsSelected[level].push(count);
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

Pm4JS.registerCallback(objectRegisteredCallback);
document.getElementById('uploadHidden').addEventListener('change', handleFileSelect, false);
document.getElementById('pm4jsMainApplication').style.display = '';
/*$('.hover_bkgr_fricc').click(function(){
	$('.hover_bkgr_fricc').hide();
});*/
$('.popupCloseButton').click(function(){
	$('.hover_bkgr_fricc').hide();
});