class CsvOcelImporter {
	static apply(txt, activityColumn, timestampColumn, objectTypes, attNames, evIdColumn=null, separators=null, sep=CsvOcelImporter.DEFAULT_SEPARATOR, quotechar=CsvOcelImporter.DEFAULT_QUOTECHAR) {
		if (separators == null) {
			separators = ["\"", "'"];
		}
		let arr = CsvImporter.parseCSV(txt, sep=sep, quotechar=quotechar);
		let ocel = {};
		ocel["ocel:events"] = {};
		ocel["ocel:objects"] = {};
		ocel["ocel:global-event"] = {"ocel:activity": "__INVALID__"};
		ocel["ocel:global-object"] = {"ocel:activity": "__INVALID__"};
		ocel["ocel:global-log"] = {"ocel:version": "1.0", "ocel:ordering": "timestamp", "ocel:attribute-names": attNames, "ocel:object-types": objectTypes};
		let i = 1;
		while (i < arr.length) {
			let eve = {"ocel:omap": [], "ocel:vmap": {}}
			let evId = null;
			if (evIdColumn == null) {
				evId = ""+i;
			}
			let j = 0;
			while (j < arr[0].length) {
				if (arr[0][j] == evIdColumn) {
					evId = arr[i][j];
				}
				if (arr[0][j] == activityColumn) {
					eve["ocel:activity"] = arr[i][j];
				}
				else if (arr[0][j] == timestampColumn) {
					eve["ocel:timestamp"] = arr[i][j];
				}
				else if (objectTypes.includes(arr[0][j])) {
					if (arr[i][j].length >= 2) {
						let objArr0 = arr[i][j].substring(1, arr[i][j].length-1);
						let objArr = null;
						if (separators.length > 0) {
							objArr = [];
							let z = 0;
							let reading = false;
							let currRead = null;
							while (z < objArr0.length) {
								if (separators.includes(objArr0[z])) {
									if (reading) {
										objArr.push(currRead);
									}
									reading = !reading;
									currRead = null;
									currRead = "";
								}
								else if (reading) {
									currRead += objArr0[z];
								}
								z++;
							}
						}
						else {
							objArr = objArr0.split(sep);
						}
						for (let objId of objArr) {
							eve["ocel:omap"].push(objId);
							if (!(objId in ocel["ocel:objects"])) {
								ocel["ocel:objects"][objId] = {"ocel:type": arr[0][j], "ocel:ovmap": {}};
							}
						}
					}
				}
				else if (attNames.includes(arr[0][j])) {
					eve["ocel:vmap"][arr[0][j]] = arr[i][j];
				}
				j++;
			}
			ocel["ocel:events"][evId] = eve;
			i++;
		}
		return ocel;
	}
}


CsvOcelImporter.DEFAULT_SEPARATOR = ',';
CsvOcelImporter.DEFAULT_QUOTECHAR = '"';

try {
	require('../../../../pm4js.js');
	module.exports = {CsvOcelImporter: CsvOcelImporter};
	global.CsvOcelImporter = CsvOcelImporter;
}
catch (err) {
	// not in node
	//console.log(err);
}
