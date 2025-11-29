import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getPersonalStats } from '@/lib/dashboard/stats'
import { StatsCard } from '@/components/dashboard/stats-card'
import { UpcomingDeadlines } from '@/components/dashboard/upcoming-deadlines'
import { CheckCircle2, Clock, AlertCircle, ListTodo } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: membership } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) {
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">대시보드</h1>
            <p>팀에 가입되어 있지 않습니다.</p>
        </div>
    )
  }

  const stats = await getPersonalStats(user.id, membership.team_id)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
            title="나의 이슈" 
            value={stats.myIssues.total} 
            icon={<ListTodo className="w-5 h-5" />}
        />
        <StatsCard 
            title="진행중" 
            value={stats.myIssues.inProgress} 
            icon={<Clock className="w-5 h-5" />}
            variant="default"
        />
        <StatsCard 
            title="마감 임박 (7일)" 
            value={stats.myIssues.dueSoon} 
            icon={<AlertCircle className="w-5 h-5" />}
            variant={stats.myIssues.dueSoon > 0 ? "warning" : "default"}
        />
        <StatsCard 
            title="완료 (전체)" 
            value={stats.myIssues.completed} 
            icon={<CheckCircle2 className="w-5 h-5" />}
            variant="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingDeadlines deadlines={stats.upcomingDeadlines} />
      </div>
    </div>
  )
}
