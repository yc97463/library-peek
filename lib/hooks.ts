import useSWR from 'swr'

const fetchOptions = {
    cache: 'no-store' as RequestCache,
    headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    }
};

// 獲取基礎路徑
const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://library-peek.deershark-tech.workers.dev/api';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const fetcher = (url: string) => fetch(`${basePath}${url}`, fetchOptions).then(res => res.json())

export function useDates() {
    return useSWR('/dates', fetcher, {
        refreshInterval: 3 * 60 * 1000 // 3 minutes
    })
}

export function useOccupancy(date?: string) {
    const { data, error, isLoading, mutate } = useSWR(date ? `/daily?date=${date}` : null, fetcher, {
        refreshInterval: (date && isLatestDate(date)) ? 3 * 60 * 1000 : 0,
        fallbackData: [], // 提供初始數據
        revalidateOnMount: true, // 確保組件掛載時立即獲取數據
    })

    return {
        data: data || [],
        error,
        isLoading,
        mutate
    }
}

// Helper to check if the date is the latest date
function isLatestDate(date: string): boolean {
    const today = new Date().toISOString().split('T')[0]
    return date === today
}
