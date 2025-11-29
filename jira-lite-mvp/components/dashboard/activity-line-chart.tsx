'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { CHART_COLORS } from '@/lib/dashboard/chart-colors'

interface ActivityTrendChartProps {
  data: Array<{
    date: string
    created: number
    completed: number
  }>
  period: '7d' | '30d'
  onPeriodChange: (period: '7d' | '30d') => void
}

export function ActivityTrendChart({
  data,
  period,
  onPeriodChange
}: ActivityTrendChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">활동 트렌드</CardTitle>
        <Tabs value={period} onValueChange={(v) => onPeriodChange(v as '7d' | '30d')}>
          <TabsList>
            <TabsTrigger value="7d">7일</TabsTrigger>
            <TabsTrigger value="30d">30일</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              stroke="#71717a"
              fontSize={12}
            />
            <YAxis stroke="#71717a" fontSize={12} />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString('ko-KR')}
              contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="created"
              name="생성"
              stroke={CHART_COLORS.trend.created}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.trend.created, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              name="완료"
              stroke={CHART_COLORS.trend.completed}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.trend.completed, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
