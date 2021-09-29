class CelonisMapper {
	constructor(baseUrl, apiKey) {
		this.baseUrl = baseUrl;
		this.apiKey = apiKey;
		this.dataPools = null;
		this.getDataPools();
		console.log(this.dataPools);
	}
	
	getDataPools() {
		this.dataPools = null;
		this.dataPools = {};
		let resp = this.performGet(this.baseUrl+"/integration/api/pools");
		for (let obj of resp) {
			this.dataPools[obj["id"]] = obj;
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