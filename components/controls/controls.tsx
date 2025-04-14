import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2, RefreshCw, Check } from "lucide-react"
import { DateSelector } from "./date-selector"
import { ViewMode } from "@/types/index"
import { useState, useEffect } from "react"

const REFRESH_INTERVAL = 180 // 3 minutes in seconds

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
    const [countdown, setCountdown] = useState(REFRESH_INTERVAL); // 3 minutes in seconds
    const [showSuccess, setShowSuccess] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (!isPaused) {
            interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        handleRefresh();
                        return REFRESH_INTERVAL;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPaused]);

    const handleRefresh = () => {
        onRefresh();
        setShowSuccess(true);
        setIsPaused(true);

        setTimeout(() => {
            setShowSuccess(false);
            setIsPaused(false);
            setCountdown(REFRESH_INTERVAL);
        }, 3000);
    };

    return (
        <div className="flex justify-between items-center gap-6 flex-wrap">
            <DateSelector dates={dates} selected={selectedDate} onSelect={onDateChange} />
            <div className="flex gap-2">
                <Button
                    variant={viewMode === "all" ? "default" : "outline"}
                    onClick={() => onViewModeChange("all")}
                    className="cursor-pointer"
                >
                    全日
                </Button>
                <Button
                    variant={viewMode === "1h" ? "default" : "outline"}
                    onClick={() => onViewModeChange("1h")}
                    className="cursor-pointer"
                >
                    近 1 小時
                </Button>
                <Button
                    variant={viewMode === "3h" ? "default" : "outline"}
                    onClick={() => onViewModeChange("3h")}
                    className="cursor-pointer"
                >
                    近 3 小時
                </Button>
                <Button
                    variant={viewMode === "6h" ? "default" : "outline"}
                    onClick={() => onViewModeChange("6h")}
                    className="cursor-pointer"
                >
                    近 6 小時
                </Button>
                <Button
                    variant="outline"
                    onClick={handleRefresh}
                    className={`cursor-pointer flex gap-2 ${showSuccess ? "bg-green-500 text-white hover:bg-green-600 hover:text-white" : ""} w-24`}
                >
                    {showSuccess ? (
                        <>
                            <Check className="h-4 w-4" />
                            已更新
                        </>
                    ) : (
                        <>
                            <RefreshCw className="h-4 w-4" />
                            <span>{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
                        </>
                    )}
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onFullscreenToggle}
                    className="cursor-pointer"
                >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}
