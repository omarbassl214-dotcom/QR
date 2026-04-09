/**
 * Hard Reset script for Four Seasons event.
 * Clears all KV check-ins and resets the registry counts.
 * USES FETCH TO KV REST API DIRECTLY.
 */
const fs = require('fs');
const path = require('path');

// Manually load .env.local
const envPath = path.join(__dirname, '../.env.local');
let KV_URL = "";
let KV_TOKEN = "";

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            const k = key.trim();
            const v = value.trim().replace(/^["']|["']$/g, ''); // Remove quotes
            if (k === 'KV_REST_API_URL') KV_URL = v;
            if (k === 'KV_REST_API_TOKEN') KV_TOKEN = v;
        }
    });
}

const CATEGORY_ID = 'weddings';
const EVENT_ID = 'four-seasons-22-3';

async function reset() {
    console.log(`Starting Hard Reset for ${CATEGORY_ID}/${EVENT_ID}...`);
    
    if (KV_URL && KV_TOKEN) {
        // Use Fetch to talk to KV directly
        const key1 = `checkins:${CATEGORY_ID}:${EVENT_ID}`;
        const key2 = `names:${CATEGORY_ID}:${EVENT_ID}`;
        
        console.log("Clearing KV keys...");
        const res = await fetch(`${KV_URL}/del/${key1}/${key2}`, {
            headers: { Authorization: `Bearer ${KV_TOKEN}` }
        });
        const result = await res.json();
        console.log("✓ Live KV data cleared:", result);
    } else {
        console.warn("⚠ KV credentials not found in .env.local. Skipping KV clear.");
    }

    // 2. Reset Local JSON
    const jsonPath = path.join(__dirname, `../src/data/${CATEGORY_ID}/${EVENT_ID}.json`);
    if (fs.existsSync(jsonPath)) {
        const guests = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const resetGuests = guests.map(g => ({ ...g, attended: false }));
        fs.writeFileSync(jsonPath, JSON.stringify(resetGuests, null, 2));
        console.log("✓ Local JSON attending status reset.");
    }

    // 3. Update Registry Index
    const indexPath = path.join(__dirname, '../src/data/registry_index.json');
    if (fs.existsSync(indexPath)) {
        const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        const category = index.categories.find(c => c.id === CATEGORY_ID);
        if (category) {
            const event = category.events.find(e => e.id === EVENT_ID);
            if (event) {
                event.checkedInGuests = 0;
                event.checkedInGuestNames = [];
                event.checkedInGuestsInfo = [];
                // Restore all guests to unarrived
                const allNames = resetGuests.map(g => (g.name || `${g.firstName || ""} ${g.lastName || ""}`.trim()));
                event.unarrivedGuestNames = allNames;
                
                fs.writeFileSync(indexPath, JSON.stringify(index, null, 4));
                console.log("✓ Registry index reset.");
            }
        }
    }

    console.log("🚀 HARD RESET COMPLETE. Please push these changes to GitHub!");
}

reset().catch(console.error);
