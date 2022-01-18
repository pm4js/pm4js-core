class StatisticsUtils {
	static average(x) {
		if (x.length > 0) {
			let ret = 0.0;
			for (let el of x) {
				ret += el;
			}
			return ret / x.length;
		}
		return 0.0;
	}
	
	static stddev(x) {
		let avg = StatisticsUtils.average(x);
		if (x.length > 0) {
			let ret = 0.0;
			for (let el of x) {
				ret += (el - avg)*(el-avg);
			}
			ret = ret / x.length;
			ret = Math.sqrt(ret);
			return ret;
		}
		return 0.0;
	}
	
	static covariance(x, y) {
		if (x.length != y.length) {
			throw "Incompatible dimensions";
		}
		else if (x.length > 0) {
			let avgX = StatisticsUtils.average(x);
			let avgY = StatisticsUtils.average(y);
			let ret = 0.0;
			let i = 0;
			while (i < x.length) {
				ret += (x[i] - avgX) * (y[i] - avgY);
				i = i + 1;
			}
			ret = ret / x.length;
			return ret;
		}
		return 0.0;
	}
	
	static pearsonCorrelation(x, y) {
		return StatisticsUtils.covariance(x, y) / (StatisticsUtils.stddev(x) * StatisticsUtils.stddev(y));
	}
}

try {
	require('../../pm4js.js');
	module.exports = {StatisticsUtils: StatisticsUtils};
	global.StatisticsUtils = StatisticsUtils;
}
catch (err) {
	// not in node
	//console.log(err);
}

