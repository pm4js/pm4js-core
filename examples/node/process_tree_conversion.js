require('../../init.js');
var fs = require('fs');

fs.readFile('../input_data/running-example.ptml', {encoding: 'utf-8'}, (err, data) => {
	let processTree = PtmlImporter.apply(data);
	console.log(processTree);
	let acceptingPetriNet = ProcessTreeToPetriNetConverter.apply(processTree);
	let gv = PetriNetVanillaVisualizer.apply(acceptingPetriNet);
	console.log(gv);
});
