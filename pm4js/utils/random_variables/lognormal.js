class LogNormalRandomVariable {
	constructor(mu, sig) {
		this.mu = mu;
		this.sig = sig;
	}
	
	toString() {
		return "LogNormalRandomVariable mu="+this.mu+" sig="+this.sig;
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
	
	static erfinv(x) {
		let sgn = 1;
		if (x < 0) {
			sgn = -1;
			x = -x;
		}
		x = (1 - x)*(1 + x);
		let lnx = Math.log(x);
		let tt1 = 2/(Math.PI * 0.147) + 0.5 * lnx;
		let tt2 = 1/0.147 * lnx;
		return sgn * Math.sqrt(-tt1 + Math.sqrt(tt1 * tt1 - tt2));
	}
	
	pdf(x) {
		if (x < 0) {
			throw "Lognormal not defined for x < 0";
		}
		return 1.0 / (x * this.sig * Math.sqrt(2 * Math.PI)) * Math.exp(-(Math.log(x) - this.mu)*(Math.log(x) - this.mu)/(2 * this.sig * this.sig));
	}
	
	cdf(x) {
		if (x < 0) {
			throw "Lognormal not defined for x < 0";
		}
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
			if (v < 0) {
				throw "Lognormal not defined for x < 0";
			}
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
	
	getQuantile(p) {
		return Math.exp(this.mu + Math.sqrt(2 * this.sig * this.sig) * LogNormalRandomVariable.erfinv(2 * p - 1));
	}
}

LogNormalRandomVariable.G = 536870911;
LogNormalRandomVariable.P = 2147483647;
LogNormalRandomVariable.C = 1;


try {
	global.LogNormalRandomVariable = LogNormalRandomVariable;
	module.exports = {LogNormalRandomVariable: LogNormalRandomVariable};
}
catch (err) {
	// not in Node
	//console.log(err);
}
