import { createClient, VercelKV } from "@vercel/kv";

// Ensure URL starts with https (Upstash REST API requirement)
const getValidUrl = (url?: string) => {
    if (!url) return "";
    return url.startsWith("https") ? url : "";
};

const KV_CONFIG = {
    url: getValidUrl(process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL),
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "",
};

// Lazy initialization to prevent build-time crashes if URL is invalid
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

export const HAS_DB = !!(KV_CONFIG.url && KV_CONFIG.token);

if (typeof window === 'undefined') {
    console.log("Redis Status:", { HAS_DB, urlType: KV_CONFIG.url ? "HTTPS" : "None/Invalid" });
}

export async function getLiveCheckins(categoryId: string, eventId: string): Promise<string[]> {
    const kv = getKV();
    if (!kv) return [];
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
    if (!kv) return false;
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

/**
 * Merges local file data with live KV data
 */
export async function mergeLiveGuestData(categoryId: string, eventId: string, localGuests: any[]) {
    const kv = getKV();
    if (!kv) return localGuests;
    
    try {
        const checkedInIds = await kv.smembers(`checkins:${categoryId}:${eventId}`);
        if (!checkedInIds || checkedInIds.length === 0) return localGuests;

        const idSet = new Set(checkedInIds.map(String));
        return localGuests.map(guest => ({
            ...guest,
            attended: guest.attended || idSet.has(String(guest.id))
        }));
    } catch (e) {
        return localGuests;
    }
}

/**
 * Merges the entire registry index with KV data for global dashboards
 */
export async function mergeRegistryWithKV(index: any) {
    const kv = getKV();
    if (!kv) return index;

    try {
        // We iterate through all events and merge their KV data
        for (const category of index.categories) {
            for (const event of category.events) {
                const checkedInIds = await kv.smembers(`checkins:${category.id}:${event.id}`);
                const usherNames = await kv.smembers(`ushers:${category.id}:${event.id}`);

                if (checkedInIds && checkedInIds.length > 0) {
                    // Update count accurately
                    event.checkedInGuests = Math.max(event.checkedInGuests, checkedInIds.length);
                    
                    // We can't easily move names here without doing a full guest-list scan,
                    // but the check-in API already does this for us and updates the index!
                    // This merge just ensures the counts stay high if the index file is reset.
                }

                const isCompleted = await kv.get(`status:${category.id}:${event.id}`);
                if (isCompleted !== null) {
                    event.completed = !!isCompleted;
                }

                if (usherNames && usherNames.length > 0) {
                    event.usherCount = Math.max(event.usherCount, usherNames.length);
                    // Merge names without duplicates
                    const existingNames = new Set(event.usherNames || []);
                    usherNames.forEach((u: any) => existingNames.add(String(u)));
                    event.usherNames = Array.from(existingNames);
                }
            }
            
            // Recalculate category totals based on merged event states
            category.activeCount = category.events.filter((e: any) => !e.completed).length;
            category.doneCount = category.events.filter((e: any) => e.completed).length;
        }

        // Recalculate global stats
        index.globalStats.totalCheckins = index.categories.reduce((acc: number, cat: any) => 
            acc + cat.events.reduce((eAcc: number, ev: any) => eAcc + ev.checkedInGuests, 0), 0);
        
        index.globalStats.activeEvents = index.categories.reduce((acc: number, c: any) => acc + c.activeCount, 0);
        index.globalStats.doneEvents = index.categories.reduce((acc: number, c: any) => acc + c.doneCount, 0);

    } catch (e) {
        console.error("Registry Merge Error:", e);
    }

    return index;
}
