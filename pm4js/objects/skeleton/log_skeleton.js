class LogSkeleton {
	constructor(equivalence, neverTogether, alwaysAfter, alwaysBefore, directlyFollows, actCounter) {
		this.equivalence = equivalence;
		this.neverTogether = neverTogether;
		this.alwaysAfter = alwaysAfter;
		this.alwaysBefore = alwaysBefore;
		this.directlyFollows = directlyFollows;
		this.actCounter = actCounter;
	}
	
	filterOnNoiseThreshold(thresh) {
		thresh = 1.0 - thresh;
		console.log(thresh);
		let newEquivalence = {};
		let newNeverTogether = {};
		let newAlwaysAfter = {};
		let newAlwaysBefore = {};
		let newDirectlyFollows = {};
		let newActCounter = {};
		for (let cou in this.equivalence) {
			if (this.equivalence[cou] >= thresh) {
				newEquivalence[cou] = this.equivalence[cou];
			}
		}
		for (let cou in this.neverTogether) {
			if (this.neverTogether[cou] >= thresh) {
				newNeverTogether[cou] = this.neverTogether[cou];
			}
		}
		for (let cou in this.alwaysAfter) {
			if (this.alwaysAfter[cou] >= thresh) {
				newAlwaysAfter[cou] = this.alwaysAfter[cou];
			}
		}
		for (let cou in this.alwaysBefore) {
			if (this.alwaysBefore[cou] >= thresh) {
				newAlwaysBefore[cou] = this.alwaysBefore[cou];
			}
		}
		for (let cou in this.directlyFollows) {
			if (this.directlyFollows[cou] >= thresh) {
				newDirectlyFollows[cou] = this.directlyFollows[cou];
			}
		}
		for (let act in this.actCounter) {
			for (let actocc in this.actCounter[act]) {
				if (this.actCounter[act][actocc] >= thresh) {
					if (!(act in newActCounter)) {
						newActCounter[act] = {};
					}
					newActCounter[act][actocc] = this.actCounter[act][actocc];
				}
			}
		}
		return new LogSkeleton(newEquivalence, newNeverTogether, newAlwaysAfter, newAlwaysBefore, newDirectlyFollows, newActCounter);
	}
}

try {
	require('../../pm4js.js');
	module.exports = { LogSkeleton: LogSkeleton };
	global.LogSkeleton = LogSkeleton;
}
catch (err) {
	// not in Node
	console.log(err);
}