import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number
  icon?: React.ReactNode
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
  }
  variant?: 'default' | 'warning' | 'success'
  onClick?: () => void
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  variant = 'default',
  onClick
}: StatsCardProps) {
  const variantStyles = {
    default: 'bg-white',
    warning: 'bg-amber-50 border-amber-200',
    success: 'bg-green-50 border-green-200'
  }

  const TrendIcon = trend?.direction === 'up'
    ? ArrowUp
    : trend?.direction === 'down'
    ? ArrowDown
    : Minus

  return (
    <Card
      className={cn(
        'cursor-pointer hover:shadow-md transition-shadow',
        variantStyles[variant]
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {trend && (
              <div className={cn(
                'flex items-center text-sm mt-2',
                trend.direction === 'up' && 'text-green-600',
                trend.direction === 'down' && 'text-red-600',
                trend.direction === 'neutral' && 'text-zinc-500'
              )}>
                <TrendIcon className="w-4 h-4 mr-1" />
                <span>{trend.value}%</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="text-zinc-400">{icon}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
