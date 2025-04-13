import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateTrend(counts: number[]): number[] {
  return counts.map((_, i, arr) => {
    const window = arr.slice(Math.max(0, i - 2), Math.min(arr.length, i + 3))
    return window.reduce((a, b) => a + b, 0) / window.length
  })
}
