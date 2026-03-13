import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const eventId = searchParams.get("eventId");

    if (!categoryId || !eventId) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
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

        const dirPath = path.join(process.cwd(), "src/data/maps", categoryId);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const filePath = path.join(dirPath, `${eventId}.json`);
        try {
            fs.writeFileSync(filePath, JSON.stringify(coordinates, null, 4), "utf8");
        } catch (e) {
            // Skip in production
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Map saving error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
