'use client'

import { useRouter } from 'next/navigation'
import { ActivityTrendChart } from './activity-line-chart'

interface WrapperProps {
    data: any[]
    period: '7d' | '30d'
}

export function ProjectActivityChartWrapper({ data, period }: WrapperProps) {
    const router = useRouter()
    
    const handlePeriodChange = (newPeriod: '7d' | '30d') => {
        const searchParams = new URLSearchParams(window.location.search)
        searchParams.set('period', newPeriod)
        router.push(`?${searchParams.toString()}`)
    }

    return <ActivityTrendChart data={data} period={period} onPeriodChange={handlePeriodChange} />
}
