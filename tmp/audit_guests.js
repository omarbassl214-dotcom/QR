const xlsx = require('xlsx');

const workbook = xlsx.readFile('./event list updated 16 march (1).xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

let mainGuests = 0;
let notesGuests = 0;
let parsingNotes = false;
let tableCounts = {};

for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (!row) continue;
  
  if (row[1] && typeof row[1] === 'string' && row[1].toLowerCase().trim() === 'notes') {
    parsingNotes = true;
    continue;
  }
  
  if (parsingNotes && row[1] && typeof row[1] === 'string' && row[1].toLowerCase().includes('left over')) {
      continue;
  }

  if (!parsingNotes && row[1] === 'Table' && row[2] === 'Capacity') {
      continue;
  }

  // Count Main Guests
  let seatStr = String(row[0] || '').trim();
  if (seatStr !== '' && !isNaN(Number(seatStr))) {
     let rawName = String(row[1] || '').trim();
     if (rawName && rawName.toLowerCase() !== 'name of guest' && rawName.toLowerCase() !== 'table') {
        mainGuests++;
        let t = String(row[3] || '').trim();
        tableCounts[t] = (tableCounts[t] || 0) + 1;
     }
  }

  // Count Notes Guests
  if (parsingNotes && row[1]) {
      let rawName = String(row[1] || '').trim();
      if (rawName) {
          notesGuests++;
          let t = String(row[2] || '').trim();
          tableCounts['Notes_' + t] = (tableCounts['Notes_' + t] || 0) + 1;
      }
  }
}

console.log("Main Table Guests Count:", mainGuests);
console.log("Notes Section Guests Count:", notesGuests);
console.log("Total Extracted:", mainGuests + notesGuests);
console.log("Breakdown by Table:", tableCounts);
