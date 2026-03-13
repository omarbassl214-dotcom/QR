import { createClient } from "@vercel/kv";

// Vercel KV usually uses KV_REST_API_URL and KV_REST_API_TOKEN.
// If the user uses the Redis integration, they might have REDIS_URL.
const kv = createClient({
    url: process.env.KV_REST_API_URL || process.env.REDIS_URL || "",
    token: process.env.KV_REST_API_TOKEN || "",
});

export const HAS_DB = !!(process.env.KV_REST_API_URL || process.env.REDIS_URL);

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
        // For production scale, we might want to optimize this with a single scan or multi-get
        for (const category of index.categories) {
            for (const event of category.events) {
                const checkedInIds = await kv.smembers(`checkins:${category.id}:${event.id}`);
                const usherNames = await kv.smembers(`ushers:${category.id}:${event.id}`);

                if (checkedInIds && checkedInIds.length > 0) {
                    // Update counts and names in the index
                    // Note: We don't have the names for checkedInIds here easily without more KV data 
                    // or re-scanning, so we at least update the count.
                    // Actually, let's just stick to the count for the global view.
                    event.checkedInGuests = Math.max(event.checkedInGuests, checkedInIds.length);
                }

                if (usherNames && usherNames.length > 0) {
                    event.usherCount = Math.max(event.usherCount, usherNames.length);
                    event.usherNames = Array.from(new Set([...event.usherNames, ...usherNames.map(String)]));
                }
            }
            
            // Recalculate category totals
            category.activeCount = category.events.filter((e: any) => !e.completed).length;
            category.doneCount = category.events.filter((e: any) => e.completed).length;
        }

        // Recalculate global stats
        index.globalStats.activeEvents = index.categories.reduce((acc: number, c: any) => acc + c.activeCount, 0);
        index.globalStats.doneEvents = index.categories.reduce((acc: number, c: any) => acc + c.doneCount, 0);

    } catch (e) {
        console.error("Registry Merge Error:", e);
    }

    return index;
}
