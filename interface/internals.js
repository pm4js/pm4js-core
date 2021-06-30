function objectRegisteredCallback() {
	console.log(Pm4JS.objects);
}

function handleFileSelect(evt) {
	var files = evt.target.files; // FileList object
	// use the 1st file from the list
	f = files[0];
	console.log(f);
	var reader = new FileReader();
	reader.onload = function(e) {
		let data = e.target.result;
		let extension = f.name.split('.').pop();
		console.log(data);
		console.log(extension);
	}
	reader.readAsText(f);
}

Pm4JS.registerCallback(objectRegisteredCallback);
document.getElementById('uploadHidden').addEventListener('change', handleFileSelect, false);
document.getElementById('pm4jsMainApplication').style.display = '';