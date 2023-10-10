class NetworkAnalysisResult {
	constructor(nodes, multiEdges) {
		this.nodes = nodes;
		this.multiEdges = multiEdges;
	}
}

class NetworkAnalysis {
	static apply(links, sourceNodeAgg, targetNodeAgg, edgeAgg, source=true) {
		let nodes = {};
		let multiEdges = {};
		for (let el of links) {
			let se = el[0];
			let te = el[1];
			let sn = StreamAttrWrapper.accessAttribute(se, sourceNodeAgg);
			let tn = StreamAttrWrapper.accessAttribute(te, targetNodeAgg);
			let eg = null;
			if (source) {
				eg = StreamAttrWrapper.accessAttribute(se, edgeAgg);
			}
			else {
				eg = StreamAttrWrapper.accessAttribute(te, edgeAgg);
			}
			
			if (sn != null && tn != null && eg != null) {
				eg = [sn, tn, eg];
				
				let st = StreamAttrWrapper.defaultTimestamp(se).getTime();
				let tt = StreamAttrWrapper.defaultTimestamp(te).getTime();
				let diff = (tt - st) / 1000.0;
				
				if (!(sn in nodes)) {
					nodes[sn] = {"IN": 0, "OUT": 0};
				}
				if (!(tn in nodes)) {
					nodes[tn] = {"IN": 0, "OUT": 0};
				}
				if (!(eg in multiEdges)) {
					multiEdges[eg] = {"count": 0, "timeDiff": []};
				}
				nodes[sn]["OUT"] += 1;
				nodes[tn]["IN"] += 1;
				multiEdges[eg]["count"] += 1;
				multiEdges[eg]["timeDiff"].push(diff);
			}
		}
		return new NetworkAnalysisResult(nodes, multiEdges);
	}
}

try {
	module.exports = {NetworkAnalysis: NetworkAnalysis};
	global.NetworkAnalysis = NetworkAnalysis;
}
catch (err) {
	// not in node
	//console.log(err);
}
