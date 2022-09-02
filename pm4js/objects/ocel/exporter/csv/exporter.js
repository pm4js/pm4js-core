class CsvOcelExporter {
	static apply(ocel, sep=CsvOcelExporter.DEFAULT_SEPARATOR, quotechar=CsvOcelExporter.DEFAULT_QUOTECHAR, newline=CsvOcelExporter.DEFAULT_NEWLINE) {
		let rows = [];
		let header = ["ocel:eid", "ocel:activity", "ocel:timestamp"];
		for (let objType of ocel["ocel:global-log"]["ocel:object-types"]) {
			header.push(objType);
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
			row.push(eve["ocel:timestamp"]);
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
				if (attName in eve) {
					row.push(eve[attName]);
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
	require('../../../../pm4js.js');
	module.exports = {CsvOcelExporter: CsvOcelExporter};
	global.CsvOcelExporter = CsvOcelExporter;
}
catch (err) {
	// not in node
	//console.log(err);
}

