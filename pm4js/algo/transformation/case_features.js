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
		let features = [];
		for (let attr of evNumAttr) {
			features.push("event@@"+attr);
		}
		for (let attr of trNumAttr) {
			features.push("trace@@"+attr);
		}
		for (let attr of evStrAttr) {
			let values = GeneralLogStatistics.getAttributeValues(eventLog, attr);
			for (let val in values) {
				features.push("event@@"+attr+"##"+val);
			}
		}
		for (let attr of trStrAttr) {
			let values = GeneralLogStatistics.getTraceAttributeValues(eventLog, attr);
			for (let val in values) {
				features.push("trace@@"+attr+"##"+val);
			}
		}
		for (let attr of evSuccStrAttr) {
			let frequencyDfg = FrequencyDfgDiscovery.apply(eventLog, attr).pathsFrequency;
			for (let path in frequencyDfg) {
				features.push("succession@@"+attr+"##"+path);
			}
		}
		console.log(features);
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
	console.log(err);
}


