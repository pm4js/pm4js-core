require("../init.js");
var fs = require('fs');
const os = require('os');

test("CSV importing running-example", () => {
	let data = fs.readFileSync('examples/input_data/running-example.csv', {encoding: 'utf-8'});
	let eventLog = CsvImporter.apply(data);
});

test("CSV importing running-example_unchanged - CSV exporting", () => {
	let data = fs.readFileSync('examples/input_data/running-example_unchanged.csv', {encoding: 'utf-8'});
	let eventLog = CsvImporter.apply(data, ";", '"', "case_id", "activity", "timestamp");
	data = CsvExporter.apply(eventLog);
	let fileName = os.tmpdir() + "/" + "running-example.csv";
	fs.writeFileSync(fileName, data);
});

test("CSV importing running-example_unchanged - XES exporting", () => {
	let data = fs.readFileSync('examples/input_data/running-example_unchanged.csv', {encoding: 'utf-8'});
	let eventLog = CsvImporter.apply(data, ";", '"', "case_id", "activity", "timestamp");
	data = XesExporter.apply(eventLog);
	let fileName = os.tmpdir() + "/" + "running-example.xes";
	fs.writeFileSync(fileName, data);
});

test("XES importing running-example - XES exporting", () => {
	let data = fs.readFileSync('examples/input_data/running-example.xes', {encoding: 'utf-8'});
	let eventLog = XesImporter.apply(data);
	data = CsvExporter.apply(eventLog);
	let fileName = os.tmpdir() + "/" + "running-example2.csv";
	fs.writeFileSync(fileName, data);
});

test("OCEL 2.0 CSV importing", () => {
	let data = [
		'id,activity,timestamp,ot:orders,ot:items,n,c,when',
		'e1,place order,2024-01-01T10:00:00+0000,"o1#ordered{""price"":10.5}","i1#item{""weight"":2}",42,true,2024-01-01T10:01:00Z',
		'e2,update,2024-01-02T10:00:00+00:00,"o1#updated{""price"":11.5}","i1#item{""weight"":3}",7,FALSE,2024-01-02T10:01:00+0000',
		',,,"o2{""priority"":""high""}",,,,',
		'o1,o2o,2024-01-03T10:00:00Z,,"i2#contains{""weight"":4}",,,',
		',,2024-01-04T10:00:00Z,,"i1{""weight"":5}",,,'
	].join('\n');

	let ocel = CsvOcel2Importer.apply(data);

	expect(Object.keys(ocel["ocel:events"]).length).toBe(2);
	expect(ocel["ocel:events"]["e1"]["ocel:activity"]).toBe("place order");
	expect(ocel["ocel:events"]["e1"]["ocel:timestamp"].toISOString()).toBe("2024-01-01T10:00:00.000Z");
	expect(ocel["ocel:events"]["e1"]["ocel:typedOmap"]).toEqual([
		{"ocel:oid": "o1", "ocel:qualifier": "ordered"},
		{"ocel:oid": "i1", "ocel:qualifier": "item"}
	]);
	expect(ocel["ocel:events"]["e1"]["ocel:vmap"]["n"]).toBe(42);
	expect(ocel["ocel:events"]["e1"]["ocel:vmap"]["c"]).toBe(true);
	expect(ocel["ocel:events"]["e1"]["ocel:vmap"]["when"].toISOString()).toBe("2024-01-01T10:01:00.000Z");

	expect(ocel["ocel:objects"]["o1"]["ocel:type"]).toBe("orders");
	expect(ocel["ocel:objects"]["o1"]["ocel:ovmap"]["price"]).toBeUndefined();
	expect(ocel["ocel:objects"]["o1"]["ocel:o2o"]).toEqual([{"ocel:oid": "i2", "ocel:qualifier": "contains"}]);
	expect(ocel["ocel:objects"]["o2"]["ocel:ovmap"]["priority"]).toBe("high");
	expect(ocel["ocel:objects"]["i1"]["ocel:ovmap"]["weight"]).toBeUndefined();
	expect(ocel["ocel:objects"]["i2"]["ocel:ovmap"]["weight"]).toBeUndefined();

	expect(ocel["ocel:objectChanges"].map(change => [change["ocel:oid"], change["ocel:name"], change["ocel:value"], change["ocel:timestamp"].toISOString()])).toEqual([
		["o1", "price", 10.5, "2024-01-01T10:00:00.000Z"],
		["i1", "weight", 2, "2024-01-01T10:00:00.000Z"],
		["o1", "price", 11.5, "2024-01-02T10:00:00.000Z"],
		["i1", "weight", 3, "2024-01-02T10:00:00.000Z"],
		["i2", "weight", 4, "2024-01-03T10:00:00.000Z"],
		["i1", "weight", 5, "2024-01-04T10:00:00.000Z"]
	]);
	expect(ocel["ocel:eventTypes"]["place order"]["n"]).toBe("int");
	expect(ocel["ocel:eventTypes"]["update"]["c"]).toBe("boolean");
	expect(ocel["ocel:eventTypes"]["update"]["when"]).toBe("date");
	expect(ocel["ocel:objectTypes"]["orders"]["price"]).toBe("float");
	expect(ocel["ocel:objectTypes"]["items"]["weight"]).toBe("int");
});

test("OCEL 2.0 CSV importing through legacy class auto-detects the new format", () => {
	let data = [
		'id,activity,timestamp,ot:orders',
		'e1,place order,2024-01-01T10:00:00Z,o1#order'
	].join('\n');
	let ocel = CsvOcelImporter.apply(data);
	expect(ocel["ocel:events"]["e1"]["ocel:omap"]).toEqual(["o1"]);
	expect(ocel["ocel:objects"]["o1"]["ocel:type"]).toBe("orders");
});

test("OCEL 2.0 CSV rejects object ids used with multiple types", () => {
	let data = [
		'id,activity,timestamp,ot:orders,ot:items',
		'e1,place order,2024-01-01T10:00:00Z,o1#order,o1#item'
	].join('\n');
	expect(() => CsvOcel2Importer.apply(data)).toThrow(/multiple object types/);
});

test("OCEL 2.0 CSV exporting", () => {
	let data = [
		'id,activity,timestamp,ot:orders,ot:items,n',
		'e2,update,2024-01-02T10:00:00+00:00,"o1#updated{""price"":11.5}","i1#item{""weight"":3}",7',
		'e1,place order,2024-01-01T10:00:00+0000,"o1#ordered{""price"":10.5}","i1#item{""weight"":2}",42',
		',,,"o2{""priority"":""high""}",,',
		'o1,o2o,,,"i2#contains",',
		',,2024-01-04T10:00:00Z,,"i1{""weight"":5}",'
	].join('\n');
	let ocel = CsvOcel2Importer.apply(data);
	let exported = CsvOcel2Exporter.apply(ocel);
	let exportedRows = CsvImporter.parseCSV(exported);

	expect(exportedRows[0]).toEqual(["id", "activity", "timestamp", "ot:orders", "ot:items", "n"]);
	expect(exportedRows[1][0]).toBe("e1");
	expect(exportedRows[2][0]).toBe("e2");
	expect(exportedRows[3][0]).toBe("");
	expect(exportedRows[3][1]).toBe("");
	expect(exportedRows[3][2]).toBe("");
	expect(exportedRows.some(row => row[0] == "o1" && row[1] == "o2o")).toBe(true);

	let roundTrip = CsvOcel2Importer.apply(exported);
	expect(Object.keys(roundTrip["ocel:events"]).length).toBe(2);
	expect(roundTrip["ocel:events"]["e1"]["ocel:typedOmap"]).toEqual([
		{"ocel:oid": "o1", "ocel:qualifier": "ordered"},
		{"ocel:oid": "i1", "ocel:qualifier": "item"}
	]);
	expect(roundTrip["ocel:objects"]["o1"]["ocel:ovmap"]["price"]).toBeUndefined();
	expect(roundTrip["ocel:objects"]["o1"]["ocel:o2o"]).toEqual([{"ocel:oid": "i2", "ocel:qualifier": "contains"}]);
	expect(roundTrip["ocel:objects"]["o2"]["ocel:ovmap"]["priority"]).toBe("high");
	expect(roundTrip["ocel:objectChanges"].map(change => [change["ocel:oid"], change["ocel:name"], change["ocel:value"], change["ocel:timestamp"].toISOString()])).toEqual([
		["o1", "price", 10.5, "2024-01-01T10:00:00.000Z"],
		["i1", "weight", 2, "2024-01-01T10:00:00.000Z"],
		["o1", "price", 11.5, "2024-01-02T10:00:00.000Z"],
		["i1", "weight", 3, "2024-01-02T10:00:00.000Z"],
		["i1", "weight", 5, "2024-01-04T10:00:00.000Z"]
	]);
});

test("OCEL 2.0 CSV preserves reference escapes and specified whitespace", () => {
	let data = [
		'id,activity,timestamp,"ot: kind ",note',
		String.raw`  e1  ,  act  ,  2024-01-01T10:00:00Z  ,  a\/b\#c\{d\\e  #  in\#box\/x\{y\\z  ,"  keep  "`
	].join('\n');
	let ocel = CsvOcel2Importer.apply(data);

	expect(Object.keys(ocel["ocel:objectTypes"])).toEqual([" kind "]);
	expect(ocel["ocel:events"]["e1"]["ocel:activity"]).toBe("act");
	expect(ocel["ocel:events"]["e1"]["ocel:vmap"]["note"]).toBe("  keep  ");
	expect(ocel["ocel:events"]["e1"]["ocel:typedOmap"]).toEqual([
		{"ocel:oid": "a/b#c{d\\e", "ocel:qualifier": "in#box/x{y\\z"}
	]);

	let exported = CsvOcel2Exporter.apply(ocel);
	expect(exported).toContain(String.raw`a\/b\#c\{d\\e#in\#box\/x\{y\\z`);
	let roundTrip = CsvOcel2Importer.apply(exported);
	expect(roundTrip["ocel:events"]["e1"]["ocel:typedOmap"]).toEqual(ocel["ocel:events"]["e1"]["ocel:typedOmap"]);
	expect(roundTrip["ocel:events"]["e1"]["ocel:vmap"]["note"]).toBe("  keep  ");
});

test.each([
	[String.raw`o\q`, /invalid reference escape/],
	["o\\", /trailing reference escape/],
	["o#a#b", /unescaped '#'/],
	["   ", /object id is mandatory/],
	['o{"x":1,', /malformed JSON attributes/],
	['o{"x":[1]}', /must be primitive/]
])("OCEL 2.0 CSV rejects invalid reference cell %s", (reference, expectedError) => {
	let data = [
		'id,activity,timestamp,ot:kind',
		'e1,act,2024-01-01T10:00:00Z,"'+reference.replace(/"/g, '""')+'"'
	].join('\n');
	expect(() => CsvOcel2Importer.apply(data)).toThrow(expectedError);
});

test.each([
	['id,activity,timestamp\n"e1,act,2024-01-01T10:00:00Z', /unterminated quoted field/],
	['id,activity,timestamp\ne"1,act,2024-01-01T10:00:00Z', /quote inside an unquoted field/],
	['id,activity,timestamp\n"e1"x,act,2024-01-01T10:00:00Z', /unexpected character after closing quote/]
])("OCEL 2.0 CSV rejects malformed RFC 4180 input", (data, expectedError) => {
	expect(() => CsvOcel2Importer.apply(data)).toThrow(expectedError);
});

test("OCEL 2.0 CSV supports RFC 4180 quoted newlines", () => {
	let data = 'id,activity,timestamp,note\r\ne1,act,2024-01-01T10:00:00Z,"line 1\r\nline 2"';
	let ocel = CsvOcel2Importer.apply(data);
	expect(ocel["ocel:events"]["e1"]["ocel:vmap"]["note"]).toBe("line 1\r\nline 2");
	let roundTrip = CsvOcel2Importer.apply(CsvOcel2Exporter.apply(ocel));
	expect(roundTrip["ocel:events"]["e1"]["ocel:vmap"]["note"]).toBe("line 1\r\nline 2");
});

test("OCEL 2.0 CSV applies canonical scope-level attribute typing", () => {
	let data = [
		'id,activity,timestamp,ot:kind,i64,leading,plus,decimal,mixed,bool,too_big,negative_zero',
		'e1,act,2024-01-01T10:00:00Z,o1,9223372036854775807,007,+5,1.50,1,FALSE,9223372036854775808,-0',
		'e2,act,2024-01-02T10:00:00Z,o1,,,,,1.5,true,,',
		',,,"o2{""max"":9223372036854775807}",,,,,,,,'
	].join('\n');
	let ocel = CsvOcel2Importer.apply(data);

	expect(ocel["ocel:events"]["e1"]["ocel:vmap"]["i64"]).toBe(9223372036854775807n);
	expect(ocel["ocel:eventTypes"]["act"]["i64"]).toBe("int");
	expect(ocel["ocel:events"]["e1"]["ocel:vmap"]["leading"]).toBe("007");
	expect(ocel["ocel:events"]["e1"]["ocel:vmap"]["plus"]).toBe("+5");
	expect(ocel["ocel:events"]["e1"]["ocel:vmap"]["decimal"]).toBe("1.50");
	expect(ocel["ocel:events"]["e1"]["ocel:vmap"]["mixed"]).toBe(1);
	expect(ocel["ocel:eventTypes"]["act"]["mixed"]).toBe("float");
	expect(ocel["ocel:events"]["e1"]["ocel:vmap"]["bool"]).toBe(false);
	expect(ocel["ocel:events"]["e1"]["ocel:vmap"]["too_big"]).toBe("9223372036854775808");
	expect(Object.is(ocel["ocel:events"]["e1"]["ocel:vmap"]["negative_zero"], -0)).toBe(true);
	expect(ocel["ocel:objects"]["o2"]["ocel:ovmap"]["max"]).toBe(9223372036854775807n);

	let roundTrip = CsvOcel2Importer.apply(CsvOcel2Exporter.apply(ocel));
	expect(roundTrip["ocel:events"]["e1"]["ocel:vmap"]["i64"]).toBe(9223372036854775807n);
	expect(roundTrip["ocel:objects"]["o2"]["ocel:ovmap"]["max"]).toBe(9223372036854775807n);
	expect(Object.is(roundTrip["ocel:events"]["e1"]["ocel:vmap"]["negative_zero"], -0)).toBe(true);
});

test("OCEL 2.0 CSV rejects conflicting object assignments at one timestamp", () => {
	let data = [
		'id,activity,timestamp,ot:kind',
		',,2024-01-01T10:00:00Z,"o1{""x"":1}"',
		',,2024-01-01T11:00:00+01:00,"o1{""x"":2}"'
	].join('\n');
	expect(() => CsvOcel2Importer.apply(data)).toThrow(/conflicting values/);
});

test("OCEL 2.0 CSV collapses duplicate relations and equal assignments", () => {
	let data = [
		'id,activity,timestamp,ot:kind',
		'e1,act,2024-01-01T09:00:00Z,o1#q/o1#q',
		',,2024-01-01T10:00:00Z,"o1{""x"":1}/o1{""x"":1}"',
		'o1,o2o,,o2#q/o2#q'
	].join('\n');
	let ocel = CsvOcel2Importer.apply(data);
	expect(ocel["ocel:events"]["e1"]["ocel:typedOmap"]).toEqual([{"ocel:oid": "o1", "ocel:qualifier": "q"}]);
	expect(ocel["ocel:objects"]["o1"]["ocel:o2o"]).toEqual([{"ocel:oid": "o2", "ocel:qualifier": "q"}]);
	expect(ocel["ocel:objectChanges"]).toHaveLength(1);
});

test("OCEL 2.0 CSV validates timestamps, row-only attributes, and declaration qualifiers", () => {
	expect(() => CsvOcel2Importer.apply([
		'id,activity,timestamp,ot:kind',
		'e1,act,2024-01-01T10:00:00,o1'
	].join('\n'))).toThrow(/timestamp/);
	expect(() => CsvOcel2Importer.apply([
		'id,activity,timestamp,ot:kind',
		'e1,act,2024-01-01T10:00:00+14:01,o1'
	].join('\n'))).toThrow(/timestamp/);
	expect(() => CsvOcel2Importer.apply([
		'id,activity,timestamp,ot:kind,attr',
		',,,o1,value'
	].join('\n'))).toThrow(/only valid for event rows/);
	expect(() => CsvOcel2Importer.apply([
		'id,activity,timestamp,ot:kind',
		',,,o1#q'
	].join('\n'))).toThrow(/cannot contain qualifiers/);
	expect(() => CsvOcel2Importer.apply([
		'id,activity,timestamp,ot:kind',
		'unknown,o2o,,o1'
	].join('\n'))).toThrow(/no previously declared type/);
});

test("OCEL 2.0 CSV exporter promotes epoch changes to declaration attributes", () => {
	let ocel = CsvOcel2Importer.apply([
		'id,activity,timestamp,ot:kind',
		'e1,act,2024-01-01T10:00:00Z,o1'
	].join('\n'));
	ocel["ocel:objectChanges"].push({
		"ocel:oid": "o1",
		"ocel:type": "kind",
		"ocel:name": "x",
		"ocel:value": 1,
		"ocel:timestamp": new Date(0)
	});

	let exported = CsvOcel2Exporter.apply(ocel);
	let rows = CsvImporter.parseCSV(exported);
	expect(rows.some(row => row[0] == "" && row[1] == "" && row[2] == "" && row[3].includes('{"x":1}'))).toBe(true);
	expect(rows.some(row => row[2] == "1970-01-01T00:00:00.000Z")).toBe(false);
	let roundTrip = CsvOcel2Importer.apply(exported);
	expect(roundTrip["ocel:objects"]["o1"]["ocel:ovmap"]["x"]).toBe(1);
	expect(roundTrip["ocel:objectChanges"]).toHaveLength(0);
});

test("OCEL 2.0 CSV exporter preserves input order for equal-time numeric event ids", () => {
	let ocel = CsvOcel2Importer.apply([
		'id,activity,timestamp',
		'10,first,2024-01-01T10:00:00Z',
		'2,second,2024-01-01T10:00:00Z'
	].join('\n'));
	let rows = CsvImporter.parseCSV(CsvOcel2Exporter.apply(ocel));
	expect(rows.slice(1).map(row => row[0])).toEqual(["10", "2"]);
});

test("OCEL 2.0 CSV exporter rejects values that cannot round-trip", () => {
	let ocel = CsvOcel2Importer.apply([
		'id,activity,timestamp,ot:kind',
		'e1,act,2024-01-01T10:00:00Z,o1'
	].join('\n'));
	ocel["ocel:events"]["e1"]["ocel:activity"] = "O2O";
	expect(() => CsvOcel2Exporter.apply(ocel)).toThrow(/cannot be represented/);

	ocel["ocel:events"]["e1"]["ocel:activity"] = "act";
	ocel["ocel:events"]["e1"]["ocel:vmap"]["empty"] = "";
	expect(() => CsvOcel2Exporter.apply(ocel)).toThrow(/empty event attribute string/);
});
