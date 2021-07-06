class TokenBasedReplay {
	static apply(eventLog, acceptingPetriNet) {
		TokenBasedReplay.buildInvisibleChain(acceptingPetriNet.net);
	}
	
	static buildInvisibleChain(net) {
		let initialDictio = TokenBasedReplay.buildInvisibleChainInitial(net);
		let changedPlaces = Object.keys(initialDictio);
		let invisibleChain = {};
		Object.assign(invisibleChain, initialDictio);
		while (changedPlaces.length > 0) {
			let newChanges = [];
			for (let place in invisibleChain) {
				for (let place2 in invisibleChain[place]) {
					if (changedPlaces.includes(place2)) {
						if (place2 in invisibleChain) {
							for (let place3 in invisibleChain[place2]) {
								if (!(place3 in invisibleChain[place])) {
									invisibleChain[place][place3] = [ ...invisibleChain[place][place2], ...invisibleChain[place2][place3] ];
									newChanges.push(place);
								}
							}
						}
					}
				}
			}
			changedPlaces = newChanges;
		}
	}
	
	static buildInvisibleChainInitial(net) {
		let initialDictio = {};
		for (let placeId in net.places) {
			let place = net.places[placeId];
			initialDictio[place] = {};
			for (let arcId in place.outArcs) {
				let trans = place.outArcs[arcId].target;
				if (trans.label == null) {
					for (let arcId2 in trans.outArcs) {
						let place2 = trans.outArcs[arcId2].target;
						initialDictio[place][place2] = [trans];
					}
				}
			}
			if (Object.keys(initialDictio[place]).length == 0) {
				delete initialDictio[place];
			}
		}
		return initialDictio;
	}
}

try {
	require('../../../pm4js.js');
	module.exports = {TokenBasedReplay: TokenBasedReplay};
	global.TokenBasedReplay = TokenBasedReplay
}
catch (err) {
	// not in Node
	console.log(err);
}
