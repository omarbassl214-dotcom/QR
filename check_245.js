const xlsx = require('xlsx');
const workbook = xlsx.readFile('./event list updated 16 march (1).xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

let guestRows = [];
for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (!row) continue;
  let seatStr = String(row[0]).trim();
  // Check if seatStr is a number and Guest Name is not empty/Table
  if (seatStr !== '' && !isNaN(Number(seatStr))) {
     let name = String(row[1] || '').trim();
     if (name && name.toLowerCase() !== 'name of guest' && name.toLowerCase() !== 'table') {
        guestRows.push(row);
     }
  }
}
console.log("Guests with strict Seat Numbers:", guestRows.length);
