import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const USHERS_DATA_DIR = path.join(process.cwd(), "src/data/ushers");

export async function POST(req: NextRequest) {
    try {
        const { categoryId, eventId, usherName } = await req.json();

        if (!categoryId || !eventId || !usherName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (!fs.existsSync(USHERS_DATA_DIR)) {
            fs.mkdirSync(USHERS_DATA_DIR, { recursive: true });
        }

        const fileName = `${categoryId}-${eventId}.json`;
        const filePath = path.join(USHERS_DATA_DIR, fileName);

        let checkins = [];
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, "utf8");
            checkins = JSON.parse(fileContent);
        }

        // Check if already checked in (optional, but good for UX)
        // For simplicity, we'll allow multiple check-ins or just check the last one
        const isAlreadyCheckedIn = checkins.some((c: any) => c.name === usherName);
        
        if (isAlreadyCheckedIn) {
            return NextResponse.json({ success: true, message: "Already checked in", alreadyDone: true });
        }

        const newCheckin = {
            name: usherName,
            timestamp: new Date().toISOString(),
        };

        checkins.push(newCheckin);
        fs.writeFileSync(filePath, JSON.stringify(checkins, null, 2));

        // Update central registry index
        const { updateIndexEvent } = await import("@/lib/registry");
        await updateIndexEvent(categoryId, eventId, { 
            usherCount: checkins.length,
            usherNames: checkins.map((c: any) => c.name)
        });

        return NextResponse.json({ success: true, message: "Checked in successfully" });
    } catch (error) {
        console.error("Usher check-in error:", error);
        return NextResponse.json({ error: "Failed to process check-in" }, { status: 500 });
    }
}
