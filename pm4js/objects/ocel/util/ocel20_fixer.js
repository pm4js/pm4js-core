class Ocel20FormatFixer {
	static apply(ocel) {
		if (!("ocel:objectChanges" in ocel)) {
			ocel["ocel:objectChanges"] = [];
		}
		for (let evId in ocel["ocel:events"]) {
			let ev = ocel["ocel:events"][evId];
			let omapIdx = 0;
			while (omapIdx < ev["ocel:omap"].length) {
				let objId = ev["ocel:omap"][omapIdx];
				if (!(objId in ocel["ocel:objects"])) {
					ev["ocel:omap"].splice(omapIdx, 1);
					continue;
				}
				omapIdx++;
			}
			for (let idx in ev["ocel:omap"]) {
				let objId = ev["ocel:omap"][idx];
				if (!(objId in ocel["ocel:objects"])) {
				}
			}
			if (!("ocel:typedOmap" in ev)) {
				let typedOmap = [];
				for (let objId of ev["ocel:omap"]) {
					typedOmap.push({"ocel:oid": objId, "ocel:qualifier": "EMPTY"});
				}
				ev["ocel:typedOmap"] = typedOmap;
			}
		}
		for (let objId in ocel["ocel:objects"]) {
			let obj = ocel["ocel:objects"][objId];
			if (!("ocel:o2o" in obj)) {
				obj["ocel:o2o"] = [];
			}
		}
		if (!("ocel:objectTypes" in ocel)) {			
			let objectTypes = {};
			
			for (let objId in ocel["ocel:objects"]) {
				let obj = ocel["ocel:objects"][objId];
				let type = obj["ocel:type"];
				
				if (!(type in objectTypes)) {
					objectTypes[type] = {};
				}
								
				for (let att in obj["ocel:ovmap"]) {
					let attValue = obj["ocel:ovmap"][att];
					let transf = Ocel20FormatFixer.transformAttValue(attValue);
					objectTypes[type][att] = transf[0];
				}
			}
			
			ocel["ocel:objectTypes"] = objectTypes;
		}
		if (!("ocel:eventTypes" in ocel)) {			
			let eventTypes = {};
			
			for (let evId in ocel["ocel:events"]) {
				let eve = ocel["ocel:events"][evId];
				let type = eve["ocel:activity"];
				
				if (!(type in eventTypes)) {
					eventTypes[type] = {};
				}
				
				for (let att in eve["ocel:vmap"]) {
					let attValue = eve["ocel:vmap"][att];
					let transf = Ocel20FormatFixer.transformAttValue(attValue);
					eventTypes[type][att] = transf[0];
				}
				
				
			}
			
			ocel["ocel:eventTypes"] = eventTypes;
		}
		return ocel;
	}
	
	static transformAttValue(attValue) {
		let xmlTag = null;
		let value = null;
		if (typeof attValue == "string") {
			xmlTag = "string";
			value = attValue;
		}
		else if (typeof attValue == "object") {
			return "date";
			xmlTag = "date";
			value = attValue.toISOString();
		}
		else if (typeof attValue == "number") {
			xmlTag = "float";
			value = ""+attValue;
		}
		else {
			xmlTag = "string";
			value = attValue;
		}
		return [xmlTag, value];
	}
}

try {
	module.exports = {Ocel20FormatFixer: Ocel20FormatFixer};
	global.Ocel20FormatFixer = Ocel20FormatFixer;
}
catch (err) {
	// not in node
	//console.log(err);
}
