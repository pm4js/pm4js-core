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
