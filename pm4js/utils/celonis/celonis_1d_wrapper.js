class Celonis1DWrapper {
	constructor(celonisMapper) {
		this.celonisMapper = celonisMapper;
	}
	
	getProcessConfiguration(dataModel, processConfigurationId=null) {
		return dataModel.processConfigurations[0];
	}
	
	downloadBaseEventLog(analysisId, processConfigurationId=null) {
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
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let processConfiguration = this.getProcessConfiguration(dataModel, processConfigurationId);
		let activityTable = dataModelTables[processConfiguration["activityTableId"]];
		let query = [];
		query.push("TABLE(");
		query.push("ACTIVITY_LAG ( \""+activityTable+"\".\""+processConfiguration.activityColumn+"\", 1) AS \"PREV_ACTIVITY\", ");
		query.push("\""+activityTable+"\".\""+processConfiguration.activityColumn+"\" AS \"CURR_ACTIVITY\" ) NOLIMIT;");
		query = query.join("");
		let ret = CsvImporter.parseCSV(this.celonisMapper.performQueryAnalysis(analysisId, query));
		let sa_dict = {};
		for (let el of ret) {
			if (el[0].length == 0) {
				if (!(el[1] in sa_dict)) {
					sa_dict[el[1]] = 1;
				}
				else {
					sa_dict[el[1]] += 1;
				}
			}
		}
		return sa_dict;
	}
	
	downloadEndActivities(analysisId, processConfigurationId=null) {
		let dataModel = this.celonisMapper.dataModels[this.celonisMapper.analysisDataModel[analysisId]];
		let dataModelTables = this.celonisMapper.dataModelsTables[dataModel["id"]];
		let processConfiguration = this.getProcessConfiguration(dataModel, processConfigurationId);
		let activityTable = dataModelTables[processConfiguration["activityTableId"]];
		let query = [];
		query.push("TABLE(");
		query.push("ACTIVITY_LEAD ( \""+activityTable+"\".\""+processConfiguration.activityColumn+"\", 1) AS \"NEXT_ACTIVITY\", ");
		query.push("\""+activityTable+"\".\""+processConfiguration.activityColumn+"\" AS \"CURR_ACTIVITY\" ) NOLIMIT;");
		query = query.join("");
		let ret = CsvImporter.parseCSV(this.celonisMapper.performQueryAnalysis(analysisId, query));
		let ea_dict = {};
		for (let el of ret) {
			if (el[0].length == 0) {
				if (!(el[1] in ea_dict)) {
					ea_dict[el[1]] = 1;
				}
				else {
					ea_dict[el[1]] += 1;
				}
			}
		}
		return ea_dict;
	}
	
	downloadActivities(analysisId, processConfigurationId=null) {
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
	
	downloadDfg(analysisId, processConfigurationId=null) {
		let activities = this.downloadActivities(analysisId, processConfigurationId);
		let startActivities = this.downloadStartActivities(analysisId, processConfigurationId);
		let endActivities = this.downloadEndActivities(analysisId, processConfigurationId);
		let pathsFrequency = this.downloadPathsFrequency(analysisId, processConfigurationId);
		return new FrequencyDfg(activities, startActivities, endActivities, pathsFrequency);
	}
}

try {
	require('../../pm4js.js');
	global.Celonis1DWrapper = Celonis1DWrapper;
	module.exports = {Celonis1DWrapper: Celonis1DWrapper};
}
catch (err) {
	// not in Node
	console.log(err);
}
