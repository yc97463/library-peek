import { Card } from "@/components/ui/card"
import { CartesianGrid, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Line } from "recharts"

interface OccupancyData {
    time: string
    count: number
    trend?: number
}

interface OccupancyChartProps {
    data: OccupancyData[]
    height: string
}

export function OccupancyChart({ data, height }: OccupancyChartProps) {
    const colors = {
        primary: "#000000",
        muted: "#666666",
        background: "#FFFFFF"
    }

    // Filter out data points where count is 0
    const filteredData = data.filter(item => item.count !== 0)

    return (
        <Card className="p-4">
            <ResponsiveContainer width="100%" height={parseInt(height)}>
                <LineChart
                    data={filteredData}
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
                                    <p className="text-xs text-muted-foreground">
                                        {(() => {
                                            const date = new Date(label)
                                            return date.toLocaleDateString('zh-TW', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit'
                                            }) + ' ' + date.toLocaleTimeString('zh-TW', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: false
                                            })
                                        })()}
                                    </p>
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
                        connectNulls
                        dot={{
                            r: 1.5,
                            fill: colors.primary,
                            stroke: colors.primary,
                            strokeWidth: 4
                        }}
                        activeDot={{
                            r: 4,
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
    )
}
