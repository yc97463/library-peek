import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2, RefreshCw } from "lucide-react"
import { DateSelector } from "./date-selector"
import { ViewMode } from "@/types"

interface ControlsProps {
    dates: string[]
    selectedDate: string
    onDateChange: (date: string) => void
    viewMode: ViewMode
    onViewModeChange: (mode: ViewMode) => void
    onRefresh: () => void
    isFullscreen: boolean
    onFullscreenToggle: () => void
}

export function Controls({
    dates,
    selectedDate,
    onDateChange,
    viewMode,
    onViewModeChange,
    onRefresh,
    isFullscreen,
    onFullscreenToggle
}: ControlsProps) {
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
                    近 3 小時
                </Button>
                <Button
                    variant={viewMode === "6h" ? "default" : "outline"}
                    onClick={() => onViewModeChange("6h")}
                >
                    近 6 小時
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
