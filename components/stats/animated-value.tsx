import { motion, AnimatePresence } from "framer-motion"

export const AnimatedValue = ({ value, className = "" }: { value: number, className?: string }) => {
    return (
        <AnimatePresence mode="wait">
            <motion.span
                key={value}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className={className}
                transition={{
                    duration: 0.3,
                    type: "spring",
                    stiffness: 200,
                    damping: 20
                }}
            >
                {value}
            </motion.span>
        </AnimatePresence>
    )
}
