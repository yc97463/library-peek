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

        const logKey = `log:${dateStr}`;
        const logsRaw = await env.LIBRARY_PEOPLE.get(logKey);
        const logs: LogEntry[] = logsRaw ? JSON.parse(logsRaw) : [];

        logs.push({ timestamp, count });
        await env.LIBRARY_PEOPLE.put(logKey, JSON.stringify(logs));
        await env.LIBRARY_PEOPLE.put("latest", JSON.stringify({ timestamp, count }), {
            expirationTtl: 600
        });

        console.log(`✔ ${taiwanDate.toLocaleString("zh-TW")} - ${count} people`);
    },

    async fetch(req: Request, env: Env, ctx: WorkerContext) {
        const url = new URL(req.url);
        const date = url.searchParams.get("date");

        if (url.pathname === "/api/latest") {
            const latest = await env.LIBRARY_PEOPLE.get("latest", { type: "json" }) as LogEntry | null;
            return Response.json(latest ?? { count: null, timestamp: null });
        }

        if (url.pathname === "/api/daily" && date) {
            const logs = await env.LIBRARY_PEOPLE.get(`log:${date}`, { type: "json" }) as LogEntry[] | null;
            return Response.json(logs ?? []);
        }

        return new Response("Not Found", { status: 404 });
    }
};

async function fetchLibraryPeopleCount(): Promise<number> {
    const res = await fetch("https://www2-lib.ndhu.edu.tw/persons-in-lib.asp");
    const html = await res.text();
    const match = html.match(/<body[^>]*>\s*(\d+)\s*<\/body>/i);
    return match ? parseInt(match[1], 10) : -1;
}
