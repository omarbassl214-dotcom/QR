import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getEventStatus, setEventStatus } from "@/lib/storage";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const eventId = searchParams.get("eventId");

    if (!categoryId || !eventId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        const completed = await getEventStatus(categoryId, eventId);
        return NextResponse.json({ completed });
    } catch (e) {
        return NextResponse.json({ completed: false });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { categoryId, eventId, completed } = body;

        if (!categoryId || !eventId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Try to update local metadata if possible (local dev)
        const metaDir = path.join(process.cwd(), "src/data/metadata", categoryId);
        const metaPath = path.join(metaDir, `${eventId}.json`);
        const metadata = { completed: !!completed, lastModified: new Date().toISOString() };
        
        try {
            if (!fs.existsSync(metaDir)) fs.mkdirSync(metaDir, { recursive: true });
            fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), "utf8");
        } catch (e) {
            // Skip in production
        }

        // Always update KV
        await setEventStatus(categoryId, eventId, !!completed);

        // Update the central registry index for performance
        const { updateIndexEvent } = await import("@/lib/registry");
        await updateIndexEvent(categoryId, eventId, { completed: !!completed });

        return NextResponse.json({ success: true, completed: !!completed });
    } catch (error) {
        console.error("Error in event-status route:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
