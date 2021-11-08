class CelonisNDWrapper {
	constructor(celonisMapper) {
		this.celonisMapper = celonisMapper;
		this.celonis1Dwrapper = new Celonis1DWrapper(this.celonisMapper);
	}
	
	getMVPmodel(analysisId) {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
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
	
	downloadBaseEventLog(analysisId, processConfiguration) {
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let activityTable = dataModelTables[processConfiguration["activityTableId"]];
		let query = [];
		query.push("TABLE(");
		query.push("\""+activityTable+"\".\""+processConfiguration.caseIdColumn+"\" AS \"ocel:omap\", ");
		query.push("\""+activityTable+"\".\""+processConfiguration.activityColumn+"\" AS \"ocel:activity\", ");
		query.push("\""+activityTable+"\".\""+processConfiguration.timestampColumn+"\" AS \"ocel:timestamp\") NOLIMIT;");
		query = query.join("");
		let res = CsvImporter.parseCSV(this.celonisMapper.performQueryAnalysis(analysisId, query));
		return [activityTable, res];
	}

	downloadRelations(analysisId, processConfiguration1, processConfiguration2) {
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let activityTable1 = dataModelTables[processConfiguration1["activityTableId"]];
		let activityTable2 = dataModelTables[processConfiguration2["activityTableId"]];
		let activityColumn1 = processConfiguration1["activityColumn"];
		let activityColumn2 = processConfiguration2["activityColumn"];
		let timestampColumn1 = processConfiguration1["timestampColumn"];
		let timestampColumn2 = processConfiguration2["timestampColumn"];
		let caseColumn2 = processConfiguration2["caseIdColumn"];
		let query = [];
		query.push("TABLE (");
		query.push("TRANSIT_COLUMN ( TIMESTAMP_INTERLEAVED_MINER (");
		query.push("\""+activityTable2+"\".\""+activityColumn2+"\", ");
		query.push("\""+activityTable1+"\".\""+activityColumn1+"\"), ");
		query.push("\""+activityTable2+"\".\""+caseColumn2+"\"), ");
		query.push("\""+activityTable1+"\".\""+activityColumn1+"\", ");
		query.push("\""+activityTable1+"\".\""+timestampColumn1+"\"");
		query.push(") NOLIMIT;");
		query = query.join("");
		try {
			let res0 = this.celonisMapper.performQueryAnalysis(analysisId, query);
			return CsvImporter.parseCSV(res0);
		}
		catch (err) {
			console.log(err);
			return [];
		}
	}

	downloadDataModelFromCelonis(analysisId) {
		let dataModelId = this.celonisMapper.analysisDataModel[analysisId];
		let dataModel = this.celonisMapper.dataModels[dataModelId];
		let ocel = {"ocel:global-log": {"ocel:attribute-names": [], "ocel:object-types": []}, "ocel:events": {}, "ocel:objects": {}};
		for (let conf of dataModel.processConfigurations) {
			let arr = this.downloadBaseEventLog(analysisId, conf);
			let ot = arr[0];
			let log = arr[1];
			ocel["ocel:global-log"]["ocel:object-types"].push(ot);
			let i = 1;
			while (i < log.length) {
				let evid = log[i][1] + log[i][2];
				let objId = log[i][0];
				let eve = {"ocel:activity": log[i][1], "ocel:timestamp": new Date(log[i][2])};
				ocel["ocel:events"][evid] = {"ocel:activity": log[i][1], "ocel:timestamp": new Date(log[i][2]), "ocel:omap": {objId: 0}};
				if (!(objId in ocel["ocel:objects"])) {
					ocel["ocel:objects"][objId] = {"ocel:type": ot};
				}
				i++;
			}
		}
		let i = 0;
		while (i < dataModel.processConfigurations.length) {
			let j = 0;
			while (j < dataModel.processConfigurations.length) {
				if (i != j) {
					let ret = this.downloadRelations(analysisId, dataModel.processConfigurations[i], dataModel.processConfigurations[j]);
					let z = 1;
					while (z < ret.length) {
						let evid = ret[z][1] + ret[z][2];
						let objId = ret[z][0];
						ocel["ocel:events"][evid]["ocel:omap"][objId] = 0;
						z = z + 1;
					}
				}
				j++;
			}
			i++;
		}
		for (let evId in ocel["ocel:events"]) {
			if ("objId" in ocel["ocel:events"][evId]["ocel:omap"]) {
				delete ocel["ocel:events"][evId]["ocel:omap"]["objId"];
			}
			ocel["ocel:events"][evId]["ocel:omap"] = Object.keys(ocel["ocel:events"][evId]["ocel:omap"]);
		}
		return ocel;
	}
	
	uploadOcelToCelonis(ocel, baseName, sep=",", quotechar="\"", newline="\r\n") {
		let res = OcelToCelonis.apply(ocel, sep, quotechar, newline);
		let dataPoolId = this.celonisMapper.createDataPool(baseName+"_POOL", false);
		for (let tab in res["coll"]) {
			console.log("pushing table: "+tab+" "+res["timestampColumns"][tab]);
			this.celonisMapper.pushCSV(dataPoolId, res["coll"][tab], tab, false, res["timestampColumns"][tab], sep, quotechar, newline);
		}
		this.celonisMapper.getDataPools();
		let dataModelId = this.celonisMapper.createDataModel(dataPoolId, baseName+"_DMODEL");
		for (let tab in res["coll"]) {
			console.log("adding table to data model: "+tab);
			this.celonisMapper.addTableFromPool(dataModelId, tab, false);
		}
		this.celonisMapper.getDataModels();
		for (let ot of res["objectTypes"]) {
			console.log("setting up foreign key for type: "+ot);
			this.celonisMapper.addForeignKey(dataModelId, ot+"_EVENTS", "CASE_"+ot, ot+"_CASES", "CASE_"+ot, false);
			console.log("adding process configuration:");
			this.celonisMapper.addProcessConfiguration(dataModelId, ot+"_EVENTS", ot+"_CASES", "CASE_"+ot, "ACT_"+ot, "TIME_"+ot, null, false);
		}
		for (let trans of res["transitions"]) {
			console.log("adding foreign keys for transition: "+trans);
			this.celonisMapper.addForeignKey(dataModelId, "CONNECT_"+trans[0]+"_CASES_"+trans[1]+"_CASES", "CASE_"+trans[0], trans[0]+"_CASES", "CASE_"+trans[0], false);
			this.celonisMapper.addForeignKey(dataModelId, "CONNECT_"+trans[0]+"_CASES_"+trans[1]+"_CASES", "CASE_"+trans[1], trans[1]+"_CASES", "CASE_"+trans[1], false);
		}
		this.celonisMapper.reloadDataModel(dataModelId);
		console.log("creating workspace");
		let workspaceId = this.celonisMapper.createWorkspace(dataModelId, baseName+"_WORKSPACE");
		console.log("creating analysis");
		let analysisId = this.celonisMapper.createAnalysis(workspaceId, baseName+"_ANALYSIS", false);
		console.log("reloading data pools");
		this.celonisMapper.getDataPools();
		console.log("reloading data models");
		this.celonisMapper.getDataModels();
		console.log("reloading analyses");
		this.celonisMapper.getAnalyses();
		return {"dataPoolId": dataPoolId, "dataModelId": dataModelId, "workspaceId": workspaceId, "analysisId": analysisId, "objectTypes": res["objectTypes"], "transitions": res["transitions"], "knowledgeYaml": res["knowledgeYaml"], "modelYaml": res["modelYaml"]};
	}
}

try {
	require('../../pm4js.js');
	global.CelonisNDWrapper = CelonisNDWrapper;
	module.exports = {CelonisNDWrapper: CelonisNDWrapper};
}
catch (err) {
	// not in Node
}
