import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsCardProps {
    title: string
    value: React.ReactNode
    extra?: React.ReactNode
    className?: string
    icon?: React.ReactNode
}

export function StatsCard({
    title,
    value,
    extra,
    className = "",
    icon
}: StatsCardProps) {
    return (
        <Card className={`relative overflow-hidden ${className}`}>
            {icon && (
                <div className="absolute -right-2 -bottom-[32px]">
                    <div className="h-36 w-36">
                        {icon}
                    </div>
                </div>
            )}
            <div className="relative">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    {extra}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{value}</div>
                </CardContent>
            </div>
        </Card>
    )
}
