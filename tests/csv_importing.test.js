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
	expect(ocel["ocel:objects"]["o1"]["ocel:ovmap"]["price"]).toBe(10.5);
	expect(ocel["ocel:objects"]["o1"]["ocel:o2o"]).toEqual([{"ocel:oid": "i2", "ocel:qualifier": "contains"}]);
	expect(ocel["ocel:objects"]["o2"]["ocel:ovmap"]["priority"]).toBe("high");
	expect(ocel["ocel:objects"]["i1"]["ocel:ovmap"]["weight"]).toBe(2);
	expect(ocel["ocel:objects"]["i2"]["ocel:ovmap"]["weight"]).toBe(4);

	expect(ocel["ocel:objectChanges"].map(change => [change["ocel:oid"], change["ocel:name"], change["ocel:value"], change["ocel:timestamp"].toISOString()])).toEqual([
		["o1", "price", 11.5, "2024-01-02T10:00:00.000Z"],
		["i1", "weight", 3, "2024-01-02T10:00:00.000Z"],
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
