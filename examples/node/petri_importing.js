require('../../init.js');
var fs = require('fs');

fs.readFile('../input_data/running-example.pnml', {encoding: 'utf-8'}, (err, data) => {
	let acceptingPetriNet = PnmlImporter.apply(data);
	console.log(acceptingPetriNet);
	let gv = PetriNetVanillaVisualizer.apply(acceptingPetriNet);
	console.log(gv);
});
