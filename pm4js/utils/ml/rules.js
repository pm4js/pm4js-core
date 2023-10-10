class MlRules {
	static dataRandomClassification(data) {
		let classification = [];
		let i = 0;
		while (i < data.length) {
			let r = Math.random();
			if (r <= 0.5) {
				classification.push(1);
			}
			else {
				classification.push(-1);
			}
			i++;
		}
		return classification;
	}
	
	static extractRangePerFeature(data, j, classification) {
		let minRange = 9999999;
		let maxRange = -9999999;
		let i = 0;
		while (i < data.length) {
			if (classification[i] == 1) {
				minRange = Math.min(minRange, data[i][j]);
				maxRange = Math.max(maxRange, data[i][j]);
			}
			i++;
		}
		return [minRange, maxRange];
	}

	static ruleDiscovery(data, featureNames, classification) {
		let ret = {};
		let j = 0;
		while (j < featureNames.length) {
			let ranges = MlRules.extractRangePerFeature(data, j, classification);
			ret[featureNames[j]] = ranges;
			j++;
		}
		return ret;
	}

	static ruleClassificationScore(rules, data, features, classification) {
		let ret = {};
		let j = 0;
		while (j < features.length) {
			let feature = features[j];
			let ranges = rules[feature];
			let i = 0;
			let devCount = 0;
			let devDetectedCount = 0;
			while (i < data.length) {
				if (classification[i] == -1) {
					devCount++;
					if (data[i][j] < ranges[0] || data[i][j] > ranges[1]) {
						devDetectedCount++;
					}
				}
				i++;
			}
			ret[feature] = 0;
			if (devCount > 0) {
				ret[feature] = devDetectedCount / devCount;
			}
			j++;
		}
		return ret;
	}

	static getClassificationFromRule(rules, data, features, feature) {
		let ret = [];
		let j = features.indexOf(feature);
		let ranges = rules[feature];
		let i = 0;
		while (i < data.length) {
			if (data[i][j] < ranges[0] || data[i][j] > ranges[1]) {
				ret.push(-1);
			}
			else {
				ret.push(1);
			}
			i++;
		}
		return ret;
	}
}

try {
	module.exports = {MlRules: MlRules};
	global.MlRules = MlRules;
}
catch (err) {
	// not in node
}
