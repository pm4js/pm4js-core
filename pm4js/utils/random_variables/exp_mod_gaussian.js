class ExponentiallyModifiedGaussian {
	constructor(mu, sig, lam) {
		this.mu = mu;
		this.sig = sig;
		this.lam = lam;
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
	
	static estimateParameters(arrayValues) {
		let n = arrayValues.length;
		let mu = 0.0;
		for (let v of arrayValues) {
			mu += v;
		}
		mu = mu / n;
		let std = 0.0;
		for (let v of arrayValues) {
			std += (v - mu) * (v - mu);
		}
		std = std / n;
		std = Math.sqrt(std);
		let skew = 0.0;
		for (let v of arrayValues) {
			skew += v * v * v;
		}
		skew = skew / n;
		skew = (skew - 3 * mu * std * std - mu * mu * mu) / (std * std * std);
		let muDist = mu - std * Math.pow(Math.abs(skew) / 2.0, 2.0 / 3.0);
		let stdDist = Math.sqrt(std * std * (1 - Math.pow((Math.abs(skew) / 2.0), 2.0 / 3.0)));
		let tauDist = std * Math.pow((Math.abs(skew) / 2), 1.0 / 3.0);
		return new ExponentiallyModifiedGaussian(muDist, stdDist, 1.0 / tauDist);
	}
	
	getMean() {
		return this.mu + 1.0 / this.lam;
	}
	
	getVariance() {
		return this.sig * this.sig + 1.0 / (this.lam * this.lam);
	}
	
	pdf(x) {
		return this.lam / 2.0 * Math.exp(this.lam / 2.0 * (2 * this.mu + this.lam * this.sig * this.sig - 2*x)) * (1 - ExponentiallyModifiedGaussian.erf((this.mu + this.lam * this.sig * this.sig - x)/(Math.sqrt(2) * this.sig)));
	}
	
	cdf(x) {
		let u = this.lam * (x - this.mu);
		let v = this.lam * this.sig;
		let rv1 = new NormalRandomVariable(0, v);
		let rv2 = new NormalRandomVariable(v*v, v);
		return rv1.cdf(u) - Math.exp(-(u + v*v)/(2 + Math.log(rv2.cdf(u))));
	}
	
	logLikelihood(arrayValues) {
		let ret = 0.0;
		for (let v of arrayValues) {
			ret += Math.log(this.pdf(v));
		}
		return ret;
	}
	
	getValue() {
		let rv1 = new NormalRandomVariable(this.mu, this.sig);
		let rv2 = new ExponentialRandomVariable(this.lam);
		return rv1.getValue() + rv2.getValue();
	}
}

try {
	require('../../pm4js.js');
	global.ExponentiallyModifiedGaussian = ExponentiallyModifiedGaussian;
	module.exports = {ExponentiallyModifiedGaussian: ExponentiallyModifiedGaussian};
}
catch (err) {
	// not in Node
	//console.log(err);
}

