import { ChartConfig } from "@/components/ui/chart"

export const chartConfig = {
    count: {
        label: "即時人數",
        color: "hsl(var(--chart-1))"
    },
    trend: {
        label: "趨勢線",
        color: "hsl(var(--chart-2))"
    }
} satisfies ChartConfig
