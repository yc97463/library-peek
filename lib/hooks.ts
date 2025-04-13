import useSWR from 'swr'

const fetchOptions = {
    cache: 'no-store' as RequestCache,
    headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    }
};

const fetcher = (url: string) => fetch(url, fetchOptions).then(res => res.json())

export function useDates() {
    return useSWR('/data/dates.json', fetcher, {
        refreshInterval: 3 * 60 * 1000 // 3 minutes
    })
}

export function useOccupancy(date?: string) {
    const { data, error, isLoading, mutate } = useSWR(date ? `/data/${date}.json` : null, fetcher, {
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
