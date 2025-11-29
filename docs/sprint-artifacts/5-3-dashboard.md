# Story 5.3: 대시보드

Status: drafted

## Story

As a **팀 멤버**,
I want **개인 및 프로젝트 대시보드에서 통계와 현황을 한눈에 볼 수 있도록**,
so that **내 업무 상태를 파악하고 프로젝트 진행 상황을 모니터링할 수 있다**.

## Acceptance Criteria

### AC-1: 개인 대시보드 (FR-080)
- [ ] 로그인 후 `/dashboard` 페이지 접근 가능
- [ ] 내 이슈 통계 카드:
  - In Progress 개수
  - Due Soon (7일 이내) 개수
  - Completed (최근 30일) 개수
- [ ] 마감 임박 이슈 목록 (Next 7 Days)
  - 이슈 키, 제목, 마감일, 프로젝트명
  - 오버듀 이슈 빨간색 강조
- [ ] 최근 활동 타임라인 (최대 10개)
- [ ] 이슈 클릭 시 해당 이슈로 이동

### AC-2: 프로젝트 대시보드 (FR-081)
- [ ] `/projects/[projectId]/dashboard` 페이지
- [ ] 프로젝트 진행률 표시 (완료/전체 %)
- [ ] 상태별 이슈 분포 차트 (Pie Chart 또는 Bar Chart)
- [ ] 우선순위별 이슈 분포

### AC-3: 팀 통계 (FR-082)
- [ ] `/teams/[teamId]/stats` 페이지
- [ ] 기간별 이슈 생성/완료 추이 (Line Chart)
- [ ] 기간 선택: 최근 7일 / 30일 / 90일
- [ ] 멤버별 담당 이슈 수

### AC-4: 차트 컴포넌트 (Recharts)
- [ ] 상태별 분포 Pie Chart
- [ ] 활동 트렌드 Line Chart
- [ ] 반응형 차트 (모바일 대응)
- [ ] 차트 색상 Linear Productivity 테마 적용

### AC-5: API Endpoints
- [ ] `GET /api/dashboard/personal` - 개인 통계
- [ ] `GET /api/projects/[projectId]/stats` - 프로젝트 통계
- [ ] `GET /api/teams/[teamId]/stats` - 팀 통계

## Tasks / Subtasks

### Task 1: 대시보드 통계 서비스
- [ ] 1.1 `lib/dashboard/stats.ts` 생성
- [ ] 1.2 개인 이슈 통계 쿼리 함수
- [ ] 1.3 프로젝트 진행률 계산 함수
- [ ] 1.4 기간별 트렌드 데이터 집계 함수

### Task 2: API Routes 구현
- [ ] 2.1 `app/api/dashboard/personal/route.ts`
- [ ] 2.2 `app/api/projects/[projectId]/stats/route.ts`
- [ ] 2.3 `app/api/teams/[teamId]/stats/route.ts`

### Task 3: 대시보드 UI 컴포넌트
- [ ] 3.1 `components/dashboard/stats-card.tsx` - 통계 카드
- [ ] 3.2 `components/dashboard/status-pie-chart.tsx` - 상태별 파이 차트
- [ ] 3.3 `components/dashboard/activity-line-chart.tsx` - 활동 트렌드
- [ ] 3.4 `components/dashboard/upcoming-deadlines.tsx` - 마감 임박 목록
- [ ] 3.5 `components/dashboard/member-stats.tsx` - 멤버별 통계

### Task 4: 대시보드 페이지 구현
- [ ] 4.1 `app/(dashboard)/dashboard/page.tsx` - 개인 대시보드
- [ ] 4.2 `app/(dashboard)/projects/[projectId]/dashboard/page.tsx`
- [ ] 4.3 `app/(dashboard)/teams/[teamId]/stats/page.tsx`

### Task 5: 차트 테마 적용
- [ ] 5.1 Recharts 커스텀 테마 설정
- [ ] 5.2 Linear Productivity 컬러 팔레트 적용
  - Primary: #5B5FC7
  - Accent: #3B82F6
  - Success: #22C55E
  - Warning: #F59E0B
  - Error: #EF4444

## Dev Notes

### 차트 컬러 팔레트

```typescript
// lib/dashboard/chart-colors.ts
export const CHART_COLORS = {
  statuses: {
    'Backlog': '#71717A',      // Zinc 500
    'In Progress': '#3B82F6',  // Blue
    'Review': '#8B5CF6',       // Violet
    'Done': '#22C55E',         // Green
  },
  priorities: {
    'HIGH': '#EF4444',         // Red
    'MEDIUM': '#F59E0B',       // Amber
    'LOW': '#22C55E',          // Green
  },
  trend: {
    created: '#5B5FC7',        // Primary
    completed: '#22C55E',      // Success
  }
}
```

### 통계 쿼리 예시

```typescript
// 개인 대시보드 통계
async function getPersonalStats(userId: string, teamId: string) {
  const { data: issues } = await supabase
    .from('issues')
    .select('id, status_id, due_date, statuses(name)')
    .eq('assignee_id', userId)
    .is('deleted_at', null)

  const inProgress = issues.filter(i => i.statuses.name === 'In Progress').length
  const dueSoon = issues.filter(i => {
    if (!i.due_date) return false
    const dueDate = new Date(i.due_date)
    const now = new Date()
    const diffDays = (dueDate - now) / (1000 * 60 * 60 * 24)
    return diffDays >= 0 && diffDays <= 7
  }).length

  return { inProgress, dueSoon, completed: ... }
}
```

### Stats Card 컴포넌트

```tsx
// components/dashboard/stats-card.tsx
interface StatsCardProps {
  title: string
  value: number
  icon: React.ReactNode
  trend?: { value: number; isUp: boolean }
  color: 'primary' | 'success' | 'warning' | 'error'
}

export function StatsCard({ title, value, icon, trend, color }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg border p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-500">{title}</div>
        <div className={`p-2 rounded-lg bg-${color}-50`}>{icon}</div>
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {trend && (
        <div className={`text-xs ${trend.isUp ? 'text-green-600' : 'text-red-600'}`}>
          {trend.isUp ? '↑' : '↓'} {trend.value}% from last week
        </div>
      )}
    </div>
  )
}
```

### 반응형 레이아웃

```tsx
// 대시보드 그리드
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <StatsCard ... />
  <StatsCard ... />
  <StatsCard ... />
</div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
  <StatusPieChart data={...} />
  <ActivityLineChart data={...} />
</div>
```

### References

- [Source: docs/prd.md#FR-080] - 프로젝트 대시보드 요구사항
- [Source: docs/prd.md#FR-081] - 개인 대시보드 요구사항
- [Source: docs/prd.md#FR-082] - 팀 통계 요구사항
- [Source: docs/architecture.md] - Recharts 사용 결정
- [Source: docs/ux-color-themes.html] - 차트 컬러 팔레트

## Dev Agent Record

### Context Reference
### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
