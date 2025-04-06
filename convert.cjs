// split-by-level.js
const fs   = require('fs');
const path = require('path');

// 1. Load & parse source data
const dataPath = path.join(__dirname, 'data', 'psgc.json');
const allData  = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 2. Define the levels you expect
const levels = ['Reg', 'Prov', 'Mun', 'City', 'SubMun', 'Bgy'];

// 3. Group records by Geographic Level
const groups = allData.reduce((acc, item) => {
  const lvl = item['Geographic Level'];
  // only group known levels
  if (levels.includes(lvl)) {
    acc[lvl] = acc[lvl] || [];
    acc[lvl].push(item);
  }
  return acc;
}, {});

// 4. Write each group to its own file
levels.forEach(lvl => {
  const arr = groups[lvl] || [];
  const filename = lvl.toLowerCase() + '.json';
  fs.writeFileSync(
    path.join(__dirname, filename),
    JSON.stringify(arr, null, 2),
    'utf8'
  );
});

// 5. Logging
console.log(`Total records: ${allData.length}`);
levels.forEach(lvl => {
  const count = (groups[lvl] || []).length;
  console.log(`${lvl.padEnd(6)}: ${count}`);
});
