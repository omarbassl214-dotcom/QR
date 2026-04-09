const fs = require('fs');

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  const imagePath = "C:/Users/USer/.gemini/antigravity/brain/cf65c6af-9425-492d-93ee-28cbc0d3d80d/uploaded_media_1774293115858.png";
  const base64Image = Buffer.from(fs.readFileSync(imagePath)).toString("base64");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=\${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `This image is a spreadsheet of a guest list. 
Transcribe all the guests into a JSON array of objects.
Each object should have:
"tableNumber": a string (extracted from the Table number column, e.g. "1", "46", "75")
"firstName": the first word of the guest name
"lastName": the rest of the guest name.
If there is no last name, leave it empty.
DO NOT summarize. Output exactly the entire list of guests from the image in pure JSON format, with no markdown formatting. The result should be a JSON array [].
The total number of guests should be exactly 245. Count carefully.`
          },
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image
            }
          }
        ]
      }
    ]
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/\\`\\`\\`json/g, '').replace(/\\`\\`\\`/g, '').trim();
    fs.writeFileSync('./tmp/vision_guests.json', text);
    console.log("Written vision_guests.json!");
  } catch (e) {
    console.error(e);
  }
}
run();
