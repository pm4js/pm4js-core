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
	
	static objectsPerTypePerActivity(ocel, retSum=false) {
		// convergence problem
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
		for (let evAct in dct) {
			for (let otype in dct[evAct]) {
				let count = 0;
				let sum = 0;
				for (let sc in dct[evAct][otype]) {
					let nc = parseInt(sc);
					let cc = dct[evAct][otype][sc];
					count += cc;
					sum += nc * cc;
				}
				if (retSum) {
					dct[evAct][otype] = sum;
				}
				else {
					dct[evAct][otype] = sum / count;
				}
			}
		}
		return dct;
	}
	
	static getObjectsLifecycle(ocel) {
		let lif = {};
		let objects = ocel["ocel:objects"];
		for (let objId in objects) {
			lif[objId] = [];
		}
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				lif[objId].push(eve);
			}
		}
		return lif;
	}
	
	static eventsPerTypePerActivity(ocel, retSum=false) {
		let objects = ocel["ocel:objects"];
		let otObjects = {};
		let objType = {};
		for (let objId in objects) {
			let obj = objects[objId];
			let ot = obj["ocel:type"];
			objType[objId] = ot;
			if (!(ot in otObjects)) {
				otObjects[ot] = [];
			}
			otObjects[ot].push(objId);
		}
		let objectTypes = Object.keys(otObjects);
		let lifecycle = GeneralOcelStatistics.getObjectsLifecycle(ocel);
		let dct = {};
		for (let ot of objectTypes) {
			dct[ot] = {};
			for (let objId of otObjects[ot]) {
				let lif = lifecycle[objId];
				let temp = {};
				let i = 0;
				while (i < lif.length) {
					let act = lif[i]["ocel:activity"];
					if (!(act in temp)) {
						temp[act] = 1;
					}
					else {
						temp[act] += 1;
					}
					i = i + 1
				}
				for (let act in temp) {
					if (!(act in dct[ot])) {
						dct[ot][act] = {};
					}
					if (!(temp[act] in dct[ot][act])) {
						dct[ot][act][temp[act]] = 1;
					}
					else {
						dct[ot][act][temp[act]] += 1;
					}
				}
			}
		}
		for (let ot in dct) {
			for (let act in dct[ot]) {
				let count = 0;
				let sum = 0;
				for (let sc in dct[ot][act]) {
					let nc = parseInt(sc);
					let cc = dct[ot][act][sc];
					count += cc;
					sum += nc * cc;
				}
				if (retSum) {
					dct[ot][act] = sum;
				}
				else {
					dct[ot][act] = sum / count;
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
