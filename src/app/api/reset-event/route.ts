import { NextResponse } from 'next/server';
import { clearAllEventAttendance } from '@/lib/storage';
import { getKV } from '@/lib/storage';

export async function POST(request: Request) {
    try {
        const { categoryId, eventId } = await request.json();
        
        const kv = getKV();
        if (kv) {
            // clear checkins and names
            await clearAllEventAttendance(categoryId, eventId);
            
            // clear ushers
            await kv.del(`ushers:${categoryId}:${eventId}`);
            
            // clear status
            await kv.del(`status:${categoryId}:${eventId}`);
        }
        
        return NextResponse.json({ success: true, message: "Cleared successfully" });
    } catch (e) {
        return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
    }
}
