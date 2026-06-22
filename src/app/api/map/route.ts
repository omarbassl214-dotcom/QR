import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { saveMapCoordinates, getMapCoordinates } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const eventId = searchParams.get("eventId");

    if (!categoryId || !eventId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        // Try KV Database First
        const kvData = await getMapCoordinates(categoryId, eventId);
        if (kvData && Object.keys(kvData).length > 0 && Array.isArray(kvData.tables) && kvData.tables.length > 0) {
            return NextResponse.json(kvData);
        }

        // Fallback to local file
        const filePath = path.join(process.cwd(), "src/data/maps", categoryId, `${eventId}.json`);
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, "utf8");
            return NextResponse.json(JSON.parse(data));
        }
        return NextResponse.json({});
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { categoryId, eventId, coordinates } = body;

        if (!categoryId || !eventId || !coordinates) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Save to Live Vercel KV Database (for production persistance)
        await saveMapCoordinates(categoryId, eventId, coordinates);

        // 2. Also gracefully attempt local file save (for dev mode)
        const dirPath = path.join(process.cwd(), "src/data/maps", categoryId);
        if (!fs.existsSync(dirPath)) {
            try { fs.mkdirSync(dirPath, { recursive: true }); } catch (e) {}
        }

        const filePath = path.join(dirPath, `${eventId}.json`);
        try {
            fs.writeFileSync(filePath, JSON.stringify(coordinates, null, 4), "utf8");
        } catch (e) {
            // Fails silently in Vercel - that is completely fine since KV caught it.
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Map saving error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
