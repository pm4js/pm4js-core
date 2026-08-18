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

class CsvOcel2Exporter {
	static apply(ocel, sep=CsvOcel2Exporter.DEFAULT_SEPARATOR, quotechar=CsvOcel2Exporter.DEFAULT_QUOTECHAR, newline=CsvOcel2Exporter.DEFAULT_NEWLINE) {
		ocel = Ocel20FormatFixer.apply(ocel);

		let objectTypes = CsvOcel2Exporter.collectObjectTypes(ocel);
		let eventAttributes = CsvOcel2Exporter.collectEventAttributes(ocel);
		CsvOcel2Exporter.validateHeader(objectTypes, eventAttributes);
		let objectAssignments = CsvOcel2Exporter.collectObjectAssignments(ocel);

		let objectTypeColumns = Object.create(null);
		let header = ["id", "activity", "timestamp"];
		for (let objectType of objectTypes) {
			objectTypeColumns[objectType] = header.length;
			header.push("ot:"+objectType);
		}
		for (let eventAttribute of eventAttributes) {
			header.push(eventAttribute);
		}

		let rows = [header];
		let eventEstablishedObjects = Object.create(null);
		let eventRows = CsvOcel2Exporter.collectEventRows(ocel, objectTypes, objectTypeColumns, eventAttributes, eventEstablishedObjects);
		let declarationRows = CsvOcel2Exporter.collectDeclarationRows(ocel, objectTypes, objectTypeColumns, eventAttributes, eventEstablishedObjects, objectAssignments.baseAttributes);
		let o2oRows = CsvOcel2Exporter.collectO2ORows(ocel, objectTypes, objectTypeColumns, eventAttributes);
		let objectAttributeRows = CsvOcel2Exporter.collectObjectAttributeRows(ocel, objectTypes, objectTypeColumns, eventAttributes, objectAssignments.changes);

		for (let row of eventRows) {
			rows.push(row);
		}
		for (let row of declarationRows) {
			rows.push(row);
		}
		for (let row of o2oRows) {
			rows.push(row);
		}
		for (let row of objectAttributeRows) {
			rows.push(row);
		}

		let csvRows = [];
		for (let row of rows) {
			let csvRow = [];
			for (let value of row) {
				csvRow.push(CsvOcel2Exporter.escapeCsvCell(value, sep, quotechar));
			}
			csvRows.push(csvRow.join(sep));
		}
		return csvRows.join(newline);
	}

	static collectObjectTypes(ocel) {
		let objectTypes = [];
		let seen = Object.create(null);
		let addObjectType = function(objectType) {
			if (typeof objectType != "string" || objectType.length == 0) {
				throw new Error("Invalid OCEL: object type names must be non-empty");
			}
			if (!(objectType in seen)) {
				seen[objectType] = 0;
				objectTypes.push(objectType);
			}
		};

		if ("ocel:global-log" in ocel && "ocel:object-types" in ocel["ocel:global-log"]) {
			for (let objectType of ocel["ocel:global-log"]["ocel:object-types"]) {
				addObjectType(objectType);
			}
		}
		if ("ocel:objectTypes" in ocel) {
			for (let objectType in ocel["ocel:objectTypes"]) {
				addObjectType(objectType);
			}
		}
		for (let objectId in ocel["ocel:objects"]) {
			addObjectType(ocel["ocel:objects"][objectId]["ocel:type"]);
		}
		return objectTypes;
	}

	static collectEventAttributes(ocel) {
		let eventAttributes = [];
		let seen = Object.create(null);
		let addAttribute = function(attributeName) {
			if (typeof attributeName != "string" || attributeName.length == 0) {
				throw new Error("Invalid OCEL: event attribute names must be non-empty");
			}
			if (!(attributeName in seen)) {
				seen[attributeName] = 0;
				eventAttributes.push(attributeName);
			}
		};

		if ("ocel:eventTypes" in ocel) {
			for (let eventType in ocel["ocel:eventTypes"]) {
				for (let attributeName in ocel["ocel:eventTypes"][eventType]) {
					addAttribute(attributeName);
				}
			}
		}
		for (let eventId in ocel["ocel:events"]) {
			let event = ocel["ocel:events"][eventId];
			for (let attributeName in event["ocel:vmap"]) {
				addAttribute(attributeName);
			}
		}
		return eventAttributes;
	}

	static validateHeader(objectTypes, eventAttributes) {
		let seenColumns = Object.create(null);
		seenColumns.id = 0;
		seenColumns.activity = 0;
		seenColumns.timestamp = 0;
		for (let objectType of objectTypes) {
			let columnName = "ot:"+objectType;
			if (columnName in seenColumns) {
				throw new Error("Invalid OCEL: duplicate OCEL 2.0 CSV column '"+columnName+"'");
			}
			seenColumns[columnName] = 0;
		}
		for (let eventAttribute of eventAttributes) {
			if (eventAttribute in seenColumns || eventAttribute.startsWith("ot:")) {
				throw new Error("Invalid OCEL: event attribute '"+eventAttribute+"' cannot be represented as an OCEL 2.0 CSV column");
			}
			seenColumns[eventAttribute] = 0;
		}
	}

	static collectObjectAssignments(ocel) {
		let baseAttributes = Object.create(null);
		let assignments = new Map();
		let changes = [];
		let addAssignment = function(objectId, attributeName, value, timestamp, index) {
			if (typeof attributeName != "string") {
				throw new Error("Invalid OCEL: object attribute names must be strings");
			}
			let time = timestamp == null ? 0 : timestamp.getTime();
			let assignmentKey = JSON.stringify([objectId, attributeName, time]);
			if (assignments.has(assignmentKey)) {
				let previous = assignments.get(assignmentKey);
				if (!CsvOcel2Exporter.valuesEqual(previous.value, value)) {
					throw new Error("Invalid OCEL: conflicting values for object '"+objectId+"', attribute '"+attributeName+"' at the same timestamp");
				}
				return;
			}
			assignments.set(assignmentKey, {"value": value});
			if (time == 0) {
				baseAttributes[objectId][attributeName] = value;
			}
			else {
				changes.push({"objectId": objectId, "name": attributeName, "value": value, "timestamp": timestamp, "index": index});
			}
		};

		for (let objectId in ocel["ocel:objects"]) {
			baseAttributes[objectId] = Object.create(null);
			let object = ocel["ocel:objects"][objectId];
			if (object["ocel:ovmap"] != null) {
				for (let attributeName in object["ocel:ovmap"]) {
					addAssignment(objectId, attributeName, object["ocel:ovmap"][attributeName], null, -1);
				}
			}
		}

		let index = 0;
		for (let change of ocel["ocel:objectChanges"]) {
			let objectId = change["ocel:oid"];
			if (!(objectId in ocel["ocel:objects"])) {
				throw new Error("Invalid OCEL: object change references unknown object '"+objectId+"'");
			}
			if (!(change["ocel:timestamp"] instanceof Date) || isNaN(change["ocel:timestamp"].getTime())) {
				throw new Error("Invalid OCEL: object change for object '"+objectId+"' has a malformed timestamp");
			}
			let objectType = ocel["ocel:objects"][objectId]["ocel:type"];
			if (change["ocel:type"] != null && change["ocel:type"] !== objectType) {
				throw new Error("Invalid OCEL: object change for object '"+objectId+"' has an inconsistent object type");
			}
			addAssignment(objectId, change["ocel:name"], change["ocel:value"], change["ocel:timestamp"], index);
			index++;
		}

		changes.sort(function(a, b) {
			let diff = a.timestamp.getTime() - b.timestamp.getTime();
			return diff != 0 ? diff : a.index - b.index;
		});
		return {"baseAttributes": baseAttributes, "changes": changes};
	}

	static valuesEqual(a, b) {
		if (a instanceof Date && b instanceof Date) {
			return a.getTime() == b.getTime();
		}
		return a === b || (typeof a == "number" && typeof b == "number" && isNaN(a) && isNaN(b));
	}

	static collectEventRows(ocel, objectTypes, objectTypeColumns, eventAttributes, eventEstablishedObjects) {
		let rows = [];
		let eventInfos = [];
		let preservedOrder = ocel["ocel:events"][Symbol.for("pm4js.ocel.csv.eventOrder")] || [];
		let orderIndexes = new Map();
		for (let i = 0; i < preservedOrder.length; i++) {
			orderIndexes.set(preservedOrder[i], i);
		}
		let fallbackIndex = preservedOrder.length;
		for (let eventId in ocel["ocel:events"]) {
			let event = ocel["ocel:events"][eventId];
			CsvOcel2Exporter.validateTrimmedNonEmpty(eventId, "event id");
			CsvOcel2Exporter.validateTrimmedNonEmpty(event["ocel:activity"], "event activity");
			if (event["ocel:activity"].toLowerCase() == "o2o") {
				throw new Error("Invalid OCEL: event activity '"+event["ocel:activity"]+"' cannot be represented in OCEL 2.0 CSV");
			}
			if (!(event["ocel:timestamp"] instanceof Date) || isNaN(event["ocel:timestamp"].getTime())) {
				throw new Error("Invalid OCEL: event '"+eventId+"' has a malformed timestamp");
			}
			let index = orderIndexes.has(eventId) ? orderIndexes.get(eventId) : fallbackIndex++;
			eventInfos.push({"eventId": eventId, "event": event, "index": index});
		}
		eventInfos.sort(function(a, b) {
			let diff = a.event["ocel:timestamp"].getTime() - b.event["ocel:timestamp"].getTime();
			if (diff != 0) {
				return diff;
			}
			return a.index - b.index;
		});

		for (let eventInfo of eventInfos) {
			let eventId = eventInfo.eventId;
			let event = eventInfo.event;
			let row = CsvOcel2Exporter.emptyRow(objectTypes, eventAttributes);
			row[0] = eventId;
			row[1] = event["ocel:activity"];
			row[2] = event["ocel:timestamp"].toISOString();

			let referencesPerType = Object.create(null);
			for (let objectType of objectTypes) {
				referencesPerType[objectType] = [];
			}
			let typedOmap = event["ocel:typedOmap"];
			if (typedOmap == null) {
				typedOmap = [];
				for (let objectId of event["ocel:omap"]) {
					typedOmap.push({"ocel:oid": objectId, "ocel:qualifier": ""});
				}
			}
			let seenRelations = new Map();
			for (let relation of typedOmap) {
				let objectId = relation["ocel:oid"];
				let qualifier = relation["ocel:qualifier"] == null ? "" : relation["ocel:qualifier"];
				if (!(objectId in ocel["ocel:objects"])) {
					throw new Error("Invalid OCEL: event '"+eventId+"' references unknown object '"+objectId+"'");
				}
				let objectType = ocel["ocel:objects"][objectId]["ocel:type"];
				eventEstablishedObjects[objectId] = 0;
				if (!(objectType in referencesPerType)) {
					throw new Error("Invalid OCEL: object '"+objectId+"' has unknown type '"+objectType+"'");
				}
				let relationKey = JSON.stringify([objectId, qualifier]);
				if (!seenRelations.has(relationKey)) {
					seenRelations.set(relationKey, true);
					referencesPerType[objectType].push(CsvOcel2Exporter.formatReference(objectId, qualifier, null));
				}
			}
			for (let objectType of objectTypes) {
				row[objectTypeColumns[objectType]] = referencesPerType[objectType].join("/");
			}
			for (let i = 0; i < eventAttributes.length; i++) {
				let attributeName = eventAttributes[i];
				if (attributeName in event["ocel:vmap"]) {
					row[3 + objectTypes.length + i] = CsvOcel2Exporter.formatAttributeValue(event["ocel:vmap"][attributeName]);
				}
			}
			rows.push(row);
		}
		return rows;
	}

	static collectDeclarationRows(ocel, objectTypes, objectTypeColumns, eventAttributes, eventEstablishedObjects, baseAttributes) {
		let declarations = [];
		for (let objectId in ocel["ocel:objects"]) {
			let object = ocel["ocel:objects"][objectId];
			let hasBaseAttributes = Object.keys(baseAttributes[objectId]).length > 0;
			if (!(objectId in eventEstablishedObjects) || hasBaseAttributes) {
				declarations.push({"objectId": objectId, "objectType": object["ocel:type"], "attributes": hasBaseAttributes ? baseAttributes[objectId] : null});
			}
		}
		declarations.sort(function(a, b) {
			if (a.objectType < b.objectType) {
				return -1;
			}
			else if (a.objectType > b.objectType) {
				return 1;
			}
			else if (a.objectId < b.objectId) {
				return -1;
			}
			else if (a.objectId > b.objectId) {
				return 1;
			}
			return 0;
		});

		let rows = [];
		for (let declaration of declarations) {
			let row = CsvOcel2Exporter.emptyRow(objectTypes, eventAttributes);
			if (!(declaration.objectType in objectTypeColumns)) {
				throw new Error("Invalid OCEL: object '"+declaration.objectId+"' has unknown type '"+declaration.objectType+"'");
			}
			row[objectTypeColumns[declaration.objectType]] = CsvOcel2Exporter.formatReference(declaration.objectId, "", declaration.attributes);
			rows.push(row);
		}
		return rows;
	}

	static collectO2ORows(ocel, objectTypes, objectTypeColumns, eventAttributes) {
		let sourceObjectIds = [];
		for (let objectId in ocel["ocel:objects"]) {
			let object = ocel["ocel:objects"][objectId];
			if ("ocel:o2o" in object && object["ocel:o2o"].length > 0) {
				sourceObjectIds.push(objectId);
			}
		}
		sourceObjectIds.sort();

		let rows = [];
		for (let sourceObjectId of sourceObjectIds) {
			let object = ocel["ocel:objects"][sourceObjectId];
			let row = CsvOcel2Exporter.emptyRow(objectTypes, eventAttributes);
			row[0] = sourceObjectId;
			row[1] = "o2o";
			let referencesPerType = Object.create(null);
			for (let objectType of objectTypes) {
				referencesPerType[objectType] = [];
			}
			let seenRelations = new Map();
			for (let relation of object["ocel:o2o"]) {
				let targetObjectId = relation["ocel:oid"];
				let qualifier = relation["ocel:qualifier"] == null ? "" : relation["ocel:qualifier"];
				if (!(targetObjectId in ocel["ocel:objects"])) {
					throw new Error("Invalid OCEL: object '"+sourceObjectId+"' has an object-object relation to unknown object '"+targetObjectId+"'");
				}
				let targetObjectType = ocel["ocel:objects"][targetObjectId]["ocel:type"];
				if (!(targetObjectType in referencesPerType)) {
					throw new Error("Invalid OCEL: object '"+targetObjectId+"' has unknown type '"+targetObjectType+"'");
				}
				let relationKey = JSON.stringify([targetObjectId, qualifier]);
				if (!seenRelations.has(relationKey)) {
					seenRelations.set(relationKey, true);
					referencesPerType[targetObjectType].push(CsvOcel2Exporter.formatReference(targetObjectId, qualifier, null));
				}
			}
			for (let objectType of objectTypes) {
				row[objectTypeColumns[objectType]] = referencesPerType[objectType].join("/");
			}
			rows.push(row);
		}
		return rows;
	}

	static collectObjectAttributeRows(ocel, objectTypes, objectTypeColumns, eventAttributes, changes) {
		let rows = [];
		for (let change of changes) {
			let objectId = change.objectId;
			let objectType = ocel["ocel:objects"][objectId]["ocel:type"];
			let attributes = Object.create(null);
			attributes[change.name] = change.value;
			let row = CsvOcel2Exporter.emptyRow(objectTypes, eventAttributes);
			row[2] = change.timestamp.toISOString();
			row[objectTypeColumns[objectType]] = CsvOcel2Exporter.formatReference(objectId, "", attributes);
			rows.push(row);
		}
		return rows;
	}

	static emptyRow(objectTypes, eventAttributes) {
		let row = ["", "", ""];
		for (let objectType of objectTypes) {
			row.push("");
		}
		for (let eventAttribute of eventAttributes) {
			row.push("");
		}
		return row;
	}

	static formatReference(objectId, qualifier, attributes) {
		let ret = CsvOcel2Exporter.escapeReferencePart(objectId, "object id");
		if (qualifier != null && qualifier !== "") {
			ret += "#"+CsvOcel2Exporter.escapeReferencePart(qualifier, "qualifier");
		}
		if (attributes != null && Object.keys(attributes).length > 0) {
			ret += CsvOcel2Exporter.stringifyJsonAttributes(attributes);
		}
		return ret;
	}

	static validateTrimmedNonEmpty(value, fieldName) {
		if (typeof value != "string" || value.length == 0) {
			throw new Error("Invalid OCEL: "+fieldName+" must be a non-empty string");
		}
		if (value.trim() !== value) {
			throw new Error("Invalid OCEL: "+fieldName+" '"+value+"' has leading or trailing whitespace that OCEL 2.0 CSV cannot preserve");
		}
	}

	static escapeReferencePart(value, fieldName) {
		CsvOcel2Exporter.validateTrimmedNonEmpty(value, fieldName);
		let ret = "";
		for (let ch of value) {
			if (ch == "/" || ch == "#" || ch == "{" || ch == "\\") {
				ret += "\\";
			}
			ret += ch;
		}
		return ret;
	}

	static stringifyJsonAttributes(attributes) {
		let entries = [];
		for (let attributeName in attributes) {
			entries.push(JSON.stringify(attributeName)+":"+CsvOcel2Exporter.formatJsonPrimitive(attributes[attributeName], attributeName));
		}
		return "{"+entries.join(",")+"}";
	}

	static formatJsonPrimitive(value, attributeName) {
		if (value instanceof Date) {
			if (isNaN(value.getTime())) {
				throw new Error("Invalid OCEL: object attribute '"+attributeName+"' contains a malformed timestamp");
			}
			return JSON.stringify(value.toISOString());
		}
		if (value === null) {
			return "null";
		}
		if (typeof value == "string" || typeof value == "boolean") {
			return JSON.stringify(value);
		}
		if (typeof value == "bigint") {
			if (value < -9223372036854775808n || value > 9223372036854775807n) {
				throw new Error("Invalid OCEL: object attribute '"+attributeName+"' contains an integer outside the signed 64-bit range");
			}
			return String(value);
		}
		if (typeof value == "number" && isFinite(value)) {
			return Object.is(value, -0) ? "-0" : String(value);
		}
		throw new Error("Invalid OCEL: object attribute '"+attributeName+"' cannot be represented as an OCEL 2.0 CSV JSON primitive");
	}

	static formatAttributeValue(value) {
		if (value instanceof Date) {
			if (isNaN(value.getTime())) {
				throw new Error("Invalid OCEL: event attribute contains a malformed timestamp");
			}
			return value.toISOString();
		}
		else if (typeof value == "string") {
			if (value.length == 0) {
				throw new Error("Invalid OCEL: an empty event attribute string cannot be represented distinctly from a missing value in OCEL 2.0 CSV");
			}
			return value;
		}
		else if (typeof value == "bigint") {
			if (value < -9223372036854775808n || value > 9223372036854775807n) {
				throw new Error("Invalid OCEL: event attribute integer is outside the signed 64-bit range");
			}
			return String(value);
		}
		else if (typeof value == "number" && isFinite(value)) {
			return Object.is(value, -0) ? "-0" : String(value);
		}
		else if (typeof value == "boolean") {
			return String(value);
		}
		throw new Error("Invalid OCEL: event attribute cannot be represented as an OCEL 2.0 CSV primitive");
	}

	static escapeCsvCell(value, sep, quotechar) {
		if (value == null) {
			value = "";
		}
		value = ""+value;
		if (value.indexOf(quotechar) >= 0) {
			value = value.split(quotechar).join(quotechar+quotechar);
		}
		if (value.indexOf(sep) >= 0 || value.indexOf(quotechar) >= 0 || value.indexOf("\n") >= 0 || value.indexOf("\r") >= 0 || /^\s|\s$/.test(value)) {
			return quotechar+value+quotechar;
		}
		return value;
	}
}

CsvOcelExporter.DEFAULT_SEPARATOR = ',';
CsvOcelExporter.DEFAULT_QUOTECHAR = '"';
CsvOcelExporter.DEFAULT_NEWLINE = '\n';
CsvOcel2Exporter.DEFAULT_SEPARATOR = ',';
CsvOcel2Exporter.DEFAULT_QUOTECHAR = '"';
CsvOcel2Exporter.DEFAULT_NEWLINE = '\r\n';

try {
	module.exports = {CsvOcelExporter: CsvOcelExporter, CsvOcel2Exporter: CsvOcel2Exporter};
	global.CsvOcelExporter = CsvOcelExporter;
	global.CsvOcel2Exporter = CsvOcel2Exporter;
}
catch (err) {
	// not in node
	//console.log(err);
}
