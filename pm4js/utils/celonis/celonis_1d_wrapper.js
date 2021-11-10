class Celonis1DWrapper {
	constructor(celonisMapper) {
		this.celonisMapper = celonisMapper;
	}
	
	getProcessConfiguration(dataModel, processConfigurationId=null) {
		if (processConfigurationId == null) {
			let ret = dataModel.processConfigurations[0];
			return ret;
		}
		else {
			let i = 0;
			while (i < dataModel.processConfigurations.length) {
				if (dataModel.processConfigurations[i].id == processConfigurationId) {
					return dataModel.processConfigurations[i];
				}
				i++;
			}
		}
	}
	
	downloadBaseEventLog(analysisId, processConfigurationId=null) {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let processConfiguration = this.getProcessConfiguration(dataModel, processConfigurationId);
		let activityTable = dataModelTables[processConfiguration["activityTableId"]];
		let query = [];
		query.push("TABLE(");
		query.push("\""+activityTable+"\".\""+processConfiguration.caseIdColumn+"\" AS \"case:concept:name\", ");
		query.push("\""+activityTable+"\".\""+processConfiguration.activityColumn+"\" AS \"concept:name\", ");
		query.push("\""+activityTable+"\".\""+processConfiguration.timestampColumn+"\" AS \"time:timestamp\") NOLIMIT;");
		query = query.join("");
		return CsvImporter.apply(this.celonisMapper.performQueryAnalysis(analysisId, query));
	}
	
	downloadStartActivities(analysisId, processConfigurationId=null) {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let processConfiguration = this.getProcessConfiguration(dataModel, processConfigurationId);
		let activityTable = dataModelTables[processConfiguration["activityTableId"]];
		let query = [];
		query.push("TABLE(");
		query.push("ACTIVITY_LAG ( \""+activityTable+"\".\""+processConfiguration.activityColumn+"\", 1) AS \"PREV_ACTIVITY\", ");
		query.push("\""+activityTable+"\".\""+processConfiguration.activityColumn+"\" AS \"CURR_ACTIVITY\",");
		query.push("COUNT(\""+activityTable+"\".\""+processConfiguration.caseIdColumn+"\") AS \"COUNT\") NOLIMIT;");
		query = query.join("");
		let ret = CsvImporter.parseCSV(this.celonisMapper.performQueryAnalysis(analysisId, query));
		let sa_dict = {};
		for (let el of ret) {
			if (el[0].length == 0) {
				sa_dict[el[1]] = parseInt(el[2]);
			}
		}
		return sa_dict;
	}
	
	downloadEndActivities(analysisId, processConfigurationId=null) {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let processConfiguration = this.getProcessConfiguration(dataModel, processConfigurationId);
		let activityTable = dataModelTables[processConfiguration["activityTableId"]];
		let query = [];
		query.push("TABLE(");
		query.push("ACTIVITY_LEAD ( \""+activityTable+"\".\""+processConfiguration.activityColumn+"\", 1) AS \"NEXT_ACTIVITY\", ");
		query.push("\""+activityTable+"\".\""+processConfiguration.activityColumn+"\" AS \"CURR_ACTIVITY\",");
		query.push("COUNT(\""+activityTable+"\".\""+processConfiguration.caseIdColumn+"\") AS \"COUNT\") NOLIMIT;");
		query = query.join("");
		let ret = CsvImporter.parseCSV(this.celonisMapper.performQueryAnalysis(analysisId, query));
		let ea_dict = {};
		for (let el of ret) {
			if (el[0].length == 0) {
				ea_dict[el[1]] = parseInt(el[2]);
			}
		}
		return ea_dict;
	}
	
	downloadActivities(analysisId, processConfigurationId=null) {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let processConfiguration = this.getProcessConfiguration(dataModel, processConfigurationId);
		let activityTable = dataModelTables[processConfiguration["activityTableId"]];
		let query = [];
		query.push("TABLE(");
		query.push("\""+activityTable+"\".\""+processConfiguration.activityColumn+"\", ");
		query.push("COUNT(\""+activityTable+"\".\""+processConfiguration.caseIdColumn+"\") AS \"ACTIVITY\") NOLIMIT;");
		query = query.join("");
		let ret = CsvImporter.parseCSV(this.celonisMapper.performQueryAnalysis(analysisId, query));
		let activities = {};
		let i = 1;
		while (i < ret.length) {
			activities[ret[i][0]] = parseInt(ret[i][1]);
			i++;
		}
		return activities;
	}
	
	downloadPathsFrequency(analysisId, processConfigurationId=null) {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let processConfiguration = this.getProcessConfiguration(dataModel, processConfigurationId);
		let activityTable = dataModelTables[processConfiguration["activityTableId"]];
		let query = [];
		query.push("TABLE(");
		query.push("ACTIVITY_LEAD ( \""+activityTable+"\".\""+processConfiguration.activityColumn+"\", 1) AS \"NEXT_ACTIVITY\", ");
		query.push("\""+activityTable+"\".\""+processConfiguration.activityColumn+"\" AS \"CURR_ACTIVITY\", ");
		query.push("COUNT(\""+activityTable+"\".\""+processConfiguration.caseIdColumn+"\") AS \"COUNT\") NOLIMIT;")
		query = query.join("");
		let res = this.celonisMapper.performQueryAnalysis(analysisId, query);
		let ret = CsvImporter.parseCSV(res);
		let i = 1;
		let pathsFrequency = {};
		while (i < ret.length) {
			if (ret[i][0].length > 0) {
				pathsFrequency[[ret[i][1], ret[i][0]]] = parseInt(ret[i][2]);
			}
			i++;
		}
		return pathsFrequency;
	}
	
	downloadVariants(analysisId, processConfigurationId=null) {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let processConfiguration = this.getProcessConfiguration(dataModel, processConfigurationId);
		let activityTable = dataModelTables[processConfiguration["activityTableId"]];
		let query = [];
		query.push("TABLE(");
		query.push("VARIANT(\""+activityTable+"\".\""+processConfiguration.activityColumn+"\")");
		query.push(", COUNT(VARIANT(\""+activityTable+"\".\""+processConfiguration.activityColumn+"\"))");
		query.push(") NOLIMIT;");
		query = query.join("");
		let res = this.celonisMapper.performQueryAnalysis(analysisId, query);
		let ret = CsvImporter.parseCSV(res);
		let variants = {};
		let i = 1;
		while (i < ret.length) {
			variants[ret[i][0]] = parseInt(ret[i][1]);
			i++;
		}
		return variants;
	}
	
	downloadPathsPerformance(analysisId, processConfigurationId=null, relationship="ANY_OCCURRENCE [ ] TO ANY_OCCURRENCE [ ]") {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let processConfiguration = this.getProcessConfiguration(dataModel, processConfigurationId);
		let activityTable = dataModelTables[processConfiguration["activityTableId"]];
		let query = [];
		query.push("TABLE(");
		query.push("SOURCE ( \""+activityTable+"\".\""+processConfiguration.activityColumn+"\", "+relationship+" ), ");
		query.push("TARGET ( \""+activityTable+"\".\""+processConfiguration.activityColumn+"\" ), ");
		query.push("AVG ( SECONDS_BETWEEN ( SOURCE ( \""+activityTable+"\".\""+processConfiguration.timestampColumn+"\" ) , TARGET ( \""+activityTable+"\".\""+processConfiguration.timestampColumn+"\" ) ) )");
		query.push(") NOLIMIT;");
		query = query.join("");
		let res = this.celonisMapper.performQueryAnalysis(analysisId, query);
		let ret = CsvImporter.parseCSV(res);
		let pathsPerformance = {};
		let i = 1;
		while (i < ret.length) {
			pathsPerformance[[ret[i][0], ret[i][1]]] = parseFloat(ret[i][2]);
			i++;
		}
		return pathsPerformance;
	}
	
	downloadSojournTimes(analysisId, processConfigurationId=null, timestampColumn=null, startTimestampColumn=null) {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let processConfiguration = this.getProcessConfiguration(dataModel, processConfigurationId);
		let activityTable = dataModelTables[processConfiguration["activityTableId"]];
		let query = [];
		if (timestampColumn == null) {
			timestampColumn = processConfiguration.timestampColumn;
		}
		if (startTimestampColumn == null) {
			startTimestampColumn = processConfiguration.timestampColumn;
		}
		timestampColumn = "\""+activityTable+"\".\""+timestampColumn+"\"";
		startTimestampColumn = "\""+activityTable+"\".\""+startTimestampColumn+"\"";
		query.push("TABLE(");
		query.push("\""+activityTable+"\".\""+processConfiguration.activityColumn+"\", ");
		query.push("AVG(SECONDS_BETWEEN("+startTimestampColumn+", "+timestampColumn+")) ");
		query.push(") NOLIMIT;");
		query = query.join("");
		let res = this.celonisMapper.performQueryAnalysis(analysisId, query);
		let ret = CsvImporter.parseCSV(res);
		let sojournTime = {};
		let i = 1;
		while (i < ret.length) {
			sojournTime[ret[i][0]] = parseFloat(ret[i][1]);
			i++;
		}
		return sojournTime;
	}
	
	downloadAllCaseDurations(analysisId, processConfigurationId=null) {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let processConfiguration = this.getProcessConfiguration(dataModel, processConfigurationId);
		let activityTable = dataModelTables[processConfiguration["activityTableId"]];
		let query = [];
		query.push("TABLE(");
		query.push("\""+activityTable+"\".\""+processConfiguration.caseIdColumn+"\", ");
		query.push("MAX ( CALC_THROUGHPUT ( CASE_START TO CASE_END, REMAP_TIMESTAMPS ( \""+activityTable+"\".\""+processConfiguration.timestampColumn+"\" , SECONDS ) ) )");
		query.push(") NOLIMIT;");
		query = query.join("");
		let res = this.celonisMapper.performQueryAnalysis(analysisId, query);
		let ret = CsvImporter.parseCSV(res);
		let caseDurations = [];
		let i = 1;
		while (i < ret.length) {
			if (ret[i][1].length > 0) {
				caseDurations.push(parseFloat(ret[i][1]));
			}
			else {
				caseDurations.push(0);
			}
			i++;
		}
		return caseDurations;
	}
	
	downloadFrequencyDfg(analysisId, processConfigurationId=null) {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let activities = this.downloadActivities(analysisId, processConfigurationId);
		let startActivities = this.downloadStartActivities(analysisId, processConfigurationId);
		let endActivities = this.downloadEndActivities(analysisId, processConfigurationId);
		let pathsFrequency = this.downloadPathsFrequency(analysisId, processConfigurationId);
		return new FrequencyDfg(activities, startActivities, endActivities, pathsFrequency);
	}
	
	downloadPerformanceDfg(analysisId, processConfigurationId=null, timestampColumn=null, startTimestampColumn=null) {
		if (analysisId == null) {
			analysisId = this.celonisMapper.getFirstAnalysis();
		}
		let activities = this.downloadActivities(analysisId, processConfigurationId);
		let startActivities = this.downloadStartActivities(analysisId, processConfigurationId);
		let endActivities = this.downloadEndActivities(analysisId, processConfigurationId);
		let pathsFrequency = this.downloadPathsFrequency(analysisId, processConfigurationId);
		let pathsPerformance = this.downloadPathsPerformance(analysisId, processConfigurationId);
		let sojournTimes = this.downloadSojournTimes(analysisId, processConfigurationId);
		return new PerformanceDfg(activities, startActivities, endActivities, pathsFrequency, pathsPerformance, sojournTimes);
	}
	
	uploadEventLogToCelonis(eventLog, baseName, dummy=false, caseIdKey="concept:name", activityKey="concept:name", timestampKey="time:timestamp", sep=",", quotechar="\"", newline="\r\n", casePrefix="case:") {
		let dataPoolId = null;
		let dataModelId = null;
		let workspaceId = null;
		let analysisId = null;
		let cases = {};
		for (let trace of eventLog.traces) {
			let caseId = trace.attributes[caseIdKey].value;
			if (caseId.indexOf(sep) > -1) {
				caseId = quotechar+caseId+quotechar;
			}
			cases[caseId] = 0;
		}
		cases = Object.keys(cases);
		caseIdKey = casePrefix+caseIdKey;
		cases.unshift(caseIdKey);
		cases = cases.join(newline);
		let csvExport = CsvExporter.apply(eventLog, sep, quotechar, casePrefix, newline);
		if (!(dummy)) {
			dataPoolId = this.celonisMapper.createDataPool(baseName+"_POOL", false);
			this.celonisMapper.getDataPools();
			dataModelId = this.celonisMapper.createDataModel(dataPoolId, baseName+"_DMODEL");
			this.celonisMapper.getDataModels();
			console.log("created data pool");
			this.celonisMapper.pushCSV(dataPoolId, csvExport, baseName+"_ACTIVITIES", false, "time:timestamp", sep, quotechar, newline);
			this.celonisMapper.getDataPools();
			console.log("created activity table");
			this.celonisMapper.addTableFromPool(dataModelId, baseName+"_ACTIVITIES", false);
			console.log("created data model for activities");
			this.celonisMapper.pushCSV(dataPoolId, cases, baseName+"_CASES", false, null, sep, quotechar, newline);
			this.celonisMapper.getDataPools();
			console.log("created cases table");
			this.celonisMapper.addTableFromPool(dataModelId, baseName+"_CASES", false);
			console.log("created data model for cases");
			this.celonisMapper.getDataModels();
			this.celonisMapper.addForeignKey(dataModelId, baseName+"_ACTIVITIES", caseIdKey, baseName+"_CASES", caseIdKey, false);
			console.log("added foreign key");
			this.celonisMapper.addProcessConfiguration(dataModelId, baseName+"_ACTIVITIES", baseName+"_CASES", caseIdKey, activityKey, timestampKey, null, false);
			console.log("added process configuration");
			this.celonisMapper.reloadDataModel(dataModelId);
			console.log("reloaded data model");
			workspaceId = this.celonisMapper.createWorkspace(dataModelId, baseName+"_WORKSPACE");
			console.log("created workspace");
			analysisId = this.celonisMapper.createAnalysis(workspaceId, baseName+"_ANALYSIS", false);
			console.log("created analysis");
			this.celonisMapper.getDataPools();
			console.log("reloading data pools");
			this.celonisMapper.getDataModels();
			console.log("reloading data models");
			this.celonisMapper.getAnalyses();
			console.log("reloading analyses");
		}
		return {"dataPoolId": dataPoolId, "dataModelId": dataModelId, "workspaceId": workspaceId, "analysisId": analysisId};
	}
}

try {
	require('../../pm4js.js');
	global.Celonis1DWrapper = Celonis1DWrapper;
	module.exports = {Celonis1DWrapper: Celonis1DWrapper};
}
catch (err) {
	// not in Node
}
