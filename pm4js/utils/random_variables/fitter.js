class RandomVariableFitter {
	static apply(arrayValues, debug=true) {
		let rv = null;
		let likelihood = -Number.MAX_VALUE;
		try {
			let un = UniformRandomVariable.estimateParameters(arrayValues);
			let unLikelihood = un.logLikelihood(arrayValues);
			if (debug) {
				console.log("unLikelihood = "+unLikelihood);
			}
			if (unLikelihood > likelihood) {
				rv = un;
				likelihood = unLikelihood;
			}
		}
		catch (err) {
			console.log(err);
		}
		try {
			let nv = NormalRandomVariable.estimateParameters(arrayValues);
			let nvLikelihood = nv.logLikelihood(arrayValues);
			if (debug) {
				console.log("nvLikelihood = "+nvLikelihood);
			}
			if (nvLikelihood > likelihood) {
				rv = nv;
				likelihood = nvLikelihood;
			}
		}
		catch (err) {
			console.log(err);
		}
		try {
			let lnv = LogNormalRandomVariable.estimateParameters(arrayValues);
			let lnvLikelihood = lnv.logLikelihood(arrayValues);
			if (debug) {
				console.log("lnvLikelihood = "+lnvLikelihood);
			}
			if (lnvLikelihood > likelihood) {
				rv = lnv;
				likelihood = lnvLikelihood;
			}
		}
		catch (err) {
			console.log(err);
		}
		try {
			let ev = ExponentialRandomVariable.estimateParameters(arrayValues);
			let evLikelihood = ev.logLikelihood(arrayValues);
			if (debug) {
				console.log("evLikelihood = "+evLikelihood);
			}
			if (evLikelihood > likelihood) {
				rv = ev;
				likelihood = evLikelihood;
			}
		}
		catch (err) {
			console.log(err);
		}
		try {
			let gv = GammaRandomVariable.estimateParameters(arrayValues);
			let gvLikelihood = gv.logLikelihood(arrayValues);
			if (debug) {
				console.log("gvLikelihood = "+gvLikelihood);
			}
			if (gvLikelihood > likelihood) {
				rv = gv;
				likelihood = gvLikelihood;
			}
		}
		catch (err) {
			console.log(err);
		}
		try {
			let emn = ExponentiallyModifiedGaussian.estimateParameters(arrayValues);
			let emnLikelihood = emn.logLikelihood(arrayValues);
			if (debug) {
				console.log("emnLikelihood = "+emnLikelihood);
			}
			if (emnLikelihood > likelihood) {
				rv = emn;
				likelihood = emnLikelihood;
			}
		}
		catch (err) {
			console.log(err);
		}
		return rv;
	}
}

try {
	require('../../pm4js.js');
	global.RandomVariableFitter = RandomVariableFitter;
	module.exports = {RandomVariableFitter: RandomVariableFitter};
}
catch (err) {
	// not in Node
	//console.log(err);
}

