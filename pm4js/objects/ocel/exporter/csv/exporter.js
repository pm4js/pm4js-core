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

		let objectTypeColumns = {};
		let header = ["id", "activity", "timestamp"];
		for (let objectType of objectTypes) {
			objectTypeColumns[objectType] = header.length;
			header.push("ot:"+objectType);
		}
		for (let eventAttribute of eventAttributes) {
			header.push(eventAttribute);
		}

		let rows = [header];
		let eventEstablishedObjects = {};
		let eventRows = CsvOcel2Exporter.collectEventRows(ocel, objectTypes, objectTypeColumns, eventAttributes, eventEstablishedObjects);
		let declarationRows = CsvOcel2Exporter.collectDeclarationRows(ocel, objectTypes, objectTypeColumns, eventAttributes, eventEstablishedObjects);
		let o2oRows = CsvOcel2Exporter.collectO2ORows(ocel, objectTypes, objectTypeColumns, eventAttributes);
		let objectAttributeRows = CsvOcel2Exporter.collectObjectAttributeRows(ocel, objectTypes, objectTypeColumns, eventAttributes);

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
		let seen = {};
		let addObjectType = function(objectType) {
			if (objectType == null || objectType.length == 0) {
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
		let seen = {};
		let addAttribute = function(attributeName) {
			if (attributeName == null || attributeName.length == 0) {
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
		let seenColumns = {"id": 0, "activity": 0, "timestamp": 0};
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

	static collectEventRows(ocel, objectTypes, objectTypeColumns, eventAttributes, eventEstablishedObjects) {
		let rows = [];
		let eventInfos = [];
		let index = 0;
		for (let eventId in ocel["ocel:events"]) {
			let event = ocel["ocel:events"][eventId];
			if (!(event["ocel:timestamp"] instanceof Date) || isNaN(event["ocel:timestamp"].getTime())) {
				throw new Error("Invalid OCEL: event '"+eventId+"' has a malformed timestamp");
			}
			eventInfos.push({"eventId": eventId, "event": event, "index": index});
			index++;
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

			let referencesPerType = {};
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
			for (let relation of typedOmap) {
				let objectId = relation["ocel:oid"];
				if (!(objectId in ocel["ocel:objects"])) {
					throw new Error("Invalid OCEL: event '"+eventId+"' references unknown object '"+objectId+"'");
				}
				let objectType = ocel["ocel:objects"][objectId]["ocel:type"];
				eventEstablishedObjects[objectId] = 0;
				if (!(objectType in referencesPerType)) {
					throw new Error("Invalid OCEL: object '"+objectId+"' has unknown type '"+objectType+"'");
				}
				referencesPerType[objectType].push(CsvOcel2Exporter.formatReference(objectId, relation["ocel:qualifier"], null));
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

	static collectDeclarationRows(ocel, objectTypes, objectTypeColumns, eventAttributes, eventEstablishedObjects) {
		let declarations = [];
		for (let objectId in ocel["ocel:objects"]) {
			let object = ocel["ocel:objects"][objectId];
			let hasBaseAttributes = object["ocel:ovmap"] != null && Object.keys(object["ocel:ovmap"]).length > 0;
			if (!(objectId in eventEstablishedObjects) || hasBaseAttributes) {
				declarations.push({"objectId": objectId, "objectType": object["ocel:type"], "attributes": hasBaseAttributes ? object["ocel:ovmap"] : null});
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
			let referencesPerType = {};
			for (let objectType of objectTypes) {
				referencesPerType[objectType] = [];
			}
			for (let relation of object["ocel:o2o"]) {
				let targetObjectId = relation["ocel:oid"];
				if (!(targetObjectId in ocel["ocel:objects"])) {
					throw new Error("Invalid OCEL: object '"+sourceObjectId+"' has an object-object relation to unknown object '"+targetObjectId+"'");
				}
				let targetObjectType = ocel["ocel:objects"][targetObjectId]["ocel:type"];
				if (!(targetObjectType in referencesPerType)) {
					throw new Error("Invalid OCEL: object '"+targetObjectId+"' has unknown type '"+targetObjectType+"'");
				}
				referencesPerType[targetObjectType].push(CsvOcel2Exporter.formatReference(targetObjectId, relation["ocel:qualifier"], null));
			}
			for (let objectType of objectTypes) {
				row[objectTypeColumns[objectType]] = referencesPerType[objectType].join("/");
			}
			rows.push(row);
		}
		return rows;
	}

	static collectObjectAttributeRows(ocel, objectTypes, objectTypeColumns, eventAttributes) {
		let changes = [];
		let index = 0;
		for (let change of ocel["ocel:objectChanges"]) {
			if (!(change["ocel:timestamp"] instanceof Date) || isNaN(change["ocel:timestamp"].getTime())) {
				throw new Error("Invalid OCEL: object change for object '"+change["ocel:oid"]+"' has a malformed timestamp");
			}
			changes.push({"change": change, "index": index});
			index++;
		}
		changes.sort(function(a, b) {
			let diff = a.change["ocel:timestamp"].getTime() - b.change["ocel:timestamp"].getTime();
			if (diff != 0) {
				return diff;
			}
			return a.index - b.index;
		});

		let rows = [];
		for (let changeInfo of changes) {
			let change = changeInfo.change;
			let objectId = change["ocel:oid"];
			if (!(objectId in ocel["ocel:objects"])) {
				throw new Error("Invalid OCEL: object change references unknown object '"+objectId+"'");
			}
			let objectType = ocel["ocel:objects"][objectId]["ocel:type"];
			let attributes = {};
			attributes[change["ocel:name"]] = change["ocel:value"];
			let row = CsvOcel2Exporter.emptyRow(objectTypes, eventAttributes);
			row[2] = change["ocel:timestamp"].toISOString();
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
		CsvOcel2Exporter.validateReferencePart(objectId, "object id");
		let ret = objectId;
		if (qualifier != null && qualifier !== "") {
			CsvOcel2Exporter.validateReferencePart(qualifier, "qualifier");
			ret += "#"+qualifier;
		}
		if (attributes != null && Object.keys(attributes).length > 0) {
			ret += JSON.stringify(CsvOcel2Exporter.formatJsonAttributes(attributes));
		}
		return ret;
	}

	static validateReferencePart(value, fieldName) {
		if (value == null || value.length == 0) {
			throw new Error("Invalid OCEL: "+fieldName+" must be non-empty");
		}
		if (value.indexOf("/") >= 0 || value.indexOf("#") >= 0 || value.indexOf("{") >= 0) {
			throw new Error("Invalid OCEL: "+fieldName+" '"+value+"' contains a reserved OCEL 2.0 CSV reference character");
		}
	}

	static formatJsonAttributes(attributes) {
		let ret = {};
		for (let attributeName in attributes) {
			let value = attributes[attributeName];
			if (value instanceof Date) {
				ret[attributeName] = value.toISOString();
			}
			else if (value === null || typeof value == "string" || typeof value == "number" || typeof value == "boolean") {
				ret[attributeName] = value;
			}
			else {
				throw new Error("Invalid OCEL: object attribute '"+attributeName+"' cannot be represented as an OCEL 2.0 CSV JSON primitive");
			}
		}
		return ret;
	}

	static formatAttributeValue(value) {
		if (value == null) {
			return "";
		}
		else if (value instanceof Date) {
			return value.toISOString();
		}
		else if (typeof value == "string") {
			return value;
		}
		else if (typeof value == "number" || typeof value == "boolean") {
			return ""+value;
		}
		return JSON.stringify(value);
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
CsvOcel2Exporter.DEFAULT_NEWLINE = '\n';

try {
	module.exports = {CsvOcelExporter: CsvOcelExporter, CsvOcel2Exporter: CsvOcel2Exporter};
	global.CsvOcelExporter = CsvOcelExporter;
	global.CsvOcel2Exporter = CsvOcel2Exporter;
}
catch (err) {
	// not in node
	//console.log(err);
}

