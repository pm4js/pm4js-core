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

function getAvailableImportersGivenExtension(extension) {
	let ret = [];
	for (let method of Pm4JS.importers) {
		if (method["extensions"].includes(extension)) {
			ret.push(method);
		}
	}
	return ret;
}

function level1ApplyImporting() {
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
		console.log(err);
	}
}

document.getElementById('uploadHidden').addEventListener('change', handleFileSelect, false);
