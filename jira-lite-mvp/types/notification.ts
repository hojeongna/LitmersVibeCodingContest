export type NotificationType =
  | 'ASSIGNED'        // 이슈 담당자 지정
  | 'COMMENTED'       // 댓글 작성
  | 'DUE_SOON'        // 마감일 임박
  | 'STATUS_CHANGED'  // 상태 변경
  | 'MENTIONED'       // 멘션 (v2)
  | 'TEAM_INVITE'     // 팀 초대

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body?: string
  issue_id?: string
  team_id?: string
  actor_id?: string
  read: boolean
  created_at: string
  actor?: {
    name: string
    avatar_url: string | null
  }
  issue?: {
      title: string
      project_id: string
  }
}

export const NOTIFICATION_CONFIG: Record<NotificationType, {
  icon: string
  color: string
  title: (actor?: string) => string
}> = {
  ASSIGNED: {
    icon: 'UserPlus',
    color: '#5B5FC7',
    title: (actor) => `${actor || 'Someone'} assigned you to an issue`
  },
  COMMENTED: {
    icon: 'MessageSquare',
    color: '#3B82F6',
    title: (actor) => `${actor || 'Someone'} commented on your issue`
  },
  DUE_SOON: {
    icon: 'Clock',
    color: '#F59E0B',
    title: () => 'Issue due soon'
  },
  STATUS_CHANGED: {
    icon: 'ArrowRight',
    color: '#22C55E',
    title: (actor) => `${actor || 'Someone'} changed issue status`
  },
  TEAM_INVITE: {
    icon: 'Users',
    color: '#8B5CF6',
    title: (actor) => `${actor || 'Someone'} invited you to a team`
  },
  MENTIONED: {
      icon: 'AtSign',
      color: '#EC4899',
      title: (actor) => `${actor || 'Someone'} mentioned you`
  }
}
