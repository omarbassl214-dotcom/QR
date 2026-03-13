import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src/data");
const META_DIR = path.join(process.cwd(), "src/data/metadata");
const USHERS_DIR = path.join(process.cwd(), "src/data/ushers");
const INDEX_PATH = path.join(DATA_DIR, "registry_index.json");

export interface RosterIndexItem {
    id: string;
    name: string;
    path: string;
    activeCount: number;
    doneCount: number;
    guestCount: number;
    events: {
        id: string;
        name: string;
        totalGuests: number;
        checkedInGuests: number;
        completed: boolean;
        publicPath: string;
        usherPath: string;
        usherCount: number;
        checkedInGuestNames: string[];
        unarrivedGuestNames: string[];
        usherNames: string[];
    }[];
}

export interface RegistryIndex {
    globalStats: {
        totalGuests: number;
        activeEvents: number;
        doneEvents: number;
    };
    categories: RosterIndexItem[];
    lastSynced: string;
}

function capitalize(str: string) {
    return str.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/**
 * Performs a full filesystem scan to rebuild the registry index.
 */
export async function syncRegistry(): Promise<RegistryIndex> {
    if (!fs.existsSync(DATA_DIR)) {
        throw new Error("Data directory not found");
    }

    let globalTotalGuests = 0;
    let globalActiveEvents = 0;
    let globalDoneEvents = 0;

    const entries = fs.readdirSync(DATA_DIR, { withFileTypes: true });
    const categoryIds = ["weddings", "events"]; // Targeted categories

    const categories = categoryIds
        .filter(id => fs.existsSync(path.join(DATA_DIR, id)))
        .map((categoryId) => {
            const categoryPath = path.join(DATA_DIR, categoryId);
            const categoryMetaPath = path.join(META_DIR, categoryId);
            
            const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.json'));
            
            let categoryGuests = 0;
            let categoryActive = 0;
            let categoryDone = 0;

            const events = files.map(file => {
                const eventId = file.replace(/\.json$/, "");
                const filePath = path.join(categoryPath, file);
                const metaPath = path.join(categoryMetaPath, `${eventId}.json`);

                let totalGuests = 0;
                let checkedInGuests = 0;
                let usherCount = 0;
                let checkedInGuestNames: string[] = [];
                let unarrivedGuestNames: string[] = [];
                let usherNames: string[] = [];
                let completed = false;

                // Guest data
                try {
                    const contents = JSON.parse(fs.readFileSync(filePath, "utf8"));
                    if (Array.isArray(contents)) {
                        totalGuests = contents.length;
                        contents.forEach((g: any) => {
                            const name = g.name || `${g.firstName || ""} ${g.lastName || ""}`.trim() || `Guest ${g.id}`;
                            if (g.attended) {
                                checkedInGuests++;
                                checkedInGuestNames.push(name);
                            } else {
                                unarrivedGuestNames.push(name);
                            }
                        });
                        categoryGuests += totalGuests;
                        globalTotalGuests += totalGuests;
                    }
                } catch (e) {}

                // Metadata status
                if (fs.existsSync(metaPath)) {
                    try {
                        const metadata = JSON.parse(fs.readFileSync(metaPath, "utf8"));
                        if (metadata.completed) completed = true;
                    } catch (e) {}
                }

                // Usher check-ins
                const usherFilePath = path.join(USHERS_DIR, `${categoryId}-${eventId}.json`);
                if (fs.existsSync(usherFilePath)) {
                    try {
                        const usherCheckins = JSON.parse(fs.readFileSync(usherFilePath, "utf8"));
                        if (Array.isArray(usherCheckins)) {
                            usherCount = usherCheckins.length;
                            usherNames = usherCheckins.map((u: any) => u.name);
                        }
                    } catch (e) {}
                }

                if (completed) {
                    categoryDone++;
                    globalDoneEvents++;
                } else {
                    categoryActive++;
                    globalActiveEvents++;
                }

                return {
                    id: eventId,
                    name: capitalize(eventId),
                    totalGuests,
                    checkedInGuests,
                    completed,
                    publicPath: `/${categoryId}/${eventId}`,
                    usherPath: `/usher/${categoryId}/${eventId}`,
                    usherCount,
                    checkedInGuestNames,
                    unarrivedGuestNames,
                    usherNames
                };
            });

            return {
                id: categoryId,
                name: capitalize(categoryId),
                path: `/admin/${categoryId}`,
                activeCount: categoryActive,
                doneCount: categoryDone,
                guestCount: categoryGuests,
                events
            };
        });

    const index: RegistryIndex = {
        globalStats: {
            totalGuests: globalTotalGuests,
            activeEvents: globalActiveEvents,
            doneEvents: globalDoneEvents
        },
        categories,
        lastSynced: new Date().toISOString()
    };

    // Atomic write
    fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
    return index;
}

/**
 * Retrieves the registry index, triggering a sync if it doesn't exist.
 */
export async function getRegistryIndex(): Promise<RegistryIndex> {
    if (!fs.existsSync(INDEX_PATH)) {
        return await syncRegistry();
    }

    try {
        const data = fs.readFileSync(INDEX_PATH, "utf8");
        return JSON.parse(data);
    } catch (e) {
        return await syncRegistry();
    }
}

/**
 * Updates a specific event's metadata in the index without a full scan.
 */
export async function updateIndexEvent(
    categoryId: string, 
    eventId: string, 
    updates: { 
        completed?: boolean, 
        checkedInGuests?: number,
        checkedInGuestNames?: string[],
        unarrivedGuestNames?: string[],
        usherCount?: number,
        usherNames?: string[]
    }
) {
    if (!fs.existsSync(INDEX_PATH)) return await syncRegistry();

    try {
        const index = await getRegistryIndex();
        const category = index.categories.find(c => c.id === categoryId);
        if (!category) return;

        const event = category.events.find(e => e.id === eventId);
        if (!event) return;

        // Handle changes that affect counts
        if (updates.completed !== undefined && updates.completed !== event.completed) {
            if (updates.completed) {
                category.activeCount--;
                category.doneCount++;
                index.globalStats.activeEvents--;
                index.globalStats.doneEvents++;
            } else {
                category.activeCount++;
                category.doneCount--;
                index.globalStats.activeEvents++;
                index.globalStats.doneEvents--;
            }
            event.completed = updates.completed;
        }

        if (updates.checkedInGuests !== undefined) {
             event.checkedInGuests = updates.checkedInGuests;
        }

        if (updates.checkedInGuestNames !== undefined) {
            event.checkedInGuestNames = updates.checkedInGuestNames;
        }

        if (updates.unarrivedGuestNames !== undefined) {
            event.unarrivedGuestNames = updates.unarrivedGuestNames;
        }

        if (updates.usherCount !== undefined) {
            event.usherCount = updates.usherCount;
        }

        if (updates.usherNames !== undefined) {
            event.usherNames = updates.usherNames;
        }

        fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
    } catch (e) {
        console.error("Failed to update index:", e);
    }
}
