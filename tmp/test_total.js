const xlsx = require('xlsx');

const workbook = xlsx.readFile('./event list updated 16 march (1).xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

let oldGuests = [];

for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (!row) continue;
  
  let seatStr = String(row[0] || '').trim();
  if (seatStr !== '' && !isNaN(Number(seatStr))) {
     let rawName = String(row[1] || '').trim();
     if (rawName && rawName.toLowerCase() !== 'name of guest' && rawName.toLowerCase() !== 'table') {
        
        // FILTERING OUT THE JUNK!!
        if (!isNaN(Number(rawName))) continue; // filters out "8"
        if (rawName.toLowerCase().includes('embassy')) continue; // filters out Embassy

        const parts = rawName.split(/\s+/);
        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ');
        
        let tableNumber = String(row[4] || '').trim();
        
        oldGuests.push({
          firstName,
          lastName,
          tableNumber
        });
     }
  }
}

console.log("Cleaned Old Guests Count:", oldGuests.length);

// Now count the missing ones from Table 46-75
const newGuests = 64; // from my previous script
console.log("Total:", oldGuests.length + newGuests);
