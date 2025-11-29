# Story 5.4: 알림 시스템

Status: drafted

## Story

As a **팀 멤버**,
I want **이슈 할당, 댓글, 마감일 등 중요한 이벤트에 대해 인앱 알림을 받을 수 있도록**,
so that **팀 활동을 실시간으로 파악하고 적시에 대응할 수 있다**.

## Acceptance Criteria

### AC-1: 알림 생성 트리거 (FR-090)
- [ ] 이슈 담당자 지정 시 담당자에게 알림
- [ ] 이슈에 댓글 작성 시 이슈 소유자/담당자에게 알림
- [ ] 마감일 임박 (D-1, D-day) 시 담당자에게 알림
- [ ] 팀 초대 시 초대 대상자에게 알림
- [ ] 이슈 상태 변경 시 담당자에게 알림

### AC-2: 알림 UI (FR-090)
- [ ] Header에 알림 벨 아이콘 표시
- [ ] 읽지 않은 알림 개수 배지 표시
- [ ] 벨 클릭 시 알림 드롭다운 표시
- [ ] 알림 목록 표시 (타입별 아이콘/색상)
- [ ] 읽음/안읽음 시각적 구분 (파란 점)
- [ ] "View All" 링크로 알림 센터 페이지 이동

### AC-3: 알림 센터 페이지
- [ ] `/notifications` 페이지
- [ ] 전체 알림 목록 (무한 스크롤)
- [ ] "Mark all as read" 버튼
- [ ] 알림 타입별 필터링 (선택)

### AC-4: 읽음 처리 (FR-091)
- [ ] 개별 알림 클릭 시 자동 읽음 처리
- [ ] 클릭 시 관련 이슈/팀으로 이동
- [ ] "모두 읽음" 버튼으로 일괄 처리

### AC-5: 실시간 알림 (Supabase Realtime)
- [ ] 새 알림 생성 시 실시간 업데이트
- [ ] 배지 카운트 자동 증가
- [ ] Toast 알림 표시 (선택)

### AC-6: API Endpoints
- [ ] `GET /api/notifications` - 알림 목록 (커서 페이지네이션)
- [ ] `PATCH /api/notifications/[id]/read` - 읽음 처리
- [ ] `POST /api/notifications/read-all` - 전체 읽음

### AC-7: notifications 테이블
- [ ] 마이그레이션 생성 및 적용
- [ ] RLS 정책 설정 (본인 알림만 조회 가능)
- [ ] Realtime 구독 활성화

## Tasks / Subtasks

### Task 1: DB 스키마 생성
- [ ] 1.1 `notifications` 테이블 마이그레이션 생성
  ```sql
  CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    issue_id UUID REFERENCES issues(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- [ ] 1.2 인덱스 생성 (user_id, read, created_at)
- [ ] 1.3 RLS 정책 적용

### Task 2: 알림 서비스 구현
- [ ] 2.1 `lib/notifications/service.ts` 생성
- [ ] 2.2 `createNotification()` 함수
- [ ] 2.3 `markAsRead()` 함수
- [ ] 2.4 `markAllAsRead()` 함수
- [ ] 2.5 알림 타입 enum 정의

### Task 3: API Routes
- [ ] 3.1 `app/api/notifications/route.ts` - GET (목록)
- [ ] 3.2 `app/api/notifications/[id]/read/route.ts` - PATCH
- [ ] 3.3 `app/api/notifications/read-all/route.ts` - POST

### Task 4: 알림 트리거 통합
- [ ] 4.1 이슈 생성/수정 API에 알림 트리거 추가
- [ ] 4.2 댓글 생성 API에 알림 트리거 추가
- [ ] 4.3 팀 초대 API에 알림 트리거 추가

### Task 5: UI 컴포넌트
- [ ] 5.1 `components/notifications/notification-bell.tsx`
- [ ] 5.2 `components/notifications/notification-dropdown.tsx`
- [ ] 5.3 `components/notifications/notification-item.tsx`
- [ ] 5.4 `components/notifications/notification-list.tsx`

### Task 6: 알림 센터 페이지
- [ ] 6.1 `app/(dashboard)/notifications/page.tsx`
- [ ] 6.2 무한 스크롤 구현
- [ ] 6.3 필터링 UI (선택)

### Task 7: Realtime 구독
- [ ] 7.1 `hooks/use-notifications.ts` 생성
- [ ] 7.2 Supabase Realtime 구독 설정
- [ ] 7.3 새 알림 시 상태 업데이트
- [ ] 7.4 연결 끊김 시 재연결 처리

## Dev Notes

### 알림 타입 정의

```typescript
// types/notification.ts
export type NotificationType =
  | 'ASSIGNED'        // 이슈 담당자 지정
  | 'COMMENTED'       // 댓글 작성
  | 'DUE_SOON'        // 마감일 임박
  | 'STATUS_CHANGED'  // 상태 변경
  | 'MENTIONED'       // 멘션 (v2)
  | 'TEAM_INVITE'     // 팀 초대

export const NOTIFICATION_CONFIG: Record<NotificationType, {
  icon: string
  color: string
  title: (actor?: string, target?: string) => string
}> = {
  ASSIGNED: {
    icon: 'UserPlus',
    color: '#5B5FC7',
    title: (actor) => `${actor}님이 이슈를 할당했습니다`
  },
  COMMENTED: {
    icon: 'MessageSquare',
    color: '#3B82F6',
    title: (actor) => `${actor}님이 댓글을 남겼습니다`
  },
  DUE_SOON: {
    icon: 'Clock',
    color: '#F59E0B',
    title: () => '마감일이 임박했습니다'
  },
  STATUS_CHANGED: {
    icon: 'ArrowRight',
    color: '#22C55E',
    title: (actor) => `${actor}님이 상태를 변경했습니다`
  },
  TEAM_INVITE: {
    icon: 'Users',
    color: '#8B5CF6',
    title: (actor) => `${actor}님이 팀에 초대했습니다`
  }
}
```

### Realtime 구독 훅

```typescript
// hooks/use-notifications.ts
export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // 초기 로드
    fetchNotifications()

    // Realtime 구독
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev])
          setUnreadCount(prev => prev + 1)
          // Toast 표시
          toast.info(payload.new.title)
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId])

  return { notifications, unreadCount, markAsRead, markAllAsRead }
}
```

### 알림 생성 유틸리티

```typescript
// lib/notifications/service.ts
export async function createNotification(data: {
  userId: string
  type: NotificationType
  title: string
  body?: string
  issueId?: string
  teamId: string
  actorId?: string
}) {
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

  if (error) throw error
}

// 이슈 할당 시 호출 예시
export async function notifyAssignment(
  issueId: string,
  assigneeId: string,
  assignerId: string,
  teamId: string,
  issueTitle: string
) {
  if (assigneeId === assignerId) return // 자기 자신에게 할당 시 알림 안함

  await createNotification({
    userId: assigneeId,
    type: 'ASSIGNED',
    title: '새 이슈가 할당되었습니다',
    body: issueTitle,
    issueId,
    teamId,
    actorId: assignerId,
  })
}
```

### 알림 벨 컴포넌트

```tsx
// components/notifications/notification-bell.tsx
export function NotificationBell() {
  const { unreadCount } = useNotifications(userId)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-zinc-100 rounded-lg relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && <NotificationDropdown onClose={() => setIsOpen(false)} />}
    </div>
  )
}
```

### References

- [Source: docs/prd.md#FR-090] - 인앱 알림 요구사항
- [Source: docs/prd.md#FR-091] - 읽음 처리 요구사항
- [Source: docs/sprint-artifacts/tech-spec-epic-5.md#FR-090] - 알림 AC
- [Source: docs/architecture.md] - Supabase Realtime 사용 결정
- [Source: docs/ux-color-themes.html] - 알림 타입별 색상

## Dev Agent Record

### Context Reference
### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
