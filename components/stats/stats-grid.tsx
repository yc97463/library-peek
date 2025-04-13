import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { StatsCard } from "./stats-card"
import { OccupancyData, ViewMode } from "@/types"

export function StatsGrid({ data, viewMode }: { data: OccupancyData[], viewMode: ViewMode }) {
    if (!data.length) {
        return (
            <div className="grid gap-4 md:grid-cols-4">
                <StatsCard title="目前人數" value={0} />
                <StatsCard title={`${viewMode === "all" ? "全日" : "時段"}最高`} value={0} />
                <StatsCard title={`${viewMode === "all" ? "全日" : "時段"}最低`} value={0} />
                <StatsCard title={`${viewMode === "all" ? "全日" : "時段"}平均人數`} value={0} />
            </div>
        )
    }

    const currentCount = data[data.length - 1].count
    const prevCount = data.length > 1 ? data[data.length - 2].count : currentCount
    const maxCount = Math.max(...data.map(d => d.count))
    const minCount = data
        .map(d => d.count)
        .filter(count => count > 0)
        .sort((a, b) => a - b)[0] || 0
    const avgCount = Math.round(data.reduce((a, b) => a + b.count, 0) / data.length)

    const getTrendInfo = () => {
        if (currentCount > prevCount) {
            return {
                badge: <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">增加中</Badge>,
                icon: <TrendingUp className="absolute right-4 bottom-4 h-24 w-24 text-emerald-100" />,
                className: "bg-emerald-50"
            }
        } else if (currentCount < prevCount) {
            return {
                badge: <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">減少中</Badge>,
                icon: <TrendingDown className="absolute right-4 bottom-4 h-24 w-24 text-rose-100" />,
                className: "bg-rose-50"
            }
        }
        return {
            badge: <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">持平</Badge>,
            icon: <Minus className="absolute right-4 bottom-4 h-24 w-24 text-sky-100" />,
            className: "bg-sky-50"
        }
    }

    const trendInfo = getTrendInfo()

    return (
        <div className="grid gap-4 md:grid-cols-4">
            <StatsCard
                title="目前人數"
                value={currentCount}
                extra={trendInfo.badge}
                className={trendInfo.className}
                icon={trendInfo.icon}
            />
            <StatsCard title={`${viewMode === "all" ? "全日" : "時段"}最高`} value={maxCount} />
            <StatsCard title={`${viewMode === "all" ? "全日" : "時段"}最低`} value={minCount} />
            <StatsCard title={`${viewMode === "all" ? "全日" : "時段"}平均人數`} value={avgCount} />
        </div>
    )
}
