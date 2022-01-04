class GeneralOcelStatistics {
	static eventsPerActivityCount(ocel) {
		let dct = {};
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			let act = eve["ocel:activity"];
			if (!(act in dct)) {
				dct[act] = 1;
			}
			else {
				dct[act] += 1;
			}
		}
		return dct;
	}
	
	static objectsPerTypeCount(ocel) {
		let dct = {};
		let objects = ocel["ocel:objects"];
		for (let objId in objects) {
			let obj = objects[objId];
			let type = obj["ocel:type"];
			if (!(type in dct)) {
				dct[type] = 1;
			}
			else {
				dct[type] += 1;
			}
		}
		return dct;
	}
	
	static eventsRelatedPerObjectTypeCount(ocel) {
		let objects = ocel["ocel:objects"];
		let objType = {};
		let dct = {};
		for (let objId in objects) {
			let obj = objects[objId];
			let type = obj["ocel:type"];
			objType[objId] = type;
		}
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			let relatedTypes = {};
			for (let objId of eve["ocel:omap"]) {
				relatedTypes[objType[objId]] = 0;
			}
			for (let otype in relatedTypes) {
				if (!(otype in dct)) {
					dct[otype] = 1;
				}
				else {
					dct[otype] += 1;
				}
			}
		}
		return dct;
	}
	
	static eventsPerTypePerActivity(ocel) {
		let objects = ocel["ocel:objects"];
		let objType = {};
		let dct = {};
		for (let objId in objects) {
			let obj = objects[objId];
			let type = obj["ocel:type"];
			objType[objId] = type;
		}
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			if (eve["ocel:omap"].length > 0) {
				let evAct = eve["ocel:activity"];
				if (!(evAct in dct)) {
					dct[evAct] = {};
				}
				let relatedTypes = {};
				for (let objId of eve["ocel:omap"]) {
					let otype = objType[objId];
					if (!(otype in relatedTypes)) {
						relatedTypes[otype] = 1;
					}
					else {
						relatedTypes[otype] += 1;
					}
				}
				for (let otype in relatedTypes) {
					if (!(otype in dct[evAct])) {
						dct[evAct][otype] = {};
					}
					if (!(relatedTypes[otype] in dct[evAct][otype])) {
						dct[evAct][otype][relatedTypes[otype]] = 0;
					}
					dct[evAct][otype][relatedTypes[otype]] += 1;
				}
			}
		}
		for (let act in dct) {
			for (let ot in dct[act]) {
				dct[act][ot] = Object.keys(dct[act][ot]);
				let i = 0;
				while (i < dct[act][ot].length) {
					dct[act][ot][i] = parseInt(dct[act][ot][i]);
					i++;
				}
			}
		}
		return dct;
	}
}

try {
	require('../../pm4js.js');
	module.exports = {GeneralOcelStatistics: GeneralOcelStatistics};
	global.GeneralOcelStatistics = GeneralOcelStatistics;
}
catch (err) {
	// not in node
	//console.log(err);
}
