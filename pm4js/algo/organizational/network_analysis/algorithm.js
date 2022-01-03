class NetworkAnalysis {
}

try {
	require('../../../pm4js.js');
	module.exports = {NetworkAnalysis: NetworkAnalysis};
	global.NetworkAnalysis = NetworkAnalysis;
}
catch (err) {
	// not in node
	//console.log(err);
}
