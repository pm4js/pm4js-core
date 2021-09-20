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
		let theta = n * n * (n-1) / kd;
		return new GammaRandomVariable(k, theta);
	}
	
	getMean() {
		return this.k * this.theta;
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
