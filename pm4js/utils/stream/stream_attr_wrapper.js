class StreamAttrWrapper {
	static accessAttribute(eve, attribute) {
		if (eve.constructor.name == "Event") {
			// EventLog Event
			if (attribute in eve.attributes) {
				return eve.attributes[attribute].value;
			}
		}
		else {
			// OCEL
			if (attribute == "ocel:activity" || attribute == "ocel:timestamp") {
				return eve[attribute];
			}
			else if (attribute in eve["ocel:vmap"]) {
				return eve["ocel:vmap"][attribute];
			}
		}
		return null;
	}
	
	static attributesList(stream) {
		let attList = {};
		if (stream.length > 0) {
			if (stream[0].constructor.name == "Event") {
				// EventLog Event
				for (let eve of stream) {
					for (let attr in eve.attributes) {
						attList[attr] = 0;
					}
				}
			}
			else {
				// OCEL
				attList["ocel:activity"] = 0;
				attList["ocel:timestamp"] = 0;
				for (let eve of stream) {
					for (let attr in eve["ocel:vmap"]) {
						attList[attr] = 0;
					}
				}
			}
		}
		return Object.keys(attList);
	}
	
	static defaultTimestamp(eve) {
		if (eve.constructor.name == "Event") {
			// EventLog Event
			return eve.attributes["time:timestamp"].value;
		}
		else {
			// OCEL
			return eve["ocel:timestamp"];
		}
	}
}

try {
	module.exports = {StreamAttrWrapper: StreamAttrWrapper};
	global.StreamAttrWrapper = StreamAttrWrapper;
}
catch (err) {
	// not in node
	//console.log(err);
}
