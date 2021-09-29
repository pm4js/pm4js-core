class CelonisMapper {
	constructor(baseUrl, apiKey) {
		this.baseUrl = baseUrl;
		this.apiKey = apiKey;
		this.dataPools = null;
		this.dataModels = null;
		this.dataPoolsDataModels = null;
		this.dataModelsForeignKeys = null;
		this.getDataPools();
		this.getDataModels();
		this.getDataModelsForeignKeys();
	}
	
	getDataPools() {
		this.dataPools = null;
		this.dataPools = {};
		let resp = this.performGet(this.baseUrl+"/integration/api/pools");
		for (let obj of resp) {
			this.dataPools[obj["id"]] = obj;
		}
	}
	
	getDataModels() {
		this.dataModels = null;
		this.dataPoolsDataModels = null;
		this.dataModels = {};
		this.dataPoolsDataModels = {};
		for (let objId in this.dataPools) {
			this.dataPoolsDataModels[objId] = {};
			let resp = this.performGet(this.baseUrl+"/integration/api/pools/"+objId+"/data-models");
			for (let model of resp) {
				this.dataPoolsDataModels[objId][model["id"]] = model;
				this.dataModels[model["id"]] = model;
			}
		}
	}
	
	getDataModelsForeignKeys() {
		this.dataModelsForeignKeys = null;
		this.dataModelsForeignKeys = {};
		for (let objId in this.dataPoolsDataModels) {
			this.dataModelsForeignKeys[objId] = {};
			for (let modelId in this.dataPoolsDataModels[objId]) {
				this.dataModelsForeignKeys[objId][modelId] = this.performGet(this.baseUrl+"/integration/api/pools/"+objId+"/data-models/"+modelId+"/foreign-keys");
			}
		}
	}
	
	performGet(url) {
		if (CelonisMapper.IS_NODE) {
			return JSON.parse(retus(url, {headers: {"authorization": "Bearer "+this.apiKey}}).body);
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