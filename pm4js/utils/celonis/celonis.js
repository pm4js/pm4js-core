class CelonisMapper {
	constructor(baseUrl, apiKey) {
		this.baseUrl = baseUrl;
		this.apiKey = apiKey;
		this.dataPools = null;
		this.dataPoolsNames = null;
		this.dataModels = null;
		this.dataModelsNames = null;
		this.dataPoolsDataModels = null;
		this.dataModelsDataPools = null;
		this.dataModelsTables = null;
		this.analysis = null;
		this.analysisNames = null;
		this.analysisDataModel = null;
		this.getDataPools();
		this.getDataModels();
		this.getAnalyses();
		this.getAnalysesDataModel();
	}
	
	getDataPools() {
		this.dataPools = null;
		this.dataPoolsNames = null;
		this.dataPools = {};
		this.dataPoolsNames = {};
		let resp = this.performGet(this.baseUrl+"/integration/api/pools");
		for (let obj of resp) {
			this.dataPoolsNames[obj["name"]] = obj["id"];
			this.dataPools[obj["id"]] = obj;
		}
	}
	
	getDataModels() {
		this.dataModels = null;
		this.dataPoolsDataModels = null;
		this.dataModelsDataPools = null;
		this.dataModelsNames = null;
		this.dataModelsTables = null;
		this.dataModels = {};
		this.dataPoolsDataModels = {};
		this.dataModelsDataPools = {};
		this.dataModelsNames = {};
		this.dataModelsTables = {};
		for (let objId in this.dataPools) {
			this.dataPoolsDataModels[objId] = {};
			let resp = this.performGet(this.baseUrl+"/integration/api/pools/"+objId+"/data-models");
			for (let model of resp) {
				this.dataPoolsDataModels[objId][model["id"]] = model;
				this.dataModels[model["id"]] = model;
				this.dataModelsDataPools[model["id"]] = objId;
				this.dataModelsNames[model["name"]] = model["id"];
				this.dataModelsTables[model["id"]] = {};
				for (let table of model.tables) {
					this.dataModelsTables[model["id"]][table["id"]] = table["name"];
				}
			}
		}
	}
	
	getAnalyses() {
		this.analysis = null;
		this.analysisNames = null;
		this.analysis = {};
		this.analysisNames = {};
		let resp = this.performGet(this.baseUrl+"/process-mining/api/analysis");
		for (let ana of resp) {
			this.analysis[ana["id"]] = ana;
			this.analysisNames[ana["name"]] = ana["id"];
		}
	}
	
	getAnalysesDataModel() {
		this.analysisDataModel = null;
		this.analysisDataModel = {};
		for (let anaId in this.analysis) {
			let resp = this.performGet(this.baseUrl+"/process-mining/analysis/v1.2/api/analysis/"+anaId+"/data_model");
			this.analysisDataModel[anaId] = resp["id"];
		}
	}
	
	pausecomp(millis)
	{
		var date = new Date();
		var curDate = null;
		do { curDate = new Date(); }
		while(curDate-date < millis);
	}
	
	performQueryAnalysis(analysisId, pqlQuery, waitingTime1=250, waitingTime2=750) {
		let dataModel = this.dataModels[this.analysisDataModel[analysisId]];
		let payload = {'dataCommandRequest': {'variables': [], 'request': {'commands': [{'queries': [pqlQuery], 'computationId': 0, 'isTransient': false}], 'cubeId': dataModel["id"]}}, 'exportType': 'CSV'};
		let resp1 = this.performPostJson(this.baseUrl+"/process-mining/analysis/v1.2/api/analysis/"+analysisId+"/exporting/query", payload);
		if (resp1["exportStatus"] != "FAILED") {
			let downloadId = resp1["id"];
			while (true) {
				this.pausecomp(waitingTime1);
				let resp2 = this.performGet(this.baseUrl+"/process-mining/analysis/v1.2/api/analysis/"+analysisId+"/exporting/query/"+downloadId+"/status");
				if (resp2.exportStatus == "DONE") {
					break;
				}
				this.pausecomp(waitingTime2);
			}
			let resp3 = this.performGet(this.baseUrl+"/process-mining/analysis/v1.2/api/analysis/"+analysisId+"/exporting/query/"+downloadId+"/download", false);
			return resp3;
		}
		return resp1;
	}
	
	performGet(url, isRequestJson=true) {
		if (CelonisMapper.IS_NODE) {
			let ret = retus(url, {headers: {"authorization": "Bearer "+this.apiKey}}).body;
			if (isRequestJson) {
				return JSON.parse(ret);
			}
			return ret;
		}
	}
	
	performPostJson(url, jsonContent) {
		if (CelonisMapper.IS_NODE) {
			return retus(url, {method: "post", headers: {"authorization": "Bearer "+this.apiKey}, json: jsonContent}).body;
		}
	}
}

try {
	global.retus = require("retus");
	require('../../pm4js.js');
	global.CelonisMapper = CelonisMapper;
	module.exports = {CelonisMapper: CelonisMapper};
	CelonisMapper.IS_NODE = true;
}
catch (err) {
	// not in Node
	console.log(err);
	CelonisMapper.IS_NODE = false;
}