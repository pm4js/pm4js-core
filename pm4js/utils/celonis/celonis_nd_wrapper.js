class CelonisNDWrapper {
	constructor(celonisMapper) {
		this.celonisMapper = celonisMapper;
		this.celonis1Dwrapper = new Celonis1DWrapper(this.celonisMapper);
	}
	
	getMVPmodel(analysisId) {
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let mvp = {};
		for (let configuration of dataModel.processConfigurations) {
			let activityTable = dataModelTables[configuration["activityTableId"]];
			mvp[activityTable] = this.celonis1Dwrapper.downloadFrequencyDfg(analysisId, configuration.id);
		}
		return mvp;
	}
	
	static uuidv4() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	}
	
	static nodeUuid() {
		let uuid = CelonisNDWrapper.uuidv4();
		return "n"+uuid.replace(/-/g, "");
	}
	
	static stringToColour(str) {
	  var hash = 0;
	  for (var i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	  }
	  var colour = '#';
	  for (var i = 0; i < 3; i++) {
		var value = (hash >> (i * 8)) & 0xFF;
		colour += ('00' + value.toString(16)).substr(-2);
	  }
	  return colour;
	}
	
	static visualizationMVP(mvp) {
		let ret = [];
		let activities = {};
		let startNodes = {};
		let endNodes = {};
		ret.push("digraph G {");
		for (let persp in mvp) {
			let perspCol = CelonisNDWrapper.stringToColour(persp);
			for (let act in mvp[persp].activities) {
				if (!(act in activities)) {
					let nodeUuid = CelonisNDWrapper.nodeUuid();
					activities[act] = nodeUuid;
					ret.push(nodeUuid+" [shape=box, label=\""+act+"\"]");
				}
			}
			let startNodeUuid = CelonisNDWrapper.nodeUuid();
			startNodes[persp] = startNodeUuid;
			ret.push(startNodeUuid+" [shape=ellipse, label=\""+persp+"\", color=\""+perspCol+"\", style=filled, fillcolor=\""+perspCol+"\"]");
			let endNodeUuid = CelonisNDWrapper.nodeUuid();
			endNodes[persp] = endNodeUuid;
			ret.push(endNodeUuid+" [shape=ellipse, label=\""+persp+"\", color=\""+perspCol+"\", style=filled, fillcolor=\""+perspCol+"\"]");
		}

		for (let persp in mvp) {
			let perspCol = CelonisNDWrapper.stringToColour(persp);
			for (let edge0 in mvp[persp].pathsFrequency) {
				let edge = edge0.split(",");
				ret.push(activities[edge[0]]+" -> "+activities[edge[1]]+" [color=\""+perspCol+"\", label=\"TO="+mvp[persp].pathsFrequency[edge0]+"\"]")
			}
			for (let act in mvp[persp].startActivities) {
				ret.push(startNodes[persp]+" -> "+activities[act]+" [color=\""+perspCol+"\", label=\"TO="+mvp[persp].startActivities[act]+"\"]");
			}
			for (let act in mvp[persp].endActivities) {
				ret.push(activities[act]+" -> "+endNodes[persp]+" [color=\""+perspCol+"\", label=\"TO="+mvp[persp].endActivities[act]+"\"]");
			}
		}
		ret.push("}");
		return ret.join("\n");
	}
}

try {
	require('../../pm4js.js');
	global.CelonisNDWrapper = CelonisNDWrapper;
	module.exports = {CelonisNDWrapper: CelonisNDWrapper};
}
catch (err) {
	// not in Node
	console.log(err);
}
