import { NextResponse } from "next/server";
import { getKV } from "@/lib/storage";

export async function POST(request: Request) {
    const kv = getKV();
    if (!kv) {
        return NextResponse.json({ error: "KV not connected" }, { status: 500 });
    }

    try {
        // Find all keys related to our application
        const keys = await kv.keys("*");
        const appKeys = keys.filter(k => 
            k.startsWith("checkins:") || 
            k.startsWith("ushers:") || 
            k.startsWith("status:") || 
            k.startsWith("names:")
        );

        if (appKeys.length > 0) {
            await kv.del(...appKeys);
        }

        return NextResponse.json({ 
            success: true, 
            message: `Database zeroed. Deleted ${appKeys.length} keys.`,
            deletedKeys: appKeys
        });
    } catch (error: any) {
        console.error("Reset error:", error);
        return NextResponse.json({ error: "Failed to reset database", message: error.message }, { status: 500 });
    }
}
