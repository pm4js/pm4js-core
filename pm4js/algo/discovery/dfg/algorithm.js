class FrequencyDfgDiscovery {
	static applyPlugin(eventLog, activityKey="concept:name") {
		return FrequencyDfgDiscovery.apply(eventLog, activityKey, true);
	}
	
	static apply(eventLog, activityKey="concept:name", addObject=false) {
		let sa = GeneralLogStatistics.getStartActivities(eventLog, activityKey);
		let ea = GeneralLogStatistics.getEndActivities(eventLog, activityKey);
		let activities = GeneralLogStatistics.getAttributeValues(eventLog, activityKey);
		let paths = {};
		for (let trace of eventLog.traces) {
			let i = 0;
			while (i < trace.events.length-1) {
				if (activityKey in trace.events[i].attributes && activityKey in trace.events[i+1].attributes) {
					let act1 = trace.events[i].attributes[activityKey].value;
					let act2 = trace.events[i+1].attributes[activityKey].value;
					let path = act1+","+act2;
					let pathOcc = paths[path];
					if (pathOcc == null) {
						paths[path] = 1;
					}
					else {
						paths[path] = paths[path] + 1;
					}
				}
				i++;
			}
		}
		let ret = new FrequencyDfg(activities, sa, ea, paths);
		if (addObject) {
			Pm4JS.registerObject(ret, "Frequency Directly-Follows Graph");
		}
		return ret;
	}
}

class PerformanceDfgDiscovery {
	static applyPlugin(eventLog, activityKey="concept:name", timestampKey="time:timestamp", aggregationMeasure="mean", startTimestampKey="time:timestamp") {
		return PerformanceDfgDiscovery.apply(eventLog, activityKey, timestampKey, aggregationMeasure, startTimestampKey, true);
	}
	
	static apply(eventLog, activityKey="concept:name", timestampKey="time:timestamp", aggregationMeasure="mean", startTimestampKey="time:timestamp", addObject=false) {
		let freqDfg = FrequencyDfgDiscovery.apply(eventLog, activityKey);
		let sa = freqDfg.startActivities;
		let ea = freqDfg.endActivities;
		let activities = freqDfg.activities;
		let pathsFrequency = freqDfg.pathsFrequency;
		let paths = {};
		for (let trace of eventLog.traces) {
			let i = 0;
			while (i < trace.events.length-1) {
				if (activityKey in trace.events[i].attributes && activityKey in trace.events[i+1].attributes) {
					let act1 = trace.events[i].attributes[activityKey].value;
					let act2 = trace.events[i+1].attributes[activityKey].value;
					let path = act1+","+act2;
					let ts1 = trace.events[i].attributes[timestampKey].value.getTime();
					let ts2 = trace.events[i+1].attributes[startTimestampKey].value.getTime();
					let diff = (ts2 - ts1)/1000;
					if (!(path in paths)) {
						paths[path] = [];
					}
					paths[path].push(diff);
				}
				i++;
			}
		}
		for (let path in paths) {
			if (aggregationMeasure == "stdev") {
				paths[path] = PerformanceDfgDiscovery.calculateStdev(paths[path]);
			}
			else if (aggregationMeasure == "min") {
				paths[path] = PerformanceDfgDiscovery.calculateMin(paths[path]);
			}
			else if (aggregationMeasure == "max") {
				paths[path] = PerformanceDfgDiscovery.calculateMax(paths[path]);
			}
			else if (aggregationMeasure == "median") {
				paths[path] = PerformanceDfgDiscovery.calculateMedian(paths[path]);
			}
			else if (aggregationMeasure == "sum") {
				paths[path] = PerformanceDfgDiscovery.calculateSum(paths[path]);
			}
			else if (aggregationMeasure == "raw_values") {
				// returns the raw values
			}
			else {
				paths[path] = PerformanceDfgDiscovery.calculateMean(paths[path]);
			}
		}
		let sojournTimes = GeneralLogStatistics.getAverageSojournTime(eventLog, activityKey, timestampKey, startTimestampKey);
		let ret = new PerformanceDfg(activities, sa, ea, pathsFrequency, paths, sojournTimes);
		if (addObject) {
			Pm4JS.registerObject(ret, "Performance Directly-Follows Graph");
		}
		return ret;
	}
	
	static calculateMean(array) {
		let sum = 0.0;
		for (let el of array) {
			sum += el;
		}
		return sum / array.length;
	}
	
	static calculateStdev(array) {
		let mean = PerformanceDfgDiscovery.calculateMean(array);
		let sum = 0.0;
		for (let el of array) {
			sum += (el - mean)*(el-mean);
		}
		return Math.sqrt(sum / array.length);
	}
	
	static calculateMin(array) {
		let minValue = Number.MAX_SAFE_INTEGER;
		for (let el of array) {
			minValue = Math.min(minValue, el);
		}
		return minValue;
	}
	
	static calculateMax(array) {
		let maxValue = Number.MIN_SAFE_INTEGER;
		for (let el of array) {
			maxValue = Math.max(maxValue, el);
		}
		return maxValue;
	}
	
	static calculateMedian(array) {
		array.sort();
		return array[Math.floor(array.length / 2)];
	}
	
	static calculateSum(array) {
		let ret = 0.0;
		for (let el of array) {
			ret += el;
		}
		return ret;
	}
}

try {
	require("../../../pm4js.js");
	require("../../../statistics/log/general.js");
	require("../../../objects/dfg/frequency/obj.js");
	require("../../../objects/dfg/performance/obj.js");
	module.exports = {FrequencyDfgDiscovery: FrequencyDfgDiscovery, PerformanceDfgDiscovery: PerformanceDfgDiscovery};
	global.FrequencyDfgDiscovery = FrequencyDfgDiscovery;
	global.PerformanceDfgDiscovery = PerformanceDfgDiscovery;
}
catch (err) {
	// not in Node.JS
}

Pm4JS.registerAlgorithm("FrequencyDfgDiscovery", "applyPlugin", ["EventLog"], "FrequencyDfg", "Get Frequency DFG abstraction", "Alessandro Berti");
Pm4JS.registerAlgorithm("PerformanceDfgDiscovery", "applyPlugin", ["EventLog"], "PerformanceDfg", "Get Performance DFG abstraction", "Alessandro Berti");
