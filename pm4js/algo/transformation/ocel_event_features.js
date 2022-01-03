class OcelEventFeatures {
	static encodeActivity(ocel) {
		let activities = {};
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			activities[eve["ocel:activity"]] = 0;
		}
		activities = Object.keys(activities);
		let arrNull = [];
		for (let act of activities) {
			arrNull.push(0);
		}
		let data = [];
		for (let evId in events) {
			let eve = events[evId];
			let act = eve["ocel:activity"];
			let vect = [...arrNull];
			vect[activities.indexOf(act)] = 1;
			data.push(vect);
		}
		let featureNames = [];
		for (let act of activities) {
			featureNames.push("@@ev_act_" + act);
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static encodeTimestamp(ocel) {
		let events = ocel["ocel:events"];
		let data = [];
		for (let evId in events) {
			let eve = events[evId];
			let timest = eve["ocel:timestamp"];
			data.push([timest.getTime() / 1000.0, timest.getDay(), timest.getMonth(), timest.getHours()]);
		}
		let featureNames = ["@@ev_timest_abs", "@@ev_timest_dayofweek", "@@ev_timest_month", "@@ev_timest_hour"];
		return {"data": data, "featureNames": featureNames};
	}
	
	static encodeNumRelObj(ocel) {
		let events = ocel["ocel:events"];
		let objects = ocel["ocel:objects"];
		let objectTypes = {};
		let otPerObject = {};
		for (let objId in objects) {
			let obj = objects[objId];
			objectTypes[obj["ocel:type"]] = 0;
			otPerObject[objId] = obj["ocel:type"];
		}
		objectTypes = Object.keys(objectTypes);
		let data = [];
		for (let evId in events) {
			let eve = events[evId];
			let arr = [eve["ocel:omap"].length];
			for (let ot of objectTypes) {
				let thisCount = 0;
				for (let objId of eve["ocel:omap"]) {
					if (otPerObject[objId] == ot) {
						thisCount = thisCount + 1;
					}
				}
				arr.push(thisCount);
			}
			data.push(arr);
		}
		let featureNames = ["@@ev_rel_objs_abs"];
		for (let objType of objectTypes) {
			featureNames.push("@@ev_rel_objs_ot_"+objType);
		}
		return {"data": data, "featureNames": featureNames};
	}
}

try {
	require('../../pm4js.js');
	module.exports = {OcelEventFeatures: OcelEventFeatures};
	global.OcelEventFeatures = OcelEventFeatures;
}
catch (err) {
	// not in node
	//console.log(err);
}
