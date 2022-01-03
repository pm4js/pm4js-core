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
