class NetworkAnalysisGraphvizVisualizer {
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static nodeUuid() {
		let uuid = NetworkAnalysisGraphvizVisualizer.uuidv4();
		return "n"+uuid.replace(/-/g, "");
	}
	
	static calculateAverage(times) {
		if (times.length > 0) {
			let sum = 0;
			for (let el of times) {
				sum += el;
			}
			return sum / times.length;
		}
		return 0;
	}
	
	
	static apply(networkAnalysis, performance=false) {
		let ret = [];
		ret.push("digraph G {");
		let nodesMap = {};
		for (let nk in networkAnalysis.nodes) {
			let nstats = networkAnalysis.nodes[nk];
			let nuid = NetworkAnalysisGraphvizVisualizer.nodeUuid();
			nodesMap[nk] = nuid;
			ret.push(nuid+" [shape=ellipse, label=\""+nk+"\nIN="+nstats["IN"]+"\nOUT="+nstats["OUT"]+"\"]");
		}
		for (let eg in networkAnalysis.multiEdges) {
			let estats = networkAnalysis.multiEdges[eg];
			let egs = eg.split(",");
			let sn = egs[0];
			let tn = egs[1];
			let ml = egs[2];
			let label = ml+"\n";
			if (performance) {
				let perf = NetworkAnalysisGraphvizVisualizer.calculateAverage(estats["timeDiff"]);
				label += humanizeDuration(Math.round(perf*1000));
			}
			else {
				label += "(" + estats["count"]+")";
			}
			ret.push(nodesMap[sn]+" -> "+nodesMap[tn]+" [label=\""+label+"\"]");
		}
		ret.push("}");
		return ret.join("\n");
	}
}

try {
	module.exports = {NetworkAnalysisGraphvizVisualizer: NetworkAnalysisGraphvizVisualizer};
	global.NetworkAnalysisGraphvizVisualizer = NetworkAnalysisGraphvizVisualizer;
}
catch (err) {
	// not in node
}
