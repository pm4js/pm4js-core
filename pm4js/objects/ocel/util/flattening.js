class OcelFlattening {
	static apply(ocel, objType, caseIdKey="concept:name", activityKey="concept:name", timestampKey="time:timestamp") {
		return OcelFlattening.flatten(ocel, objType, caseIdKey, activityKey, timestampKey);
	}
	
	static flatten(ocel, objType, caseIdKey="concept:name", activityKey="concept:name", timestampKey="time:timestamp") {
		let log = new EventLog();
		let objTraces = {};
		for (let eveId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][eveId];
			for (let objId of eve["ocel:omap"]) {
				let obj = ocel["ocel:objects"][objId];
				if (obj["ocel:type"] == objType) {
					let trace = null;
					if (!(objId in objTraces)) {
						trace = new Trace();
						trace.attributes[caseIdKey] = new Attribute(objId);
						log.traces.push(trace);
						objTraces[objId] = trace;
					}
					else {
						trace = objTraces[objId];
					}
					let xesEve = new Event();
					trace.events.push(xesEve);
					xesEve.attributes[activityKey] = new Attribute(eve["ocel:activity"]);
					xesEve.attributes[timestampKey] = new Attribute(new Date(eve["ocel:timestamp"]));
					for (let attr in eve["ocel:vmap"]) {
						xesEve.attributes[attr] = new Attribute(eve["ocel:vmap"][attr]);
					}
				}
			}
		}
		return log;
	}
}

try {
	require('../../../pm4js.js');
	module.exports = {OcelFlattening: OcelFlattening};
	global.OcelFlattening = OcelFlattening;
}
catch (err) {
	// not in node
	//console.log(err);
}
