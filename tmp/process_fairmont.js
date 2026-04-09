const fs = require('fs');
const xlsx = require('xlsx');

const workbook = xlsx.readFile('./SEATING PLAN FINAL EDIT 2 (3).xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

const uniqueId = () => 'gst_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

let guests = [];
let capacities = {};

let tableMap = [];
for (let r = 0; r < data.length; r++) {
  if (!data[r]) continue;
  for (let c = 0; c < data[r].length; c++) {
    let val = String(data[r][c] || '').trim();
    if (val.toLowerCase().includes('table')) {
      let m = val.match(/table\s*(\d+(?:-\d+)?)/i);
      if (m) {
        tableMap.push({ colIndex: c, startRow: r, tableNum: m[1], raw: val });
      }
    }
  }
}

for (let tm of tableMap) {
  let tableGuestsCount = 0;
  for (let r = tm.startRow + 1; r < data.length; r++) {
       // Stop if we hit a completely empty row? No, some might have empty gaps.
       // Stop if we hit another "Table" header in this col? Yes.
       let cellVal = String(data[r][tm.colIndex] || '').trim();
       if (cellVal.toLowerCase().includes('table') && cellVal.match(/table\s*(\d+(?:-\d+)?)/i)) {
           break;
       }

       if (cellVal !== '') {
           let rawName = cellVal;
           // If the cell happens to just be a number, skip it? Wait, seat numbers are in column 0!
           // The names are directly in the mapped column.
           const parts = rawName.split(/\s+/);
           const firstName = parts[0];
           const lastName = parts.slice(1).join(' ');
           
           guests.push({
             id: uniqueId(),
             firstName,
             lastName,
             tableNumber: tm.tableNum,
             event: "fairmont-22-3",
             attended: false,
             timestamp: new Date().toISOString()
           });
           tableGuestsCount++;
       } else {
           // If cell is empty, we reached the end of the visual block of names for this table usually.
           // However, to be safe, we might just look a few more rows.
           // Since we break on the next table header anyway, we can just continue and ignore empty cells!
       }
  }
  
  // Attempt to parse capacity from header (e.g. "Table 10 (S) 11" -> 11)
  let capMatch = tm.raw.match(/\((\d+)\)|\s(\d+)$/);
  let capacity = tableGuestsCount; // fallback
  if (capMatch) {
      capacity = parseInt(capMatch[1] || capMatch[2], 10);
      if (capacity < tableGuestsCount) capacity = tableGuestsCount; // override
  }
  capacities[tm.tableNum] = capacity;
}

fs.writeFileSync('./src/data/weddings/fairmont-22-3.json', JSON.stringify(guests, null, 2));
fs.writeFileSync('./fairmont-capacities.json', JSON.stringify(capacities, null, 2));

console.log("Extracted Guests:", guests.length);
console.log("Extracted Capacities:", Object.keys(capacities).length);

