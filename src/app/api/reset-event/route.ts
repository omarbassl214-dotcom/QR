import { NextResponse } from 'next/server';
import { clearAllEventAttendance } from '@/lib/storage';
import { getKV } from '@/lib/storage';

export async function POST(request: Request) {
    try {
        const { categoryId, eventId } = await request.json();
        await doReset(categoryId, eventId);
        return NextResponse.json({ success: true, message: "Cleared successfully" });
    } catch (e) {
        return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        // Hardcode for this event for easy manual triggering
        await doReset("weddings", "june-26-wedding");
        return NextResponse.json({ success: true, message: "Live Vercel database for june-26-wedding cleared successfully via GET!" });
    } catch (e) {
        return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
    }
}

async function doReset(categoryId: string, eventId: string) {
    const kv = getKV();
    if (kv) {
        // clear checkins and names
        await clearAllEventAttendance(categoryId, eventId);
        
        // clear ushers
        await kv.del(`ushers:${categoryId}:${eventId}`);
        
        // clear status
        await kv.del(`status:${categoryId}:${eventId}`);
    }
}
