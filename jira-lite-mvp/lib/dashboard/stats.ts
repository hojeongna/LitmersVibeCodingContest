import { createAdminClient } from '@/lib/supabase/admin'
import { CHART_COLORS } from '@/lib/dashboard/chart-colors'

export async function getPersonalStats(userId: string, teamId: string) {
  const supabase = createAdminClient()
  
  const { data: issues, error } = await supabase
    .from('issues')
    .select(`
      id, 
      status_id, 
      due_date, 
      priority,
      title,
      project_id,
      statuses!inner(name, color),
      projects!inner(name, team_id)
    `)
    .eq('assignee_id', userId)
    .is('deleted_at', null)

  if (error) throw error

  const teamIssues = issues.filter(i => i.projects.team_id === teamId)

  const total = teamIssues.length
  const inProgress = teamIssues.filter(i => !['Done', 'Closed'].includes(i.statuses.name)).length
  const completed = teamIssues.filter(i => ['Done', 'Closed'].includes(i.statuses.name)).length
  
  const now = new Date()
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const dueSoonIssues = teamIssues.filter(i => {
    if (!i.due_date) return false
    const dueDate = new Date(i.due_date)
    return dueDate >= now && dueDate <= sevenDaysLater && !['Done', 'Closed'].includes(i.statuses.name)
  })

  const dueSoonCount = dueSoonIssues.length

  const upcomingDeadlines = teamIssues
    .filter(i => {
        if (!i.due_date) return false
        const dueDate = new Date(i.due_date)
        return dueDate <= sevenDaysLater && !['Done', 'Closed'].includes(i.statuses.name)
    })
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 10)
    .map(i => {
        const dueDate = new Date(i.due_date!)
        const diffTime = dueDate.getTime() - now.getTime()
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        return {
            id: i.id,
            key: i.id.slice(0, 8),
            title: i.title,
            due_date: i.due_date!,
            days_remaining: daysRemaining,
            is_overdue: daysRemaining < 0,
            priority: i.priority,
            status: { name: i.statuses.name, color: i.statuses.color || '#ccc' },
            project_name: i.projects.name
        }
    })

  return {
    myIssues: {
      total,
      inProgress,
      completed,
      dueSoon: dueSoonCount
    },
    upcomingDeadlines
  }
}

export async function getProjectStats(projectId: string, period: '7d' | '30d' = '7d') {
    const supabase = createAdminClient()

    // 1. Progress & Status Distribution
    const { data: issues, error } = await supabase
        .from('issues')
        .select(`
            id,
            status_id,
            priority,
            created_at,
            statuses!inner(name, color, position)
        `)
        .eq('project_id', projectId)
        .is('deleted_at', null)

    if (error) throw error

    const total = issues.length
    const completed = issues.filter(i => ['Done', 'Closed'].includes(i.statuses.name)).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    // Group by status
    const statusMap = new Map<string, { status: string, color: string, count: number, position: number }>()
    issues.forEach(i => {
        const { name, color, position } = i.statuses
        if (!statusMap.has(name)) {
            statusMap.set(name, { 
                status: name, 
                color: CHART_COLORS.statuses[name as keyof typeof CHART_COLORS.statuses] || color || '#ccc', 
                count: 0, 
                position 
            })
        }
        statusMap.get(name)!.count++
    })
    const issuesByStatus = Array.from(statusMap.values()).sort((a, b) => a.position - b.position)

    // Group by priority
    const priorityMap = new Map<string, number>()
    issues.forEach(i => {
        const p = i.priority || 'MEDIUM'
        priorityMap.set(p, (priorityMap.get(p) || 0) + 1)
    })
    const issuesByPriority = Array.from(priorityMap.entries()).map(([priority, count]) => ({
        priority: priority as 'HIGH' | 'MEDIUM' | 'LOW',
        count
    }))

    // 2. Activity Trend
    const days = period === '7d' ? 7 : 30
    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - days + 1)
    startDate.setHours(0, 0, 0, 0)

    // Fetch Done/Closed status IDs
    const { data: doneStatuses } = await supabase
        .from('statuses')
        .select('id')
        .eq('project_id', projectId)
        .in('name', ['Done', 'Closed'])
    
    const doneStatusIds = doneStatuses?.map(s => s.id) || []

    // Fetch history for completion trend
    const { data: history } = await supabase
        .from('issue_history')
        .select('created_at, new_value, issue_id, issues!inner(project_id)')
        .eq('issues.project_id', projectId)
        .eq('field_name', 'status')
        .gte('created_at', startDate.toISOString())
    
    const activityTrend = []
    for (let i = 0; i < days; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        const nextDate = new Date(date)
        nextDate.setDate(date.getDate() + 1)

        // Created count
        const createdCount = issues.filter(issue => {
            const created = new Date(issue.created_at)
            return created >= date && created < nextDate
        }).length

        // Completed count
        const completedCount = history?.filter(h => {
            const hDate = new Date(h.created_at)
            return hDate >= date && hDate < nextDate && doneStatusIds.includes(h.new_value || '')
        }).length || 0

        activityTrend.push({
            date: dateStr,
            created: createdCount,
            completed: completedCount
        })
    }

    return {
        progress: { total, completed, percentage },
        issuesByStatus,
        issuesByPriority,
        activityTrend
    }
}

export async function getTeamStats(teamId: string, period: '7d' | '30d' | '90d' = '7d') {
    const supabase = createAdminClient()
    
    // Member stats
    const { data: members } = await supabase
        .from('team_members')
        .select(`
            user_id,
            profiles(name, avatar_url)
        `)
        .eq('team_id', teamId)
    
    const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('team_id', teamId)
    
    const projectIds = projects?.map(p => p.id) || []
    
    const memberStats = []
    if (members && projectIds.length > 0) {
        for (const member of members) {
             const { count } = await supabase
                .from('issues')
                .select('*', { count: 'exact', head: true })
                .eq('assignee_id', member.user_id)
                .in('project_id', projectIds)
                .is('deleted_at', null)
             
             memberStats.push({
                 user_id: member.user_id,
                 name: member.profiles?.name,
                 avatar_url: member.profiles?.avatar_url,
                 issue_count: count || 0
             })
        }
    }

    // Team Activity Trend
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - days + 1)
    startDate.setHours(0, 0, 0, 0)

    // Fetch Done/Closed status IDs for all projects in team
    const { data: doneStatuses } = await supabase
        .from('statuses')
        .select('id')
        .in('project_id', projectIds)
        .in('name', ['Done', 'Closed'])
    
    const doneStatusIds = doneStatuses?.map(s => s.id) || []

    // Fetch history for completion trend
    const { data: history } = await supabase
        .from('issue_history')
        .select('created_at, new_value, issue_id, issues!inner(project_id)')
        .in('issues.project_id', projectIds)
        .eq('field_name', 'status')
        .gte('created_at', startDate.toISOString())
    
    // Fetch created issues
    const { data: createdIssues } = await supabase
        .from('issues')
        .select('created_at')
        .in('project_id', projectIds)
        .gte('created_at', startDate.toISOString())
        .is('deleted_at', null)

    const activityTrend = []
    for (let i = 0; i < days; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        const nextDate = new Date(date)
        nextDate.setDate(date.getDate() + 1)

        // Created count
        const createdCount = createdIssues?.filter(issue => {
            const created = new Date(issue.created_at)
            return created >= date && created < nextDate
        }).length || 0

        // Completed count
        const completedCount = history?.filter(h => {
            const hDate = new Date(h.created_at)
            return hDate >= date && hDate < nextDate && doneStatusIds.includes(h.new_value || '')
        }).length || 0

        activityTrend.push({
            date: dateStr,
            created: createdCount,
            completed: completedCount
        })
    }
    
    return { memberStats, activityTrend }
}
