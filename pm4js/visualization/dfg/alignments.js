class AlignmentsDfgGraphvizVisualizer {
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static nodeUuid() {
		let uuid = FrequencyDfgGraphvizVisualizer.uuidv4();
		return "n"+uuid.replace(/-/g, "");
	}
	
	static apply(frequencyDfg, alignedTraces) {
		let smCount = {};
		let mmCount = {};
		let lmCount = {};
		for (let act in frequencyDfg.activities) {
			smCount[act] = 0;
			mmCount[act] = 0;
			lmCount[act] = 0;
		}
		for (let move0 in alignedTraces.movesUsage) {
			let move = move0.split(";");
			move[0] = move[0].substring(1, move[0].length);
			move[1] = move[1].substring(0, move[1].length-1);
			if (move[0] == move[1]) {
				// sync
				smCount[move[0]] = alignedTraces.movesUsage[move0];
			}
			else if (move[1] == ">>") {
				lmCount[move[0]] = alignedTraces.movesUsage[move0];
			}
			else if (move[0] == ">>") {
				mmCount[move[1]] = alignedTraces.movesUsage[move0];
			}
		}
		let ret = [];
		let uidMap = {};
		ret.push("digraph G {");
		for (let act in frequencyDfg.activities) {
			let nUid = FrequencyDfgGraphvizVisualizer.nodeUuid();
			uidMap[act] = nUid;
			ret.push(nUid+" [shape=box, label=\""+act+"\nSM="+smCount[act]+";MM="+mmCount[act]+";LM="+lmCount[act]+"\"]");
		}
		let startNodeUid = FrequencyDfgGraphvizVisualizer.nodeUuid();
		let endNodeUid = FrequencyDfgGraphvizVisualizer.nodeUuid();
		ret.push(startNodeUid+" [shape=circle, label=\" \", style=filled, fillcolor=green]");
		ret.push(endNodeUid+" [shape=circle, label=\" \", style=filled, fillcolor=orange]");
		for (let sa in frequencyDfg.startActivities) {
			let occ = frequencyDfg.startActivities[sa];
			let penwidth = 0.5 + Math.log10(occ);
			ret.push(startNodeUid+" -> "+uidMap[sa]+" [penwidth=\""+penwidth+"\"]");
		}
		for (let ea in frequencyDfg.endActivities) {
			let occ = frequencyDfg.endActivities[ea];
			let penwidth = 0.5 + Math.log10(occ);
			ret.push(uidMap[ea]+" -> "+endNodeUid+" [penwidth=\""+penwidth+"\"]");
		}
		for (let arc in frequencyDfg.pathsFrequency) {
			let act1 = arc.split(",")[0];
			let act2 = arc.split(",")[1];
			let occ = frequencyDfg.pathsFrequency[arc];
			let penwidth = 0.5 + Math.log10(occ);
			ret.push(uidMap[act1]+" -> "+uidMap[act2]+" [penwidth=\""+penwidth+"\"]");
		}
		ret.push("}");
		return ret.join("\n");
	}
}

try {
	require('../../pm4js.js');
	require('../../objects/dfg/frequency/obj.js');
	module.exports = {AlignmentsDfgGraphvizVisualizer: AlignmentsDfgGraphvizVisualizer};
	global.AlignmentsDfgGraphvizVisualizer = AlignmentsDfgGraphvizVisualizer;
}
catch (err) {
	// not in node
}