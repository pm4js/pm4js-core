class CsvOcelImporter {
	static apply(txt, activityColumn=null, timestampColumn=null, objectTypes=null, attNames=null, evIdColumn=null, separators=null, sep=CsvOcelImporter.DEFAULT_SEPARATOR, quotechar=CsvOcelImporter.DEFAULT_QUOTECHAR) {
		if (activityColumn == null && timestampColumn == null && objectTypes == null && attNames == null) {
			return CsvOcel2Importer.apply(txt, sep, quotechar);
		}
		if (separators == null) {
			separators = ["\"", "'"];
		}
		if (objectTypes == null) {
			objectTypes = [];
		}
		if (attNames == null) {
			attNames = [];
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
					eve["ocel:timestamp"] = new Date(arr[i][j]);
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
							objArr = objArr0.split(",");
							if (objArr.length == 1 && objArr[0].length == 0) {
								objArr = [];
							}
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

class CsvOcel2Importer {
	static apply(txt, sep=CsvOcel2Importer.DEFAULT_SEPARATOR, quotechar=CsvOcel2Importer.DEFAULT_QUOTECHAR) {
		let arr = CsvOcel2Importer.parseCsv(txt, sep, quotechar);
		if (arr.length == 0) {
			throw new Error("Invalid OCEL 2.0 CSV: empty file");
		}

		let header = arr[0].slice();
		if (header.length > 0 && header[0].length > 0 && header[0].charCodeAt(0) == 0xFEFF) {
			header[0] = header[0].substring(1);
		}
		let columns = CsvOcel2Importer.parseHeader(header);

		let events = Object.create(null);
		let objects = Object.create(null);
		let objectTypes = Object.create(null);
		let eventTypes = Object.create(null);
		let attributeNames = Object.create(null);
		let eventAttributeEntries = [];
		let objectAttributeEntries = [];
		let assignmentSeq = 0;
		Object.defineProperty(events, Symbol.for("pm4js.ocel.csv.eventOrder"), {"value": [], "enumerable": false});

		for (let objectColumn of columns.objectColumns) {
			objectTypes[objectColumn.type] = Object.create(null);
		}

		for (let rowIndex = 1; rowIndex < arr.length; rowIndex++) {
			let row = arr[rowIndex];
			if (row.length > header.length) {
				throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+": too many fields");
			}
			row = CsvOcel2Importer.padRow(row, header.length);
			if (CsvOcel2Importer.isEmptyRow(row)) {
				continue;
			}

			let rowId = CsvOcel2Importer.trimValue(row[columns.idIndex]);
			let rowActivity = CsvOcel2Importer.trimValue(row[columns.activityIndex]);
			let rowTimestamp = CsvOcel2Importer.trimValue(row[columns.timestampIndex]);
			let isO2ORow = rowActivity.toLowerCase() == "o2o";
			let rowDate = null;
			if (rowTimestamp.length > 0) {
				rowDate = CsvOcel2Importer.parseTimestamp(rowTimestamp, "row "+(rowIndex + 1));
			}

			if (isO2ORow) {
				if (rowId.length == 0) {
					throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+": object-to-object row without source object id");
				}
				if (!(rowId in objects)) {
					throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+": source object '"+rowId+"' has no previously declared type");
				}
				CsvOcel2Importer.ensureNoEventAttributes(row, columns.eventAttributeColumns, rowIndex);
				for (let objectColumn of columns.objectColumns) {
					let references = CsvOcel2Importer.parseReferenceCell(row[objectColumn.index], rowIndex, header[objectColumn.index]);
					for (let reference of references) {
						CsvOcel2Importer.ensureObject(objects, reference.objectId, objectColumn.type, rowIndex);
						CsvOcel2Importer.addUniqueRelation(objects[rowId]["ocel:o2o"], reference.objectId, reference.qualifier);
						if (reference.attributes != null) {
							if (rowDate == null) {
								throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+": object-to-object JSON attributes require a timestamp");
							}
							assignmentSeq = CsvOcel2Importer.collectObjectAttributes(reference, objectColumn.type, rowDate, rowIndex, assignmentSeq, "timed", objectAttributeEntries);
						}
					}
				}
			}
			else if (rowId.length == 0 && rowActivity.length == 0 && rowTimestamp.length == 0) {
				CsvOcel2Importer.ensureNoEventAttributes(row, columns.eventAttributeColumns, rowIndex);
				for (let objectColumn of columns.objectColumns) {
					let references = CsvOcel2Importer.parseReferenceCell(row[objectColumn.index], rowIndex, header[objectColumn.index]);
					for (let reference of references) {
						if (reference.hasQualifier) {
							throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+": object declaration rows cannot contain qualifiers");
						}
						CsvOcel2Importer.ensureObject(objects, reference.objectId, objectColumn.type, rowIndex);
						if (reference.attributes != null) {
							assignmentSeq = CsvOcel2Importer.collectObjectAttributes(reference, objectColumn.type, null, rowIndex, assignmentSeq, "base", objectAttributeEntries);
						}
					}
				}
			}
			else if (rowId.length == 0 && rowActivity.length == 0 && rowTimestamp.length > 0) {
				CsvOcel2Importer.ensureNoEventAttributes(row, columns.eventAttributeColumns, rowIndex);
				for (let objectColumn of columns.objectColumns) {
					let references = CsvOcel2Importer.parseReferenceCell(row[objectColumn.index], rowIndex, header[objectColumn.index]);
					for (let reference of references) {
						if (reference.attributes == null) {
							throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+": object attribute rows require JSON attributes");
						}
						CsvOcel2Importer.ensureObject(objects, reference.objectId, objectColumn.type, rowIndex);
						assignmentSeq = CsvOcel2Importer.collectObjectAttributes(reference, objectColumn.type, rowDate, rowIndex, assignmentSeq, "timed", objectAttributeEntries);
					}
				}
			}
			else if (rowId.length > 0 && rowActivity.length > 0 && rowTimestamp.length > 0) {
				if (rowId in events) {
					throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+": duplicate event id '"+rowId+"'");
				}
				let event = {"ocel:activity": rowActivity, "ocel:timestamp": rowDate, "ocel:omap": [], "ocel:typedOmap": [], "ocel:vmap": Object.create(null)};
				events[rowId] = event;
				events[Symbol.for("pm4js.ocel.csv.eventOrder")].push(rowId);
				if (!(rowActivity in eventTypes)) {
					eventTypes[rowActivity] = Object.create(null);
				}

				for (let eventAttributeColumn of columns.eventAttributeColumns) {
					let value = row[eventAttributeColumn.index];
					if (value !== "") {
						eventAttributeEntries.push({"eventId": rowId, "activity": rowActivity, "name": eventAttributeColumn.name, "value": value});
						attributeNames[eventAttributeColumn.name] = 0;
					}
				}

				for (let objectColumn of columns.objectColumns) {
					let references = CsvOcel2Importer.parseReferenceCell(row[objectColumn.index], rowIndex, header[objectColumn.index]);
					for (let reference of references) {
						CsvOcel2Importer.ensureObject(objects, reference.objectId, objectColumn.type, rowIndex);
						CsvOcel2Importer.addUniqueRelation(event["ocel:typedOmap"], reference.objectId, reference.qualifier);
						if (!(event["ocel:omap"].includes(reference.objectId))) {
							event["ocel:omap"].push(reference.objectId);
						}
						if (reference.attributes != null) {
							assignmentSeq = CsvOcel2Importer.collectObjectAttributes(reference, objectColumn.type, rowDate, rowIndex, assignmentSeq, "timed", objectAttributeEntries);
						}
					}
				}
			}
			else {
				throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+": row does not match a supported OCEL 2.0 CSV row type");
			}
		}

		CsvOcel2Importer.applyEventAttributes(events, eventTypes, eventAttributeEntries);
		let objectChanges = CsvOcel2Importer.applyObjectAttributes(objects, objectTypes, objectAttributeEntries);
		for (let entry of objectAttributeEntries) {
			attributeNames[entry.name] = 0;
		}

		let ocel = {};
		ocel["ocel:global-event"] = {};
		ocel["ocel:global-object"] = {};
		ocel["ocel:global-log"] = {};
		ocel["ocel:global-log"]["ocel:attribute-names"] = Object.keys(attributeNames);
		ocel["ocel:global-log"]["ocel:object-types"] = Object.keys(objectTypes);
		ocel["ocel:global-log"]["ocel:version"] = "1.0";
		ocel["ocel:global-log"]["ocel:ordering"] = "timestamp";
		ocel["ocel:events"] = events;
		ocel["ocel:objects"] = objects;
		ocel["ocel:objectTypes"] = objectTypes;
		ocel["ocel:eventTypes"] = eventTypes;
		ocel["ocel:objectChanges"] = objectChanges;

		return Ocel20FormatFixer.apply(ocel);
	}

	static parseCsv(txt, sep, quotechar) {
		if (typeof txt != "string") {
			throw new Error("Invalid OCEL 2.0 CSV: input must be a UTF-8 string");
		}
		if (sep.length != 1 || quotechar.length != 1 || sep == quotechar) {
			throw new Error("Invalid OCEL 2.0 CSV: separator and quote character must be distinct single characters");
		}
		if (txt.length == 0) {
			return [];
		}

		let rows = [];
		let row = [];
		let field = "";
		let state = "start";
		let justEndedRecord = false;
		let i = 0;
		while (i < txt.length) {
			let ch = txt[i];
			if (state == "quoted") {
				if (ch == quotechar) {
					if (i + 1 < txt.length && txt[i + 1] == quotechar) {
						field += quotechar;
						i += 2;
						continue;
					}
					state = "afterQuote";
					i++;
					continue;
				}
				field += ch;
				i++;
				continue;
			}

			if (state == "afterQuote" && ch != sep && ch != "\r" && ch != "\n") {
				throw new Error("Invalid OCEL 2.0 CSV at record "+(rows.length + 1)+": unexpected character after closing quote");
			}
			if (state == "unquoted" && ch == quotechar) {
				throw new Error("Invalid OCEL 2.0 CSV at record "+(rows.length + 1)+": quote inside an unquoted field");
			}
			if (state == "start" && ch == quotechar) {
				state = "quoted";
				justEndedRecord = false;
				i++;
				continue;
			}
			if (ch == sep) {
				row.push(field);
				field = "";
				state = "start";
				justEndedRecord = false;
				i++;
				continue;
			}
			if (ch == "\r" || ch == "\n") {
				row.push(field);
				rows.push(row);
				row = [];
				field = "";
				state = "start";
				justEndedRecord = true;
				if (ch == "\r" && i + 1 < txt.length && txt[i + 1] == "\n") {
					i++;
				}
				i++;
				continue;
			}
			field += ch;
			state = "unquoted";
			justEndedRecord = false;
			i++;
		}

		if (state == "quoted") {
			throw new Error("Invalid OCEL 2.0 CSV at record "+(rows.length + 1)+": unterminated quoted field");
		}
		if (!justEndedRecord) {
			row.push(field);
			rows.push(row);
		}
		return rows;
	}

	static parseHeader(header) {
		let seenColumns = Object.create(null);
		let idIndex = null;
		let activityIndex = null;
		let timestampIndex = null;
		let objectColumns = [];
		let eventAttributeColumns = [];

		for (let i = 0; i < header.length; i++) {
			let columnName = header[i];
			if (columnName.length == 0) {
				throw new Error("Invalid OCEL 2.0 CSV: empty column name at position "+(i + 1));
			}
			if (columnName in seenColumns) {
				throw new Error("Invalid OCEL 2.0 CSV: duplicate column '"+columnName+"'");
			}
			seenColumns[columnName] = 0;
			if (columnName == "id") {
				idIndex = i;
			}
			else if (columnName == "activity") {
				activityIndex = i;
			}
			else if (columnName == "timestamp") {
				timestampIndex = i;
			}
		}

		if (idIndex == null || activityIndex == null || timestampIndex == null) {
			throw new Error("Invalid OCEL 2.0 CSV: columns id, activity, and timestamp are required");
		}

		for (let i = 0; i < header.length; i++) {
			let columnName = header[i];
			if (i == idIndex || i == activityIndex || i == timestampIndex) {
				continue;
			}
			if (columnName.startsWith("ot:")) {
				let objectType = columnName.substring(3);
				if (objectType.length == 0) {
					throw new Error("Invalid OCEL 2.0 CSV: object type column '"+columnName+"' has an empty object type");
				}
				objectColumns.push({"index": i, "type": objectType});
			}
			else {
				eventAttributeColumns.push({"index": i, "name": columnName});
			}
		}

		return {"idIndex": idIndex, "activityIndex": activityIndex, "timestampIndex": timestampIndex, "objectColumns": objectColumns, "eventAttributeColumns": eventAttributeColumns};
	}

	static padRow(row, length) {
		let ret = row.slice();
		while (ret.length < length) {
			ret.push("");
		}
		return ret;
	}

	static isEmptyRow(row) {
		for (let value of row) {
			if (value !== "") {
				return false;
			}
		}
		return true;
	}

	static trimValue(value) {
		if (value == null) {
			return "";
		}
		return value.trim();
	}

	static ensureNoEventAttributes(row, eventAttributeColumns, rowIndex) {
		for (let eventAttributeColumn of eventAttributeColumns) {
			if (row[eventAttributeColumn.index] !== "") {
				throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+": event attribute column '"+eventAttributeColumn.name+"' is only valid for event rows");
			}
		}
	}

	static ensureObject(objects, objectId, objectType, rowIndex) {
		if (objectId in objects) {
			if (objects[objectId]["ocel:type"] != objectType) {
				throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+": object '"+objectId+"' appears under multiple object types");
			}
		}
		else {
			objects[objectId] = {"ocel:type": objectType, "ocel:ovmap": Object.create(null), "ocel:o2o": []};
		}
	}

	static addUniqueRelation(relations, objectId, qualifier) {
		for (let relation of relations) {
			if (relation["ocel:oid"] === objectId && relation["ocel:qualifier"] === qualifier) {
				return;
			}
		}
		relations.push({"ocel:oid": objectId, "ocel:qualifier": qualifier});
	}

	static parseReferenceCell(cell, rowIndex, columnName) {
		if (cell == null || cell === "") {
			return [];
		}
		let referenceStrings = CsvOcel2Importer.splitReferenceCell(cell, rowIndex, columnName);
		let references = [];
		for (let referenceString of referenceStrings) {
			references.push(CsvOcel2Importer.parseReference(referenceString, rowIndex, columnName));
		}
		return references;
	}

	static splitReferenceCell(cell, rowIndex, columnName) {
		let references = [];
		let current = "";
		let inJson = false;
		let jsonDepth = 0;
		let inJsonString = false;
		let jsonEscaped = false;
		let headEscaped = false;
		let jsonComplete = false;
		for (let i = 0; i < cell.length; i++) {
			let ch = cell[i];
			if (!inJson && !jsonComplete && headEscaped) {
				if (!(ch == "/" || ch == "#" || ch == "{" || ch == "\\")) {
					throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+", column '"+columnName+"': invalid reference escape");
				}
				current += ch;
				headEscaped = false;
				continue;
			}
			if (!inJson && !jsonComplete && ch == "\\") {
				current += ch;
				headEscaped = true;
				continue;
			}
			if (ch == "/" && !inJson) {
				references.push(current);
				current = "";
				jsonComplete = false;
				continue;
			}
			current += ch;
			if (inJson) {
				if (inJsonString) {
					if (jsonEscaped) {
						jsonEscaped = false;
					}
					else if (ch == "\\") {
						jsonEscaped = true;
					}
					else if (ch == "\"") {
						inJsonString = false;
					}
				}
				else {
					if (ch == "\"") {
						inJsonString = true;
					}
					else if (ch == "{") {
						jsonDepth++;
					}
					else if (ch == "}") {
						jsonDepth--;
						if (jsonDepth < 0) {
							throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+", column '"+columnName+"': malformed JSON attributes");
						}
						if (jsonDepth == 0) {
							inJson = false;
							jsonComplete = true;
						}
					}
				}
			}
			else if (!jsonComplete && ch == "{") {
				inJson = true;
				jsonDepth = 1;
			}
		}
		if (headEscaped) {
			throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+", column '"+columnName+"': trailing reference escape");
		}
		if (inJson && jsonDepth != 0) {
			throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+", column '"+columnName+"': malformed JSON attributes");
		}
		references.push(current);
		return references;
	}

	static parseReference(referenceString, rowIndex, columnName) {
		let jsonStart = CsvOcel2Importer.findUnescapedJsonStart(referenceString, rowIndex, columnName);
		let referenceHead = jsonStart >= 0 ? referenceString.substring(0, jsonStart) : referenceString;
		let jsonText = jsonStart >= 0 ? referenceString.substring(jsonStart) : null;
		let parsedHead = CsvOcel2Importer.parseReferenceHead(referenceHead, rowIndex, columnName);
		let hasQualifier = parsedHead.hasQualifier;
		let objectId = parsedHead.objectId.trim();
		let qualifier = parsedHead.qualifier.trim();
		if (objectId.length == 0) {
			throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+", column '"+columnName+"': object id is mandatory");
		}

		let attributes = null;
		if (jsonText != null) {
			try {
				attributes = CsvOcel2Importer.parseJsonAttributes(jsonText);
			}
			catch (err) {
				if (err != null && err.ocelPrimitiveError) {
					throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+", column '"+columnName+"': JSON attribute values must be primitive");
				}
				throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+", column '"+columnName+"': malformed JSON attributes");
			}
		}
		return {"objectId": objectId, "qualifier": qualifier, "hasQualifier": hasQualifier, "attributes": attributes};
	}

	static parseJsonAttributes(jsonText) {
		let attributes = Object.create(null);
		let i = 0;
		let skipWhitespace = function() {
			while (i < jsonText.length && (jsonText[i] == " " || jsonText[i] == "\t" || jsonText[i] == "\r" || jsonText[i] == "\n")) {
				i++;
			}
		};
		let parseString = function() {
			if (jsonText[i] != '"') {
				throw new Error("expected JSON string");
			}
			let start = i;
			i++;
			let escaped = false;
			while (i < jsonText.length) {
				let ch = jsonText[i];
				if (escaped) {
					escaped = false;
				}
				else if (ch == "\\") {
					escaped = true;
				}
				else if (ch == '"') {
					i++;
					return JSON.parse(jsonText.substring(start, i));
				}
				i++;
			}
			throw new Error("unterminated JSON string");
		};
		let primitiveError = function() {
			let err = new Error("non-primitive JSON attribute");
			err.ocelPrimitiveError = true;
			throw err;
		};
		let parseValue = function() {
			if (jsonText[i] == '"') {
				return parseString();
			}
			if (jsonText.startsWith("true", i)) {
				i += 4;
				return true;
			}
			if (jsonText.startsWith("false", i)) {
				i += 5;
				return false;
			}
			if (jsonText.startsWith("null", i)) {
				i += 4;
				return null;
			}
			if (jsonText[i] == "{" || jsonText[i] == "[") {
				primitiveError();
			}
			let match = jsonText.substring(i).match(/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/);
			if (match == null) {
				throw new Error("invalid JSON value");
			}
			let raw = match[0];
			i += raw.length;
			if (/^-?(?:0|[1-9][0-9]*)$/.test(raw)) {
				let integer = BigInt(raw);
				if (integer >= -9223372036854775808n && integer <= 9223372036854775807n) {
					if (raw === "-0") {
						return -0;
					}
					if (integer >= BigInt(Number.MIN_SAFE_INTEGER) && integer <= BigInt(Number.MAX_SAFE_INTEGER)) {
						return Number(integer);
					}
					return integer;
				}
			}
			let number = Number(raw);
			if (!isFinite(number)) {
				throw new Error("non-finite JSON number");
			}
			return number;
		};

		skipWhitespace();
		if (jsonText[i] != "{") {
			throw new Error("JSON attributes must be an object");
		}
		i++;
		skipWhitespace();
		if (i >= jsonText.length) {
			throw new Error("unterminated JSON object");
		}
		if (jsonText[i] == "}") {
			i++;
			skipWhitespace();
			if (i != jsonText.length) {
				throw new Error("trailing JSON content");
			}
			return attributes;
		}
		let closed = false;
		while (i < jsonText.length) {
			let name = parseString();
			skipWhitespace();
			if (jsonText[i] != ":") {
				throw new Error("expected ':'");
			}
			i++;
			skipWhitespace();
			attributes[name] = parseValue();
			skipWhitespace();
			if (jsonText[i] == "}") {
				i++;
				closed = true;
				break;
			}
			if (jsonText[i] != ",") {
				throw new Error("expected ','");
			}
			i++;
				skipWhitespace();
		}
		if (!closed) {
			throw new Error("unterminated JSON object");
		}
		skipWhitespace();
		if (i != jsonText.length) {
			throw new Error("trailing JSON content");
		}
		return attributes;
	}

	static findUnescapedJsonStart(referenceString, rowIndex, columnName) {
		let escaped = false;
		for (let i = 0; i < referenceString.length; i++) {
			let ch = referenceString[i];
			if (escaped) {
				if (!(ch == "/" || ch == "#" || ch == "{" || ch == "\\")) {
					throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+", column '"+columnName+"': invalid reference escape");
				}
				escaped = false;
			}
			else if (ch == "\\") {
				escaped = true;
			}
			else if (ch == "{") {
				return i;
			}
		}
		if (escaped) {
			throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+", column '"+columnName+"': trailing reference escape");
		}
		return -1;
	}

	static parseReferenceHead(referenceHead, rowIndex, columnName) {
		let objectId = "";
		let qualifier = "";
		let hasQualifier = false;
		let escaped = false;
		for (let ch of referenceHead) {
			if (escaped) {
				if (!(ch == "/" || ch == "#" || ch == "{" || ch == "\\")) {
					throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+", column '"+columnName+"': invalid reference escape");
				}
				if (hasQualifier) {
					qualifier += ch;
				}
				else {
					objectId += ch;
				}
				escaped = false;
			}
			else if (ch == "\\") {
				escaped = true;
			}
			else if (ch == "#") {
				if (hasQualifier) {
					throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+", column '"+columnName+"': unescaped '#' in qualifier");
				}
				hasQualifier = true;
			}
			else if (hasQualifier) {
				qualifier += ch;
			}
			else {
				objectId += ch;
			}
		}
		if (escaped) {
			throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+", column '"+columnName+"': trailing reference escape");
		}
		return {"objectId": objectId, "qualifier": qualifier, "hasQualifier": hasQualifier};
	}

	static collectObjectAttributes(reference, objectType, timestamp, rowIndex, assignmentSeq, kind, objectAttributeEntries) {
		for (let attributeName in reference.attributes) {
			objectAttributeEntries.push({"objectId": reference.objectId, "objectType": objectType, "name": attributeName, "value": reference.attributes[attributeName], "timestamp": timestamp, "rowIndex": rowIndex, "seq": assignmentSeq, "kind": kind});
			assignmentSeq++;
		}
		return assignmentSeq;
	}

	static parseTimestamp(value, context) {
		let match = value.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(?:\.([0-9]+))?(Z|[+-][0-9]{2}:?[0-9]{2})$/);
		if (match == null) {
			throw new Error("Invalid OCEL 2.0 CSV timestamp in "+context+": '"+value+"'");
		}
		let year = parseInt(match[1]);
		let month = parseInt(match[2]);
		let day = parseInt(match[3]);
		let hour = parseInt(match[4]);
		let minute = parseInt(match[5]);
		let second = parseInt(match[6]);
		if (month < 1 || month > 12 || hour > 23 || minute > 59 || second > 59) {
			throw new Error("Invalid OCEL 2.0 CSV timestamp in "+context+": '"+value+"'");
		}
		let daysPerMonth = [31, ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		let maxDay = daysPerMonth[month - 1];
		if (day < 1 || day > maxDay) {
			throw new Error("Invalid OCEL 2.0 CSV timestamp in "+context+": '"+value+"'");
		}
		let offset = match[8];
		if (offset != "Z") {
			let offsetParts = offset.substring(1).replace(":", "");
			let offsetHours = parseInt(offsetParts.substring(0, 2));
			let offsetMinutes = parseInt(offsetParts.substring(2, 4));
			if (offsetHours > 14 || offsetMinutes > 59 || (offsetHours == 14 && offsetMinutes != 0)) {
				throw new Error("Invalid OCEL 2.0 CSV timestamp in "+context+": '"+value+"'");
			}
		}
		let date = new Date(value);
		if (isNaN(date.getTime())) {
			throw new Error("Invalid OCEL 2.0 CSV timestamp in "+context+": '"+value+"'");
		}
		return date;
	}

	static applyEventAttributes(events, eventTypes, eventAttributeEntries) {
		let entriesPerScope = Object.create(null);
		for (let entry of eventAttributeEntries) {
			if (!(entry.name in entriesPerScope)) {
				entriesPerScope[entry.name] = [];
			}
			entriesPerScope[entry.name].push(entry.value);
		}
		let scopeTypes = Object.create(null);
		for (let name in entriesPerScope) {
			scopeTypes[name] = CsvOcel2Importer.inferType(entriesPerScope[name]);
		}
		for (let entry of eventAttributeEntries) {
			let typeName = scopeTypes[entry.name];
			events[entry.eventId]["ocel:vmap"][entry.name] = CsvOcel2Importer.convertValue(entry.value, typeName);
			eventTypes[entry.activity][entry.name] = CsvOcel2Importer.toOcelType(typeName);
		}
	}

	static applyObjectAttributes(objects, objectTypes, objectAttributeEntries) {
		let entriesPerScope = Object.create(null);
		for (let entry of objectAttributeEntries) {
			let scope = CsvOcel2Importer.objectAttributeScope(entry.objectType, entry.name);
			if (!(scope in entriesPerScope)) {
				entriesPerScope[scope] = [];
			}
			entriesPerScope[scope].push(entry.value);
		}
		let scopeTypes = Object.create(null);
		for (let scope in entriesPerScope) {
			scopeTypes[scope] = CsvOcel2Importer.inferType(entriesPerScope[scope]);
		}
		for (let entry of objectAttributeEntries) {
			let scope = CsvOcel2Importer.objectAttributeScope(entry.objectType, entry.name);
			entry.value = CsvOcel2Importer.convertValue(entry.value, scopeTypes[scope]);
			objectTypes[entry.objectType][entry.name] = CsvOcel2Importer.toOcelType(scopeTypes[scope]);
		}

		let sortedEntries = objectAttributeEntries.slice().sort(CsvOcel2Importer.compareAssignments);
		let uniqueEntries = [];
		let assignments = new Map();
		for (let entry of sortedEntries) {
			let timestamp = entry.timestamp == null ? 0 : entry.timestamp.getTime();
			let assignmentKey = JSON.stringify([entry.objectId, entry.name, timestamp]);
			if (assignments.has(assignmentKey)) {
				let previous = assignments.get(assignmentKey);
				if (!CsvOcel2Importer.valuesEqual(previous.value, entry.value)) {
					throw new Error("Invalid OCEL 2.0 CSV at row "+(entry.rowIndex + 1)+": conflicting values for object '"+entry.objectId+"', attribute '"+entry.name+"' at the same timestamp");
				}
				continue;
			}
			assignments.set(assignmentKey, entry);
			uniqueEntries.push(entry);
		}

		let objectChanges = [];
		for (let entry of uniqueEntries) {
			let timestamp = entry.timestamp == null ? 0 : entry.timestamp.getTime();
			if (timestamp == 0) {
				objects[entry.objectId]["ocel:ovmap"][entry.name] = entry.value;
			}
			else {
				objectChanges.push({"ocel:oid": entry.objectId, "ocel:type": entry.objectType, "ocel:name": entry.name, "ocel:value": entry.value, "ocel:timestamp": entry.timestamp});
			}
		}
		return objectChanges;
	}

	static valuesEqual(a, b) {
		if (a instanceof Date && b instanceof Date) {
			return a.getTime() == b.getTime();
		}
		return a === b || (typeof a == "number" && typeof b == "number" && isNaN(a) && isNaN(b));
	}

	static objectAttributeScope(objectType, attributeName) {
		return objectType+"\u0000"+attributeName;
	}

	static compareAssignments(a, b) {
		let aTime = a.timestamp == null ? 0 : a.timestamp.getTime();
		let bTime = b.timestamp == null ? 0 : b.timestamp.getTime();
		if (aTime != bTime) {
			return aTime - bTime;
		}
		if (a.rowIndex != b.rowIndex) {
			return a.rowIndex - b.rowIndex;
		}
		return a.seq - b.seq;
	}

	static inferType(values) {
		let nonNullValues = values.filter(value => value !== null);
		if (nonNullValues.length == 0) {
			return "string";
		}
		let candidates = ["integer", "float", "boolean", "timestamp"];
		for (let candidate of candidates) {
			let allParse = true;
			for (let value of nonNullValues) {
				if (!CsvOcel2Importer.canParseValue(value, candidate)) {
					allParse = false;
					break;
				}
			}
			if (allParse) {
				return candidate;
			}
		}
		return "string";
	}

	static canParseValue(value, typeName) {
		if (typeName == "integer") {
			if (typeof value == "number") {
				if (!isFinite(value) || !Number.isInteger(value)) {
					return false;
				}
				let integer = BigInt(value);
				return integer >= -9223372036854775808n && integer <= 9223372036854775807n;
			}
			if (typeof value == "bigint") {
				return value >= -9223372036854775808n && value <= 9223372036854775807n;
			}
			if (typeof value != "string" || !/^-?(?:0|[1-9][0-9]*)$/.test(value)) {
				return false;
			}
			let parsed = BigInt(value);
			return parsed >= -9223372036854775808n && parsed <= 9223372036854775807n;
		}
		else if (typeName == "float") {
			if (typeof value == "number") {
				return isFinite(value);
			}
			if (typeof value == "bigint") {
				let parsed = Number(value);
				return isFinite(parsed) && BigInt(parsed) == value;
			}
			if (typeof value != "string") {
				return false;
			}
			if (CsvOcel2Importer.canParseValue(value, "integer")) {
				let integer = BigInt(value);
				let parsedInteger = Number(integer);
				return isFinite(parsedInteger) && BigInt(parsedInteger) == integer;
			}
			let parsed = Number(value);
			return isFinite(parsed) && String(parsed) === value;
		}
		else if (typeName == "boolean") {
			return typeof value == "boolean" || (typeof value == "string" && /^(true|false)$/i.test(value));
		}
		else if (typeName == "timestamp") {
			if (value instanceof Date) {
				return !isNaN(value.getTime());
			}
			if (typeof value != "string") {
				return false;
			}
			try {
				CsvOcel2Importer.parseTimestamp(value, "attribute value");
				return true;
			}
			catch (err) {
				return false;
			}
		}
		return true;
	}

	static convertValue(value, typeName) {
		if (value === null) {
			return null;
		}
		if (typeName == "integer") {
			if (typeof value == "number" || typeof value == "bigint") {
				return value;
			}
			if (value === "-0") {
				return -0;
			}
			let parsed = BigInt(value);
			if (parsed >= BigInt(Number.MIN_SAFE_INTEGER) && parsed <= BigInt(Number.MAX_SAFE_INTEGER)) {
				return Number(parsed);
			}
			return parsed;
		}
		else if (typeName == "float") {
			return typeof value == "number" ? value : Number(value);
		}
		else if (typeName == "boolean") {
			return typeof value == "boolean" ? value : value.toLowerCase() == "true";
		}
		else if (typeName == "timestamp") {
			return value instanceof Date ? value : CsvOcel2Importer.parseTimestamp(value, "attribute value");
		}
		else if (typeof value == "string") {
			return value;
		}
		return String(value);
	}

	static toOcelType(typeName) {
		if (typeName == "integer") {
			return "int";
		}
		else if (typeName == "timestamp") {
			return "date";
		}
		return typeName;
	}
}


CsvOcelImporter.DEFAULT_SEPARATOR = ',';
CsvOcelImporter.DEFAULT_QUOTECHAR = '"';
CsvOcel2Importer.DEFAULT_SEPARATOR = ',';
CsvOcel2Importer.DEFAULT_QUOTECHAR = '"';

try {
	module.exports = {CsvOcelImporter: CsvOcelImporter, CsvOcel2Importer: CsvOcel2Importer};
	global.CsvOcelImporter = CsvOcelImporter;
	global.CsvOcel2Importer = CsvOcel2Importer;
}
catch (err) {
	// not in node
	//console.log(err);
}
