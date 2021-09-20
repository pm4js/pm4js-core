class GammaRandomVariable {
	constructor(k, theta) {
		this.k = k;
		this.theta = theta;
	}
	
	static estimateParameters(arrayValues) {
		let n = arrayValues.length;
		let kn = 0;
		for (let v of arrayValues) {
			kn += v;
		}
		kn = kn * n * (n-1);
		let kd1 = 0;
		let kd2 = 0;
		let kd3 = 0;
		for (let v of arrayValues) {
			kd1 += v * Math.log(v);
			kd2 += Math.log(v);
			kd3 += v;
		}
		kd1 = kd1 * n;
		let kd = (n+2)*(kd1 - kd2 * kd3);
		let k = kn / kd;
		let theta = kd / (n * n * (n-1));
		return new GammaRandomVariable(k, theta);
	}
	
	static eulerGamma(x) {
		x = x - 1;
		let ret1 = Math.sqrt(2 * Math.PI * x) * Math.pow((x / Math.E), x);
		let ret2 = (1 + 1 / (12 * x * x * x + 24.0 / 7.0 * x - 0.5));
		ret2 = Math.pow(ret2, x * x + 53.0 / 210.0);
		return ret1 * ret2;
	}
	
	pdf(x) {
		return (Math.pow(x, this.k - 1) * Math.exp(-x / this.theta)) / (Math.pow(this.theta, this.k) * GammaRandomVariable.eulerGamma(this.k));
	}
	
	logLikelihood(arrayValues) {
		let ret = 0.0;
		for (let v of arrayValues) {
			ret += Math.log(this.pdf(v));
		}
		return ret;
	}
	
	getMean() {
		return this.k * this.theta;
	}
	
	getVariance() {
		return this.k * this.theta * this.theta;
	}
	
	getMode() {
		return (this.k - 1)*this.theta;
	}
}

try {
	require('../../pm4js.js');
	global.GammaRandomVariable = GammaRandomVariable;
	module.exports = {GammaRandomVariable: GammaRandomVariable};
}
catch (err) {
	// not in Node
	//console.log(err);
}
