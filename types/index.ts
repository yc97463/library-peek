export interface OccupancyData {
    timestamp: string
    count: number
}

export interface ChartData {
    time: string
    count: number
    trend: number
}

export type ViewMode = "all" | "1h" | "3h" | "6h"
