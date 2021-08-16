class CsvImporter {
	static apply(str, sep=CsvImporter.DEFAULT_SEPARATOR, quotechar=CsvImporter.DEFAULT_QUOTECHAR, caseId=CsvImporter.DEFAULT_CASE_ID, activity=CsvImporter.DEFAULT_ACTIVITY, timestamp=CsvImporter.DEFAULT_TIMESTAMP) {
		let csvArray = CsvImporter.parseCSV(str, sep=sep, quotechar=quotechar);
		let traces = {};
		let i = 1;
		let j = 0;
		let log = new EventLog();
		while (i < csvArray.length) {
			let eve = new Event();
			j = 0;
			while (j < csvArray[i].length) {
				eve.attributes[csvArray[0][j]] = new Attribute(csvArray[i][j]);
				j++;
			}
			eve.attributes[CsvImporter.DEFAULT_ACTIVITY] = eve.attributes[activity];
			eve.attributes[CsvImporter.DEFAULT_TIMESTAMP] = new Attribute(new Date(eve.attributes[timestamp].value));
			let thisCaseId = eve.attributes[caseId].value;
			let trace = null;
			if (thisCaseId in traces) {
				trace = traces[thisCaseId];
			}
			else {
				trace = new Trace();
				trace.attributes[CsvImporter.DEFAULT_CASE_ID_AS_TRACE_ATTRIBUTE] = new Attribute(thisCaseId);
				traces[thisCaseId] = trace;
				log.traces.push(trace);
			}
			trace.events.push(eve);
			i++;
		}
		Pm4JS.registerObject(log, "Log imported from a CSV file");
		return log;
	}
	
	static parseCSV(str, sep=CsvImporter.DEFAULT_SEPARATOR, quotechar=CsvImporter.DEFAULT_QUOTECHAR) {
		var arr = [];
		var quote = false;  // 'true' means we're inside a quoted field

		// Iterate over each character, keep track of current row and column (of the returned array)
		for (var row = 0, col = 0, c = 0; c < str.length; c++) {
			var cc = str[c], nc = str[c+1];        // Current character, next character
			arr[row] = arr[row] || [];             // Create a new row if necessary
			arr[row][col] = arr[row][col] || '';   // Create a new column (start with empty string) if necessary

			// If the current character is a quotation mark, and we're inside a
			// quoted field, and the next character is also a quotation mark,
			// add a quotation mark to the current column and skip the next character
			if (cc == quotechar && quote && nc == quotechar) { arr[row][col] += cc; ++c; continue; }

			// If it's just one quotation mark, begin/end quoted field
			if (cc == quotechar) { quote = !quote; continue; }

			// If it's a comma and we're not in a quoted field, move on to the next column
			if (cc == sep && !quote) { ++col; continue; }

			// If it's a newline (CRLF) and we're not in a quoted field, skip the next character
			// and move on to the next row and move to column 0 of that new row
			if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }

			// If it's a newline (LF or CR) and we're not in a quoted field,
			// move on to the next row and move to column 0 of that new row
			if (cc == '\n' && !quote) { ++row; col = 0; continue; }
			if (cc == '\r' && !quote) { ++row; col = 0; continue; }

			// Otherwise, append the current character to the current column
			arr[row][col] += cc;
		}
		return arr;
	}
}

CsvImporter.DEFAULT_CASE_ID = "case:concept:name";
CsvImporter.DEFAULT_ACTIVITY = "concept:name";
CsvImporter.DEFAULT_TIMESTAMP = "time:timestamp";
CsvImporter.DEFAULT_CASE_ID_AS_TRACE_ATTRIBUTE = "concept:name";
CsvImporter.DEFAULT_CASE_PREFIX = "case:";
CsvImporter.DEFAULT_SEPARATOR = ',';
CsvImporter.DEFAULT_QUOTECHAR = '"';

try {
	require('../../../../pm4js.js');
	require('../../log.js');
	module.exports = {CsvImporter: CsvImporter};
	global.CsvImporter = CsvImporter;
}
catch (err) {
	// not in node
	//console.log(err);
}

//Pm4JS.registerImporter("CsvImporter", "apply", ["csv"], "CSV Importer", "Alessandro Berti");