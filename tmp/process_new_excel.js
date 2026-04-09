const fs = require('fs');
const xlsx = require('xlsx');

const workbook = xlsx.readFile('./event list updated 16 march (1).xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

const uniqueId = () => 'gst_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

let guests = [];
let capacities = {};

let parsingNotes = false;

for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (!row) continue;
  
  // Detect Notes section
  if (row[1] && typeof row[1] === 'string' && row[1].toLowerCase().trim() === 'notes') {
    parsingNotes = true;
    continue;
  }
  if (parsingNotes && row[1] && typeof row[1] === 'string' && row[1].toLowerCase().includes('left over')) {
      continue;
  }

  // Detect Capacity section summary
  if (!parsingNotes && row[1] === 'Table' && row[2] === 'Capacity') {
      // It's the summary headers, ignore
      continue;
  }

  // 1. Capacity extraction
  if (row[1] != null && !isNaN(Number(String(row[1]).trim())) && row[2] != null && !isNaN(Number(String(row[2]).trim()))) {
      // To strictly ensure it's the Summary table, check if row[0] is empty
      if (!row[0] || String(row[0]).trim() === '') {
          const tableNum = String(row[1]).trim();
          const cap = Number(String(row[2]).trim());
          if (tableNum && cap) {
              capacities[tableNum] = cap;
          }
      }
  }

  // 2. Main Guests Extraction
  let seatStr = String(row[0] || '').trim();
  if (seatStr !== '' && !isNaN(Number(seatStr))) {
     let rawName = String(row[1] || '').trim();
     if (rawName && rawName.toLowerCase() !== 'name of guest' && rawName.toLowerCase() !== 'table') {
        const parts = rawName.split(/\s+/);
        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ');
        
        // Table number is row[3] based on headers
        let tableNumber = String(row[3] || '').trim();
        
        guests.push({
          id: uniqueId(),
          firstName,
          lastName,
          tableNumber,
          event: "four-seasons-22-3",
          attended: false,
          timestamp: new Date().toISOString()
        });
     }
  }

  // 3. Notes section extraction
  if (parsingNotes && row[1]) {
      let rawName = String(row[1] || '').trim();
      if (rawName) {
          const parts = rawName.split(/\s+/);
          const firstName = parts[0];
          const lastName = parts.slice(1).join(' ');
          
          let tableNumber = String(row[2] || '').trim();
          if (tableNumber.toLowerCase() === 'confirmed seat') tableNumber = '9'; // based on context of Marwan
          
          guests.push({
            id: uniqueId(),
            firstName,
            lastName,
            tableNumber,
            event: "four-seasons-22-3",
            attended: false,
            timestamp: new Date().toISOString()
          });
      }
  }
}

// Write the parsed guests
fs.writeFileSync('./src/data/weddings/four-seasons-22-3.json', JSON.stringify(guests, null, 2));
fs.writeFileSync('./four-seasons-capacities.json', JSON.stringify(capacities, null, 2));

console.log("Extracted Guests:", guests.length);
console.log("Extracted Capacities:", Object.keys(capacities).length);
