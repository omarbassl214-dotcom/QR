import { notFound } from "next/navigation";
import SearchClient, { Guest } from "./SearchClient";
import fs from "fs";
import path from "path";

async function getEventData(categoryId: string, eventId: string): Promise<Guest[] | null> {
    try {
        const filePath = path.join(process.cwd(), "src/data", categoryId, `${eventId}.json`);
        const fileContents = fs.readFileSync(filePath, "utf8");
        const data = JSON.parse(fileContents);
        return Array.isArray(data) ? data : null;
    } catch (error) {
        return null;
    }
}

function capitalize(str: string) {
    return str.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default async function EventPage({ params }: { params: Promise<{ categoryId: string, eventId: string }> }) {
    const resolvedParams = await params;
    const { categoryId, eventId } = resolvedParams;
    const guests = await getEventData(categoryId, eventId);

    if (!guests) {
        return notFound();
    }

    // Generate a display name dynamically if we don't have a hardcoded map
    let eventName = capitalize(eventId);
    if (categoryId === "weddings") {
        // Special formatting for weddings e.g. "Mohamed & Maya's Wedding"
        eventName = eventId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" & ") + "'s Wedding";
    }

    return (
        <main className="min-h-screen flex items-start justify-center pt-10 sm:pt-20 relative z-10 w-full overflow-hidden">
            <SearchClient guests={guests} eventName={eventName} />
        </main>
    );
}
