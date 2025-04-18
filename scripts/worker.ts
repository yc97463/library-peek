interface Env {
    LIBRARY_PEOPLE: KVNamespace;
}

interface ScheduledEvent {
    cron: string;
    scheduledTime: number;
}

interface WorkerContext {
    waitUntil(promise: Promise<any>): void;
}

interface LogEntry {
    timestamp: string;
    count: number;
}

export default {
    async scheduled(event: ScheduledEvent, env: Env, ctx: WorkerContext) {
        const count = await fetchLibraryPeopleCount();
        const now = new Date();
        const taiwanOffset = 8 * 60 * 60 * 1000;
        const taiwanDate = new Date(now.getTime() + taiwanOffset);
        const dateStr = taiwanDate.toISOString().slice(0, 10);
        const timestamp = now.toISOString();

        // Store the count in KV
        const logKey = `log:${dateStr}`;
        const logsRaw = await env.LIBRARY_PEOPLE.get(logKey);
        const logs: LogEntry[] = logsRaw ? JSON.parse(logsRaw) : [];
        logs.push({ timestamp, count });

        await env.LIBRARY_PEOPLE.put(logKey, JSON.stringify(logs));
        await env.LIBRARY_PEOPLE.put("latest", JSON.stringify({ timestamp, count }), {
            expirationTtl: 600
        });

        // Update the dates list
        const datesRaw = await env.LIBRARY_PEOPLE.get("dates");
        const dates: string[] = datesRaw ? JSON.parse(datesRaw) : [];
        if (!dates.includes(dateStr)) {
            dates.push(dateStr);
            dates.sort(); // optional
            await env.LIBRARY_PEOPLE.put("dates", JSON.stringify(dates));
        }

        console.log(`✔ ${taiwanDate.toLocaleString("zh-TW")} - ${count} people`);
    },

    async fetch(req: Request, env: Env, ctx: WorkerContext) {
        // Handle CORS preflight requests
        if (req.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "https://yc97463.github.io",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "*",
                }
            });
        }

        const url = new URL(req.url);
        const date = url.searchParams.get("date");
        const corsHeaders = {
            "Access-Control-Allow-Origin": "https://yc97463.github.io",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
        };

        if (url.pathname === "/api/latest") {
            const latest = await env.LIBRARY_PEOPLE.get("latest", { type: "json" }) as LogEntry | null;
            return Response.json(latest ?? { count: null, timestamp: null }, { headers: corsHeaders });
        }

        if (url.pathname === "/api/daily" && date) {
            const logs = await env.LIBRARY_PEOPLE.get(`log:${date}`, { type: "json" }) as LogEntry[] | null;
            return Response.json(logs ?? [], { headers: corsHeaders });
        }

        if (url.pathname === "/api/dates") {
            const dates = await env.LIBRARY_PEOPLE.get("dates", { type: "json" });
            return Response.json(dates ?? [], { headers: corsHeaders });
        }

        return new Response("Not Found", {
            status: 404,
            headers: corsHeaders
        });
    }
};

async function fetchLibraryPeopleCount(): Promise<number> {
    const res = await fetch("https://www2-lib.ndhu.edu.tw/persons-in-lib.asp");
    const html = await res.text();
    const match = html.match(/<body[^>]*>\s*(\d+)\s*<\/body>/i);
    return match ? parseInt(match[1], 10) : -1;
}
