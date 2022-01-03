class OcelObjectFeatures {
	static encodeObjStrAttr(ocel, strAttributes=null) {
		if (strAttributes == null) {
			strAttributes = [];
		}
		let objects = ocel["ocel:objects"];
		let data = [];
		let featureNames = [];
		
		for (let objId in objects) {
			data.push([]);
		}
		for (let attr of strAttributes) {
			let diffValues = {};
			for (let objId in objects) {
				let obj = objects[objId];
				if (attr in obj["ocel:ovmap"]) {
					diffValues[obj["ocel:ovmap"][attr]] = 0;
				}
			}
			diffValues = Object.keys(diffValues);
			let zeroArr = [];
			for (let val of diffValues) {
				featureNames.push("@@obj_attr_"+attr+"_"+val);
				zeroArr.push(0);
			}
			let count = 0;
			for (let objId in objects) {
				let obj = objects[objId];
				let vect = [...zeroArr];
				if (attr in obj["ocel:ovmap"]) {
					let val = obj["ocel:ovmap"][attr];
					vect[diffValues.indexOf(val)] = 1;
				}
				data[count] = [...data[count], ...vect];
				count = count + 1;
			}
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static encodeObjNumAttr(ocel, numAttributes=null) {
		if (numAttributes == null) {
			numAttributes = [];
		}
		let objects = ocel["ocel:objects"];
		let data = [];
		let featureNames = [];
		
		for (let objId in objects) {
			data.push([]);
		}
		
		for (let attr of numAttributes) {
			let count = 0;
			for (let objId in objects) {
				let obj = objects[objId];
				if (attr in obj["ocel:ovmap"]) {
					data[count].push(obj["ocel:ovmap"][attr]);
				}
				else {
					data[count].push(0);
				}
				count = count + 1;
			}
			featureNames.push("@@obj_num_attr_"+attr);
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static getObjectsLifecycle(ocel) {
		let lif = {};
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				if (!(objId in lif)) {
					lif[objId] = [];
				}
				lif[objId].push(eve);
			}
		}
		return lif;
	}
	
	static encodeLifecycleActivities(ocel) {
		let events = ocel["ocel:events"];
		let objects = ocel["ocel:objects"];
		let diffActivities = {};
		for (let evId in events) {
			let eve = events[evId];
			diffActivities[eve["ocel:activity"]] = 0;
		}
		diffActivities = Object.keys(diffActivities);
		let zeroArr = [];
		for (let act of diffActivities) {
			zeroArr.push(0);
		}
		let objLifecycle = OcelObjectFeatures.getObjectsLifecycle(ocel);
		let data = [];
		for (let objId in objects) {
			let lif = objLifecycle[objId];
			let vect = [...zeroArr];
			for (let eve of lif) {
				vect[diffActivities.indexOf(eve["ocel:activity"])] += 1;
			}
			data.push(vect);
		}
		let featureNames = [];
		for (let act of diffActivities) {
			featureNames.push("@@obj_lif_act_"+act);
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static encodeLifecycleDuration(ocel) {
		let events = ocel["ocel:events"];
		let objects = ocel["ocel:objects"];
		let data = [];
		let featureNames = ["@@obj_lif_dur"];
		let objLifecycle = OcelObjectFeatures.getObjectsLifecycle(ocel);
		for (let objId in objects) {
			let lif = objLifecycle[objId];
			let st = lif[0]["ocel:timestamp"].getTime();
			let et = lif[lif.length - 1]["ocel:timestamp"].getTime();
			data.push([(et-st)/1000.0]);
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static encodeLifecycleLength(ocel) {
		let events = ocel["ocel:events"];
		let objects = ocel["ocel:objects"];
		let data = [];
		let featureNames = ["@@obj_lif_length"];
		let objLifecycle = OcelObjectFeatures.getObjectsLifecycle(ocel);
		for (let objId in objects) {
			let lif = objLifecycle[objId];
			data.push([lif.length]);
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	
}

try {
	require('../../pm4js.js');
	module.exports = {OcelObjectFeatures: OcelObjectFeatures};
	global.OcelObjectFeatures = OcelObjectFeatures;
}
catch (err) {
	// not in node
	//console.log(err);
}
