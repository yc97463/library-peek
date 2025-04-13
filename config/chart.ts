export interface ChartConfig {
    count: {
        label: string;
        color: string;
    };
    trend: {
        label: string;
        color: string;
    };
}

export const chartConfig = {
    count: {
        label: "人數",
        color: "hsl(var(--chart-1))"
    },
    trend: {
        label: "趨勢",
        color: "hsl(var(--chart-2))"
    }
} satisfies ChartConfig
