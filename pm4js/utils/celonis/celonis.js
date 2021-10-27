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
		this.defaultAnalysis = null;
	}
	
	getFirstAnalysis() {
		if (this.defaultAnalysis != null) {
			return this.defaultAnalysis;
		}
		let analysisIds = Object.keys(this.analysis).sort();
		return analysisIds[0];
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
		this.getAnalysesDataModel();
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
		if (resp1["exportStatus"] == "WAITING" || resp1["exportStatus"] == "RUNNING" || resp1["exportStatus"] == "DONE") {
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
	
	createWorkspace(dataModelId, name) {
		let ret = this.performPostJson(this.baseUrl+"/process-mining/api/processes", {"name": name, "dataModelId": dataModelId});
		return ret["id"];
	}
	
	createAnalysis(workspaceId, name, reload=true) {
		let ret = this.performPostJson(this.baseUrl+"/process-mining/api/analysis", {"name": name, "processId": workspaceId, "applicationId": null});
		if (reload) {
			this.getAnalyses();
		}
		return ret["id"];
	}
	
	createDataModel(dataPoolId, name, reload=true) {
		let ret = this.performPostJson(this.baseUrl+"/integration/api/pools/"+dataPoolId+"/data-models", {"name": name, "poolId": dataPoolId, "configurationSkipped": true});
		if (reload) {
			this.getDataModels();
		}
		return ret["id"];
	}
	
	createDataPool(name, reload=true) {
		let ret = this.performPostJson(this.baseUrl+"/integration/api/pools", {"name": name});
		if (reload) {
			this.getDataPools();
		}
		return ret["id"];
	}
	
	getTablesFromPool(dataPoolId) {
		let ret = this.performGet(this.baseUrl+"/integration/api/pools/"+dataPoolId+"/tables");
		return ret;
	}
	
	addTableFromPool(dataModelId, tableName, reload=true) {
		let dataPoolId = this.dataModelsDataPools[dataModelId];
		let payload = [{"dataSourceId": null, "dataModelId": dataModelId, "name": tableName, "alias": tableName}];
		let ret = this.performPostJson(this.baseUrl+"/integration/api/pools/"+dataPoolId+"/data-model/"+dataModelId+"/tables", payload);
		if (reload) {
			this.getDataModels();
		}
	}
	
	getTableIdFromName(dataModelId, tableName) {
		for (let tableId in this.dataModelsTables[dataModelId]) {
			if (this.dataModelsTables[dataModelId][tableId] == tableName) {
				return tableId;
			}
		}
	}
	
	addForeignKey(dataModelId, table1, column1, table2, column2, reload=true) {
		table1 = this.getTableIdFromName(dataModelId, table1);
		table2 = this.getTableIdFromName(dataModelId, table2);
		let dataPoolId = this.dataModelsDataPools[dataModelId];
		let url = this.baseUrl+"/integration/api/pools/"+dataPoolId+"/data-models/"+dataModelId+"/foreign-keys";
		let payload = {"dataModelId": dataModelId, "sourceTableId": table1, "targetTableId": table2, "columns": [{"sourceColumnName": column1, "targetColumnName": column2}]};
		let ret = this.performPostJson(url, payload);
		if (reload) {
			this.getDataModels();
		}
	}
	
	addProcessConfiguration(dataModelId, activityTable, caseTable, caseIdColumn, activityColumn, timestampColumn, sortingColumn=null, reload=true) {
		let payload = {};
		let dataPoolId = this.dataModelsDataPools[dataModelId];
		activityTable = this.getTableIdFromName(dataModelId, activityTable);
		caseTable = this.getTableIdFromName(dataModelId, caseTable);
		payload["activityTableId"] = activityTable;
		payload["caseTableId"] = caseTable;
		payload["caseIdColumn"] = caseIdColumn;
		payload["activityColumn"] = activityColumn;
		payload["timestampColumn"] = timestampColumn;
		let url = this.baseUrl+"/integration/api/pools/"+dataPoolId+"/data-models/"+dataModelId+"/process-configurations";
		let ret = this.performPutJson(url, payload);
		if (reload) {
			this.getDataModels();
		}
	}
	
	reloadDataModel(dataModelId, waitingTime1=1000, waitingTime2=10000) {
		let dataPoolId = this.dataModelsDataPools[dataModelId];
		let dataModel = this.dataModels[dataModelId];
		let url = this.baseUrl+"/integration/api/pools/"+dataPoolId+"/data-models/"+dataModelId+"/reload";
		try {
			let ret = this.performPostJson(url, {"forceComplete": true});
		}
		catch (err) {
		}
		console.log("... reloading the data model: "+dataModel["name"]);
		while (true) {
			let url = this.baseUrl+"/integration/api/pools/"+dataPoolId+"/data-models/"+dataModelId+"/load-history/load-info-sync";
			this.pausecomp(waitingTime1);
			let ret = this.performGet(url)["loadInfo"]["currentComputeLoad"]["loadStatus"];
			if (ret == "DONE" || ret == "SUCCESS") {
				break;
			}
			console.log("... still waiting");
			this.pausecomp(waitingTime2);
		}
		console.log("successful reload of data model: "+dataModel["name"]);
	}
	
	performGet(url, isRequestJson=true) {
		if (CelonisMapper.IS_NODE) {
			let ret = retus(url, {headers: {"authorization": "Bearer "+this.apiKey}}).body;
			if (isRequestJson) {
				return JSON.parse(ret);
			}
			return ret;
		}
		else {
			let ret = null;
			let ajaxDict = {
				url: CelonisMapper.PROXY_URL_GET,
				data: {"access_token": this.apiKey, "url": url},
				async: false,
				success: function(data) {
					ret = data;
				}
			}
			$.ajax(ajaxDict);
			if (isRequestJson) {
				ret = JSON.parse(ret);
			}
			return ret;
		}
	}
	
	performPostJson(url, jsonContent) {
		if (CelonisMapper.IS_NODE) {
			return retus(url, {method: "post", headers: {"authorization": "Bearer "+this.apiKey}, json: jsonContent}).body;
		}
		else {
			let ret = null;
			jsonContent["access_token"] = this.apiKey;
			jsonContent["url"] = url;
			let ajaxDict = {
				url: CelonisMapper.PROXY_URL_POST,
				dataType: 'json',
				type: 'post',
				contentType: 'application/json',
				data: JSON.stringify(jsonContent),
				async: false,
				success: function(data) {
					ret = data;
				}
			}
			$.ajax(ajaxDict);
			return ret;
		}
	}
	
	performPutJson(url, jsonContent) {
		if (CelonisMapper.IS_NODE) {
			return retus(url, {method: "put", headers: {"authorization": "Bearer "+this.apiKey}, json: jsonContent}).body;
		}
		else {
			let ret = null;
			jsonContent["access_token"] = this.apiKey;
			jsonContent["url"] = url;
			let ajaxDict = {
				url: CelonisMapper.PROXY_URL_POST,
				dataType: 'json',
				type: 'post',
				contentType: 'application/json',
				data: JSON.stringify(jsonContent),
				async: false,
				success: function(data) {
					ret = data;
				}
			}
			$.ajax(ajaxDict);
			return ret;
		}
	}
	
	static autoConfiguration() {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		let targetUrl = ""+document.referrer;
		targetUrl = targetUrl.substring(0, targetUrl.length - 1);
		let apiKey = urlParams.get("key");
		let analysis = urlParams.get("analysis");
		let celonisMapper = new CelonisMapper(targetUrl, apiKey);
		celonisMapper.defaultAnalysis = analysis;
		return celonisMapper;
	}
	
	toString() {
		return "CelonisMapper url="+this.baseUrl+" key="+this.apiKey+" defaultAnalysis="+this.defaultAnalysis;
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
	CelonisMapper.IS_NODE = false;
	CelonisMapper.PROXY_URL_GET = "http://localhost:5004/getWrapper";
	CelonisMapper.PROXY_URL_POST = "http://localhost:5004/postWrapper";
	CelonisMapper.PROXY_URL_POST = "http://localhost:5004/putWrapper";
}