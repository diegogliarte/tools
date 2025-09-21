import type { APIRoute } from "astro";
import { fetchSlayerTasks } from "@lib/api/osrs";

export const GET: APIRoute = async () => {
    try {
        const data = await fetchSlayerTasks();
        return new Response(JSON.stringify(data), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: "Failed to fetch" }), { status: 500 });
    }
};
