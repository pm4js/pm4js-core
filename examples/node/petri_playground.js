require('../../pm4js/objects/petri_net/petri_net.js');
require('../../pm4js/visualization/petri_net/vanilla_graphviz.js');

let petriNet = new PetriNet();
let source = petriNet.addPlace('source');
let sink = petriNet.addPlace('sink');
let A = petriNet.addTransition('A', 'A');
let B = petriNet.addTransition('B', 'B');
let C = petriNet.addTransition('C', 'C');
petriNet.addArcFromTo(source, A);
petriNet.addArcFromTo(A, sink);
petriNet.addArcFromTo(sink, C);
let im = new Marking(petriNet);
im.setTokens(source, 1);
let fm = new Marking(petriNet);
fm.setTokens(sink, 1);
let acceptingPetriNet = new AcceptingPetriNet(petriNet, im, fm);
let gv = PetriNetVanillaVisualizer.apply(acceptingPetriNet);
console.log(gv);
