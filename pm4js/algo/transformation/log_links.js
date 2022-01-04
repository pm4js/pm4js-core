class LogLinksAnalysis {
	static linkAnalysisAttributeOutIn(stream, outAttribute, inAttribute) {
		let outAttributeValuesEvents = {};
		let inAttributeValuesEvents = {};
		let linkedEventsPos = {};
		let i = 0;
		while (i < stream.length) {
			let eve = stream[i];
			if (outAttribute in eve.attributes) {
				let val = StreamAttrWrapper.accessAttribute(eve, outAttribute);
				if (val != null) {
					if (!(val in outAttributeValuesEvents)) {
						outAttributeValuesEvents[val] = [];
					}
					outAttributeValuesEvents[val].push(i);
				}
			}
			if (inAttribute in eve.attributes) {
				let val = StreamAttrWrapper.accessAttribute(eve, inAttribute);
				if (val != null) {
					if (!(val in inAttributeValuesEvents)) {
						inAttributeValuesEvents[val] = [];
					}
					inAttributeValuesEvents[val].push(i);
				}
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
					if (!(n1 in links)) {
						links[n1] = [];
					}
					links[n1].push(n2);
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
	require('../../pm4js.js');
	module.exports = {LogLinksAnalysis: LogLinksAnalysis};
	global.LogLinksAnalysis = LogLinksAnalysis;
}
catch (err) {
	// not in node
	//console.log(err);
}
