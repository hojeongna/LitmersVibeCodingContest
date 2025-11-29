import { createAdminClient } from '@/lib/supabase/admin'
import { NotificationType } from '@/types/notification'

export async function createNotification(data: {
  userId: string
  type: NotificationType
  title: string
  body?: string
  issueId?: string
  teamId?: string
  actorId?: string
}) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: data.userId,
      type: data.type,
      title: data.title,
      body: data.body,
      issue_id: data.issueId,
      team_id: data.teamId,
      actor_id: data.actorId,
    })

  if (error) {
      console.error('Failed to create notification:', error)
      // Don't throw error to prevent blocking the main action
  }
}

export async function markAsRead(notificationId: string, userId: string) {
    const supabase = createAdminClient()
    
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId) // Security check
    
    if (error) throw error
}

export async function markAllAsRead(userId: string) {
    const supabase = createAdminClient()
    
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)
    
    if (error) throw error
}

// Helper functions for specific events

export async function notifyAssignment(
  issueId: string,
  assigneeId: string,
  assignerId: string,
  teamId: string,
  issueTitle: string,
  assignerName?: string
) {
  if (assigneeId === assignerId) return

  await createNotification({
    userId: assigneeId,
    type: 'ASSIGNED',
    title: `${assignerName || 'Someone'} assigned you to an issue`,
    body: issueTitle,
    issueId,
    teamId,
    actorId: assignerId,
  })
}

export async function notifyComment(
    issueId: string,
    commenterId: string,
    issueOwnerId: string,
    assigneeId: string | null,
    teamId: string,
    commentBody: string,
    commenterName?: string
) {
    const recipients = new Set<string>()
    if (issueOwnerId !== commenterId) recipients.add(issueOwnerId)
    if (assigneeId && assigneeId !== commenterId) recipients.add(assigneeId)

    const promises = Array.from(recipients).map(userId => 
        createNotification({
            userId,
            type: 'COMMENTED',
            title: `${commenterName || 'Someone'} commented on an issue`,
            body: commentBody.length > 50 ? commentBody.substring(0, 50) + '...' : commentBody,
            issueId,
            teamId,
            actorId: commenterId
        })
    )

    await Promise.all(promises)
}
