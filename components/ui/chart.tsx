"use client"

import { Ref, forwardRef } from "react"
import {
    TooltipProps,
    ResponsiveContainer,
    Line as RechartsLine,
    LineChart as RechartsLineChart,
} from "recharts"

export type ChartConfig = Record<
    string,
    {
        label: string
        color: string
    }
>

export const ChartContainer = ({ children, config, height = 350 }: {
    children: React.ReactElement
    config: ChartConfig
    height?: number
}) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
            {children}
        </ResponsiveContainer>
    )
}

export const ChartTooltipContent = forwardRef(({ active, payload, label }: TooltipProps<any, any>, ref: Ref<HTMLDivElement>) => {
    if (!active || !payload) return null
    return (
        <div ref={ref} className="rounded-lg border bg-background p-2 shadow-sm">
            <div className="grid gap-2">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-1 text-sm text-muted-foreground">
                        {label}
                    </div>
                </div>
                {payload.map(({ value, color }: any) => (
                    <div key={value} className="flex items-center gap-2">
                        <div className="text-sm font-medium">{value}</div>
                    </div>
                ))}
            </div>
        </div>
    )
})
ChartTooltipContent.displayName = "ChartTooltipContent"
