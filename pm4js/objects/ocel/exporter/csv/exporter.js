class CsvOcelExporter {
	static apply(ocel, sep=CsvOcelExporter.DEFAULT_SEPARATOR, quotechar=CsvOcelExporter.DEFAULT_QUOTECHAR, newline=CsvOcelExporter.DEFAULT_NEWLINE) {
		let rows = [];
		let header = ["ocel:eid", "ocel:activity", "ocel:timestamp"];
		for (let objType of ocel["ocel:global-log"]["ocel:object-types"]) {
			let objType1 = objType.split("ocel:type:");
			objType1 = objType1[objType1.length - 1]
			header.push("ocel:type:"+objType1);
		}
		for (let attName of ocel["ocel:global-log"]["ocel:attribute-names"]) {
			header.push(attName);
		}
		rows.push(header.join(sep));
		for (let evId in ocel["ocel:events"]) {
			let eve = ocel["ocel:events"][evId];
			let row = [];
			row.push(evId);
			row.push(eve["ocel:activity"]);
			row.push(eve["ocel:timestamp"].toISOString());
			let omap = eve["ocel:omap"];
			let typeOmap = {};
			for (let objType of ocel["ocel:global-log"]["ocel:object-types"]) {
				typeOmap[objType] = [];
			}
			for (let obj of omap) {
				let objType = ocel["ocel:objects"][obj]["ocel:type"];
				typeOmap[objType].push(obj);
			}
			for (let objType of ocel["ocel:global-log"]["ocel:object-types"]) {
				if (typeOmap[objType].length > 0) {
					row.push(quotechar+"['"+typeOmap[objType].join("','")+"']"+quotechar);
				}
				else {
					row.push(" ");
				}
			}
			for (let attName of ocel["ocel:global-log"]["ocel:attribute-names"]) {
				if (attName in eve["ocel:vmap"]) {
					row.push(eve["ocel:vmap"][attName]);
				}
				else {
					row.push(" ");
				}
			}
			rows.push(row.join(sep));
		}
		return rows.join(newline);
	}
}

CsvOcelExporter.DEFAULT_SEPARATOR = ',';
CsvOcelExporter.DEFAULT_QUOTECHAR = '"';
CsvOcelExporter.DEFAULT_NEWLINE = '\n';

try {
	module.exports = {CsvOcelExporter: CsvOcelExporter};
	global.CsvOcelExporter = CsvOcelExporter;
}
catch (err) {
	// not in node
	//console.log(err);
}

