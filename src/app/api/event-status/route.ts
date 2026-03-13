import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const eventId = searchParams.get("eventId");

    if (!categoryId || !eventId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const metaDir = path.join(process.cwd(), "src/data/metadata", categoryId);
    const metaPath = path.join(metaDir, `${eventId}.json`);

    if (!fs.existsSync(metaPath)) {
        return NextResponse.json({ completed: false });
    }

    try {
        const metadata = JSON.parse(fs.readFileSync(metaPath, "utf8"));
        return NextResponse.json({ completed: !!metadata.completed });
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

        const metaDir = path.join(process.cwd(), "src/data/metadata", categoryId);
        if (!fs.existsSync(metaDir)) {
            fs.mkdirSync(metaDir, { recursive: true });
        }

        const metaPath = path.join(metaDir, `${eventId}.json`);
        const metadata = { completed: !!completed, lastModified: new Date().toISOString() };
        try {
            fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), "utf8");
        } catch (e) {
            // Skip in production
        }

        // Update the central registry index for performance
        const { updateIndexEvent } = await import("@/lib/registry");
        await updateIndexEvent(categoryId, eventId, { completed: metadata.completed });

        return NextResponse.json({ success: true, completed: metadata.completed });
    } catch (error) {
        console.error("Error in event-status route:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
