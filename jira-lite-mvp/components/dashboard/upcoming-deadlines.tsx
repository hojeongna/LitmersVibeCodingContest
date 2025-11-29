import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface UpcomingDeadlinesProps {
  deadlines: Array<{
    id: string
    key: string
    title: string
    due_date: string
    days_remaining: number
    is_overdue: boolean
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
    status: { name: string; color: string }
    project_name?: string
  }>
  projectId?: string
}

export function UpcomingDeadlines({ deadlines, projectId }: UpcomingDeadlinesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          마감 임박 이슈
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {deadlines.length === 0 ? (
            <p className="text-sm text-zinc-500 py-4 text-center">마감 임박한 이슈가 없습니다.</p>
          ) : (
            deadlines.map((issue) => (
              <div 
                key={issue.id} 
                className={cn(
                  "flex items-center justify-between p-3 rounded-md border border-transparent hover:bg-zinc-50 transition-colors",
                  issue.is_overdue && "bg-red-50/50 border-red-100 hover:bg-red-50"
                )}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-500 bg-zinc-100 px-1.5 rounded">
                      {issue.key}
                    </span>
                    <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]">
                      {issue.title}
                    </span>
                    {issue.is_overdue && (
                      <AlertCircle className="w-3 h-3 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>{issue.project_name}</span>
                    <span>•</span>
                    <span className={cn(
                        issue.is_overdue ? "text-red-600 font-medium" : "text-zinc-600"
                    )}>
                      {new Date(issue.due_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                   <Badge 
                    variant="outline" 
                    className={cn(
                        "whitespace-nowrap",
                        issue.is_overdue ? "bg-red-100 text-red-700 border-red-200" : 
                        issue.days_remaining <= 3 ? "bg-amber-100 text-amber-700 border-amber-200" :
                        "bg-green-100 text-green-700 border-green-200"
                    )}
                   >
                     {issue.is_overdue ? `Overdue ${Math.abs(issue.days_remaining)}d` : `D-${issue.days_remaining}`}
                   </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
