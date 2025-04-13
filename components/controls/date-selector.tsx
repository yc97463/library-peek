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

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[240px] justify-start text-left font-normal cursor-pointer",
                        !selected && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selected ? format(selectedDate, 'yyyy-MM-dd') : "選擇日期"}
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
    )
}
