class CaseFeaturesOutput {
	constructor(data, features) {
		this.data = data;
		this.features = features;
	}
}

class CaseFeatures {
	static apply(eventLog, activityKey="concept:name", caseIdKey="concept:name", evStrAttr=null, evNumAttr=null, trStrAttr=null, trNumAttr=null, evSuccStrAttr=null) {
		let vect = null;
		if (evStrAttr == null || evNumAttr == null || trStrAttr == null || trNumAttr == null || evSuccStrAttr == null) {
			vect = CaseFeatures.automaticFeatureSelection(eventLog, activityKey);
		}
		if (evStrAttr == null) {
			evStrAttr = vect[0];
		}
		if (evNumAttr == null) {
			evNumAttr = vect[1];
		}
		if (trStrAttr == null) {
			trStrAttr = vect[2];
		}
		if (trNumAttr == null) {
			trNumAttr = vect[3];
		}
		if (evSuccStrAttr == null) {
			evSuccStrAttr = vect[4];
		}
		vect = CaseFeatures.formFeaturesFromSpecification(eventLog, evStrAttr, evNumAttr, trStrAttr, trNumAttr, evSuccStrAttr);
		let features = vect[0];
		let valuesCorr = vect[1];
		let data = [];
		for (let trace of eventLog.traces) {
			let vect = [];
			for (let attr of trNumAttr) {
				vect.push(trace.attributes[attr].value);
			}
			for (let attr of evNumAttr) {
				let i = trace.events.length - 1;
				while (i >= 0) {
					if (attr in trace.events[i].attributes) {
						vect.push(trace.events[i].attributes[attr].value);
						break;
					}
					i--;
				}
			}
			for (let attr of trStrAttr) {
				let value = null;
				if (attr in trace.attributes) {
					value = trace.attributes[attr].value;
				}
				for (let val of valuesCorr["trace@@"+attr]) {
					if (val == value) {
						vect.push(1);
					}
					else {
						vect.push(0);
					}
				}
			}
			for (let attr of evStrAttr) {
				let values = {};
				for (let eve of trace.events) {
					if (attr in eve.attributes) {
						let val = eve.attributes[attr].value;
						if (!(val in values)) {
							values[val] = 1;
						}
						else {
							values[val] += 1;
						}
					}
				}
				for (let val of valuesCorr["event@@"+attr]) {
					if (val in values) {
						vect.push(values[val]);
					}
					else {
						vect.push(0);
					}
				}
			}
			for (let attr of evSuccStrAttr) {
				let paths = {};
				let i = 0;
				while (i < trace.events.length - 1) {
					if (attr in trace.events[i].attributes && attr in trace.events[i+1].attributes) {
						let val1 = trace.events[i].attributes[attr].value;
						let val2 = trace.events[i+1].attributes[attr].value;
						let path = val1+","+val2;
						if (!(path in paths)) {
							paths[path] = 1;
						}
						else {
							paths[path] += 1;
						}
					}
					i++;
				}
				for (let path of valuesCorr["succession@@"+attr]) {
					if (path in paths) {
						vect.push(paths[path]);
					}
					else {
						vect.push(0);
					}
				}
			}
			data.push(vect);
		}
		return new CaseFeaturesOutput(data, features);
	}
	
	static formFeaturesFromSpecification(eventLog, evStrAttr, evNumAttr, trStrAttr, trNumAttr, evSuccStrAttr) {
		let features = [];
		let valuesCorr = {};
		for (let attr of evNumAttr) {
			features.push("event@@"+attr);
		}
		for (let attr of trNumAttr) {
			features.push("trace@@"+attr);
		}
		for (let attr of evStrAttr) {
			let values = Object.keys(GeneralLogStatistics.getAttributeValues(eventLog, attr));
			valuesCorr["event@@"+attr] = values;
			for (let val of values) {
				features.push("event@@"+attr+"##"+val);
			}
		}
		for (let attr of trStrAttr) {
			let values = Object.keys(GeneralLogStatistics.getTraceAttributeValues(eventLog, attr));
			valuesCorr["trace@@"+attr] = values;
			for (let val of values) {
				features.push("trace@@"+attr+"##"+val);
			}
		}
		for (let attr of evSuccStrAttr) {
			let frequencyDfg = Object.keys(FrequencyDfgDiscovery.apply(eventLog, attr).pathsFrequency);
			valuesCorr["succession@@"+attr] = frequencyDfg;
			for (let path of frequencyDfg) {
				features.push("succession@@"+attr+"##"+path);
			}
		}
		return [features, valuesCorr];
	}
	
	static automaticFeatureSelection(eventLog, activityKey="concept:name", caseIdKey="concept:name") {
		let evAttrWithType = GeneralLogStatistics.getEventAttributesWithType(eventLog);
		let trAttrWithType = GeneralLogStatistics.getTraceAttributesWithType(eventLog);
		let evStrAttrCandidatesWithValues = {};
		let evNumAttr = [];
		let trStrAttrCandidatesWithValues = {};
		let trNumAttr = [];
		for (let attr in evAttrWithType) {
			if (evAttrWithType[attr] == "string") {
				let values = GeneralLogStatistics.getAttributeValues(eventLog, attr);
				if (Object.keys(values).length >= 2 && (Object.keys(values).length <= 50 || attr == activityKey)) {
					evStrAttrCandidatesWithValues[attr] = values;
				}
			}
			else if (evAttrWithType[attr] == "number") {
				let res = CaseFeatures.checkNumericEventAttribute(eventLog, attr);
				if (res) {
					evNumAttr.push(attr);
				}
			}
		}
		for (let attr in trAttrWithType) {
			if (trAttrWithType[attr] == "string") {
				if (attr != caseIdKey) {
					let values = GeneralLogStatistics.getTraceAttributeValues(eventLog, attr);
					if (Object.keys(values).length >= 2 && Object.keys(values).length <= 50) {
						trStrAttrCandidatesWithValues[attr] =  values;
					}
				}
			}
			else if (trAttrWithType[attr] == "number") {
				let res = CaseFeatures.checkNumericTraceAttribute(eventLog, attr);
				if (res) {
					trNumAttr.push(attr);
				}
			}
		}
		return [Object.keys(evStrAttrCandidatesWithValues), evNumAttr, Object.keys(trStrAttrCandidatesWithValues), trNumAttr, [activityKey]];
	}
	
	static checkNumericEventAttribute(log, attr) {
		for (let trace of log.traces) {
			let found = false;
			for (let eve of trace.events) {
				if (attr in eve.attributes) {
					found = true;
					break;
				}
			}
			if (!(found)) {
				return false;
			}
		}
		return true;
	}
	
	static checkNumericTraceAttribute(log, attr) {
		for (let trace of log.traces) {
			if (!(attr in trace.attributes)) {
				return false;
			}
		}
		return true;
	}
}

try {
	require('../../pm4js.js');
	require('../discovery/dfg/algorithm.js');
	require('../../statistics/log/general.js');
	module.exports = {CaseFeatures: CaseFeatures};
	global.CaseFeatures = CaseFeatures;
}
catch (err) {
	// not in node
	//console.log(err);
}


