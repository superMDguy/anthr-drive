const { convertArrayToCSV } = require("convert-array-to-csv");
const fs = require("fs");
const highlights = require("./highlights.json");

fs.writeFileSync(
  "highlights.csv",
  convertArrayToCSV(highlights.flatMap((doc) => doc.highlights))
);
