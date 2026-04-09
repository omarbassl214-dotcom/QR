import { NextResponse } from "next/server";
import { getKV } from "@/lib/storage";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const eventId = searchParams.get("eventId");

    if (!categoryId || !eventId) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    try {
        const kv = getKV();
        if (kv) {
            // 1. Clear KV Data
            await kv.del(`checkins:${categoryId}:${eventId}`);
            await kv.del(`names:${categoryId}:${eventId}`);
        }

        // 2. Reset Local JSON (if possible, though on Vercel it may not persist)
        const filePath = path.join(process.cwd(), "src/data", categoryId, `${eventId}.json`);
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, "utf8");
            const guests = JSON.parse(data);
            const resetGuests = guests.map((g: any) => ({ ...g, attended: false }));
            try {
                fs.writeFileSync(filePath, JSON.stringify(resetGuests, null, 2));
            } catch (e) {
                // Ignore write errors in production
            }
        }

        // 3. Clear Registry Index (ephemeral in Vercel, but good to try)
        // Note: Real fix is mergeRegistryWithKV which will now see 0 checkins in KV.

        return NextResponse.json({ 
            success: true, 
            message: `Hard reset completed for ${eventId}. All check-ins cleared in live database.` 
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
