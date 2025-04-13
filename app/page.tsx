"use client"

import { useDates, useOccupancy } from "@/lib/hooks"
import { useState, useEffect, useRef } from "react"
import { Controls } from "@/components/controls/controls"
import { StatsGrid } from "@/components/stats/stats-grid"
import { OccupancyChart } from "@/components/chart/occupancy-chart"
import { calculateTrend } from "@/lib/utils"
import { OccupancyData, ChartData, ViewMode } from "@/types"

export default function Home() {
  const { data: dates } = useDates()
  const [selectedDate, setSelectedDate] = useState("")
  const { data: occupancy, mutate } = useOccupancy(selectedDate)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("all")
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (dates?.length) setSelectedDate(dates[dates.length - 1])
  }, [dates])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && containerRef.current) {
        await containerRef.current.requestFullscreen()
      } else if (document.fullscreenElement) {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err)
    }
  }

  const getFilteredData = (data: OccupancyData[]) => {
    switch (viewMode) {
      case "3h":
        return data.slice(-36);
      case "6h":
        return data.slice(-72);
      default:
        return data;
    }
  }

  const processChartData = (data: OccupancyData[]): ChartData[] => {
    const counts = data.map(d => d.count)
    const trend = calculateTrend(counts)

    return data.map((d, i) => ({
      time: d.timestamp,
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
    <div
      ref={containerRef}
      className={isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}
    >
      <div className="container mx-auto space-y-6 py-8">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold">東華圖書館在館人數趨勢</h1>

          <div className="w-full space-y-6">
            <Controls
              dates={dates}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onRefresh={mutate}
              isFullscreen={isFullscreen}
              onFullscreenToggle={toggleFullscreen}
            />

            <StatsGrid data={filteredData} viewMode={viewMode} />

            <OccupancyChart
              data={chartData}
              height={isFullscreen ? "600px" : "400px"}
            />

            <footer className="text-center text-sm text-muted-foreground">
              資料每 5 分鐘更新一次 • 頁面每 3 分鐘自動重新整理
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}
