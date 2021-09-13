require("./init.js");
var fs = require('fs');
const os = require('os');

let data = fs.readFileSync('examples/input_data/running-example.ptml', {encoding: 'utf-8'});
let processTree = PtmlImporter.apply(data);
let xmlStri = PtmlExporter.apply(processTree);
console.log(xmlStri);
fs.writeFileSync("prova.ptml", xmlStri);
