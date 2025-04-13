"use client"

import { useDates, useOccupancy } from "@/lib/hooks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Maximize2, Minimize2, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { CartesianGrid, Line as RechartsLine, LineChart, XAxis, YAxis, Tooltip } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { chartConfig } from "@/config/chart"
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
      time: new Date(d.timestamp).toLocaleTimeString(),
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
                config={chartConfig}
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
  const minCount = Math.min(...data.map(d => d.count))
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

function OccupancyChart({ data, config, height }: { data: any[], config: ChartConfig, height: string }) {
  const chartData = data.map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString(),
    count: d.count,
    trend: calculateTrend(data.map(d => d.count))
  }))

  return (
    <Card className="p-4">
      <ChartContainer config={chartConfig}>
        <LineChart data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 5)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <Tooltip
            content={<ChartTooltipContent />}
          />
          <RechartsLine
            type="natural"
            dataKey="count"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={{
              fill: "hsl(var(--chart-1))",
            }}
            activeDot={{
              r: 6,
            }}
          />
          <RechartsLine
            type="natural"
            dataKey="trend"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ChartContainer>
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
