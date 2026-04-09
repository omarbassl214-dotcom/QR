const xlsx = require('xlsx');
const fs = require('fs');

try {
  const workbook = xlsx.readFile('./event list updated 16 march (1).xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  
  let guests = [];
  let capacities = {};
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;
    
    // 1. Strict Guest Extraction (Seat Number column 0)
    let seatStr = String(row[0] || '').trim();
    if (seatStr !== '' && !isNaN(Number(seatStr))) {
       let rawName = String(row[1] || '').trim();
       if (rawName && rawName.toLowerCase() !== 'name of guest' && rawName.toLowerCase() !== 'table') {
          const parts = rawName.split(/\s+/);
          const firstName = parts[0];
          const lastName = parts.slice(1).join(' ');
          
          let tableNumber = String(row[4] || '').trim();
          
          const uniqueId = 'gst_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
          guests.push({
            id: uniqueId,
            firstName,
            lastName,
            tableNumber,
            event: "four-seasons-22-3",
            attended: false,
            timestamp: new Date().toISOString()
          });
       }
    }
    
    // 2. Capacity Extraction (from the summary table at the bottom)
    // Structure: row[1] = Table Number, row[2] = Capacity
    if (row[1] != null && !isNaN(Number(String(row[1]).trim())) && row[2] != null && !isNaN(Number(String(row[2]).trim()))) {
       // Wait, guests have row[0] populated. The summary table has row[0] empty.
       if (!row[0] || String(row[0]).trim() === '') {
           const tableNum = String(row[1]).trim();
           const cap = Number(String(row[2]).trim());
           if (tableNum && cap) {
               capacities[tableNum] = cap;
           }
       }
    }
  }
  
  console.log("Total Strict Guests:", guests.length);
  console.log("Official Capacities Found:", capacities);
  
  fs.writeFileSync('./src/data/weddings/four-seasons-22-3.json', JSON.stringify(guests, null, 2));
  fs.writeFileSync('./four-seasons-capacities.json', JSON.stringify(capacities, null, 2));
  console.log("Wrote guests and capacities.");
} catch (e) {
  console.error("Critical error:", e);
}
