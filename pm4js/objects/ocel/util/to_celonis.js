class OcelToCelonis {
	static escap(stru, sep, quotechar) {
		if (stru.indexOf(sep) > -1) {
			return quotechar + stru + quotechar;
		}
		else {
			return stru;
		}
	}
	
	static getLogFromCollection(coll, logName, logType, objType1, objType2, sep, quotechar, newline) {
		if (!(logName in coll)) {
			coll[logName] = [];
			if (logType == "events") {
				coll[logName].push("EVID_"+objType1+sep+"CASE_"+objType1+sep+"ACT_"+objType1+sep+"TIME_"+objType1+sep+"EVID_GENERAL");
			}
			else if (logType == "objects") {
				coll[logName].push("CASE_"+objType1);
			}
			else if (logType == "objrel") {
				coll[logName].push("CASE_"+objType1+sep+"CASE_"+objType2);
			}
			else if (logType == "everel") {
				coll[logName].push("EVID_"+objType1+sep+"EVID_"+objType2);
			}
		}
		return coll[logName];
	}
	
	static pushElementIntoCollection(coll, elem, logName, logType, objType1, objType2, sep, quotechar, newline) {
		let log = OcelToCelonis.getLogFromCollection(coll, logName, logType, objType1, objType2, sep, quotechar, newline);
		let i = 0;
		while (i < elem.length) {
			elem[i] = OcelToCelonis.escap(elem[i], sep, quotechar);
			i++;
		}
		elem = elem.join(sep);
		if (!(log.includes(elem))) {
			log.push(elem);
		}
	}
	
	static yaml1(objectTypes, transitions) {
		let ret = [];
		ret.push("eventLogsMetadata:");
		ret.push("    eventLogs:");
		for (let ot of objectTypes) {
			ret.push("      - id: "+ot);
			ret.push("        displayName: "+ot);
			ret.push("        pql: '\""+ot+"_EVENTS\".\"ACT_"+ot+"\"'")
		}
		ret.push("    transitions:");
		for (let trans of transitions) {
			ret.push("      - id: "+trans[0]+"_"+trans[1]);
			ret.push("        displayName: "+trans[0]+"_"+trans[1]);
			ret.push("        firstEventLogId: "+trans[0]);
			ret.push("        secondEventLogId: "+trans[1]);
			ret.push("        type: INTERLEAVED");
		}
		return ret.join("\n");
	}
	
	static yaml2(objectTypes, transitions) {
		let ret = [];
		ret.push("settings:");
		ret.push("    eventLogs:");
		for (let ot of objectTypes) {
			ret.push("      - eventLog: "+ot);
		}
		return ret.join("\n");
	}
	
	static apply(ocel, sep=",", quotechar="\"", newline="\r\n") {
		let coll = {};
		let objectTypes = {};
		let transitions0 = {};
		
		for (let evId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][evId];
			for (let objId of eve["ocel:omap"]) {
				let objType = ocel["ocel:objects"][objId]["ocel:type"];
				OcelToCelonis.pushElementIntoCollection(coll, [objId], objType+"_CASES", "objects", objType, null, sep, quotechar, newline);
				OcelToCelonis.pushElementIntoCollection(coll, [evId+":"+objId, objId, eve["ocel:activity"], eve["ocel:timestamp"], evId], objType+"_EVENTS", "events", objType, null, sep, quotechar, newline);
				objectTypes[objType] = 0;
				for (let objId2 of eve["ocel:omap"]) {
					if (objId != objId2) {
						let objType2 = ocel["ocel:objects"][objId2]["ocel:type"];
						if (objType <= objType2) {
							if (objType < objType2) {
								OcelToCelonis.pushElementIntoCollection(coll, [objId, objId2], "CONNECT_"+objType+"_CASES_"+objType2+"_CASES", "objrel", objType, objType2, sep, quotechar, newline);
								transitions0[objType+"@#@#"+objType2] = 0;

							}
							OcelToCelonis.pushElementIntoCollection(coll, [evId+":"+objId, evId+":"+objId2],  "CONNECT_"+objType+"_EVENTS_"+objType2+"_EVENTS", "everel", objType, objType2, sep, quotechar, newline);
						}
					}
				}
			}
		}
		for (let logName in coll) {
			coll[logName] = coll[logName].join(newline);
		}
		objectTypes = Object.keys(objectTypes);
		let transitions = [];
		for (let trans0 in transitions0) {
			let trans00 = trans0.split("@#@#");
			transitions.push([trans00[0], trans00[1]]);
		}
		return {"coll": coll, "objectTypes": objectTypes, "transitions": transitions, "knowledgeYaml": OcelToCelonis.yaml1(objectTypes, transitions), "modelYaml": OcelToCelonis.yaml2(objectTypes, transitions)};
	}
}

try {
	require('../../../pm4js.js');
	module.exports = {OcelToCelonis: OcelToCelonis};
	global.OcelToCelonis = OcelToCelonis;
}
catch (err) {
	// not in node
	//console.log(err);
}
