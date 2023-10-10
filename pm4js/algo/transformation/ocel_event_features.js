class OcelEventFeatures {
	static apply(ocel, strAttributes=null, numAttributes=null) {
		let activitiesEncoding = OcelEventFeatures.encodeActivity(ocel);
		let timestampEncoding = OcelEventFeatures.encodeTimestamp(ocel);
		let numRelObjEncoding = OcelEventFeatures.encodeNumRelObj(ocel);
		let numRelObjStartEncoding = OcelEventFeatures.encodeNumRelObjStart(ocel);
		let numRelObjEndEncoding = OcelEventFeatures.encodeNumRelObjEnd(ocel);
		let strAttrEncoding = OcelEventFeatures.encodeStrAttrEv(ocel, strAttributes);
		let numAttrEncoding = OcelEventFeatures.encodeNumAttrEv(ocel, numAttributes);
		let featureNames = [...activitiesEncoding["featureNames"], ...timestampEncoding["featureNames"], ...numRelObjEncoding["featureNames"], ...numRelObjStartEncoding["featureNames"], ...numRelObjEndEncoding["featureNames"], ...strAttrEncoding["featureNames"], ...numAttrEncoding["featureNames"]];
		let data = [];
		let count = 0;
		for (let evId in ocel["ocel:events"]) {
			data.push([...activitiesEncoding["data"][count], ...timestampEncoding["data"][count], ...numRelObjEncoding["data"][count], ...numRelObjStartEncoding["data"][count], ...numRelObjEndEncoding["data"][count], ...strAttrEncoding["data"][count], ...numAttrEncoding["data"][count]]);
			count = count + 1;
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static transformToDct(fea) {
		let lst = [];
		let i = 0;
		while (i < fea["data"].length) {
			let dct = {};
			let j = 0;
			while (j < fea["data"][i].length) {
				dct[fea["featureNames"][j]] = fea["data"][i][j];
				j++;
			}
			lst.push(dct);
			i++;
		}
		return lst;
	}
	
	static filterOnVariance(fea, threshold) {
		let varPerFea = OcelEventFeatures.variancePerFea(fea["data"]);
		let filteredIdxs = [];
		let j = 0;
		while (j < varPerFea.length) {
			if (varPerFea[j] >= 0.1) {
				filteredIdxs.push(j);
			}
			j = j + 1;
		}
		let filteredFea = OcelEventFeatures.filterOnIndexes(fea, filteredIdxs);
		return filteredFea;
	}
	
	static filterOnIndexes(fea, idxs) {
		let filteredFea = {"featureNames": [], "data": []};
		let j = 0;
		while (j < idxs.length) {
			filteredFea["featureNames"].push(fea["featureNames"][idxs[j]]);
			j++;
		}
		let i = 0;
		while (i < fea["data"].length) {
			let arr = [];
			j = 0;
			while (j < idxs.length) {
				arr.push(fea["data"][i][idxs[j]]);
				j++;
			}
			filteredFea["data"].push(arr);
			i++;
		}
		return filteredFea;
	}
	
	static variancePerFea(data) {
		let ret = [];
		let j = 0;
		while (j < data[0].length) {
			let avg = 0.0;
			let i = 0;
			while (i < data.length) {
				avg += data[i][j];
				i++;
			}
			avg = avg / data.length;
			let vr = 0.0;
			i = 0;
			while (i < data.length) {
				vr += (data[i][j] - avg)*(data[i][j] - avg)
				i++;
			}
			vr = vr / data.length;
			ret.push(vr);
			j++;
		}
		return ret;
	}
	
	static scaling(fea) {
		let j = 0;
		while (j < fea["featureNames"].length) {
			let minValue = 99999999999;
			let maxValue = -99999999999;
			let i = 0;
			while (i < fea["data"].length) {
				minValue = Math.min(minValue, fea["data"][i][j]);
				maxValue = Math.max(maxValue, fea["data"][i][j]);
				i++;
			}
			i = 0;
			while (i < fea["data"].length) {
				if (minValue != maxValue) {
					fea["data"][i][j] = (fea["data"][i][j] - minValue)/(maxValue - minValue);
				}
				else {
					fea["data"][i][j] = 1;
				}
				i++;
			}
			j++;
		}
		return fea;
	}
	
	static enrichEventLogWithEventFeatures(ocel, strAttributes=null, numAttributes=null) {
		let fea = OcelEventFeatures.apply(ocel, strAttributes, numAttributes);
		let data = fea["data"];
		let featureNames = fea["featureNames"];
		let count = 0;
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			let i = 0;
			while (i < featureNames.length) {
				let fn = featureNames[i];
				let val = data[count][i];
				eve["ocel:vmap"][fn] = val;
				i = i + 1;
			}
			count = count + 1;
		}
		return ocel;
	}
	
	static produceTable(ocel, fea) {
		let featureNames = [...fea["featureNames"]];
		let data = [];
		let events = Object.keys(ocel["ocel:events"]);
		let i = 0;
		while (i < fea["data"].length) {
			data.push([...fea["data"][i]]);
			data[i].unshift(events[i]);
			i = i + 1;
		}
		featureNames.unshift("EVENT_ID");
		i = 0;
		while (i < featureNames.length) {
			featureNames[i] = featureNames[i].replace(new RegExp("@@", 'g'), "").replace(/[^a-z0-9]/gmi, " ").replace(/\s+/g, " ").replace(new RegExp(" ", 'g'), "_");
			i = i + 1;
		}
		return {"data": data, "featureNames": featureNames};
	}
	
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
			featureNames.push("@@ev_act_" + act.replace(/[\W_]+/g," "));
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
			featureNames.push("@@ev_rel_objs_ot_"+objType.replace(/[\W_]+/g," "));
		}
		return {"data": data, "featureNames": featureNames};
	}

	static encodeNumRelObjStart(ocel) {
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
		let seenObjects = {};
		for (let evId in events) {
			let eve = events[evId];
			let arr = [];
			for (let ot of objectTypes) {
				let thisCount = 0;
				for (let objId of eve["ocel:omap"]) {
					if (otPerObject[objId] == ot) {
						if (!(objId in seenObjects)) {
							thisCount = thisCount + 1;
						}
					}
				}
				arr.push(thisCount);
			}
			for (let objId of eve["ocel:omap"]) {
				seenObjects[objId] = 0;
			}
			data.push(arr);
		}
		let featureNames = [];
		for (let objType of objectTypes) {
			featureNames.push("@@ev_rel_objs_start_ot_"+objType.replace(/[\W_]+/g," "));
		}
		return {"data": data, "featureNames": featureNames};
	}

	static encodeNumRelObjEnd(ocel) {
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
		let evIds = Object.keys(events).reverse();
		let lastEventLifecycle = {};
		for (let evId of evIds) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				if (!(objId in lastEventLifecycle)) {
					lastEventLifecycle[objId] = evId;
				}
			}
		}
		evIds = evIds.reverse();
		let data = [];
		for (let evId of evIds) {
			let eve = events[evId];
			let arr = [];
			for (let ot of objectTypes) {
				let thisCount = 0;
				for (let objId of eve["ocel:omap"]) {
					if (otPerObject[objId] == ot) {
						if (lastEventLifecycle[objId] == evId) {
							thisCount = thisCount + 1;
						}
					}
				}
				arr.push(thisCount);
			}
			data.push(arr);
		}
		let featureNames = [];
		for (let objType of objectTypes) {
			featureNames.push("@@ev_rel_objs_end_ot_"+objType.replace(/[\W_]+/g," "));
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static encodeStrAttrEv(ocel, strAttributes=null) {
		if (strAttributes == null) {
			strAttributes = [];
		}
		let events = ocel["ocel:events"];
		let data = [];
		let featureNames = [];
		
		for (let evId in events) {
			data.push([]);
		}
		for (let attr of strAttributes) {
			let diffValues = {};
			for (let evId in events) {
				let eve = events[evId];
				if (attr in eve["ocel:vmap"]) {					
					diffValues[eve["ocel:vmap"][attr]] = 0;
				}
			}
			diffValues = Object.keys(diffValues);
			let zeroArr = [];
			for (let val of diffValues) {
				featureNames.push("@@ev_attr_"+attr.replace(/[\W_]+/g," ")+"_"+val.replace(/[\W_]+/g," "));
				zeroArr.push(0);
			}
			let count = 0;
			for (let evId in events) {
				let eve = events[evId];
				let vect = [...zeroArr];
				if (attr in eve["ocel:vmap"]) {
					let val = eve["ocel:vmap"][attr];
					vect[diffValues.indexOf(val)] = 1;
				}
				data[count] = [...data[count], ...vect];
				count = count + 1;
			}
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static encodeNumAttrEv(ocel, numAttributes=null) {
		if (numAttributes == null) {
			numAttributes = [];
		}
		let events = ocel["ocel:events"];
		let data = [];
		let featureNames = [];
		for (let evId in events) {
			data.push([]);
		}
		for (let attr of numAttributes) {
			let count = 0;
			for (let evId in events) {
				let eve = events[evId];
				if (attr in eve["ocel:vmap"]) {
					data[count].push(eve["ocel:vmap"][attr]);
				}
				else {
					data[count].push(0);
				}
				count = count + 1;
			}
			featureNames.push("@@ev_num_attr_"+attr.replace(/[\W_]+/g," "));
		}
		return {"data": data, "featureNames": featureNames};
	}
}

try {
	module.exports = {OcelEventFeatures: OcelEventFeatures};
	global.OcelEventFeatures = OcelEventFeatures;
}
catch (err) {
	// not in node
	//console.log(err);
}
