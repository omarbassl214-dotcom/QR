const xlsx = require('xlsx');
const wb = xlsx.readFile('./event list updated 16 march (1).xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(ws, {header:1});

console.log("Looking for 'Ghassan' or 'Yonis' anywhere in the sheet...");
data.forEach((r, i) => {
    const rowStr = r.join(' ').toLowerCase();
    if (rowStr.includes('ghassan') || rowStr.includes('yonis')) {
        console.log(`Row ${i}:`, r);
    }
});
