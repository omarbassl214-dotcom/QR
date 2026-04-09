const fs = require('fs');
const path = require('path');

const inputPath = 'tmp/event.json';
const outputPath = 'src/data/weddings/four-seasons-22-3.json';

try {
    const buffer = fs.readFileSync(inputPath);
    // Check for UTF-16 BOM or just try reading as utf16le
    let rawData = buffer.toString('utf16le');
    if (!rawData.trim().startsWith('[') && !rawData.trim().startsWith('{')) {
        rawData = buffer.toString('utf8');
    }
    
    // Remove potential BOM or garbage at start
    const cleanData = rawData.replace(/^\uFEFF/, '').trim();
    let data = JSON.parse(cleanData);
    
    // The data we got from npx xlsx-cli was likely a flat array of all sheets
    // or an object with keys. Our 'type' showed it was an array.
    if (!Array.isArray(data)) {
        const sheetNames = Object.keys(data);
        data = data[sheetNames[0]];
    }

    const transformed = data
        .filter(item => {
            return item["Name of Guest"] && 
                   item["Table Number"] && 
                   (item["Confirmed Coming"] === "yes" || item["Confirmed Coming"] === "Yes");
        })
        .map((item, index) => {
            const fullName = String(item["Name of Guest"]).trim();
            const parts = fullName.split(/\s+/);
            const firstName = parts[0] || "";
            const lastName = parts.slice(1).join(" ") || "";
            
            return {
                id: (index + 1).toString(),
                firstName: firstName,
                lastName: lastName,
                tableNumber: parseInt(item["Table Number"]),
                attended: false
            };
        });

    // Ensure output directory exists (though it should)
    const outDir = path.dirname(outputPath);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2));
    console.log(`Successfully transformed ${transformed.length} guests.`);
} catch (err) {
    console.error("Error:", err);
    process.exit(1);
}
