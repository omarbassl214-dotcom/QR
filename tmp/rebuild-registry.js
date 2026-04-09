const fs = require("fs");
const path = require("path");

const DATA_DIR = path.resolve(__dirname, "../src/data");
const INDEX_PATH = path.join(DATA_DIR, "registry_index.json");

function capitalize(str) {
    return str.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function sync() {
    console.log("Syncing registry from:", DATA_DIR);
    if (!fs.existsSync(DATA_DIR)) {
        console.error("Data directory not found:", DATA_DIR);
        process.exit(1);
    }

    const categoryIds = ["weddings", "events"];
    const categories = categoryIds.filter(id => fs.existsSync(path.join(DATA_DIR, id))).map(categoryId => {
        const categoryPath = path.join(DATA_DIR, categoryId);
        const files = fs.readdirSync(categoryPath).filter(f => f.endsWith(".json"));
        
        let categoryGuests = 0;
        const events = files.map(file => {
            const eventId = file.replace(/\.json$/, "");
            const filePath = path.join(categoryPath, file);
            let totalGuests = 0;
            let checkedInGuestNames = [];
            let checkedInGuestsInfo = [];
            let unarrivedGuestNames = [];
            try {
                const contents = JSON.parse(fs.readFileSync(filePath, "utf8"));
                if (Array.isArray(contents)) {
                    totalGuests = contents.length;
                    categoryGuests += totalGuests;
                    contents.forEach(g => {
                        const name = g.name || `${g.firstName || ""} ${g.lastName || ""}`.trim() || `Guest ${g.id}`;
                        if (g.attended) {
                            checkedInGuestNames.push(name);
                            checkedInGuestsInfo.push({ id: String(g.id), name });
                        } else {
                            unarrivedGuestNames.push(name);
                        }
                    });
                }
            } catch (e) {}

            return {
                id: eventId,
                name: eventId === "four-seasons-22-3" ? "Four Seasons 22/3" : capitalize(eventId),
                totalGuests,
                checkedInGuests: checkedInGuestNames.length,
                completed: false,
                publicPath: `/${categoryId}/${eventId}`,
                usherPath: `/usher/${categoryId}/${eventId}`,
                usherCount: 0,
                checkedInGuestNames,
                checkedInGuestsInfo,
                unarrivedGuestNames,
                usherNames: []
            };
        });

        return {
            id: categoryId,
            name: capitalize(categoryId),
            path: `/admin/${categoryId}`,
            activeCount: events.length,
            doneCount: 0,
            guestCount: categoryGuests,
            events
        };
    });

    const index = {
        globalStats: {
            totalGuests: categories.reduce((sum, c) => sum + c.guestCount, 0),
            activeEvents: categories.reduce((sum, c) => sum + c.activeCount, 0),
            doneEvents: 0
        },
        categories,
        lastSynced: new Date().toISOString()
    };

    fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
    console.log("Registry index rebuilt at:", INDEX_PATH);
    console.log(`Found ${index.globalStats.activeEvents} events total.`);
}

sync();
