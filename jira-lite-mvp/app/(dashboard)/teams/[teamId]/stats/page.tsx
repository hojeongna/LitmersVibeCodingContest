import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTeamStats } from '@/lib/dashboard/stats'
import { MemberStats } from '@/components/dashboard/member-stats'
import { ProjectActivityChartWrapper } from '@/components/dashboard/project-activity-chart-wrapper'

export default async function TeamStatsPage({ 
    params, 
    searchParams 
}: { 
    params: Promise<{ teamId: string }>,
    searchParams: Promise<{ period?: string }>
}) {
  const { teamId } = await params
  const { period: periodParam } = await searchParams
  const period = (periodParam === '30d' ? '30d' : '7d') as '7d' | '30d'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: team } = await supabase
    .from('teams')
    .select('name')
    .eq('id', teamId)
    .single()
  
  if (!team) {
      return <div>Team not found</div>
  }

  const { data: membership } = await supabase
    .from('team_members')
    .select('id')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .single()
  
  if (!membership) {
      return <div>Access denied</div>
  }

  const stats = await getTeamStats(teamId, period)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">{team.name} 팀 통계</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MemberStats members={stats.memberStats} />
        <ProjectActivityChartWrapper data={stats.activityTrend} period={period} />
      </div>
    </div>
  )
}
