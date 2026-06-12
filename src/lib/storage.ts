import { createClient, VercelKV } from "@vercel/kv";
import fs from "fs";
import path from "path";

// Ensure URL starts with https (Upstash REST API requirement)
const getValidUrl = (url?: string) => {
    if (!url || url.includes("your-upstash-url-here")) return "";
    return url.startsWith("https") ? url : "";
};

const KV_CONFIG = {
    url: getValidUrl(
        process.env.KV_REST_API_URL || 
        process.env.UPSTASH_REDIS_KV_REST_API_URL || 
        process.env.UPSTASH_REDIS_REST_URL || 
        process.env.REDIS_URL
    ),
    token: (
        process.env.KV_REST_API_TOKEN || 
        process.env.UPSTASH_REDIS_KV_REST_API_TOKEN || 
        process.env.UPSTASH_REDIS_REST_TOKEN || 
        ""
    ).includes("your-token-here") 
        ? "" 
        : (
            process.env.KV_REST_API_TOKEN || 
            process.env.UPSTASH_REDIS_KV_REST_API_TOKEN || 
            process.env.UPSTASH_REDIS_REST_TOKEN || 
            ""
        ),
};

// Lazy initialization with connection check
let _kv: VercelKV | null = null;
export const getKV = () => {
    if (!_kv && KV_CONFIG.url && KV_CONFIG.token) {
        try {
            _kv = createClient(KV_CONFIG);
        } catch (e) {
            console.error("Failed to init KV client:", e);
        }
    }
    return _kv;
};

/**
 * Helper to wrap promises with a timeout
 */
async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<T>((resolve) => {
        timeoutId = setTimeout(() => {
            console.warn(`KV Operation timed out after ${ms}ms`);
            resolve(fallback);
        }, ms);
    });

    return Promise.race([
        promise.then((result) => {
            clearTimeout(timeoutId);
            return result;
        }),
        timeoutPromise
    ]);
}

export const HAS_DB = !!(KV_CONFIG.url && KV_CONFIG.token);

if (typeof window === 'undefined') {
    console.log("Redis Status:", { HAS_DB, urlType: KV_CONFIG.url ? "HTTPS" : "None/Invalid" });
}

export async function getLiveCheckins(categoryId: string, eventId: string): Promise<string[]> {
    const kv = getKV();
    if (!kv) {
        // Fallback to FS
        const filePath = path.join(process.cwd(), "src/data", categoryId, `${eventId}.json`);
        if (!fs.existsSync(filePath)) return [];
        try {
            const contents = JSON.parse(fs.readFileSync(filePath, "utf8"));
            return Array.isArray(contents) ? contents.filter(g => g.attended).map(g => String(g.id)) : [];
        } catch (e) {
            return [];
        }
    }
    try {
        const key = `checkins:${categoryId}:${eventId}`;
        const checkins = await kv.sadd(key, []); // Ensure key exists
        return (await kv.smembers(key)) || [];
    } catch (e) {
        console.error("KV Error:", e);
        return [];
    }
}

export async function addLiveCheckin(categoryId: string, eventId: string, guestId: string) {
    const kv = getKV();
    if (!kv) return;
    try {
        const key = `checkins:${categoryId}:${eventId}`;
        await kv.sadd(key, guestId);
    } catch (e) {
        console.error("KV Error:", e);
    }
}

export async function removeLiveCheckin(categoryId: string, eventId: string, guestId: string, guestName?: string) {
    const kv = getKV();
    if (!kv) return;
    try {
        const key = `checkins:${categoryId}:${eventId}`;
        const itemsToRemove = [guestId];
        if (guestName) itemsToRemove.push(guestName);
        await kv.srem(key, ...itemsToRemove);
    } catch (e) {
        console.error("KV Error:", e);
    }
}

export async function clearAllEventAttendance(categoryId: string, eventId: string) {
    const kv = getKV();
    if (!kv) return;
    try {
        const keys = [
            `checkins:${categoryId}:${eventId}`,
            `names:${categoryId}:${eventId}`
        ];
        await kv.del(...keys);
    } catch (e) {
        console.error("KV Clear Error:", e);
    }
}

export async function addLiveGuestName(categoryId: string, eventId: string, guestId: string, guestName: string) {
    const kv = getKV();
    if (!kv) return;
    try {
        const key = `names:${categoryId}:${eventId}`;
        const data = `${guestId}|${guestName}`;
        await kv.sadd(key, data);
    } catch (e) {
        console.error("KV Error:", e);
    }
}

export async function removeLiveGuestName(categoryId: string, eventId: string, guestId: string, guestName: string) {
    const kv = getKV();
    if (!kv) return;
    try {
        const key = `names:${categoryId}:${eventId}`;
        const data = `${guestId}|${guestName}`;
        await Promise.all([
            kv.srem(key, data),
            kv.srem(key, guestName)
        ]);
    } catch (e) {
        console.error("KV Error:", e);
    }
}

export async function getLiveUshers(categoryId: string, eventId: string): Promise<string[]> {
    const kv = getKV();
    if (!kv) return [];
    try {
        const key = `ushers:${categoryId}:${eventId}`;
        return (await kv.smembers(key)) || [];
    } catch (e) {
        console.error("KV Error:", e);
        return [];
    }
}

export async function removeLiveUsher(categoryId: string, eventId: string, usherName: string) {
    const kv = getKV();
    if (!kv) return;
    try {
        const key = `ushers:${categoryId}:${eventId}`;
        await kv.srem(key, usherName);
    } catch (e) {
        console.error("KV Error:", e);
    }
}

export async function addLiveUsher(categoryId: string, eventId: string, usherName: string) {
    const kv = getKV();
    if (!kv) return;
    try {
        const key = `ushers:${categoryId}:${eventId}`;
        await kv.sadd(key, usherName);
    } catch (e) {
        console.error("KV Error:", e);
    }
}

export async function getEventStatus(categoryId: string, eventId: string): Promise<boolean> {
    const kv = getKV();
    if (!kv) {
        const metaPath = path.join(process.cwd(), "src/data", "metadata", categoryId, `${eventId}.json`);
        if (!fs.existsSync(metaPath)) return false;
        try {
            const metadata = JSON.parse(fs.readFileSync(metaPath, "utf8"));
            return !!metadata.completed;
        } catch (e) {
            return false;
        }
    }
    try {
        const status = await kv.get(`status:${categoryId}:${eventId}`);
        return !!status;
    } catch (e) {
        return false;
    }
}

export async function setEventStatus(categoryId: string, eventId: string, completed: boolean) {
    const kv = getKV();
    if (!kv) return;
    try {
        await kv.set(`status:${categoryId}:${eventId}`, completed);
    } catch (e) {
        console.error("KV Error:", e);
    }
}

export async function deleteEventFromKV(categoryId: string, eventId: string) {
    const kv = getKV();
    if (!kv) return;
    try {
        const keys = [
            `checkins:${categoryId}:${eventId}`,
            `names:${categoryId}:${eventId}`,
            `ushers:${categoryId}:${eventId}`,
            `status:${categoryId}:${eventId}`
        ];
        await kv.del(...keys);
    } catch (e) {
        console.error("KV Delete Error:", e);
    }
}

export async function markEventAsDeleted(categoryId: string, eventId: string) {
    const kv = getKV();
    if (!kv) return;
    try {
        await kv.sadd('deleted_events', `${categoryId}:${eventId}`);
    } catch (e) {
        console.error("KV Soft-Delete Error:", e);
    }
}

export async function isEventDeleted(categoryId: string, eventId: string): Promise<boolean> {
    const kv = getKV();
    if (!kv) return false;
    try {
        return await kv.sismember('deleted_events', `${categoryId}:${eventId}`) === 1;
    } catch (e) {
        return false;
    }
}

export async function mergeLiveGuestData(categoryId: string, eventId: string, localGuests: any[]) {
    const kv = getKV();
    if (!kv) return localGuests;
    
    try {
        const checkedInIds = await kv.smembers(`checkins:${categoryId}:${eventId}`);
        if (checkedInIds === null) return localGuests;

        const idSet = new Set(checkedInIds.map(String));
        return localGuests.map(guest => {
            const guestId = String(guest.id);
            const isLiveCheckedIn = idSet.has(guestId);
            
            return {
                ...guest,
                attended: isLiveCheckedIn
            };
        });
    } catch (e) {
        return localGuests;
    }
}

export async function mergeRegistryWithKV(index: any) {
    const kv = getKV();
    if (!kv) return index;

    try {
        const fetchPromises: Promise<any>[] = [];

        for (const category of index.categories) {
            for (const event of category.events) {
                const eventId = event.id;
                const catId = category.id;

                const eventSync = (async () => {
                    try {
                        const [isCompleted, checkedInIds, liveNames, usherNames] = await Promise.all([
                            withTimeout(kv.get(`status:${catId}:${eventId}`), 1000, null),
                            withTimeout(kv.smembers(`checkins:${catId}:${eventId}`), 1000, []),
                            withTimeout(kv.smembers(`names:${catId}:${eventId}`), 1000, []),
                            withTimeout(kv.smembers(`ushers:${catId}:${eventId}`), 1000, [])
                        ]);

                        if (isCompleted !== null) {
                            event.completed = !!isCompleted;
                        }

                        if (checkedInIds) {
                            event.checkedInGuests = checkedInIds.length;
                        }

                        const infoMap = new Map<string, string>();
                        const rawNames = new Set<string>();
                        const isKvManaged = (liveNames && liveNames.length > 0) || (checkedInIds && checkedInIds.length > 0);

                        if (isKvManaged) {
                            try {
                                const rosterPath = path.join(process.cwd(), "src/data", catId, `${eventId}.json`);
                                if (fs.existsSync(rosterPath)) {
                                    const roster = JSON.parse(fs.readFileSync(rosterPath, "utf8"));
                                    if (Array.isArray(roster)) {
                                        roster.forEach((g: any) => {
                                            const name = g.name || `${g.firstName || ""} ${g.lastName || ""}`.trim();
                                            infoMap.set(String(g.id), name);
                                        });
                                    }
                                }
                            } catch (e) {
                                console.error("Error loading roster for resolution:", e);
                            }

                            if (liveNames) {
                                liveNames.forEach((item: string) => {
                                    if (item.includes('|')) {
                                        const [id, name] = item.split('|');
                                        infoMap.set(id, name);
                                    }
                                });
                            }
                            
                            checkedInIds.forEach((id: string) => {
                                const name = infoMap.get(String(id)) || `Guest ${id}`;
                                rawNames.add(name);
                            });
                        } else if (!HAS_DB) {
                            (event.checkedInGuestNames || []).forEach((n: string) => rawNames.add(n));
                            (event.checkedInGuestsInfo || []).forEach((info: any) => {
                                if (!infoMap.has(info.id)) {
                                    infoMap.set(info.id, info.name);
                                    rawNames.add(info.name);
                                }
                            });
                        }

                        event.checkedInGuestNames = Array.from(rawNames);
                        
                        const checkedInIdSet = new Set(checkedInIds.map(String));
                        event.checkedInGuestsInfo = Array.from(infoMap.entries())
                            .filter(([id]) => checkedInIdSet.has(id))
                            .map(([id, name]) => ({ id, name }));

                        event.checkedInGuests = event.checkedInGuestsInfo.length;

                        const arrivedNames = new Set(event.checkedInGuestNames.map((n: string) => n.toLowerCase().trim()));
                        event.unarrivedGuestNames = (event.unarrivedGuestNames || []).filter((n: string) => {
                            const normalized = n.toLowerCase().trim();
                            return !arrivedNames.has(normalized);
                        });

                        if (usherNames && usherNames.length > 0) {
                            const existingUshers = new Set(event.usherNames || []);
                            usherNames.forEach((u: any) => existingUshers.add(String(u)));
                            event.usherNames = Array.from(existingUshers);
                            event.usherCount = event.usherNames.length;
                        }
                    } catch (err) {}
                })();
                fetchPromises.push(eventSync);
            }
        }

        await withTimeout(Promise.all(fetchPromises), 1500, []);

        const deletedEvents = await withTimeout(kv.smembers('deleted_events'), 800, [] as string[]);
        const deletedSet = new Set(deletedEvents || []);

        for (const category of index.categories) {
            category.events = category.events.filter((e: any) => !deletedSet.has(`${category.id}:${e.id}`));
            category.activeCount = category.events.filter((e: any) => !e.completed).length;
            category.doneCount = category.events.filter((e: any) => e.completed).length;
            category.guestCount = category.events.reduce((acc: number, e: any) => acc + (e.totalGuests || 0), 0);
        }

        index.globalStats.totalCheckins = index.categories.reduce((acc: number, cat: any) => 
            acc + cat.events.reduce((eAcc: number, ev: any) => eAcc + ev.checkedInGuests, 0), 0);
        
        index.globalStats.activeEvents = index.categories.reduce((acc: number, c: any) => acc + c.activeCount, 0);
        index.globalStats.doneEvents = index.categories.reduce((acc: number, c: any) => acc + c.doneCount, 0);
        index.globalStats.totalGuests = index.categories.reduce((acc: number, c: any) => acc + c.guestCount, 0);

    } catch (e) {
        console.error("Registry Merge Error:", e);
    }

    return index;
}

// -----------------------------------------------------
// Map Coordinates (Floor Plan Editor) Support
// -----------------------------------------------------

export async function saveMapCoordinates(categoryId: string, eventId: string, coordinates: any) {
    const kv = getKV();
    if (!kv) return false;
    try {
        await kv.set(`map:${categoryId}:${eventId}`, coordinates);
        return true;
    } catch (e) {
        console.error("KV Map Save Error:", e);
        return false;
    }
}

export async function getMapCoordinates(categoryId: string, eventId: string) {
    const kv = getKV();
    if (!kv) return null;
    try {
        return await kv.get(`map:${categoryId}:${eventId}`);
    } catch (e) {
        console.error("KV Map Load Error:", e);
        return null;
    }
}
