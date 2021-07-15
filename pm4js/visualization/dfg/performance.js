class PerformanceDfgGraphvizVisualizer {
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static nodeUuid() {
		let uuid = PerformanceDfgGraphvizVisualizer.uuidv4();
		return "n"+uuid.replace(/-/g, "");
	}
	
	static apply(performanceDfg) {
		let ret = [];
		let uidMap = {};
		ret.push("digraph G {");
		for (let act in performanceDfg.activities) {
			let nUid = PerformanceDfgGraphvizVisualizer.nodeUuid();
			uidMap[act] = nUid;
			let st = performanceDfg.sojournTimes[act];
			ret.push(nUid+" [shape=box, label=\""+act+"\n("+humanizeDuration(st*1000)+")\"]");
		}
		let startNodeUid = PerformanceDfgGraphvizVisualizer.nodeUuid();
		let endNodeUid = PerformanceDfgGraphvizVisualizer.nodeUuid();
		ret.push(startNodeUid+" [shape=circle, label=\" \", style=filled, fillcolor=green]");
		ret.push(endNodeUid+" [shape=circle, label=\" \", style=filled, fillcolor=orange]");
		for (let sa in performanceDfg.startActivities) {
			ret.push(startNodeUid+" -> "+uidMap[sa]);
		}
		for (let ea in performanceDfg.endActivities) {
			ret.push(uidMap[ea]+" -> "+endNodeUid);
		}
		for (let arc in performanceDfg.pathsPerformance) {
			let act1 = arc.split(",")[0];
			let act2 = arc.split(",")[1];
			let perf = performanceDfg.pathsPerformance[arc];
			let penwidth = 0.5 + 0.3 * Math.log10(1 + perf);
			ret.push(uidMap[act1]+" -> "+uidMap[act2]+" [label=\""+humanizeDuration(Math.round(perf*1000))+"\", penwidth=\""+penwidth+"\"]");
		}
		ret.push("}");
		return ret.join("\n");
	}
}

try {
	require('../../pm4js.js');
	require('../../objects/dfg/performance/obj.js');
	module.exports = {PerformanceDfgGraphvizVisualizer: PerformanceDfgGraphvizVisualizer};
	global.PerformanceDfgGraphvizVisualizer = PerformanceDfgGraphvizVisualizer;
}
catch (err) {
	// not in node
	console.log(err);
}