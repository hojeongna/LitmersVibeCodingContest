import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { verifyFirebaseAuth } from '@/lib/firebase/auth-server'
import { getProjectStats } from '@/lib/dashboard/stats'
import { StatsCard } from '@/components/dashboard/stats-card'
import { IssuesByStatusChart } from '@/components/dashboard/status-pie-chart'
import { ProjectActivityChartWrapper } from '@/components/dashboard/project-activity-chart-wrapper'
import { CheckCircle2, ListTodo, Percent } from 'lucide-react'

export default async function ProjectDashboardPage({
    params,
    searchParams
}: {
    params: Promise<{ projectId: string }>,
    searchParams: Promise<{ period?: string }>
}) {
  const { projectId } = await params
  const { period: periodParam } = await searchParams
  const period = (periodParam === '30d' ? '30d' : '7d') as '7d' | '30d'

  const { user, error } = await verifyFirebaseAuth()

  if (error || !user) {
    redirect('/auth/login')
  }

  const supabase = createAdminClient()
  const { data: project } = await supabase
    .from('projects')
    .select('name, team_id')
    .eq('id', projectId)
    .single()
  
  if (!project) {
      return <div>Project not found</div>
  }

  const { data: membership } = await supabase
    .from('team_members')
    .select('id')
    .eq('team_id', project.team_id)
    .eq('user_id', user.uid)
    .single()
  
  if (!membership) {
      return <div>Access denied</div>
  }

  const stats = await getProjectStats(projectId, period)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">{project.name} 대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard 
            title="전체 이슈" 
            value={stats.progress.total} 
            icon={<ListTodo className="w-5 h-5" />}
        />
        <StatsCard 
            title="완료된 이슈" 
            value={stats.progress.completed} 
            icon={<CheckCircle2 className="w-5 h-5" />}
            variant="success"
        />
        <StatsCard 
            title="진행률" 
            value={stats.progress.percentage} 
            icon={<Percent className="w-5 h-5" />}
            trend={{ value: stats.progress.percentage, direction: 'neutral' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IssuesByStatusChart data={stats.issuesByStatus} />
        <ProjectActivityChartWrapper data={stats.activityTrend} period={period} />
      </div>
    </div>
  )
}
