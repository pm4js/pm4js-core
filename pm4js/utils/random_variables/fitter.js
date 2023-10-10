class RandomVariableFitter {
	static apply(arrayValues, debug=false) {
		let rv = null;
		let likelihood = -Number.MAX_VALUE;
		if (debug) {
			console.log("----- debug -----");
		}
		try {
			let un = UniformRandomVariable.estimateParameters(arrayValues);
			let unLikelihood = un.logLikelihood(arrayValues);
			if (debug) {
				console.log(un.toString() + " unLikelihood = "+unLikelihood);
			}
			if (unLikelihood > likelihood) {
				rv = un;
				likelihood = unLikelihood;
			}
		}
		catch (err) {
		}
		try {
			let nv = NormalRandomVariable.estimateParameters(arrayValues);
			let nvLikelihood = nv.logLikelihood(arrayValues);
			if (debug) {
				console.log(nv.toString() + " nvLikelihood = "+nvLikelihood);
			}
			if (nvLikelihood > likelihood) {
				rv = nv;
				likelihood = nvLikelihood;
			}
		}
		catch (err) {
		}
		try {
			let lnv = LogNormalRandomVariable.estimateParameters(arrayValues);
			let lnvLikelihood = lnv.logLikelihood(arrayValues);
			if (debug) {
				console.log(lnv.toString() + " lnvLikelihood = "+lnvLikelihood);
			}
			if (lnvLikelihood > likelihood) {
				rv = lnv;
				likelihood = lnvLikelihood;
			}
		}
		catch (err) {
		}
		try {
			let ev = ExponentialRandomVariable.estimateParameters(arrayValues);
			let evLikelihood = ev.logLikelihood(arrayValues);
			if (debug) {
				console.log(ev.toString() + "evLikelihood = "+evLikelihood);
			}
			if (evLikelihood > likelihood) {
				rv = ev;
				likelihood = evLikelihood;
			}
		}
		catch (err) {
		}
		try {
			let gv = GammaRandomVariable.estimateParameters(arrayValues);
			let gvLikelihood = gv.logLikelihood(arrayValues);
			if (debug) {
				console.log(gv.toString() + " gvLikelihood = "+gvLikelihood);
			}
			if (gvLikelihood > likelihood) {
				rv = gv;
				likelihood = gvLikelihood;
			}
		}
		catch (err) {
		}
		try {
			let emn = ExponentiallyModifiedGaussian.estimateParameters(arrayValues);
			let emnLikelihood = emn.logLikelihood(arrayValues);
			if (debug) {
				console.log(emn.toString() + " emnLikelihood = "+emnLikelihood);
			}
			if (emnLikelihood > likelihood) {
				rv = emn;
				likelihood = emnLikelihood;
			}
		}
		catch (err) {
		}
		if (debug) {
			console.log("----- /debug -----");
		}
		return rv;
	}
}

try {
	global.RandomVariableFitter = RandomVariableFitter;
	module.exports = {RandomVariableFitter: RandomVariableFitter};
}
catch (err) {
	// not in Node
	//console.log(err);
}

