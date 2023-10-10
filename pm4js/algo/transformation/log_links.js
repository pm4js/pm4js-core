class LogLinksAnalysis {
	static linkAnalysisAttributeOutIn(stream, outAttribute, inAttribute) {
		let outAttributeValuesEvents = {};
		let inAttributeValuesEvents = {};
		let linkedEventsPos = {};
		let i = 0;
		while (i < stream.length) {
			let eve = stream[i];
			let val = StreamAttrWrapper.accessAttribute(eve, outAttribute);
			if (val != null) {
				if (!(val in outAttributeValuesEvents)) {
					outAttributeValuesEvents[val] = [];
				}
				outAttributeValuesEvents[val].push(i);
			}
			val = StreamAttrWrapper.accessAttribute(eve, inAttribute);
			if (val != null) {
				if (!(val in inAttributeValuesEvents)) {
					inAttributeValuesEvents[val] = [];
				}
				inAttributeValuesEvents[val].push(i);
			}
			i = i + 1;
		}
		for (let val in outAttributeValuesEvents) {
			if (val in inAttributeValuesEvents) {
				for (let i1 of outAttributeValuesEvents[val]) {
					if (!(i1 in linkedEventsPos)) {
						linkedEventsPos[i1] = {};
					}
					for (let i2 of inAttributeValuesEvents[val]) {
						linkedEventsPos[i1][i2] = 0;
					}
				}
			}
		}
		for (let idx in linkedEventsPos) {
			linkedEventsPos[idx] = Object.keys(linkedEventsPos[idx]);
		}
		return linkedEventsPos;
	}
	
	static filterLinksByTimestamp(stream, oldLinks) {
		let links = {};
		for (let k1 in oldLinks) {
			let n1 = parseInt(k1);
			for (let k2 of oldLinks[k1]) {
				let n2 = parseInt(k2);
				if (n2 > n1) {
					if (!(k1 in links)) {
						links[k1] = [];
					}
					links[k1].push(k2);
				}
			}
		}
		return links;
	}
	
	static filterFirstLink(stream, oldLinks) {
		let links = {};
		for (let k1 in oldLinks) {
			links[k1] = [oldLinks[k1][0]];
		}
		return links;
	}
	
	static expandLinks(stream, links0) {
		let links = {};
		for (let k in links0) {
			links[k] = {};
			for (let k2 of links0[k]) {
				links[k][k2] = 0;
			}
		}
		let toVisit = {};
		let invGraph = {};
		for (let k in links) {
			if (!(k in invGraph)) {
				invGraph[k] = [];
			}
			for (let k2 in links[k]) {
				if (!(k2 in invGraph)) {
					invGraph[k2] = {};
				}
				invGraph[k2][k] = 0;
			}
		}
		for (let k in links) {
			toVisit[k] = 0;
		}
		while (true) {
			let newToVisit = {};
			for (let k2 in toVisit) {
				for (let k in invGraph[k2]) {
					let newGraph = Object.assign({}, links[k]);
					for (let k3 in links[k2]) {
						newGraph[k3] = 0;
					}
					if (Object.keys(newGraph).length > Object.keys(links[k]).length) {
						links[k] = newGraph;
						newToVisit[k] = 0;
					}
				}
			}
			if (Object.keys(newToVisit).length == 0) {
				break;
			}
			toVisit = newToVisit;
		}
		for (let k in links) {
			links[k] = Object.keys(links[k]);
		}
		return links;
	}
	
	static linksToFinalForm(stream, oldLinks) {
		let links = [];
		for (let k1 in oldLinks) {
			let n1 = parseInt(k1);
			for (let k2 of oldLinks[k1]) {
				let n2 = parseInt(k2);
				links.push([stream[n1], stream[n2]]);
			}
		}
		return links;
	}
}

try {
	module.exports = {LogLinksAnalysis: LogLinksAnalysis};
	global.LogLinksAnalysis = LogLinksAnalysis;
}
catch (err) {
	// not in node
	//console.log(err);
}
