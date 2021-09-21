class UniformRandomVariable {
	constructor(a, b) {
		if (a >= b) {
			throw "a must be lower than b";
		}
		this.a = a;
		this.b = b;
	}
	
	toString() {
		return "UniformRandomVariable a="+this.a+" b="+this.b;
	}
	
	pdf(x) {
		if (x >= this.a && x <= this.b) {
			return 1.0 / (this.b - this.a);
		}
		return 0.0;
	}
	
	cdf(x) {
		if (x <= this.a) {
			return 0.0;
		}
		else if (x > this.a && x < this.b) {
			return (x - this.a)/(this.b - this.a);
		}
		else {
			return 1.0;
		}
	}
	
	static estimateParameters(arrayValues) {
		let minValue = Number.MAX_VALUE;
		let maxValue = Number.MIN_VALUE;
		for (let v of arrayValues) {
			if (v < minValue) {
				minValue = v;
			}
			if (v > maxValue) {
				maxValue = v;
			}
		}
		return new UniformRandomVariable(minValue, maxValue);
	}
	
	getMean() {
		return 0.5 * (this.a + this.b);
	}
	
	getMedian() {
		return 0.5 * (this.a + this.b);
	}
	
	getMode() {
		return 0.5 * (this.a + this.b);
	}
	
	getVariance() {
		return 1.0 / 12.0 * (this.b - this.a) * (this.b - this.a);
	}
	
	logLikelihood(arrayValues) {
		let ret = 0.0;
		for (let v of arrayValues) {
			ret += Math.log(this.pdf(v));
		}
		return ret;
	}
	
	static gen() {
		UniformRandomVariable.C = (UniformRandomVariable.C*UniformRandomVariable.G) % UniformRandomVariable.P;
		return UniformRandomVariable.C / UniformRandomVariable.P;
	}
	
	getValue() {
		let val = UniformRandomVariable.gen();
		return this.a + (this.b - this.a) * val;
	}
	
	getQuantile(p) {
		return this.a + p * (this.b - this.a);
	}
}

UniformRandomVariable.G = 536870911;
UniformRandomVariable.P = 2147483647;
UniformRandomVariable.C = 1;

try {
	require('../../pm4js.js');
	global.UniformRandomVariable = UniformRandomVariable;
	module.exports = {UniformRandomVariable: UniformRandomVariable};
}
catch (err) {
	// not in Node
	//console.log(err);
}

