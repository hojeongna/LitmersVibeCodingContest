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

### FR-040: AI 이슈 요약

| AC ID | 인수 조건 | 검증 방법 |
|-------|----------|----------|
| AC-040-1 | 이슈 상세 페이지에서 "AI 요약" 버튼 클릭 시 요약 생성 | UI 테스트 |
| AC-040-2 | description이 10자 미만이면 AI 버튼 비활성화 | UI 테스트 |
| AC-040-3 | 요약 결과가 이슈에 저장되고 재방문 시 표시됨 | 통합 테스트 |
| AC-040-4 | "Regenerate" 버튼으로 요약 재생성 가능 | UI 테스트 |
| AC-040-5 | 로딩 중 스피너 표시, 에러 시 메시지 표시 | UI 테스트 |

### FR-041: 라벨 자동 제안

| AC ID | 인수 조건 | 검증 방법 |
|-------|----------|----------|
| AC-041-1 | 이슈 생성/편집 시 "AI 라벨 제안" 버튼 표시 | UI 테스트 |
| AC-041-2 | 제안된 라벨 목록에서 선택하여 적용 가능 | UI 테스트 |
| AC-041-3 | 제안 라벨은 신뢰도 점수와 함께 표시 | UI 테스트 |

### FR-042: 우선순위 자동 제안

| AC ID | 인수 조건 | 검증 방법 |
|-------|----------|----------|
| AC-042-1 | 이슈 생성 시 AI가 우선순위 제안 | UI 테스트 |
| AC-042-2 | 제안된 우선순위를 원클릭으로 적용 가능 | UI 테스트 |
| AC-042-3 | 사용자가 수동으로 변경 가능 | UI 테스트 |

### FR-043: AI Rate Limiting

| AC ID | 인수 조건 | 검증 방법 |
|-------|----------|----------|
| AC-043-1 | 분당 10회 초과 시 429 에러 반환 | API 테스트 |
| AC-043-2 | 일당 100회 초과 시 429 에러 반환 | API 테스트 |
| AC-043-3 | 남은 사용량 UI에 표시 (선택) | UI 테스트 |
| AC-043-4 | 제한 초과 시 친절한 안내 메시지 표시 | UI 테스트 |

### FR-044: 중복 이슈 탐지

| AC ID | 인수 조건 | 검증 방법 |
|-------|----------|----------|
| AC-044-1 | 이슈 생성 시 유사도 80% 이상 이슈 경고 | UI 테스트 |
| AC-044-2 | 중복 의심 이슈 클릭 시 해당 이슈로 이동 | UI 테스트 |
| AC-044-3 | 사용자가 무시하고 생성 진행 가능 | UI 테스트 |

### FR-045: 댓글 요약

| AC ID | 인수 조건 | 검증 방법 |
|-------|----------|----------|
| AC-045-1 | 댓글 3개 이상 시 "댓글 요약" 버튼 표시 | UI 테스트 |
| AC-045-2 | 요약에 핵심 포인트 목록 포함 | UI 테스트 |
| AC-045-3 | 요약 결과 복사 가능 | UI 테스트 |

### FR-080: 개인 대시보드

| AC ID | 인수 조건 | 검증 방법 |
|-------|----------|----------|
| AC-080-1 | 로그인 후 대시보드 페이지 접근 가능 | UI 테스트 |
| AC-080-2 | 내 담당 이슈 통계 표시 (진행중/완료/마감임박) | UI 테스트 |
| AC-080-3 | 마감 7일 이내 이슈 목록 표시 | UI 테스트 |
| AC-080-4 | 이슈 클릭 시 해당 이슈로 이동 | UI 테스트 |

### FR-081: 프로젝트 통계

| AC ID | 인수 조건 | 검증 방법 |
|-------|----------|----------|
| AC-081-1 | 프로젝트 진행률 표시 (완료/전체) | UI 테스트 |
| AC-081-2 | 상태별 이슈 분포 차트 (파이/바) | UI 테스트 |
| AC-081-3 | 우선순위별 분포 표시 | UI 테스트 |

### FR-082: 활동 트렌드

| AC ID | 인수 조건 | 검증 방법 |
|-------|----------|----------|
| AC-082-1 | 최근 7일 생성/완료 이슈 트렌드 라인 차트 | UI 테스트 |
| AC-082-2 | 기간 필터 변경 가능 (7일/30일) | UI 테스트 |

### FR-090: 인앱 알림

| AC ID | 인수 조건 | 검증 방법 |
|-------|----------|----------|
| AC-090-1 | 헤더에 알림 벨 아이콘 및 읽지 않은 개수 표시 | UI 테스트 |
| AC-090-2 | 벨 클릭 시 알림 드롭다운/페이지 표시 | UI 테스트 |
| AC-090-3 | 담당자 할당 시 실시간 알림 수신 | 통합 테스트 |
| AC-090-4 | 댓글 작성 시 이슈 작성자에게 알림 | 통합 테스트 |
| AC-090-5 | 마감일 임박 시 알림 (하루 전) | 스케줄 테스트 |
| AC-090-6 | 알림 클릭 시 읽음 처리 및 해당 이슈로 이동 | UI 테스트 |
| AC-090-7 | "모두 읽음" 버튼으로 일괄 처리 | UI 테스트 |

### FR-091: 이메일 알림

| AC ID | 인수 조건 | 검증 방법 |
|-------|----------|----------|
| AC-091-1 | 담당자 할당 시 이메일 발송 | 통합 테스트 |
| AC-091-2 | 이메일에 이슈 제목, 링크 포함 | 이메일 템플릿 검증 |
| AC-091-3 | 알림 설정에서 이메일 알림 끄기 가능 (v2) | - |

## Traceability Mapping

### FR → Story → 구현 컴포넌트 맵핑

| FR | Story ID | 컴포넌트/파일 | API Endpoint |
|----|----------|--------------|--------------|
| FR-040 | 5.1 | `components/ai/AISummaryPanel.tsx` | `POST /api/ai/summary` |
| FR-041 | 5.2 | `components/ai/AILabelSuggestion.tsx` | `POST /api/ai/suggest` |
| FR-042 | 5.2 | `components/ai/AIPrioritySuggestion.tsx` | `POST /api/ai/suggest` |
| FR-043 | 5.3 | `lib/ai/rate-limiter.ts` | (미들웨어) |
| FR-044 | 5.4 | `components/ai/DuplicateWarning.tsx` | `POST /api/ai/duplicate` |
| FR-045 | 5.5 | `components/ai/CommentSummary.tsx` | `POST /api/ai/comment-summary` |
| FR-080 | 5.6 | `app/(dashboard)/dashboard/page.tsx` | `GET /api/dashboard/personal` |
| FR-081 | 5.7 | `components/dashboard/ProjectStats.tsx` | `GET /api/dashboard/project/:id` |
| FR-082 | 5.7 | `components/dashboard/ActivityChart.tsx` | `GET /api/dashboard/project/:id` |
| FR-090 | 5.8 | `components/notifications/NotificationCenter.tsx` | `GET /api/notifications` |
| FR-091 | 5.9 | `lib/notifications/email.ts` | (서버 사이드) |

### Story 목록 (예상)

| Story | 제목 | FR Coverage | 예상 포인트 |
|-------|------|-------------|------------|
| 5.1 | AI 이슈 요약 기능 | FR-040 | 5 |
| 5.2 | AI 라벨/우선순위 제안 | FR-041, FR-042 | 5 |
| 5.3 | AI Rate Limiting | FR-043 | 3 |
| 5.4 | 중복 이슈 탐지 | FR-044 | 5 |
| 5.5 | 댓글 요약 | FR-045 | 3 |
| 5.6 | 개인 대시보드 | FR-080 | 5 |
| 5.7 | 프로젝트 통계 & 차트 | FR-081, FR-082 | 5 |
| 5.8 | 인앱 알림 센터 | FR-090 | 8 |
| 5.9 | 이메일 알림 | FR-091 | 5 |

**총 예상 포인트**: 44 SP

### 파일 구조 계획

```
app/
├── (dashboard)/
│   ├── dashboard/
│   │   └── page.tsx              # FR-080
│   └── notifications/
│       └── page.tsx              # FR-090
├── api/
│   ├── ai/
│   │   ├── summary/route.ts      # FR-040
│   │   ├── suggest/route.ts      # FR-041, FR-042
│   │   ├── duplicate/route.ts    # FR-044
│   │   └── comment-summary/route.ts  # FR-045
│   ├── dashboard/
│   │   ├── personal/route.ts     # FR-080
│   │   └── project/[id]/route.ts # FR-081, FR-082
│   └── notifications/
│       ├── route.ts              # FR-090
│       └── [id]/read/route.ts    # FR-090

components/
├── ai/
│   ├── AISummaryPanel.tsx        # FR-040
│   ├── AILabelSuggestion.tsx     # FR-041
│   ├── AIPrioritySuggestion.tsx  # FR-042
│   ├── DuplicateWarning.tsx      # FR-044
│   └── CommentSummary.tsx        # FR-045
├── dashboard/
│   ├── StatsCard.tsx             # FR-080
│   ├── ProjectProgress.tsx       # FR-081
│   ├── IssuesByStatusChart.tsx   # FR-081
│   ├── ActivityTrendChart.tsx    # FR-082
│   └── UpcomingDeadlines.tsx     # FR-080
└── notifications/
    ├── NotificationBell.tsx      # FR-090
    ├── NotificationList.tsx      # FR-090
    ├── NotificationItem.tsx      # FR-090
    └── NotificationToast.tsx     # FR-090

lib/
├── ai/
│   ├── openai-client.ts
│   ├── prompts.ts
│   └── rate-limiter.ts           # FR-043
├── dashboard/
│   └── stats.ts
└── notifications/
    ├── service.ts                # FR-090
    └── email.ts                  # FR-091
```

## Risks, Assumptions, Open Questions

### Risks (위험 요소)

| 위험 | 영향도 | 가능성 | 완화 전략 |
|------|--------|--------|----------|
| OpenAI API 비용 초과 | 높음 | 중간 | Rate Limiting 적용, 사용량 모니터링, 예산 알림 설정 |
| OpenAI API 응답 지연 | 중간 | 중간 | 타임아웃 설정 (10초), 사용자에게 로딩 상태 표시, 취소 버튼 |
| AI 결과 품질 불일치 | 중간 | 높음 | 프롬프트 튜닝, 사용자 피드백 수집, Regenerate 기능 |
| Resend 이메일 전달 실패 | 낮음 | 낮음 | 재시도 로직, 실패 로깅, 인앱 알림으로 보완 |
| Realtime 연결 불안정 | 중간 | 중간 | 자동 재연결, 폴링 폴백, 연결 상태 UI 표시 |
| 대시보드 쿼리 성능 | 중간 | 중간 | 인덱스 최적화, 캐싱, 데이터 집계 최적화 |

### Assumptions (가정)

| 가정 | 검증 방법 |
|------|----------|
| OpenAI GPT-5-nano (또는 gpt-4o-mini)가 충분한 품질 제공 | 프로토타입 테스트 |
| 사용자당 분당 10회 AI 호출이 충분함 | 사용 패턴 모니터링 |
| Resend 무료 티어 (일 100통)로 MVP 충분 | 예상 사용량 계산 |
| Supabase Realtime이 안정적으로 작동 | 부하 테스트 |
| 사용자가 AI 제안을 수동으로 확인/적용할 의향 있음 | 사용자 피드백 |

### Open Questions (미결 사항)

| 질문 | 결정 필요 시점 | 담당자 |
|------|--------------|--------|
| 1. OpenAI 모델 선택 (gpt-4o-mini vs gpt-5-nano)? | Story 5.1 시작 전 | PM/Dev |
| 2. AI 캐싱 전략 - 결과를 얼마나 유지할지? | Story 5.1 | Dev |
| 3. 중복 탐지 유사도 threshold (80% 적절한지)? | Story 5.4 | PM |
| 4. 마감일 알림 - 며칠 전부터? (1일/3일/7일) | Story 5.8 | PM |
| 5. 이메일 알림 - 어떤 이벤트에 발송할지 우선순위? | Story 5.9 | PM |
| 6. 대시보드 - 팀 전체 통계도 필요한지? | Story 5.6 | PM |
| 7. 알림 - 배지 알림 외 Toast도 기본 활성화? | Story 5.8 | UX |

### 결정 로그

| 날짜 | 결정 사항 | 근거 |
|------|----------|------|
| 2025-11-29 | GPT-4o-mini 사용 | 비용 효율성, 충분한 품질 (GPT-5-nano 미출시 시) |
| 2025-11-29 | Rate Limit 분당 10회 | PRD FR-043 명시 |
| 2025-11-29 | Resend 사용 | package.json에 이미 의존성 포함 |

## Test Strategy Summary

### 테스트 레벨별 전략

| 레벨 | 범위 | 도구 |
|------|------|------|
| Unit Test | AI 유틸리티, Rate Limiter, 통계 계산 | Jest/Vitest |
| Integration Test | API Route + Supabase, OpenAI Mock | Jest + MSW |
| E2E Test | 주요 사용자 플로우 | Playwright |
| Manual Test | AI 품질 검증, UX 검증 | QA 체크리스트 |

### 주요 테스트 케이스

#### AI 기능 (FR-040 ~ FR-045)

```typescript
// AI Summary 테스트
describe('POST /api/ai/summary', () => {
  it('should generate summary for valid issue', async () => {})
  it('should return error if description < 10 chars', async () => {})
  it('should return 429 if rate limit exceeded', async () => {})
  it('should handle OpenAI API error gracefully', async () => {})
})

// Rate Limiter 테스트
describe('AIRateLimiter', () => {
  it('should allow request within minute limit', async () => {})
  it('should block request exceeding minute limit', async () => {})
  it('should allow request within daily limit', async () => {})
  it('should block request exceeding daily limit', async () => {})
})
```

#### 대시보드 (FR-080 ~ FR-082)

```typescript
describe('Dashboard Stats', () => {
  it('should return correct issue counts by status', async () => {})
  it('should return upcoming deadlines within 7 days', async () => {})
  it('should calculate project progress percentage', async () => {})
  it('should group issues by status for chart', async () => {})
})
```

#### 알림 (FR-090 ~ FR-091)

```typescript
describe('Notification Service', () => {
  it('should create notification on issue assignment', async () => {})
  it('should mark notification as read', async () => {})
  it('should mark all notifications as read', async () => {})
  it('should send email via Resend', async () => {})
})

describe('Realtime Notifications', () => {
  it('should receive new notification in real-time', async () => {})
  it('should update unread count on new notification', async () => {})
})
```

### E2E 테스트 시나리오

| 시나리오 | 설명 |
|---------|------|
| AI 요약 플로우 | 이슈 상세 → AI 요약 클릭 → 로딩 → 결과 표시 |
| 대시보드 접근 | 로그인 → 대시보드 → 통계 로딩 → 차트 렌더링 |
| 알림 수신 | 다른 사용자가 이슈 할당 → 실시간 알림 수신 → 클릭 → 이슈 이동 |
| 이메일 발송 | 이슈 할당 → 이메일 발송 확인 (Resend 대시보드) |

### 테스트 데이터

```sql
-- 테스트용 시드 데이터
-- 다양한 상태의 이슈 10개
-- 댓글 20개 (요약 테스트용)
-- 마감일 다양한 이슈 (오버듀, 1일/3일/7일 후)
```

### 품질 게이트

| 항목 | 기준 |
|------|------|
| Unit Test Coverage | > 70% |
| Integration Test | 모든 API endpoint |
| E2E | 핵심 사용자 플로우 3개 |
| Performance | API 응답 < 2초 (AI 제외) |
| AI 응답 | < 5초 (P95) |

---

*문서 생성일: 2025-11-29*
*작성자: hojeong*
*상태: Draft - 리뷰 대기*
