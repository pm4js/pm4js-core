class GammaRandomVariable {
	constructor(k, theta) {
		this.k = k;
		this.theta = theta;
	}
	
	toString() {
		return "GammaRandomVariable k="+this.k+" theta="+this.theta;
	}
	
	static gen() {
		GammaRandomVariable.C = (GammaRandomVariable.C*GammaRandomVariable.G) % GammaRandomVariable.P;
		return GammaRandomVariable.C / GammaRandomVariable.P;
	}
	
	static estimateParameters(arrayValues) {
		let n = arrayValues.length;
		let kn = 0;
		for (let v of arrayValues) {
			if (v < 0) {
				throw "Gamma not defined for x < 0";
			}
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
		return Math.sqrt(Math.PI) * Math.pow(Math.abs(x) / Math.E, x) * Math.pow(8 * x * x *x + 4 *x *x + x + 1.0 / 3.0, 1.0 / 6.0);
	}
	
	pdf(x) {
		if (x < 0) {
			throw "Gamma not defined for x < 0";
		}
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
		if (this.k > 1) {
			return (this.k - 1)*this.theta;
		}
		return 0;
	}
	
	getValue() {
		let k = 0 + this.k;
		let exp = new ExponentialRandomVariable(1.0 / this.theta);
		let ret = 0;
		while (k > 1) {
			ret += exp.getValue();
			k = k - 1;
		}
		let umax = Math.pow((k / Math.E), k / 2.0);
		let vmin = -2 / Math.E;
		let vmax = 2*k / (Math.E * (Math.E - k));
		while (true) {
			let v1 = GammaRandomVariable.gen();
			let v2 = GammaRandomVariable.gen();
			let u = umax * v1;
			let v = (vmax - vmin) * v2 + vmin;
			let t = v / u;
			let x = Math.exp(t / k);
			if (2*Math.log(u) <= t - x) {
				ret += x * this.theta;
				break;
			}
		}
		return ret;
	}
}

GammaRandomVariable.G = 536870911;
GammaRandomVariable.P = 2147483647;
GammaRandomVariable.C = 1;

try {
	global.GammaRandomVariable = GammaRandomVariable;
	module.exports = {GammaRandomVariable: GammaRandomVariable};
}
catch (err) {
	// not in Node
	//console.log(err);
}
