"use client"

import { useDates, useOccupancy } from "@/lib/hooks"
import { useState, useEffect, useRef } from "react"
import { Controls } from "@/components/controls/controls"
import { StatsGrid } from "@/components/stats/stats-grid"
import { OccupancyChart } from "@/components/chart/occupancy-chart"
import { calculateTrend } from "@/lib/utils"
import { OccupancyData, ChartData, ViewMode } from "@/types"
import { Clock, Globe, Book, Calendar } from "lucide-react"
import { motion } from "motion/react"
import { LoadingSpinner } from "@/components/loading"

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
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
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

            <footer className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-primary">更新資訊</h3>
                  <div className="flex flex-col space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-primary/70" />
                      <span>資料每 5 分鐘更新一次</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-primary/70" />
                      <span>頁面每 3 分鐘自動重新整理</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-primary md:text-right">其他資訊</h3>
                  <div className="flex flex-col space-y-3 text-sm text-muted-foreground md:items-end">
                    <div className="flex items-center gap-3 md:flex-row-reverse">
                      <span>
                        {new Date(occupancy[occupancy.length - 1].timestamp).toLocaleString('zh-TW', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                      <Calendar className="h-4 w-4 text-primary/70" />
                      <span className="md:hidden">上次更新：</span>
                      <span className="hidden md:inline">上次更新：</span>
                    </div>
                    <div className="flex items-center gap-3 md:flex-row-reverse">
                      <a
                        href="https://lib.ndhu.edu.tw"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        東華大學圖書館
                      </a>
                      <Book className="h-4 w-4 text-primary/70" />
                      <span>資料來源：</span>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}
