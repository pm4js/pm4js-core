class OcelObjectFeatures {
	static apply(ocel, strAttributes=null, numAttributes=null) {
		let objStrAttr = OcelObjectFeatures.encodeObjStrAttr(ocel, strAttributes);
		let objNumAttr = OcelObjectFeatures.encodeObjNumAttr(ocel, numAttributes);
		let objLifecycleActivities = OcelObjectFeatures.encodeLifecycleActivities(ocel);
		let objLifecycleDuration = OcelObjectFeatures.encodeLifecycleDuration(ocel);
		let objLifecycleLength = OcelObjectFeatures.encodeLifecycleLength(ocel);
		let overallObjectGraphs = OcelObjectFeatures.encodeOverallObjectGraphs(ocel);
		let interactionGraphOt = OcelObjectFeatures.encodeInteractionGraphOt(ocel);
		let wip = OcelObjectFeatures.encodeWip(ocel);
		let featureNames = [...objStrAttr["featureNames"], ...objNumAttr["featureNames"], ...objLifecycleActivities["featureNames"], ...objLifecycleDuration["featureNames"], ...objLifecycleLength["featureNames"], ...overallObjectGraphs["featureNames"], ...interactionGraphOt["featureNames"], ...wip["featureNames"]];
		let data = [];
		let objects = ocel["ocel:objects"];
		let count = 0;
		for (let objId in objects) {
			data.push([...objStrAttr["data"][count], ...objNumAttr["data"][count], ...objLifecycleActivities["data"][count], ...objLifecycleDuration["data"][count], ...objLifecycleLength["data"][count], ...overallObjectGraphs["data"][count], ...interactionGraphOt["data"][count], ...wip["data"][count]]);
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
		let varPerFea = OcelObjectFeatures.variancePerFea(fea["data"]);
		let filteredIdxs = [];
		let j = 0;
		while (j < varPerFea.length) {
			if (varPerFea[j] >= 0.1) {
				filteredIdxs.push(j);
			}
			j = j + 1;
		}
		let filteredFea = OcelObjectFeatures.filterOnIndexes(fea, filteredIdxs);
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
	
	static enrichEventLogWithObjectFeatures(ocel, strAttributes=null, numAttributes=null) {
		let fea = OcelObjectFeatures.apply(ocel, strAttributes, numAttributes);
		let data = fea["data"];
		let featureNames = fea["featureNames"];
		let count = 0;
		let objects = ocel["ocel:objects"];
		for (let objId in objects) {
			let obj = objects[objId];
			let i = 0;
			while (i < featureNames.length) {
				let fn = featureNames[i];
				let val = data[count][i];
				obj["ocel:ovmap"][fn] = val;
				i = i + 1;
			}
			count = count + 1;
		}
		return ocel;
	}
	
	static produceTable(ocel, fea) {
		let featureNames = [...fea["featureNames"]];
		let data = [];
		let objects = Object.keys(ocel["ocel:objects"]);
		let i = 0;
		while (i < fea["data"].length) {
			data.push([...fea["data"][i]]);
			data[i].unshift(objects[i]);
			i = i + 1;
		}
		featureNames.unshift("OBJECT_ID");
		i = 0;
		while (i < featureNames.length) {
			featureNames[i] = featureNames[i].replace(new RegExp("@@", 'g'), "").replace(/[^a-z0-9]/gmi, " ").replace(/\s+/g, " ").replace(new RegExp(" ", 'g'), "_");
			i = i + 1;
		}
		return {"data": data, "featureNames": featureNames};
	}
	
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
				featureNames.push("@@obj_attr_"+attr.replace(/[\W_]+/g," ")+"_"+val.replace(/[\W_]+/g," "));
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
			featureNames.push("@@obj_num_attr_"+attr.replace(/[\W_]+/g," "));
		}
		return {"data": data, "featureNames": featureNames};
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
	
	static getObjectsLifecycleId(ocel) {
		let lif = {};
		let objects = ocel["ocel:objects"];
		for (let objId in objects) {
			lif[objId] = [];
		}
		let events = ocel["ocel:events"];
		for (let evId in events) {
			let eve = events[evId];
			for (let objId of eve["ocel:omap"]) {
				lif[objId].push(evId);
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
			featureNames.push("@@obj_lif_act_"+act.replace(/[\W_]+/g," "));
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
			if (lif.length > 0) {
				let st = lif[0]["ocel:timestamp"].getTime();
				let et = lif[lif.length - 1]["ocel:timestamp"].getTime();
				data.push([(et-st)/1000.0]);
			}
			else {
				data.push([0]);
			}
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
	
	static encodeOverallObjectGraphs(ocel) {
		let interactionGraph = OcelGraphs.objectInteractionGraph(ocel);
		let descendantsGraph = OcelGraphs.objectDescendantsGraph(ocel);
		let cobirthGraph = OcelGraphs.objectCobirthGraph(ocel);
		let codeathGraph = OcelGraphs.objectCodeathGraph(ocel);
		let inheritanceGraph = OcelGraphs.objectInheritanceGraph(ocel);
		let objects = ocel["ocel:objects"];
		let data = [];
		let featureNames = ["@@object_overall_interactions", "@@object_overall_descendants", "@@object_overall_cobirth", "@@object_overall_codeath", "@@object_overall_inheritance"];
		for (let objId in objects) {
			let interactions = 0;
			let descendants = 0;
			let cobirth = 0;
			let codeath = 0;
			let inheritance = 0;
			if (objId in interactionGraph) {
				interactions = interactionGraph[objId].length;
			}
			if (objId in descendantsGraph) {
				descendants = descendantsGraph[objId].length;
			}
			if (objId in cobirthGraph) {
				cobirth = cobirthGraph[objId].length;
			}
			if (objId in codeathGraph) {
				codeath = codeathGraph[objId].length;
			}
			if (objId in inheritanceGraph) {
				inheritance = inheritanceGraph[objId].length;
			}
			data.push([interactions, descendants, cobirth, codeath, inheritance]);
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static encodeInteractionGraphOt(ocel) {
		let interactionGraph = OcelGraphs.objectInteractionGraph(ocel);
		let objects = ocel["ocel:objects"];
		let objOt = {};
		let objectTypes = {};
		for (let objId in objects) {
			let obj = objects[objId];
			objOt[objId] = obj["ocel:type"];
			objectTypes[obj["ocel:type"]] = 0;
		}
		objectTypes = Object.keys(objectTypes);
		let data = [];
		let featureNames = [];
		for (let ot of objectTypes) {
			featureNames.push("@@object_interaction_ot_" + ot.replace(/[\W_]+/g," "));
		}
		for (let objId in objects) {
			let interactions = interactionGraph[objId];
			let arr = [];
			for (let ot of objectTypes) {
				let count = 0;
				if (interactions != null) {
					for (let objId2 of interactions) {
						if (objOt[objId2] == ot) {
							count = count + 1
						}
					}
				}
				arr.push(count);
			}
			data.push(arr);
		}
		return {"data": data, "featureNames": featureNames};
	}
	
	static encodeWip(ocel) {
		let tree = OcelIntervalTree.buildObjectLifecycleTimestampIntervalTree(ocel);
		let objLifecycle = OcelObjectFeatures.getObjectsLifecycle(ocel);
		let data = [];
		let featureNames = ["@@object_wip"];
		let objects = ocel["ocel:objects"];
		for (let objId in objects) {
			let obj = objects[objId];
			let lif = objLifecycle[objId];
			if (lif.length > 0) {
				let st = lif[0]["ocel:timestamp"].getTime() / 1000.0;
				let et = lif[lif.length - 1]["ocel:timestamp"].getTime() / 1000.0;
				let intersectionAfterBefore = IntervalTreeAlgorithms.queryInterval(tree, st, et);
				data.push([intersectionAfterBefore.length]);
			}
			else {
				data.push([0]);
			}
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
