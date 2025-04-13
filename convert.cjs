const fs = require('fs');

// Define input and output file paths.
const inputFile = './data/submun.json';
const outputFile = 'submun_modified.json';

// Define the mapping from original keys to new keys.
const keyMapping = {
  "10-digit PSGC": "psgcCode",
  "Name": "name",
  "Correspondence Code": "correspondenceCode",
  "Geographic Level": "geographicLevel"
};

// Function to process and rename keys in a record.
function processRecord(record) {
  const newRecord = {};
  for (const oldKey in keyMapping) {
    if (record.hasOwnProperty(oldKey)) {
      newRecord[keyMapping[oldKey]] = record[oldKey];
    }
  }
  return newRecord;
}

// Read the JSON data from the input file.
let data = fs.readFileSync(inputFile, 'utf-8');
data = JSON.parse(data);

// Determine and log the original number of records.
let originalCount;
let modifiedData;
if (Array.isArray(data)) {
  originalCount = data.length;
  console.log(`Original number of records: ${originalCount}`);
  modifiedData = data.map(processRecord);
} else if (typeof data === 'object' && data !== null) {
  originalCount = 1;
  console.log("Original data is a single record.");
  modifiedData = processRecord(data);
} else {
  throw new Error("Unexpected JSON format.");
}

// Count the number of converted records.
const convertedCount = Array.isArray(modifiedData) ? modifiedData.length : 1;

// Write the modified JSON data to the output file.
fs.writeFileSync(outputFile, JSON.stringify(modifiedData, null, 2), 'utf-8');
console.log(`Converted ${convertedCount} records. Modified JSON data has been written to ${outputFile}.`);
