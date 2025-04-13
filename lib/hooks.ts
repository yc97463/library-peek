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
    return useSWR(date ? `/data/${date}.json` : null, fetcher, {
        refreshInterval: (date && isLatestDate(date)) ? 3 * 60 * 1000 : 0 // Only auto-refresh for latest date
    })
}

// Helper to check if the date is the latest date
function isLatestDate(date: string): boolean {
    const today = new Date().toISOString().split('T')[0]
    return date === today
}
