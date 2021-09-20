class NormalRandomVariable {
	constructor(mu, sig) {
		this.mu = mu;
		this.sig = sig;
	}
	
	static gen() {
		NormalRandomVariable.C = (NormalRandomVariable.C*NormalRandomVariable.G) % NormalRandomVariable.P;
		return NormalRandomVariable.C / NormalRandomVariable.P;
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
		return 1.0/(this.sig*Math.sqrt(2*Math.PI)) * Math.exp(-0.5*((x-this.mu)/this.sig)*((x-this.mu)/this.sig));
	}
	
	cdf(x) {
		return 0.5*(1.0 + NormalRandomVariable.erf((x - this.mu)/(this.sig * Math.sqrt(2))));
	}
	
	getValue() {
		let v1 = NormalRandomVariable.gen();
		let v2 = NormalRandomVariable.gen();
		return this.mu + this.sig * Math.cos(2*Math.PI*v2) * Math.sqrt(-2.0 * Math.log(v1));
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
		return new NormalRandomVariable(avg, std);
	}
	
	getMean() {
		return this.mu;
	}
	
	getVariance() {
		return this.sig * this.sig;
	}
	
	getMedian() {
		return this.mu;
	}
	
	getMode() {
		return this.mu;
	}
	
	getQuantile(p) {
		return this.mu + this.sig * Math.sqrt(2) * NormalRandomVariable.erfinv(2*p - 1);
	}
}

NormalRandomVariable.G = 536870911;
NormalRandomVariable.P = 2147483647;
NormalRandomVariable.C = 1;


try {
	require('../../pm4js.js');
	global.NormalRandomVariable = NormalRandomVariable;
	module.exports = {NormalRandomVariable: NormalRandomVariable};
}
catch (err) {
	// not in Node
	//console.log(err);
}
