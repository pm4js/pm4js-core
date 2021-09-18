class ExponentialRandomVariable {
	static gen() {
		ExponentialRandomVariable.C = (ExponentialRandomVariable.C*ExponentialRandomVariable.G) % ExponentialRandomVariable.P;
		return ExponentialRandomVariable.C / ExponentialRandomVariable.P;
	}
	
	static pdf(x, lam) {
		return lam * Math.exp(-lam*x);
	}
	
	static cdf(x, lam) {
		return 1 - Math.exp(-lam*x);
	}
	
	static getv(lam) {
		return -1.0 / (lam * Math.log(1.0 - ExponentialRandomVariable.gen()));
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