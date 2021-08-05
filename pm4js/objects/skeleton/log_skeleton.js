class LogSkeleton {
	constructor(equivalence, neverTogether, alwaysAfter, alwaysBefore, directlyFollows, actCounter) {
		this.equivalence = equivalence;
		this.neverTogether = neverTogether;
		this.alwaysAfter = alwaysAfter;
		this.alwaysBefore = alwaysBefore;
		this.directlyFollows = directlyFollows;
		this.actCounter = actCounter;
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