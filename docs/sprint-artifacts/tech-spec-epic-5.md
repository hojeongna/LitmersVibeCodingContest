# Epic Technical Specification: AI & 대시보드 & 알림

Date: 2025-11-29
Author: hojeong
Epic ID: 5
Status: Draft

---

## Overview

Epic 5는 Jira Lite MVP의 AI 기능, 대시보드 통계, 알림 시스템을 구현합니다. 이 Epic은 사용자 경험을 한층 향상시키는 핵심 기능들을 포함합니다:

1. **AI 기능 (FR-040~045)**: OpenAI GPT-5-nano를 활용한 이슈 자동 요약, 라벨 제안, 우선순위 추천, 중복 탐지, 댓글 요약 기능
2. **대시보드 & 통계 (FR-080~082)**: 개인 대시보드, 프로젝트 통계, 차트 시각화
3. **알림 시스템 (FR-090~091)**: 인앱 알림, 이메일 알림 (Resend)

**관련 FR**: FR-040, FR-041, FR-042, FR-043, FR-044, FR-045, FR-080, FR-081, FR-082, FR-090, FR-091

**예상 스토리 수**: 11개 (각 FR당 1개)

**Epic 우선순위**: P3 (핵심 MVF 완료 후)

## Objectives and Scope

### 목표 (Objectives)

1. **AI 자동화로 생산성 향상**
   - 이슈 내용을 AI가 자동 요약하여 빠른 파악 지원
   - 라벨/우선순위 자동 제안으로 분류 시간 단축
   - 중복 이슈 자동 탐지로 관리 효율화

2. **데이터 기반 의사결정 지원**
   - 개인 대시보드로 내 업무 현황 파악
   - 프로젝트 진행률/통계 시각화
   - 마감 임박 이슈 강조

3. **실시간 협업 강화**
   - 인앱 알림으로 즉각적인 변경 감지
   - 이메일 알림으로 오프라인 사용자 커버

### 범위 (Scope)

**In Scope:**
- AI 기능 (요약, 라벨 제안, 우선순위 추천, 중복 탐지, 댓글 요약)
- 개인 대시보드 (내 이슈 현황, 마감 임박)
- 프로젝트 통계 (진행률, 상태별 분포)
- 인앱 알림 센터
- 이메일 알림 (Resend 통합)

**Out of Scope:**
- 슬랙/디스코드 연동 (v2)
- AI 학습/튜닝 (사전 학습 모델 사용)
- 고급 리포팅/BI 기능 (v2)
- 푸시 알림 (모바일 앱 없음)

## System Architecture Alignment

### 아키텍처 준수사항

Epic 5는 기존 아키텍처 결정사항을 준수합니다:

| ADR | 결정 내용 | Epic 5 적용 |
|-----|----------|------------|
| ADR-001 | Next.js App Router | AI/대시보드/알림 모두 App Router 사용 |
| ADR-002 | Supabase Auth | 인증 상태 활용 (알림 수신자 식별) |
| ADR-003 | Supabase Realtime | 인앱 알림 실시간 업데이트 |
| ADR-005 | API Route Handlers | AI/알림 API는 Route Handler로 구현 |
| ADR-006 | Server-Side OpenAI | AI 호출은 서버에서만 (API key 보호) |

### 시스템 컴포넌트 맵핑

```
┌─────────────────────────────────────────────────────────────────┐
│                     Epic 5 Components                           │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Next.js App Router)                                  │
│  ├── app/(dashboard)/ai/         # AI 기능 UI                   │
│  ├── app/(dashboard)/dashboard/  # 대시보드 페이지               │
│  ├── components/ai/              # AI 관련 컴포넌트              │
│  ├── components/dashboard/       # 대시보드 컴포넌트             │
│  └── components/notifications/   # 알림 컴포넌트                 │
├─────────────────────────────────────────────────────────────────┤
│  API Routes                                                     │
│  ├── app/api/ai/summary/         # AI 요약 API                  │
│  ├── app/api/ai/suggest/         # AI 제안 API                  │
│  ├── app/api/ai/duplicate/       # 중복 탐지 API                │
│  ├── app/api/dashboard/          # 대시보드 통계 API             │
│  └── app/api/notifications/      # 알림 CRUD API                │
├─────────────────────────────────────────────────────────────────┤
│  Backend Services                                               │
│  ├── lib/openai.ts              # OpenAI 클라이언트              │
│  ├── lib/resend.ts              # Resend 이메일 클라이언트        │
│  └── lib/notifications.ts       # 알림 유틸리티                  │
├─────────────────────────────────────────────────────────────────┤
│  Supabase                                                       │
│  ├── notifications 테이블        # 알림 저장                     │
│  ├── ai_cache 테이블 (선택)      # AI 결과 캐싱                   │
│  └── Realtime subscription       # 알림 실시간 구독              │
└─────────────────────────────────────────────────────────────────┘
```

### 기존 테이블 활용

- `issues`: AI 요약/라벨 결과 저장 (ai_summary, ai_labels 컬럼 추가)
- `comments`: 댓글 요약 대상
- `team_members`: 알림 권한 확인
- `notifications`: 신규 테이블

## Detailed Design

### Services and Modules

#### 1. AI Service Module (`lib/ai/`)

```typescript
// lib/ai/openai-client.ts
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export { openai }

// lib/ai/prompts.ts - AI 프롬프트 템플릿
export const PROMPTS = {
  ISSUE_SUMMARY: `...(이슈 요약 프롬프트)`,
  LABEL_SUGGEST: `...(라벨 제안 프롬프트)`,
  PRIORITY_SUGGEST: `...(우선순위 제안 프롬프트)`,
  DUPLICATE_DETECT: `...(중복 탐지 프롬프트)`,
  COMMENT_SUMMARY: `...(댓글 요약 프롬프트)`,
}

// lib/ai/rate-limiter.ts - Rate Limit 관리
export class AIRateLimiter {
  // 분당 10회, 일당 100회 제한 (PRD FR-043)
  async checkLimit(userId: string): Promise<boolean>
  async recordUsage(userId: string): Promise<void>
}
```

**책임**:
- OpenAI API 통신 추상화
- 프롬프트 관리 및 버전 관리
- Rate Limiting (분당 10회, 일당 100회)
- 에러 핸들링 및 재시도 로직

#### 2. Dashboard Service Module (`lib/dashboard/`)

```typescript
// lib/dashboard/stats.ts
export interface DashboardStats {
  myIssues: {
    inProgress: number
    dueSoon: number
    completed: number
  }
  projectProgress: {
    percentage: number
    completed: number
    total: number
  }
  issuesByStatus: { status: string; count: number }[]
  upcomingDeadlines: Issue[]
}

export async function getPersonalDashboard(userId: string, teamId: string): Promise<DashboardStats>
export async function getProjectStats(projectId: string): Promise<ProjectStats>
```

**책임**:
- 개인/프로젝트 통계 집계
- 차트 데이터 포맷팅
- 마감 임박 이슈 계산

#### 3. Notification Service Module (`lib/notifications/`)

```typescript
// lib/notifications/service.ts
export interface Notification {
  id: string
  user_id: string
  type: 'ASSIGNED' | 'COMMENTED' | 'DUE_SOON' | 'STATUS_CHANGED' | 'MENTIONED'
  title: string
  body: string
  issue_id?: string
  read: boolean
  created_at: string
}

export async function createNotification(data: CreateNotificationInput): Promise<Notification>
export async function markAsRead(notificationId: string, userId: string): Promise<void>
export async function markAllAsRead(userId: string): Promise<void>

// lib/notifications/email.ts - Resend 통합
import { Resend } from 'resend'

export async function sendEmailNotification(
  to: string,
  type: NotificationType,
  data: NotificationData
): Promise<void>
```

**책임**:
- 알림 생성/조회/읽음 처리
- 이메일 발송 (Resend)
- Supabase Realtime 트리거

### Data Models and Contracts

#### 1. notifications 테이블 (신규)

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ASSIGNED', 'COMMENTED', 'DUE_SOON', 'STATUS_CHANGED', 'MENTIONED', 'TEAM_INVITE')),
  title TEXT NOT NULL,
  body TEXT,
  issue_id UUID REFERENCES issues(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- RLS 정책
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);  -- API Route에서만 호출

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);
```

#### 2. issues 테이블 확장 (AI 결과 저장)

```sql
-- 기존 issues 테이블에 컬럼 추가
ALTER TABLE issues ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS ai_labels JSONB DEFAULT '[]';
ALTER TABLE issues ADD COLUMN IF NOT EXISTS ai_priority TEXT;
ALTER TABLE issues ADD COLUMN IF NOT EXISTS ai_generated_at TIMESTAMPTZ;
```

#### 3. ai_usage 테이블 (Rate Limiting)

```sql
CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,  -- 'summary', 'suggest', 'duplicate', 'comment_summary'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 (분당/일당 카운트용)
CREATE INDEX idx_ai_usage_user_time ON ai_usage(user_id, created_at DESC);
```

#### 4. TypeScript Types

```typescript
// types/notification.ts
export type NotificationType =
  | 'ASSIGNED'
  | 'COMMENTED'
  | 'DUE_SOON'
  | 'STATUS_CHANGED'
  | 'MENTIONED'
  | 'TEAM_INVITE'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  issue_id: string | null
  team_id: string
  actor_id: string | null
  actor?: { name: string; avatar_url: string | null }
  issue?: { key: string; title: string }
  read: boolean
  email_sent: boolean
  created_at: string
}

// types/ai.ts
export interface AISuggestion {
  labels: string[]
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  confidence: number
}

export interface AIDuplicateResult {
  duplicates: {
    issue_id: string
    issue_key: string
    title: string
    similarity: number
  }[]
}

// types/dashboard.ts
export interface DashboardStats {
  myIssues: {
    inProgress: number
    dueSoon: number
    completed: number
  }
  projectProgress: {
    percentage: number
    completed: number
    total: number
  }
  issuesByStatus: Array<{ status: string; count: number }>
  activityTrend: Array<{ date: string; created: number; completed: number }>
  upcomingDeadlines: Array<{
    id: string
    key: string
    title: string
    due_date: string
    is_overdue: boolean
  }>
}
```

### APIs and Interfaces

#### AI APIs

##### POST /api/ai/summary
**설명**: 이슈 내용을 AI로 요약 (FR-040)

```typescript
// Request
{
  issue_id: string
}

// Response (Success)
{
  success: true,
  data: {
    summary: string,
    generated_at: string
  }
}

// Response (Error)
{
  success: false,
  error: {
    code: 'RATE_LIMIT_EXCEEDED' | 'DESCRIPTION_TOO_SHORT' | 'AI_ERROR',
    message: string
  }
}
```

**Rate Limit**: 분당 10회, 일당 100회
**제약조건**: description 10자 이상

##### POST /api/ai/suggest
**설명**: 라벨/우선순위 자동 제안 (FR-041, FR-042)

```typescript
// Request
{
  issue_id: string,
  suggest_type: 'labels' | 'priority' | 'both'
}

// Response
{
  success: true,
  data: {
    labels?: string[],
    priority?: 'LOW' | 'MEDIUM' | 'HIGH',
    confidence: number
  }
}
```

##### POST /api/ai/duplicate
**설명**: 중복 이슈 탐지 (FR-044)

```typescript
// Request
{
  issue_id: string,
  project_id: string
}

// Response
{
  success: true,
  data: {
    duplicates: Array<{
      issue_id: string,
      issue_key: string,
      title: string,
      similarity: number  // 0-1
    }>
  }
}
```

##### POST /api/ai/comment-summary
**설명**: 댓글 스레드 요약 (FR-045)

```typescript
// Request
{
  issue_id: string
}

// Response
{
  success: true,
  data: {
    summary: string,
    comment_count: number,
    key_points: string[]
  }
}
```

#### Dashboard APIs

##### GET /api/dashboard/personal
**설명**: 개인 대시보드 통계 (FR-080)

```typescript
// Query Params
?team_id=uuid

// Response
{
  success: true,
  data: {
    myIssues: {
      inProgress: number,
      dueSoon: number,
      completed: number
    },
    upcomingDeadlines: Issue[]
  }
}
```

##### GET /api/dashboard/project/:projectId
**설명**: 프로젝트 통계 (FR-081, FR-082)

```typescript
// Response
{
  success: true,
  data: {
    progress: {
      percentage: number,
      completed: number,
      total: number
    },
    issuesByStatus: Array<{ status: string, count: number }>,
    issuesByPriority: Array<{ priority: string, count: number }>,
    activityTrend: Array<{ date: string, created: number, completed: number }>
  }
}
```

#### Notification APIs

##### GET /api/notifications
**설명**: 알림 목록 조회 (FR-090)

```typescript
// Query Params
?unread_only=boolean&limit=number&cursor=string

// Response
{
  success: true,
  data: {
    notifications: Notification[],
    unread_count: number,
    next_cursor: string | null
  }
}
```

##### PATCH /api/notifications/:id/read
**설명**: 알림 읽음 처리

```typescript
// Response
{ success: true }
```

##### POST /api/notifications/read-all
**설명**: 모든 알림 읽음 처리

```typescript
// Response
{
  success: true,
  data: { updated_count: number }
}
```

##### POST /api/notifications/test-email
**설명**: 이메일 알림 테스트 (개발용)

```typescript
// Request
{
  type: NotificationType,
  email: string
}
```

### Workflows and Sequencing

#### 1. AI 요약 생성 워크플로우

```
사용자                    Frontend                  API Route              OpenAI
  │                         │                         │                      │
  ├── "AI 요약" 버튼 클릭 ───▶│                         │                      │
  │                         ├── POST /api/ai/summary ─▶│                      │
  │                         │                         ├── Rate Limit 확인 ───│
  │                         │                         │   (분당 10회)          │
  │                         │                         │◀── OK ────────────────┤
  │                         │                         ├── description 검증 ───│
  │                         │                         │   (10자 이상)          │
  │                         │                         ├── ChatCompletion ────▶│
  │                         │                         │◀── summary ───────────┤
  │                         │                         ├── DB 저장             │
  │                         │                         │   (ai_summary 업데이트)│
  │                         │◀── { summary } ──────────┤                      │
  │◀── AI 요약 표시 ─────────┤                         │                      │
```

#### 2. 알림 생성 워크플로우 (이슈 할당 시)

```
API (이슈 업데이트)          Notification Service       Supabase            Resend
  │                              │                        │                   │
  ├── assignee 변경 감지 ────────▶│                        │                   │
  │                              ├── notifications INSERT ▶│                   │
  │                              │                        ├── Realtime 전파 ──│
  │                              │                        │   (구독 클라이언트)  │
  │                              ├── 이메일 발송 여부 확인 ──│                   │
  │                              │   (사용자 설정 기반)      │                   │
  │                              ├── sendEmail ─────────────────────────────▶│
  │                              │◀── 발송 완료 ─────────────────────────────┤
  │                              ├── email_sent = true ───▶│                   │
```

#### 3. 실시간 알림 구독 워크플로우

```typescript
// Frontend: 알림 실시간 구독
useEffect(() => {
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
        // 새 알림 추가
        addNotification(payload.new)
        // 읽지 않은 개수 증가
        incrementUnreadCount()
        // Toast 표시
        showNotificationToast(payload.new)
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [userId])
```

#### 4. 대시보드 데이터 로딩 시퀀스

```
Dashboard Page Load
       │
       ├──▶ GET /api/dashboard/personal (병렬)
       │         └── 내 이슈 통계
       │         └── 마감 임박 이슈
       │
       ├──▶ GET /api/dashboard/project/:id (병렬)
       │         └── 프로젝트 진행률
       │         └── 상태별 분포
       │         └── 활동 트렌드
       │
       └── 모든 응답 완료 후 렌더링
```

#### 5. 중복 탐지 워크플로우

```
이슈 생성 폼                     API                    OpenAI
     │                           │                        │
     ├── 제목/설명 입력 ──────────▶│                        │
     │   (debounce 500ms)         │                        │
     │                           ├── 기존 이슈 조회 ────────│
     │                           │   (같은 프로젝트)        │
     │                           ├── Embedding 비교 ──────▶│
     │                           │◀── 유사도 점수 ──────────┤
     │                           │   (threshold: 0.8)      │
     │◀── 중복 의심 이슈 표시 ─────┤                        │
     │   (유사도 80% 이상)        │                        │
```

## Non-Functional Requirements

### Performance

| 항목 | 목표 | 구현 방법 |
|------|------|----------|
| AI 응답 시간 | < 5초 (P95) | GPT-5-nano 사용, 스트리밍 응답 |
| 대시보드 로딩 | < 2초 (P95) | 병렬 데이터 페칭, 캐싱 |
| 알림 목록 | < 500ms (P95) | 인덱스 최적화, 커서 페이지네이션 |
| 실시간 알림 전달 | < 1초 | Supabase Realtime |
| 이메일 발송 | < 3초 | Resend 비동기 발송 |

**최적화 전략:**
- AI 결과 캐싱 (동일 이슈 재요청 시)
- 대시보드 통계 캐싱 (5분 TTL)
- 알림 배치 처리 (벌크 INSERT)

### Security

| 위협 | 대응 방법 |
|------|----------|
| API Key 노출 | 서버 사이드에서만 OpenAI 호출 |
| 과도한 AI 사용 | Rate Limiting (분당 10회, 일당 100회) |
| 알림 권한 우회 | RLS 정책으로 본인 알림만 조회 가능 |
| 이메일 스푸핑 | Resend 인증 도메인 사용 |
| 프롬프트 인젝션 | 사용자 입력 sanitize, 구조화된 프롬프트 |

```typescript
// AI Rate Limiting 구현
const LIMITS = {
  PER_MINUTE: 10,
  PER_DAY: 100
}

async function checkRateLimit(userId: string): Promise<boolean> {
  const now = new Date()
  const oneMinuteAgo = new Date(now.getTime() - 60000)
  const oneDayAgo = new Date(now.getTime() - 86400000)

  const [minuteCount, dayCount] = await Promise.all([
    supabase.from('ai_usage')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', oneMinuteAgo.toISOString()),
    supabase.from('ai_usage')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', oneDayAgo.toISOString())
  ])

  return minuteCount.count! < LIMITS.PER_MINUTE &&
         dayCount.count! < LIMITS.PER_DAY
}
```

### Reliability/Availability

| 시나리오 | 대응 방법 |
|---------|----------|
| OpenAI API 장애 | Fallback 메시지 표시, 재시도 버튼 제공 |
| Resend 장애 | 이메일 실패 로깅, 나중에 재발송 큐 |
| Supabase Realtime 연결 끊김 | 자동 재연결, polling fallback |
| 높은 부하 | AI 요청 큐잉, 우선순위 처리 |

```typescript
// OpenAI 호출 재시도 로직
async function callOpenAIWithRetry(
  prompt: string,
  maxRetries = 3
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',  // 또는 GPT-5-nano
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        timeout: 10000,
      })
      return response.choices[0].message.content!
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await sleep(1000 * (i + 1))  // Exponential backoff
    }
  }
  throw new Error('Max retries exceeded')
}
```

### Observability

| 항목 | 구현 |
|------|------|
| AI 사용 로깅 | ai_usage 테이블 (사용자별 추적) |
| 에러 트래킹 | console.error + Vercel 로그 |
| 성능 모니터링 | API 응답 시간 로깅 |
| 알림 전달 추적 | notifications.email_sent 플래그 |

```typescript
// AI 호출 로깅
async function logAIUsage(
  userId: string,
  actionType: string,
  issueId: string,
  success: boolean,
  durationMs: number
) {
  await supabase.from('ai_usage').insert({
    user_id: userId,
    action_type: actionType,
    issue_id: issueId,
    success,
    duration_ms: durationMs,
  })
}
```

## Dependencies and Integrations

### 외부 서비스 의존성

| 서비스 | 용도 | 설정 필요 |
|--------|------|----------|
| **OpenAI API** | AI 요약/제안/중복탐지 | `OPENAI_API_KEY` 환경변수 |
| **Resend** | 이메일 발송 | `RESEND_API_KEY` 환경변수 |
| **Supabase Realtime** | 실시간 알림 | 기존 Supabase 프로젝트 활용 |

### 환경변수 추가

```bash
# .env.local (신규 추가)
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=notifications@jiralite.app
```

### 라이브러리 의존성

```json
// package.json (이미 설치됨)
{
  "dependencies": {
    "openai": "^6.9.1",
    "resend": "^6.5.2",
    "recharts": "^3.5.1"  // 대시보드 차트
  }
}
```

### 내부 의존성 (선행 Epic)

| Epic | 의존성 | 필요 사항 |
|------|--------|----------|
| Epic 1 | 인증 시스템 | 사용자 ID로 알림 수신자 식별 |
| Epic 2 | 팀/프로젝트 | 프로젝트별 통계, 팀 알림 범위 |
| Epic 3 | 이슈 CRUD | AI 요약 대상, 통계 데이터 소스 |
| Epic 4 | 칸반/검색 | 상태별 통계, 검색 기반 중복 탐지 |

### 통합 포인트

```typescript
// 1. 이슈 생성 시 알림 트리거
// app/api/issues/route.ts
export async function POST(request: Request) {
  const issue = await createIssue(data)

  // 담당자 할당 시 알림 생성
  if (issue.assignee_id) {
    await createNotification({
      user_id: issue.assignee_id,
      type: 'ASSIGNED',
      title: 'Issue assigned to you',
      body: `${issue.key}: ${issue.title}`,
      issue_id: issue.id,
      team_id: issue.team_id,
      actor_id: currentUser.id
    })
  }

  return NextResponse.json({ success: true, data: issue })
}

// 2. 댓글 생성 시 알림 트리거
// app/api/issues/[id]/comments/route.ts
export async function POST(request: Request) {
  const comment = await createComment(data)

  // 이슈 작성자에게 알림
  if (issue.reporter_id !== currentUser.id) {
    await createNotification({
      user_id: issue.reporter_id,
      type: 'COMMENTED',
      title: `New comment on ${issue.key}`,
      body: comment.content.substring(0, 100),
      issue_id: issue.id,
      team_id: issue.team_id,
      actor_id: currentUser.id
    })
  }

  return NextResponse.json({ success: true, data: comment })
}
```

### 마이그레이션 순서

1. `notifications` 테이블 생성
2. `ai_usage` 테이블 생성
3. `issues` 테이블 AI 컬럼 추가
4. RLS 정책 적용
5. Realtime 구독 활성화

## Acceptance Criteria (Authoritative)

{{acceptance_criteria}}

## Traceability Mapping

{{traceability_mapping}}

## Risks, Assumptions, Open Questions

{{risks_assumptions_questions}}

## Test Strategy Summary

{{test_strategy}}
