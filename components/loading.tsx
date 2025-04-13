import { motion } from "motion/react"
import { BookOpen } from "lucide-react"

export function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center gap-4">
            <motion.div
                animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1],
                    opacity: [1, 0.8, 1],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <BookOpen className="h-8 w-8 text-primary" />
            </motion.div>
            <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-sm text-muted-foreground gap-2"
            >
                載入人數資料中
                <span className="absolute">⋯</span>
            </motion.span>
        </div>
    )
}
