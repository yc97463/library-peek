"use client"

import { useDates, useOccupancy } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Maximize2, Minimize2, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { CartesianGrid, Line as RechartsLine, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Line } from "recharts"
import { ChartTooltip } from "@/components/ui/chart"
import { OccupancyData, ChartData, ViewMode } from "@/types"

export default function Home() {
  const { data: dates } = useDates()
  const [selectedDate, setSelectedDate] = useState("")
  const { data: occupancy, mutate } = useOccupancy(selectedDate)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("all")

  useEffect(() => {
    if (dates?.length) setSelectedDate(dates[dates.length - 1])
  }, [dates])

  const getFilteredData = (data: OccupancyData[]) => {
    return viewMode === "3h" ? data.slice(-36) : data
  }

  const processChartData = (data: OccupancyData[]): ChartData[] => {
    const counts = data.map(d => d.count)
    const trend = calculateTrend(counts)

    return data.map((d, i) => ({
      time: d.timestamp,  // 不需要在這裡轉換時間格式
      count: d.count,
      trend: trend[i]
    }))
  }

  if (!dates?.length || !occupancy?.length) {
    return <div className="flex h-screen items-center justify-center">載入中...</div>
  }

  const filteredData = getFilteredData(occupancy)
  const chartData = processChartData(filteredData)

  return (
    <div className={isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}>
      <div className="container space-y-6 py-8">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold">東華圖書館在館人數趨勢</h1>

          <div className="w-full max-w-4xl space-y-6">
            <Controls
              dates={dates}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onRefresh={mutate}
              isFullscreen={isFullscreen}
              onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
            />

            <StatsGrid data={filteredData} />

            <Card className="p-4">
              <OccupancyChart
                data={chartData}
                height={isFullscreen ? "600px" : "400px"}
              />
            </Card>

            <footer className="text-center text-sm text-muted-foreground">
              資料每 5 分鐘更新一次 • 頁面每 3 分鐘自動重新整理
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}

// Utility functions
function calculateTrend(counts: number[]): number[] {
  return counts.map((_, i, arr) => {
    const window = arr.slice(Math.max(0, i - 2), Math.min(arr.length, i + 3))
    return window.reduce((a, b) => a + b, 0) / window.length
  })
}

// Component definitions...
function Controls({
  dates,
  selectedDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  onRefresh,
  isFullscreen,
  onFullscreenToggle
}: {
  dates: string[],
  selectedDate: string,
  onDateChange: (date: string) => void,
  viewMode: ViewMode,
  onViewModeChange: (mode: ViewMode) => void,
  onRefresh: () => void,
  isFullscreen: boolean,
  onFullscreenToggle: () => void
}) {
  return (
    <div className="flex justify-between items-center gap-4 flex-wrap">
      <DateSelector dates={dates} selected={selectedDate} onSelect={onDateChange} />
      <div className="flex gap-2">
        <Button
          variant={viewMode === "all" ? "default" : "outline"}
          onClick={() => onViewModeChange("all")}
        >
          全日
        </Button>
        <Button
          variant={viewMode === "3h" ? "default" : "outline"}
          onClick={() => onViewModeChange("3h")}
        >
          近3小時
        </Button>
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onFullscreenToggle}>
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

function DateSelector({ dates, selected, onSelect }: { dates: string[], selected: string, onSelect: (date: string) => void }) {
  return (
    <Select value={selected} onValueChange={onSelect}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="選擇日期" />
      </SelectTrigger>
      <SelectContent>
        {dates.map((date: string) => (
          <SelectItem key={date} value={date}>{date}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function StatsGrid({ data }: { data: OccupancyData[] }) {
  const currentCount = data[data.length - 1].count
  const prevCount = data[data.length - 2].count
  const maxCount = Math.max(...data.map(d => d.count))
  const minCount = data
    .map(d => d.count)
    .filter(count => count > 0) // 過濾掉 0
    .sort((a, b) => a - b)[0] || 0 // 取最小值，如果沒有非 0 值則 return 0
  const avgCount = Math.round(data.reduce((a, b) => a + b.count, 0) / data.length)

  const getTrendBadge = () => {
    if (currentCount > prevCount) {
      return <Badge variant="default" className="bg-green-500">增加中</Badge>
    } else if (currentCount < prevCount) {
      return <Badge variant="destructive">減少中</Badge>
    }
    return <Badge variant="secondary">持平</Badge>
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatsCard
        title="目前人數"
        value={currentCount}
        extra={getTrendBadge()}
      />
      <StatsCard title="今日最高" value={maxCount} />
      <StatsCard title="今日最低" value={minCount} />
      <StatsCard title="平均人數" value={avgCount} />
    </div>
  )
}

const chartConfig = {
  count: {
    label: "人數",
    color: "hsl(var(--chart-1))"
  },
  trend: {
    label: "趨勢",
    color: "hsl(var(--chart-2))"
  }
} as const

function OccupancyChart({ data, height }: { data: any[], height: string }) {
  const colors = {
    primary: "#000000",
    muted: "#666666",
    background: "#FFFFFF"
  }

  return (
    <Card className="p-4">
      <ResponsiveContainer width="100%" height={parseInt(height)}>
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
  )
}

function StatsCard({ title, value, extra }: { title: string, value: number, extra?: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {extra}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
