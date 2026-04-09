import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Guest } from "@/app/[categoryId]/[eventId]/SearchClient";
import { removeLiveCheckin, removeLiveGuestName } from "@/lib/storage";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { categoryId, eventId, guestId } = body;

        if (!categoryId || !eventId || !guestId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const filePath = path.join(process.cwd(), "src/data", categoryId, `${eventId}.json`);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: "Event data not found" }, { status: 404 });
        }

        const fileContents = fs.readFileSync(filePath, "utf8");
        const guests: Guest[] = JSON.parse(fileContents);

        // Find by ID first, then by Name (for legacy/ghost check-ins)
        let guestIndex = guests.findIndex((g) => String(g.id) === String(guestId));
        
        if (guestIndex === -1) {
            // Try searching by name if the ID looks like a name
            guestIndex = guests.findIndex((g) => {
                const name = (g as any).name || `${(g as any).firstName || ""} ${(g as any).lastName || ""}`.trim();
                return name === guestId;
            });
        }

        if (guestIndex === -1) {
            return NextResponse.json({ error: "Guest not found" }, { status: 404 });
        }

        // Reset the attended status
        guests[guestIndex].attended = false;

        // Try to update static file (local dev only)
        try {
            fs.writeFileSync(filePath, JSON.stringify(guests, null, 2), "utf8");
        } catch (e) {
            // Ignore write errors in production
        }

        // 1. Remove from KV checkins (Exhaustive removal of all possible "Ghosts")
        const guest = guests[guestIndex];
        const firstName = (guest as any).firstName || "";
        const lastName = (guest as any).lastName || "";
        const fullName = (guest as any).name || `${firstName} ${lastName}`.trim();
        
        // Remove ID, Full Name, and Trimmed variants
        await removeLiveCheckin(categoryId, eventId, guestId, fullName);
        
        // Extra careful: remove case-insensitive variants if they might exist
        const kv = (await import("@/lib/storage")).getKV();
        if (kv) {
            const key = `checkins:${categoryId}:${eventId}`;
            await Promise.all([
                kv.srem(key, fullName.toLowerCase()),
                kv.srem(key, fullName.toUpperCase()),
                kv.srem(key, guestId.toString())
            ]);
        }
        
        // 2. Remove from KV guest names (for usher dashboard)
        await removeLiveGuestName(categoryId, eventId, guestId, fullName);
        
        // 3. Update central registry index
        const { updateIndexEvent } = await import("@/lib/registry");
        
        let checkedInCount = 0;
        let checkedInGuestNames: string[] = [];
        let unarrivedGuestNames: string[] = [];
        
        guests.forEach((g, idx) => {
            const name = (g as any).name || `${(g as any).firstName || ""} ${(g as any).lastName || ""}`.trim() || `Guest ${g.id}`;
            // If it's NOT the guest we just undid, check if they are attended
            const isAttended = g.attended && idx !== guestIndex;
            if (isAttended) {
                checkedInCount++;
                checkedInGuestNames.push(name);
            } else {
                unarrivedGuestNames.push(name);
            }
        });

        await updateIndexEvent(categoryId, eventId, { 
            checkedInGuests: checkedInCount,
            checkedInGuestNames,
            unarrivedGuestNames
        }, guestId, undefined, true);

        return NextResponse.json({ success: true, guest: guests[guestIndex] });
    } catch (error: any) {
        console.error("Undo check-in error:", error);
        return NextResponse.json({ 
            error: "Failed to undo check-in", 
            message: error.message 
        }, { status: 500 });
    }
}
