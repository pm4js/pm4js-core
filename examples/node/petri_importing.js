require('../../pm4js/objects/petri_net/petri_net.js');
require('../../pm4js/objects/petri_net/importer/importer.js');
require('../../pm4js/visualization/petri_net/vanilla_graphviz.js');
var fs = require('fs');

fs.readFile('../input_data/running-example.pnml', {encoding: 'utf-8'}, (err, data) => {
	let acceptingPetriNet = PnmlImporter.apply(data);
	console.log(acceptingPetriNet);
	let gv = PetriNetVanillaVisualizer.apply(acceptingPetriNet);
	console.log(gv);
});
