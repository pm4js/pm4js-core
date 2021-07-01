class PetriNetVanillaVisualizer {
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static nodeUuid() {
		let uuid = PetriNetVanillaVisualizer.uuidv4();
		return "n"+uuid.replace("-", "");
	}
	
	static apply(petri_net) {
		let ret = [];
		ret.push("digraph G {\n");
		for (let placeKey in petri_net.places) {
			let place = petri_net.places[placeKey];
			
		}
		ret.push("}\n");
		return ret.toString();
	}
}