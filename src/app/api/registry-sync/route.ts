import { NextResponse } from "next/server";
import { syncRegistry } from "@/lib/registry";

export async function POST() {
    try {
        const newIndex = await syncRegistry();
        return NextResponse.json({ success: true, lastSynced: newIndex.lastSynced });
    } catch (error) {
        console.error("Error syncing registry:", error);
        return NextResponse.json({ error: "Failed to sync registry" }, { status: 500 });
    }
}
