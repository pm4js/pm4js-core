class NormalRandomVariable {
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
	
	static pdf(x, mu, sig) {
		return 1.0/(sig*Math.sqrt(2*Math.PI)) * Math.exp(-0.5*((x-mu)/sig)*((x-mu)/sig));
	}
	
	static cdf(x, mu, sig) {
		return 0.5*(1.0 + NormalRandomVariable.erf((x - mu)/(sig * Math.sqrt(2))));
	}
	
	static getv(mu, sig) {
		let v1 = NormalRandomVariable.gen();
		let v2 = NormalRandomVariable.gen();
		return mu + sig * Math.cos(2*Math.PI*v2) * Math.sqrt(-2.0 * Math.log(v1));
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
