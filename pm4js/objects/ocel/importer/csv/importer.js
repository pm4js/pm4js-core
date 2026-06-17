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
		let arr = CsvImporter.parseCSV(txt, sep, quotechar);
		if (arr.length == 0) {
			throw new Error("Invalid OCEL 2.0 CSV: empty file");
		}

		let header = arr[0].slice();
		if (header.length > 0 && header[0].length > 0 && header[0].charCodeAt(0) == 0xFEFF) {
			header[0] = header[0].substring(1);
		}
		let columns = CsvOcel2Importer.parseHeader(header);

		let events = {};
		let objects = {};
		let objectTypes = {};
		let eventTypes = {};
		let attributeNames = {};
		let eventAttributeEntries = [];
		let objectAttributeEntries = [];
		let assignmentSeq = 0;

		for (let objectColumn of columns.objectColumns) {
			objectTypes[objectColumn.type] = {};
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
						objects[rowId]["ocel:o2o"].push({"ocel:oid": reference.objectId, "ocel:qualifier": reference.qualifier});
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
				let event = {"ocel:activity": rowActivity, "ocel:timestamp": rowDate, "ocel:omap": [], "ocel:typedOmap": [], "ocel:vmap": {}};
				events[rowId] = event;
				if (!(rowActivity in eventTypes)) {
					eventTypes[rowActivity] = {};
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
						event["ocel:typedOmap"].push({"ocel:oid": reference.objectId, "ocel:qualifier": reference.qualifier});
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
		CsvOcel2Importer.applyObjectAttributes(objects, objectTypes, objectAttributeEntries);
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
		ocel["ocel:objectChanges"] = CsvOcel2Importer.objectChanges;

		return Ocel20FormatFixer.apply(ocel);
	}

	static parseHeader(header) {
		let seenColumns = {};
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
			objects[objectId] = {"ocel:type": objectType, "ocel:ovmap": {}, "ocel:o2o": []};
		}
	}

	static parseReferenceCell(cell, rowIndex, columnName) {
		if (cell == null || cell.trim().length == 0) {
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
		let escaped = false;
		for (let i = 0; i < cell.length; i++) {
			let ch = cell[i];
			if (ch == "/" && (!inJson || jsonDepth == 0)) {
				references.push(current);
				current = "";
				inJson = false;
				continue;
			}
			current += ch;
			if (inJson) {
				if (inJsonString) {
					if (escaped) {
						escaped = false;
					}
					else if (ch == "\\") {
						escaped = true;
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
					}
				}
			}
			else if (ch == "{") {
				inJson = true;
				jsonDepth = 1;
			}
		}
		if (inJson && jsonDepth != 0) {
			throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+", column '"+columnName+"': malformed JSON attributes");
		}
		references.push(current);
		return references;
	}

	static parseReference(referenceString, rowIndex, columnName) {
		let jsonStart = referenceString.indexOf("{");
		let referenceHead = jsonStart >= 0 ? referenceString.substring(0, jsonStart) : referenceString;
		let jsonText = jsonStart >= 0 ? referenceString.substring(jsonStart) : null;
		let qualifierStart = referenceHead.indexOf("#");
		let hasQualifier = qualifierStart >= 0;
		let objectId = hasQualifier ? referenceHead.substring(0, qualifierStart).trim() : referenceHead.trim();
		let qualifier = hasQualifier ? referenceHead.substring(qualifierStart + 1).trim() : "";
		if (objectId.length == 0) {
			throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+", column '"+columnName+"': object id is mandatory");
		}

		let attributes = null;
		if (jsonText != null) {
			try {
				attributes = JSON.parse(jsonText);
			}
			catch (err) {
				throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+", column '"+columnName+"': malformed JSON attributes");
			}
			if (attributes == null || Array.isArray(attributes) || typeof attributes != "object") {
				throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+", column '"+columnName+"': JSON attributes must be an object");
			}
			for (let attributeName in attributes) {
				let attributeValue = attributes[attributeName];
				if (Array.isArray(attributeValue) || (typeof attributeValue == "object" && attributeValue !== null)) {
					throw new Error("Invalid OCEL 2.0 CSV at row "+(rowIndex + 1)+", column '"+columnName+"': JSON attribute values must be primitive");
				}
			}
		}
		return {"objectId": objectId, "qualifier": qualifier, "hasQualifier": hasQualifier, "attributes": attributes};
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
		let maxDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
		if (day < 1 || day > maxDay) {
			throw new Error("Invalid OCEL 2.0 CSV timestamp in "+context+": '"+value+"'");
		}
		let offset = match[8];
		if (offset != "Z") {
			let offsetParts = offset.substring(1).replace(":", "");
			let offsetHours = parseInt(offsetParts.substring(0, 2));
			let offsetMinutes = parseInt(offsetParts.substring(2, 4));
			if (offsetHours > 23 || offsetMinutes > 59) {
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
		let entriesPerScope = {};
		for (let entry of eventAttributeEntries) {
			if (!(entry.name in entriesPerScope)) {
				entriesPerScope[entry.name] = [];
			}
			entriesPerScope[entry.name].push(entry.value);
		}
		let scopeTypes = {};
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
		let entriesPerScope = {};
		for (let entry of objectAttributeEntries) {
			let scope = CsvOcel2Importer.objectAttributeScope(entry.objectType, entry.name);
			if (!(scope in entriesPerScope)) {
				entriesPerScope[scope] = [];
			}
			entriesPerScope[scope].push(entry.value);
		}
		let scopeTypes = {};
		for (let scope in entriesPerScope) {
			scopeTypes[scope] = CsvOcel2Importer.inferType(entriesPerScope[scope]);
		}
		for (let entry of objectAttributeEntries) {
			let scope = CsvOcel2Importer.objectAttributeScope(entry.objectType, entry.name);
			entry.value = CsvOcel2Importer.convertValue(entry.value, scopeTypes[scope]);
			objectTypes[entry.objectType][entry.name] = CsvOcel2Importer.toOcelType(scopeTypes[scope]);
		}

		CsvOcel2Importer.objectChanges = [];
		let baseEntries = objectAttributeEntries.filter(entry => entry.kind == "base");
		baseEntries.sort(CsvOcel2Importer.compareAssignments);
		for (let entry of baseEntries) {
			objects[entry.objectId]["ocel:ovmap"][entry.name] = entry.value;
		}

		let timedEntries = objectAttributeEntries.filter(entry => entry.kind == "timed");
		timedEntries.sort(CsvOcel2Importer.compareAssignments);
		for (let entry of timedEntries) {
			let object = objects[entry.objectId];
			if (entry.name in object["ocel:ovmap"]) {
				CsvOcel2Importer.objectChanges.push({"ocel:oid": entry.objectId, "ocel:type": entry.objectType, "ocel:name": entry.name, "ocel:value": entry.value, "ocel:timestamp": entry.timestamp});
			}
			else {
				object["ocel:ovmap"][entry.name] = entry.value;
			}
		}
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
				return isFinite(value) && Number.isInteger(value);
			}
			return typeof value == "string" && /^[+-]?[0-9]+$/.test(value);
		}
		else if (typeName == "float") {
			if (typeof value == "number") {
				return isFinite(value);
			}
			return typeof value == "string" && /^[+-]?(?:(?:[0-9]+(?:\.[0-9]*)?)|(?:\.[0-9]+))(?:[eE][+-]?[0-9]+)?$/.test(value) && isFinite(parseFloat(value));
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
			return typeof value == "number" ? parseInt(value) : parseInt(value, 10);
		}
		else if (typeName == "float") {
			return typeof value == "number" ? value : parseFloat(value);
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
		return ""+value;
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
CsvOcel2Importer.objectChanges = [];

try {
	module.exports = {CsvOcelImporter: CsvOcelImporter, CsvOcel2Importer: CsvOcel2Importer};
	global.CsvOcelImporter = CsvOcelImporter;
	global.CsvOcel2Importer = CsvOcel2Importer;
}
catch (err) {
	// not in node
	//console.log(err);
}
