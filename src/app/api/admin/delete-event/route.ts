import { NextResponse } from "next/server";
import { deleteEventFromKV } from "@/lib/storage";
import { deleteEventFromRegistry } from "@/lib/registry";

export async function POST(request: Request) {
    try {
        const { categoryId, eventId } = await request.json();

        if (!categoryId || !eventId) {
            return NextResponse.json({ error: "Missing categoryId or eventId" }, { status: 400 });
        }

        // Delete from KV (Live guest data + Status)
        const { deleteEventFromKV, markEventAsDeleted } = await import("@/lib/storage");
        await deleteEventFromKV(categoryId, eventId);
        await markEventAsDeleted(categoryId, eventId);

        // Delete from Registry (Filesystem - for local dev + Index re-sync)
        await deleteEventFromRegistry(categoryId, eventId);

        return NextResponse.json({ 
            success: true, 
            message: `Event ${eventId} deleted successfully from ${categoryId}.`
        });
    } catch (error: any) {
        console.error("Delete error:", error);
        return NextResponse.json({ 
            error: "Failed to delete event", 
            message: error.message 
        }, { status: 500 });
    }
}
