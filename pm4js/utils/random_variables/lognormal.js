class LogNormalRandomVariable {
	constructor(mu, sig) {
		this.mu = mu;
		this.sig = sig;
	}
	
	static gen() {
		LogNormalRandomVariable.C = (LogNormalRandomVariable.C*LogNormalRandomVariable.G) % LogNormalRandomVariable.P;
		return LogNormalRandomVariable.C / LogNormalRandomVariable.P;
	}
	
	static erf(x) {
		let v = 1;
		v = v + 0.278393*x;
		let y = x * x;
		v = v + 0.230389*y;
		y = y * x;
		v = v + 0.000972*y;
		y = y * x;
		v = v + 0.078108*y;
		v = v * v;
		v = v * v;
		v = 1.0 / v;
		v = 1.0 - v;
		return v;
	}
	
	pdf(x) {
		return 1.0 / (x * this.sig * Math.sqrt(2 * Math.PI)) * Math.exp(-(Math.log(x) - this.mu)*(Math.log(x) - this.mu)/(2 * this.sig * this.sig));
	}
	
	cdf(x) {
		return 0.5*(1.0 + LogNormalRandomVariable.erf((Math.log(x) - this.mu)/(this.sig * Math.sqrt(2))));
	}
	
	getValue() {
		let v1 = NormalRandomVariable.gen();
		let v2 = NormalRandomVariable.gen();
		return Math.exp(this.mu + this.sig * Math.cos(2*Math.PI*v2) * Math.sqrt(-2.0 * Math.log(v1)));
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
		let avg = sum / arrayValues.length;
		sum = 0.0;
		for (let v of arrayValues) {
			sum += (v - avg) * (v-avg);
		}
		let std = Math.sqrt(sum / arrayValues.length);
		let mu = Math.log((avg * avg)/(Math.sqrt(avg*avg + std*std)));
		let s = Math.sqrt(Math.log(1 + (std*std)/(avg*avg)))
		return new LogNormalRandomVariable(mu, s);
	}
	
	getMean() {
		return Math.exp(this.mu + this.sig * this.sig / 2.0);
	}
	
	getVariance() {
		return (Math.exp(this.sig * this.sig) - 1) * Math.exp(2*this.mu + this.sig * this.sig);
	}
	
	getMedian() {
		return Math.exp(this.mu);
	}
	
	getMode() {
		return Math.exp(this.mu - this.sig * this.sig);
	}
}

LogNormalRandomVariable.G = 536870911;
LogNormalRandomVariable.P = 2147483647;
LogNormalRandomVariable.C = 1;


try {
	require('../../pm4js.js');
	global.LogNormalRandomVariable = LogNormalRandomVariable;
	module.exports = {LogNormalRandomVariable: LogNormalRandomVariable};
}
catch (err) {
	// not in Node
	//console.log(err);
}
