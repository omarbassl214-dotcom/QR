const fs = require('fs');

const data = {
  3: ["Zaki Bakri", "Rima Abu Hassan", "Nimer Zaki Bakri", "Nimer Bakri", "Salwa Qawasmi", "Mohammad Bakri", "Luna Bakri", "Lina Bakri"],
  1: ["Ragheb Husseini", "Hadeel Bakri", "Dania Husseni", "Shadia Husseini", "Haya Husseini", "Yousef Husseini", "Ehab Bakri", "Manal Hammo", "Nihal Bakri", "Aya Abu Snobar", "Mohammad Ehab", "Hanan Bakri", "Hisham Bakri", "Heba Bakri (Child)", "Abdulrahman Bakri", "Terry"],
  5: ["Ali Abu Hassan", "Sawsan Al Sheikh", "Yara Abu Hassan", "Omar Alqaq", "Tala Abu Hassan", "Hala Abu Hassan", "Zeyad Abu Hassan", "Ghalia Awamleh", "Saleem Abu Hassan", "Nouran", "Hiyam Abu Hassan", "Sabah Abu Hassan", "Hanan Abu Hassan", "Hazem Nazzal", "Haneen Nazzal", "May Abu Hassan"],
  19: ["Asma Tarshihi", "Maram Tarshihi", "Razan Abu Hassan", "Farah Zoubi", "Nuha Abu Hassan", "Wafaa Abu Hassan", "Ali Ghamdi", "Yahya Nazzal", "Shaheyeh", "Khaldoun Abu Hassan"],
  9: ["Nuha Bakri", "Nasser Rassa'a", "Muqadas", "Hana Bakri", "Hana's Husband", "Nader Bakri", "Nader's Daughter", "Fouad Bakri", "Fouad Wife", "Suzan Bakri"],
  17: ["Iman Abu Hassan", "Fozi Nazzal", "Riham Abu Hassan", "Lamar Ghamdi", "Mohammad Masri", "Masri's Wife", "Ammar Dajani", "Lara Mamkegh", "Laura Naqrash", "Linda Janakat"],
  13: ["Anas Rashid", "Layan Jadallah", "Sama Khalifah", "Shaher Tarawneh", "saad Daoud", "Ibrahim Izmigna", "Joud Shawareb", "Maya Salous", "Abdullah Jbouri", "Tuleen Kirresh", "Tina Kannan", "Taleen Kannan", "Bahaa Abulezz", "Dima Adwan", "Obada Shweikh", "Abdo Al Zayat"],
  11: ["Saif Kalbouneh", "Heba Baddad", "Walid Jitan", "Yazan Kalbouneh", "Isabella Nababteh", "Yazan Abu Lebeh", "Farah Hamad", "Mohammad Kalbouneh", "Rahaf Mraizeeq", "Abdulmushen Zghayer", "Nour Baddad", "Sadan Manasrah", "Hussein Ayoub", "Eyad Kalbouneh", "Fares Jilani", "Anas Lababidi"],
  "11-2": ["Saif Akhras", "Sharwan Kurdi", "Lana Zamel", "Osama Gaith", "Ibtihal", "Nezar Gaith", "Zubida Khafaji", "Abdullah Shamayleh", "Hamzeh Shamayleh", "Hashem Shamayleh"],
  7: ["Omar Amiri", "Ahmad Wafa", "Fadi Bakri", "Sarah Salameh", "Ruba Salameh", "Rimal Salameh", "Zaina Salameh", "Luma abu hassan"],
  4: ["May Hassan", "Layan Kalbouneh", "Fawaz Abulghanam", "Jana Kalbouneh", "Elham Mor", "Abdulwahab Hasan", "Zaid Abulghanam", "Eman Malhas"],
  6: ["Mohammad Hasan", "Suzan Kassab", "Dareen Habeballah", "Ahmad Hasan", "Areen Khader", "Ehab Hasan", "Fares (Child)", "Rashed (Child)", "Em Dareen", "Em Areen", "Abo Areen", "Sawsan (KSA)", "Sawsan", "Hadeel (KSA)", "Hadeel"],
  2: ["Rana Kalbouneh", "Khaled Kalbouneh", "Fedaa Kalbouneh", "Omar Mahameed", "Raed Kalbouneh", "Maysa Qaraen", "Omar Kalbouneh", "Um Nidal", "Loay Kalbouneh", "Lina Hashem", "Nedal Kalbouneh", "Suha Tahboub", "Sameer Kalbouneh", "Hala Irshaid", "Yomna Kalbouneh", "Fares Samhouri"],
  10: ["Tariq Samhouri", "Mohannad", "Hala Kalbouneh", "Mohammad Q.", "Esraa Kalbouneh", "Shadi Hamad", "Omar Nabtiti", "Omar Wife", "Ayman Rawwas"],
  20: ["Reem Alsayed", "Haneen Awad", "Salam Banna", "Manal Jarrar", "Jumana", "Rania Bader", "Mirna", "Aisha", "Amal Khlaif", "Sara Jaber"],
  18: ["Amer Shaqman", "Eman", "Sauda Salem", "Abu Hamzeh", "Faizeh", "Abu Samer", "Rabeeha", "Dr Ayed", "Dina Abu Ghanam", "Om Zaid AbuGhanam"],
  14: ["Dalia Tineh", "Tamar Omar", "Maya Fahoum", "Own Qtaishat", "Ahmad Arabiat", "Zaid Hawari", "Adnan Salah", "Zaid Oqal", "Zain Al Khatib", "Noor Hawash", "Sarah Hamawi", "Saras Sister", "Zain Zuaiter", "Yasmeen Zuaiter", "Dania Abdeen", "Kinda Qarem"],
  16: ["Laila Oweis", "Abdullah Madi", "Nadia Tayyan", "Leen Shahrour", "Leen Manna", "Faris Tayyan", "Yasmeen Abdeen", "Muhyei", "Raya Kanaan", "Akram Salous", "Faisal", "Ghalia", "Dana Al Yousef", "Faisal", "Sima Shaqman", "Zaid Soubar"],
  12: ["Mohammad Sadaqa", "Sadaqas Wife", "Zaid Elyan", "Zaids Wife", "Saleem Flouty", "Mahmoud Hammouz", "Mahmoud Wife", "Ebaa Badran", "Ahmad Yanes", "Muhannad Younes", "Reem Abu Hejleh"]
};

let guests = [];
let idCounter = 1;

for (const [tableNum, guestNames] of Object.entries(data)) {
  for (const fullName of guestNames) {
    let parts = fullName.trim().split(' ');
    let firstName = parts[0];
    let lastName = parts.slice(1).join(' '); // Could be empty string if no last name
    
    guests.push({
      id: idCounter.toString(),
      firstName: firstName,
      lastName: lastName,
      tableNumber: isNaN(Number(tableNum)) ? tableNum : Number(tableNum),
      attended: false
    });
    idCounter++;
  }
}

// 1. Update fairmont-22-3.json
fs.writeFileSync('d:\\qr code\\src\\data\\weddings\\fairmont-22-3.json', JSON.stringify(guests, null, 2));

// 2. Update registry_index.json
const masterPath = 'd:\\qr code\\src\\data\\registry_index.json';
const masterData = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

// find fairmont-22-3
for (const category of masterData.categories) {
  if (category.id === 'weddings') {
    const event = category.events.find(e => e.id === 'fairmont-22-3');
    if (event) {
      event.totalGuests = guests.length;
      event.unarrivedGuestNames = guests.map(g => (g.firstName + " " + g.lastName).trim());
    }
  }
}

// update global stats
let globalTotal = 0;
for (const category of masterData.categories) {
  let catGuestCount = 0;
  for (const event of category.events) {
    catGuestCount += event.totalGuests;
  }
  category.guestCount = catGuestCount;
  globalTotal += catGuestCount;
}
masterData.globalStats.totalGuests = globalTotal;

fs.writeFileSync(masterPath, JSON.stringify(masterData, null, 2));

console.log("Successfully updated guests!");
