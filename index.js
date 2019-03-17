let fs = require('fs');
let MarkdownParser = require('./lib/Parser');


let text = fs.readFileSync('file.md', 'utf-8');


let parser = new MarkdownParser(text);
//parser.printContext();
//console.log("_____");
parser.parse();
//console.log("_____");
//parser.show();
console.log("\n            _____ Tree ____\n");
parser.printTree();
console.log("\n");
//parser.printLines();

