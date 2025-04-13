import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateSelectorProps {
    dates: string[]
    selected: string
    onSelect: (date: string) => void
}

export function DateSelector({ dates, selected, onSelect }: DateSelectorProps) {
    return (
        <Select value={selected} onValueChange={onSelect}>
            <SelectTrigger className="w-[180px] cursor-pointer">
                <SelectValue placeholder="選擇日期" />
            </SelectTrigger>
            <SelectContent>
                {dates.map((date: string) => (
                    <SelectItem key={date} value={date} className="cursor-pointer">{date}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
