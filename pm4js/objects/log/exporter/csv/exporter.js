class CsvExporter {
	static formatDateString(d) {
		return ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
	}
	
	static apply(eventLog, sep=CsvExporter.DEFAULT_SEPARATOR, quotechar=CsvExporter.DEFAULT_QUOTECHAR, casePrefix=CsvExporter.DEFAULT_CASE_PREFIX, newline=CsvExporter.DEFAULT_NEWLINE) {
		let caseAttributes = GeneralLogStatistics.getCaseAttributesList(eventLog);
		let eventAttributes0 = GeneralLogStatistics.getEventAttributesList(eventLog);
		let eventAttributes = [];
		for (let ea of eventAttributes0) {
			if (!(ea.startsWith(casePrefix))) {
				eventAttributes.push(ea);
			}
		}
		let ret = [];
		let header = "";
		for (let ca of caseAttributes) {
			header += casePrefix+ca+sep;
		}
		for (let ea of eventAttributes) {
			header += ea+sep;
		}
		header = header.slice(0, -1);
		ret.push(header);
		for (let trace of eventLog.traces) {
			let pref = "";
			for (let ca of caseAttributes) {
				let val = trace.attributes[ca];
				if (val != null) {
					val = val.value;
					if (typeof val == "string" && val.includes(sep)) {
						pref += quotechar+val+quotechar+sep;
					}
					else if (typeof val == "object") {
						//pref += val.toISOString()+sep;
						pref += CsvExporter.formatDateString(val)+sep;
					}
					else {
						pref += val+sep;
					}
				}
				else {
					pref += sep;
				}
			}
			for (let eve of trace.events) {
				let eveStr = ""+pref;
				for (let ea of eventAttributes) {
					let val = eve.attributes[ea];
					if (val != null) {
						val = val.value;
						if (typeof val == "string" && val.includes(sep)) {
							eveStr += quotechar+val+quotechar+sep;
						}
						else if (typeof val == "object") {
							//eveStr += val.toISOString()+sep;
							eveStr += CsvExporter.formatDateString(val)+sep;
						}
						else {
							eveStr += val+sep;
						}
					}
					else {
						eveStr += sep;
					}
				}
				eveStr = eveStr.slice(0, -1);
				ret.push(eveStr);
			}
		}
		ret = ret.join(newline);
		return ret;
	}
}

CsvExporter.DEFAULT_CASE_ID = "case:concept:name";
CsvExporter.DEFAULT_ACTIVITY = "concept:name";
CsvExporter.DEFAULT_TIMESTAMP = "time:timestamp";
CsvExporter.DEFAULT_CASE_ID_AS_TRACE_ATTRIBUTE = "concept:name";
CsvExporter.DEFAULT_CASE_PREFIX = "case:";
CsvExporter.DEFAULT_SEPARATOR = ',';
CsvExporter.DEFAULT_QUOTECHAR = '"';
CsvExporter.DEFAULT_NEWLINE = '\n';

try {
	require('../../../../pm4js.js');
	require('../../log.js');
	require('../../../../statistics/log/general.js');
	module.exports = {CsvExporter: CsvExporter};
	global.CsvExporter = CsvExporter;
}
catch (err) {
	// not in node
	//console.log(err);
}

Pm4JS.registerExporter("CsvExporter", "apply", "EventLog", "csv", "text/csv", "CSV Exporter", "Alessandro Berti");
