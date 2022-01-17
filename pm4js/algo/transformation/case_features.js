class CaseFeaturesOutput {
	constructor(data, features) {
		this.data = data;
		this.features = features;
	}
	
	transformToDct() {
		let lst = [];
		let i = 0;
		while (i < this.data.length) {
			let dct = {};
			let j = 0;
			while (j < this.data[i].length) {
				dct[this.features[j]] = this.data[i][j];
				j++;
			}
			lst.push(dct);
			i++;
		}
		return lst;
	}
	
	scaling() {
		let j = 0;
		while (j < this.features.length) {
			let minValue = 99999999999;
			let maxValue = -99999999999;
			let i = 0;
			while (i < this.data.length) {
				minValue = Math.min(minValue, this.data[i][j]);
				maxValue = Math.max(maxValue, this.data[i][j]);
				i++;
			}
			i = 0;
			while (i < this.data.length) {
				if (minValue != maxValue) {
					this.data[i][j] = (this.data[i][j] - minValue)/(maxValue - minValue);
				}
				else {
					this.data[i][j] = 1;
				}
				i++;
			}
			j++;
		}
	}
	
	variancePerFea() {
		let ret = [];
		let j = 0;
		while (j < this.data[0].length) {
			let avg = 0.0;
			let i = 0;
			while (i < this.data.length) {
				avg += this.data[i][j];
				i++;
			}
			avg = avg / this.data.length;
			let vr = 0.0;
			i = 0;
			while (i < this.data.length) {
				vr += (this.data[i][j] - avg)*(this.data[i][j] - avg)
				i++;
			}
			vr = vr / this.data.length;
			ret.push(vr);
			j++;
		}
		return ret;
	}
	
	filterOnVariance(threshold) {
		let varPerFea = OcelObjectFeatures.variancePerFea(this.data);
		let data = [];
		let featureNames = [];
		let i = 0;
		while (i < this.features.length) {
			if (varPerFea[i] > threshold) {
				featureNames.push(this.features[i]);
			}
			i++;
		}
		i = 0;
		while (i < this.data.length) {
			let j = 0;
			let arr = [];
			while (j < this.data[i].length) {
				if (varPerFea[j] > threshold) {
					arr.push(this.data[i][j]);
				}
				j++;
			}
			data.push(arr);
			i++;
		}
		return new CaseFeaturesOutput(data, featureNames);
	}
}

class CaseFeatures {
	static apply(eventLog, activityKey="concept:name", caseIdKey="concept:name", evStrAttr=null, evNumAttr=null, trStrAttr=null, trNumAttr=null, evSuccStrAttr=null, timestampKey="time:timestamp", includeWorkInProgress=CaseFeatures.INCLUDE_WIP) {
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
		let activityMinMaxIdx = CaseFeatures.activityMinMaxIndex(eventLog, activityKey);
		let activityMinMaxTimeFromStart = CaseFeatures.activityMinMaxTimeFromStart(eventLog, activityKey, timestampKey);
		let activityMinMaxTimeToEnd = CaseFeatures.activityMinMaxTimeToEnd(eventLog, activityKey, timestampKey);
		let pathDuration = CaseFeatures.pathDuration(eventLog, activityKey, timestampKey);
		
		let i = 0;
		while (i < data.length) {
			data[i] = [...data[i], ...activityMinMaxIdx[0][i], ...activityMinMaxTimeFromStart[0][i], ...activityMinMaxTimeToEnd[0][i], ...pathDuration[0][i]];
			i++;
		}
		features = [...features, ...activityMinMaxIdx[1], ...activityMinMaxTimeFromStart[1], ...activityMinMaxTimeToEnd[1], ...pathDuration[1]];
		
		if (includeWorkInProgress) {
			let wip = CaseFeatures.workInProgress(eventLog, timestampKey, caseIdKey);
			i = 0;
			while (i < data.length) {
				data[i] = [...data[i], ...wip[0][i]];
				i++;
			}
			features = [...features, ...wip[1]];
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
	
	static activityMinMaxIndex(log, activityKey="concept:name", naRep=-1) {
		let features = ["@@act_min_idx", "@@act_max_idx"];
		let data = [];
		let activities = Object.keys(GeneralLogStatistics.getAttributeValues(log, activityKey));
		for (let trace of log.traces) {
			let minIdx = {};
			let maxIdx = {};
			let i = 0;
			while (i < trace.events.length) {
				let act = trace.events[i].attributes[activityKey];
				if (act != null) {
					act = act.value;
					if (!(act in minIdx)) {
						minIdx[act] = i;
					}
					maxIdx[act] = i;
				}
				i++;
			}
			let arr = [];			
			for (let act of activities) {
				if (act in minIdx) {
					arr.push(minIdx[act]);
					arr.push(maxIdx[act]);
				}
				else {
					arr.push(naRep);
					arr.push(naRep);
				}
			}
			data.push(arr);
		}
		return [data, features];
	}
	
	static activityMinMaxTimeFromStart(log, activityKey="concept:name", timestampKey="time:timestamp", naRep=-1) {
		let features = ["@@act_min_time_from_start", "@@act_max_time_from_start"];
		let data = [];
		let activities = Object.keys(GeneralLogStatistics.getAttributeValues(log, activityKey));
		for (let trace of log.traces) {
			let minTime = {};
			let maxTime = {};
			let i = 0;
			let consideredTime = 0;
			if (trace.events.length > 0) {
				consideredTime = trace.events[0].attributes[timestampKey].value / 1000.0;
			}
			while (i < trace.events.length) {
				let act = trace.events[i].attributes[activityKey];
				let thisTime = trace.events[i].attributes[timestampKey];
				if (act != null && thisTime != null) {
					act = act.value;
					thisTime = thisTime.value / 1000.0;
					if (!(act in minTime)) {
						minTime[act] = thisTime - consideredTime;
					}
					maxTime[act] = thisTime - consideredTime;
				}
				i++;
			}
			let arr = [];			
			for (let act of activities) {
				if (act in minTime) {
					arr.push(minTime[act]);
					arr.push(maxTime[act]);
				}
				else {
					arr.push(naRep);
					arr.push(naRep);
				}
			}
			data.push(arr);
		}
		
		return [data, features];
	}
	
	static activityMinMaxTimeToEnd(log, activityKey="concept:name", timestampKey="time:timestamp", naRep=-1) {
		let features = ["@@act_min_time_to_end", "@@act_max_time_to_end"];
		let data = [];
		let activities = Object.keys(GeneralLogStatistics.getAttributeValues(log, activityKey));
		for (let trace of log.traces) {
			let minTime = {};
			let maxTime = {};
			let i = 0;
			let consideredTime = 0;
			if (trace.events.length > 0) {
				consideredTime = trace.events[trace.events.length - 1].attributes[timestampKey].value / 1000.0;
			}
			while (i < trace.events.length) {
				let act = trace.events[i].attributes[activityKey];
				let thisTime = trace.events[i].attributes[timestampKey];
				if (act != null && thisTime != null) {
					act = act.value;
					thisTime = thisTime.value / 1000.0;
					if (!(act in maxTime)) {
						maxTime[act] = consideredTime - thisTime;
					}
					minTime[act] = consideredTime - thisTime;
				}
				i++;
			}
			let arr = [];			
			for (let act of activities) {
				if (act in minTime) {
					arr.push(minTime[act]);
					arr.push(maxTime[act]);
				}
				else {
					arr.push(naRep);
					arr.push(naRep);
				}
			}
			data.push(arr);
		}
		return [data, features];
	}
	
	static pathDuration(log, activityKey="concept:name", timestampKey="time:timestamp", naRep=-1) {
		let paths = Object.keys(FrequencyDfgDiscovery.apply(log, activityKey).pathsFrequency);
		let data = [];
		let features = [];
		for (let path of paths) {
			features.push("@@path_duration_min_"+path);
			features.push("@@path_duration_max_"+path);
		}
		for (let trace of log.traces) {
			let minPathDuration = {};
			let maxPathDuration = {};
			let i = 0;
			while (i < trace.events.length - 1) {
				let acti = trace.events[i].attributes[activityKey];
				let actj = trace.events[i+1].attributes[activityKey];
				let timei = trace.events[i].attributes[timestampKey];
				let timej = trace.events[i+1].attributes[timestampKey];
				if (acti != null && actj != null && timei != null && timej != null) {
					acti = acti.value;
					actj = actj.value;
					timei = timei.value / 1000;
					timej = timej.value / 1000;
					let path = acti + "," + actj;
					let thisdiff = timej - timei;
					if (!(path in minPathDuration)) {
						minPathDuration[path] = thisdiff;
						maxPathDuration[path] = thisdiff;
					}
					minPathDuration[path] = Math.min(thisdiff, minPathDuration[path]);
					maxPathDuration[path] = Math.max(thisdiff, maxPathDuration[path]);
				}
				let arr = [];
				for (let path of paths) {
					if (path in minPathDuration) {
						arr.push(minPathDuration[path]);
						arr.push(maxPathDuration[path]);
					}
					else {
						arr.push(naRep);
						arr.push(naRep);
					}
				}
				data.push(arr);
				i++;
			}
		}
		return [data, features];
	}
	
	static workInProgress(log, timestampKey="time:timestamp", caseIdKey="concept:name") {
		let tree = IntervalTreeBuilder.apply(log, timestampKey);
		let features = ["@@case_wip"];
		let data = [];
		let i = 0;
		while (i < log.traces.length) {
			let inte = {};
			if (log.traces[i].events.length > 0) {
				let st = log.traces[i].events[0].attributes[timestampKey].value / 1000.0;
				let et = log.traces[i].events[log.traces[i].events.length - 1].attributes[timestampKey].value / 1000.0;
				let intersectionAfterBefore = IntervalTreeAlgorithms.queryInterval(tree, st, et);
				for (let el of intersectionAfterBefore) {
					inte[el.value[0].attributes[caseIdKey].value] = 0;
				}
			}
			data.push([Object.keys(inte).length]);
			i++;
		}
		return [data, features];
	}
}

CaseFeatures.INCLUDE_WIP = false;
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


