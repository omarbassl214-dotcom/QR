import { NextResponse } from "next/server";
import { removeLiveUsher } from "@/lib/storage";
import { updateIndexEvent } from "@/lib/registry";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
    try {
        const { categoryId, eventId, usherName } = await request.json();

        if (!categoryId || !eventId || !usherName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Remove from KV ushers
        await removeLiveUsher(categoryId, eventId, usherName);

        // 2. Update central registry index
        // We need to fetch the current usher list to update perfectly
        const dataDir = path.join(process.cwd(), "src/data");
        const indexPath = path.join(dataDir, "registry_index.json");
        
        if (fs.existsSync(indexPath)) {
            const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
            const category = index.categories.find((c: any) => c.id === categoryId);
            if (category) {
                const event = category.events.find((e: any) => e.id === eventId);
                if (event) {
                    const currentUshers = new Set((event.usherNames || []) as string[]);
                    currentUshers.delete(usherName);
                    
                    await updateIndexEvent(categoryId, eventId, {
                        usherNames: Array.from(currentUshers),
                        usherCount: currentUshers.size
                    });
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Usher Remove Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
