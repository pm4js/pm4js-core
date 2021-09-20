class ExponentialRandomVariable {
	constructor(lam) {
		this.lam = lam;
	}
	
	static gen() {
		ExponentialRandomVariable.C = (ExponentialRandomVariable.C*ExponentialRandomVariable.G) % ExponentialRandomVariable.P;
		return ExponentialRandomVariable.C / ExponentialRandomVariable.P;
	}
	
	pdf(x) {
		return this.lam * Math.exp(-this.lam * x);
	}
	
	cdf(x) {
		return 1 - Math.exp(-this.lam * x);
	}
	
	getValue() {
		return (-1.0 / this.lam) * Math.log(1.0 - ExponentialRandomVariable.gen());
	}
	
	logLikelihood(arrayValues) {
		let ret = 0.0;
		for (let v of arrayValues) {
			ret += Math.log(this.pdf(v));
		}
		return ret;
	}
	
	static estimateParameters(arrayValues) {
		let sum = 0.0;
		for (let v of arrayValues) {
			sum += v;
		}
		return new ExponentialRandomVariable(1.0 / (sum / arrayValues.length));
	}
	
	getMean() {
		return 1.0 / this.lam;
	}
	
	getVariance() {
		return 1.0 / (this.lam * this.lam);
	}
	
	getMedian() {
		return Math.log(2) / this.lam;
	}
	
	getMode() {
		return 0;
	}
	
	getQuantile(p) {
		return - Math.log(1 - p) / this.lam;
	}
}

ExponentialRandomVariable.G = 536870911;
ExponentialRandomVariable.P = 2147483647;
ExponentialRandomVariable.C = 1;


try {
	require('../../pm4js.js');
	global.ExponentialRandomVariable = ExponentialRandomVariable;
	module.exports = {ExponentialRandomVariable: ExponentialRandomVariable};
}
catch (err) {
	// not in Node
	//console.log(err);
}
