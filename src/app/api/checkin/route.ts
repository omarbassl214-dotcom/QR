import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Guest } from "@/app/[categoryId]/[eventId]/SearchClient";
import { addLiveCheckin, HAS_DB } from "@/lib/storage";

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

        const guestIndex = guests.findIndex((g) => g.id === guestId);

        if (guestIndex === -1) {
            return NextResponse.json({ error: "Guest not found" }, { status: 404 });
        }

        // Toggle or set the attended status
        guests[guestIndex].attended = true;

        if (fs.existsSync(filePath)) {
            // Only write to file if possible (local dev)
            try {
                fs.writeFileSync(filePath, JSON.stringify(guests, null, 2), "utf8");
            } catch (e) {
                // Ignore write errors in production
            }
        }

        // Always update KV if in Vercel
        await addLiveCheckin(categoryId, eventId, guestId);

        // Update central registry index for performance
        const { updateIndexEvent } = await import("@/lib/registry");
        
        let checkedInCount = 0;
        let checkedInGuestNames: string[] = [];
        let unarrivedGuestNames: string[] = [];
        
        guests.forEach((g) => {
            const name = (g as any).name || `${(g as any).firstName || ""} ${(g as any).lastName || ""}`.trim() || `Guest ${g.id}`;
            if (g.attended || g.id === guestId) {
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
        });

        return NextResponse.json({ success: true, guest: guests[guestIndex] });
    } catch (error: any) {
        console.error("Check-in error:", error);
        return NextResponse.json({ 
            error: "Failed to process check-in", 
            message: error.message 
        }, { status: 500 });
    }
}
