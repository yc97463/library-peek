import { Card } from "@/components/ui/card"
import { CartesianGrid, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Line } from "recharts"

interface ChartData {
    time: string | number;
    count: number;
    trend?: number;
}

interface OccupancyChartProps {
    data: ChartData[]
    height: string
}

export function OccupancyChart({ data, height }: OccupancyChartProps) {
    const colors = {
        primary: "#000000",
        muted: "#666666",
        background: "#FFFFFF"
    }

    return (
        <div style={{ width: '100%', height }} className="relative">
            <Card className="absolute inset-0 p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.muted} opacity={0.2} />
                        <XAxis
                            dataKey="time"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            stroke={colors.muted}
                            fontSize={12}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return date.toLocaleTimeString('zh-TW', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                })
                            }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            stroke={colors.muted}
                            fontSize={12}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (!active || !payload) return null;
                                return (
                                    <div className="rounded-lg border bg-background/80 backdrop-blur-sm p-2 shadow-sm">
                                        <p className="text-xs text-muted-foreground">{label}</p>
                                        {payload.map((entry) => (
                                            <p key={entry.name} className="text-sm font-medium flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full" style={{ background: entry.stroke }} />
                                                <span>{entry.name}: {entry.value}</span>
                                            </p>
                                        ))}
                                    </div>
                                );
                            }}
                        />
                        <Line
                            name="人數"
                            type="monotone"
                            dataKey="count"
                            stroke={colors.primary}
                            strokeWidth={2}
                            dot={{
                                r: 3,
                                fill: colors.background,
                                stroke: colors.primary,
                                strokeWidth: 2
                            }}
                            activeDot={{
                                r: 6,
                                fill: colors.primary,
                                stroke: colors.background,
                                strokeWidth: 2
                            }}
                        />
                        <Line
                            name="趨勢"
                            type="monotone"
                            dataKey="trend"
                            stroke={colors.muted}
                            strokeWidth={1.5}
                            strokeDasharray="5 5"
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Card>
        </div>
    )
}
