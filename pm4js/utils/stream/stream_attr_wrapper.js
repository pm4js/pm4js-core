class StreamAttrWrapper {
	static accessAttribute(eve, attribute) {
		if (eve.constructor.name == "Event") {
			// EventLog Event
			return eve.attributes[attribute].value;
		}
		else {
			// OCEL
			if (attribute == "ocel:activity" || attribute == "ocel:timestamp") {
				return eve[attribute];
			}
			return eve["ocel:vmap"][attribute];
		}
	}
}

try {
	require('../../pm4js.js');
	module.exports = {StreamAttrWrapper: StreamAttrWrapper};
	global.StreamAttrWrapper = StreamAttrWrapper;
}
catch (err) {
	// not in node
	//console.log(err);
}
