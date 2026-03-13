import { createClient } from "@vercel/kv";

// Define all possible environment variable pairs provided by Vercel/Upstash integrations
const KV_CONFIG = {
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL || "",
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "",
};

// Create a robust client instance
export const kv = createClient(KV_CONFIG);

export const HAS_DB = !!(KV_CONFIG.url && KV_CONFIG.token);

/**
 * Diagnostic check to log DB status in Vercel logs
 */
if (typeof window === 'undefined') {
    console.log("Redis Init Status:", { 
        HAS_DB, 
        hasUrl: !!KV_CONFIG.url, 
        hasToken: !!KV_CONFIG.token,
        nodeEnv: process.env.NODE_ENV
    });
}

export async function getLiveCheckins(categoryId: string, eventId: string): Promise<string[]> {
    if (!HAS_DB) return [];
    try {
        const key = `checkins:${categoryId}:${eventId}`;
        const checkins = await kv.get<string[]>(key);
        return checkins || [];
    } catch (e) {
        console.error("KV Error:", e);
        return [];
    }
}

export async function addLiveCheckin(categoryId: string, eventId: string, guestId: string) {
    if (!HAS_DB) return;
    try {
        const key = `checkins:${categoryId}:${eventId}`;
        await kv.sadd(key, guestId);
    } catch (e) {
        console.error("KV Error:", e);
    }
}

export async function getLiveUshers(categoryId: string, eventId: string): Promise<string[]> {
    if (!HAS_DB) return [];
    try {
        const key = `ushers:${categoryId}:${eventId}`;
        const ushers = await kv.get<string[]>(key);
        return ushers || [];
    } catch (e) {
        console.error("KV Error:", e);
        return [];
    }
}

export async function addLiveUsher(categoryId: string, eventId: string, usherName: string) {
    if (!HAS_DB) return;
    try {
        const key = `ushers:${categoryId}:${eventId}`;
        await kv.sadd(key, usherName);
    } catch (e) {
        console.error("KV Error:", e);
    }
}

/**
 * Merges local file data with live KV data
 */
export async function mergeLiveGuestData(categoryId: string, eventId: string, localGuests: any[]) {
    if (!HAS_DB) return localGuests;
    
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
    if (!HAS_DB) return index;

    try {
        // We iterate through all events and merge their KV data
        for (const category of index.categories) {
            for (const event of category.events) {
                const checkedInIds = await kv.smembers(`checkins:${category.id}:${event.id}`);
                const usherNames = await kv.smembers(`ushers:${category.id}:${event.id}`);

                if (checkedInIds && checkedInIds.length > 0) {
                    // Update count accurately
                    event.checkedInGuests = Math.max(event.checkedInGuests, checkedInIds.length);
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
