import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DateSelectorProps {
    dates: string[]
    selected: string
    onSelect: (date: string) => void
}

export function DateSelector({ dates, selected, onSelect }: DateSelectorProps) {
    const selectedDate = new Date(selected)
    const disabledDates = dates.map(d => new Date(d))

    const today = format(new Date(), 'yyyy-MM-dd')
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')

    const hasToday = dates.includes(today)
    const hasYesterday = dates.includes(yesterday)

    return (
        <div className="flex gap-2 items-center">
            <Button
                variant={selected === yesterday ? "default" : "outline"}
                onClick={() => hasYesterday && onSelect(yesterday)}
                disabled={!hasYesterday}
                className="cursor-pointer"
            >
                昨日
            </Button>
            <Button
                variant={selected === today ? "default" : "outline"}
                onClick={() => hasToday && onSelect(today)}
                disabled={!hasToday}
                className="cursor-pointer"
            >
                今日
            </Button>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-[200px] justify-start text-left font-normal cursor-pointer",
                            !selected && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selected ? format(selectedDate, 'yyyy-MM-dd EEEE').replace('Monday', '星期一').replace('Tuesday', '星期二').replace('Wednesday', '星期三').replace('Thursday', '星期四').replace('Friday', '星期五').replace('Saturday', '星期六').replace('Sunday', '星期日') : "選擇日期"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && onSelect(format(date, 'yyyy-MM-dd'))}
                        disabled={(date) =>
                            !disabledDates.some(d =>
                                d.getFullYear() === date.getFullYear() &&
                                d.getMonth() === date.getMonth() &&
                                d.getDate() === date.getDate()
                            )
                        }
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
