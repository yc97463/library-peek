"use client"

import { Line as RechartsLine, LineChart as RechartsLineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

export interface ChartProps extends React.ComponentProps<typeof RechartsLineChart> {
    height?: number
}

export const Chart = ({ height = 350, ...props }: ChartProps) => (
    <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart {...props} />
    </ResponsiveContainer>
)

export const ChartLine = RechartsLine

export const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null

    return (
        <div className="rounded-lg border bg-background p-2 text-sm shadow-sm">
            <div className="grid gap-2">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">{label}</span>
                </div>
                {payload.map(({ name, value }: any) => (
                    <div key={name} className="flex items-center justify-between gap-8">
                        <span className="text-muted-foreground">{name}</span>
                        <span className="font-medium">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
