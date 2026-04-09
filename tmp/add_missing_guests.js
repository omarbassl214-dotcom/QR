const fs = require('fs');
const uniqueId = () => 'gst_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

const missingGuests = [
  // Table 46
  { firstName: "Ghassan", lastName: "", tableNumber: "46" },
  { firstName: "Ahmed", lastName: "Ghassan", tableNumber: "46" },
  { firstName: "Ali", lastName: "Ghassan", tableNumber: "46" },
  { firstName: "Omar", lastName: "Ghassan", tableNumber: "46" },
  { firstName: "Yahya", lastName: "Ghassan", tableNumber: "46" },
  // Table 47
  { firstName: "Yonis", lastName: "(Abu Ahmed)", tableNumber: "47" },
  { firstName: "Yonis", lastName: "Wife", tableNumber: "47" },
  // Table 48
  { firstName: "Foad", lastName: "(Abu Ahmed)", tableNumber: "48" },
  { firstName: "Foad", lastName: "Wife", tableNumber: "48" },
  // Table 49
  { firstName: "Dr. Zaid", lastName: "Abed Alwahab", tableNumber: "49" },
  { firstName: "Dr. Zaid", lastName: "Wife", tableNumber: "49" },
  // Table 50
  { firstName: "Muthana", lastName: "Al Samarai", tableNumber: "50" },
  { firstName: "Muthana", lastName: "Al Samarai - Wife", tableNumber: "50" },
  // Table 51
  { firstName: "Mahmoud", lastName: "AL Marsoomi", tableNumber: "51" },
  { firstName: "Mahmoud", lastName: "AL Marsoomi - Wife", tableNumber: "51" },
  // Table 52
  { firstName: "Saif", lastName: "Al-Deen Jassim", tableNumber: "52" },
  { firstName: "Wife of", lastName: "Saif Al-Deen", tableNumber: "52" },
  // Table 53
  { firstName: "Faris", lastName: "Al Kubaisy", tableNumber: "53" },
  { firstName: "Faris", lastName: "Al Kubaisy - Wife", tableNumber: "53" },
  // Table 54
  { firstName: "Yasir", lastName: "Al samamarai", tableNumber: "54" },
  { firstName: "Yasir", lastName: "Al samamarai - Wife", tableNumber: "54" },
  // Table 55
  { firstName: "Dr. Amar", lastName: "", tableNumber: "55" },
  { firstName: "Dr. Amar -", lastName: "Wife", tableNumber: "55" },
  // Table 56
  { firstName: "Hammeed", lastName: "Al Najar", tableNumber: "56" },
  { firstName: "Hammeed", lastName: "Al Najar - Wife", tableNumber: "56" },
  // Table 57
  { firstName: "Ammar", lastName: "Al Bandar", tableNumber: "57" },
  { firstName: "Ammar", lastName: "Al Bandar - Wife", tableNumber: "57" },
  // Table 58
  { firstName: "Yasser", lastName: "Abu Al Timen (Eyad)", tableNumber: "58" },
  { firstName: "Yasser", lastName: "Abu Al Timen (Eyad) - Wife", tableNumber: "58" },
  // Table 59
  { firstName: "Ihab", lastName: "Naji", tableNumber: "59" },
  { firstName: "Ihab", lastName: "Naji Wife", tableNumber: "59" },
  // Table 60
  { firstName: "Muhnead", lastName: "Sabahi", tableNumber: "60" },
  // Table 61
  { firstName: "Ali", lastName: "Taha", tableNumber: "61" },
  // Table 62
  { firstName: "Ali Fadel", lastName: "(Abo Zainab)", tableNumber: "62" },
  // Table 63
  { firstName: "Qays", lastName: "Al Timi", tableNumber: "63" },
  { firstName: "Qays", lastName: "Al Timi - Wife", tableNumber: "63" },
  // Table 64
  { firstName: "Ahmed", lastName: "Qays", tableNumber: "64" },
  { firstName: "Ahmed", lastName: "Qays - Wife", tableNumber: "64" },
  // Table 65
  { firstName: "Muhnaed", lastName: "Al Bayati", tableNumber: "65" },
  { firstName: "Muhnaed", lastName: "Al Bayati - Wife", tableNumber: "65" },
  { firstName: "Zaid", lastName: "Muhnaed", tableNumber: "65" },
  { firstName: "Omar", lastName: "Muhnaed", tableNumber: "65" },
  // Table 66
  { firstName: "Qusay", lastName: "Al Bayati", tableNumber: "66" },
  { firstName: "Qusay", lastName: "Al Bayati - Wife", tableNumber: "66" },
  { firstName: "Ali", lastName: "Qusay", tableNumber: "66" },
  { firstName: "Hussien", lastName: "Qusay", tableNumber: "66" },
  // Table 68
  { firstName: "Nabil", lastName: "Al Ani", tableNumber: "68" },
  { firstName: "Nabil", lastName: "Al Ani - Wife", tableNumber: "68" },
  // Table 69
  { firstName: "Dr. Ziad", lastName: "", tableNumber: "69" },
  { firstName: "Dr. Ziad -", lastName: "Wife", tableNumber: "69" },
  { firstName: "Dr. Ziad -", lastName: "Son", tableNumber: "69" },
  { firstName: "Dr. Ziad -", lastName: "Son", tableNumber: "69" },
  { firstName: "Dr. Ziad -", lastName: "Son", tableNumber: "69" },
  // Table 70
  { firstName: "Dr. Muhaned", lastName: "", tableNumber: "70" },
  { firstName: "Dr. Muhaned", lastName: "Wife", tableNumber: "70" },
  // Table 71
  { firstName: "Yaseer", lastName: "(Abo Zaid)", tableNumber: "71" },
  { firstName: "Yaseer", lastName: "(Abo Zaid) - Wife", tableNumber: "71" },
  // Table 72
  { firstName: "Hamed", lastName: "Al Kubaisy", tableNumber: "72" },
  { firstName: "Hamed", lastName: "Al Kubaisy - Wife", tableNumber: "72" },
  // Table 73
  { firstName: "Saker", lastName: "Bahaa", tableNumber: "73" },
  { firstName: "Saker", lastName: "Bahaa Wife", tableNumber: "73" },
  // Table 74
  { firstName: "Foad", lastName: "Jowdet", tableNumber: "74" },
  { firstName: "Foad", lastName: "Jowdet Wife", tableNumber: "74" },
  // Table 75
  { firstName: "Samer", lastName: "Jowdet", tableNumber: "75" }
].map(g => ({
    id: uniqueId(),
    firstName: g.firstName,
    lastName: g.lastName,
    tableNumber: g.tableNumber,
    event: "four-seasons-22-3",
    attended: false,
    timestamp: new Date().toISOString()
}));

const GUEST_FILE = './src/data/weddings/four-seasons-22-3.json';

// OVERWRITE guest file entirely!
fs.writeFileSync(GUEST_FILE, JSON.stringify(missingGuests, null, 2));
console.log(`Overwrote file with ONLY ${missingGuests.length} guests.`);

const CAPS_FILE = './four-seasons-capacities.json';

// Capacities Update based on missing ONLY!
const tableCapacities = {
  "46": 5, "47": 2, "48": 2, "49": 2, "50": 2, "51": 2, "52": 2, "53": 2, "54": 2, 
  "55": 2, "56": 2, "57": 2, "58": 2, "59": 2, "60": 1, "61": 1, "62": 1, "63": 2, 
  "64": 2, "65": 4, "66": 4, "68": 2, "69": 5, "70": 2, "71": 2, "72": 2, "73": 2, 
  "74": 2, "75": 1
};

fs.writeFileSync(CAPS_FILE, JSON.stringify(tableCapacities, null, 2));
console.log("Overwrote capacities to strictly match image setup file.");
