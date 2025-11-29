# Jira Lite MVP - Architecture Document

## Executive Summary

Jira Lite MVP는 AI-Native 이슈 트래킹 웹 애플리케이션으로, Next.js 15 + Supabase + Firebase App Hosting 아키텍처를 기반으로 합니다. 8시간 해커톤 MVP로서, 빠른 개발과 배포를 위해 풀스택 통합 솔루션을 선택했습니다.

**핵심 아키텍처 결정:**
- **Frontend/Backend**: Next.js 15 (App Router) - 서버 컴포넌트 + API Routes
- **Database**: Supabase (PostgreSQL) - 인증, 실시간, 스토리지 통합
- **Hosting**: Firebase App Hosting - Git 푸시 자동 배포
- **AI**: OpenAI GPT-5-nano - 요약, 제안, 분류, 중복 탐지

## Project Initialization

첫 번째 구현 스토리에서 실행할 명령어:

```bash
# 1. 프로젝트 생성
npx create-next-app -e with-supabase jira-lite-mvp

# 2. 추가 의존성 설치
cd jira-lite-mvp
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install zustand @tanstack/react-query
npm install react-hook-form @hookform/resolvers zod
npm install recharts
npm install date-fns
npm install openai
npm install resend

# 3. Firebase CLI 설치 및 초기화
npm install -g firebase-tools
firebase login
firebase init apphosting

# 4. Git 연결
git remote add origin https://github.com/hojeongna/LitmersVibeCodingContest.git
```

## Decision Summary

| Category | Decision | Version | Affects FR | Rationale |
|----------|----------|---------|------------|-----------|
| Framework | Next.js | 15.x (App Router) | 전체 | Firebase App Hosting 공식 지원, React 생태계 |
| Language | TypeScript | 5.x | 전체 | 타입 안전성, DX 향상 |
| Styling | Tailwind CSS | 3.x | 전체 | 빠른 개발, UX 스펙 호환 |
| UI Library | shadcn/ui | latest | 전체 | Radix 기반 접근성, 커스터마이징 |
| Auth | Supabase Auth | latest | FR-001~007 | OAuth, 이메일 인증 통합 |
| Database | Supabase PostgreSQL | latest | 전체 | RLS, 실시간, 스토리지 통합 |
| Hosting | Firebase App Hosting | GA | 전체 | Git 푸시 자동 배포 |
| AI/LLM | OpenAI GPT | gpt-5-nano | FR-040~045 | 비용 효율, 성능 균형 |
| Email | Resend | latest | FR-003, FR-013 | 간편한 API, React Email |
| Realtime | Supabase Realtime | latest | FR-050~052 | 추가 설정 없음, 통합 |
| Storage | Supabase Storage | latest | FR-005 | 통합 관리, RLS |
| Drag & Drop | @dnd-kit | latest | FR-050~052 | 현대적, 접근성 |
| State Management | Zustand + TanStack Query | latest | 전체 | 서버/클라이언트 상태 분리 |
| Form Validation | react-hook-form + zod | latest | 전체 | 타입 안전, 성능 |
| Charts | Recharts | latest | FR-080~082 | React 친화적 |
| E2E Testing | Chrome DevTools MCP | - | 전체 | 실시간 테스트 |

## Project Structure

```
jira-lite-mvp/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 인증 (로그인 전)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (dashboard)/              # 메인 레이아웃 (로그인 후)
│   │   ├── layout.tsx            # Sidebar + Header
│   │   ├── page.tsx              # 개인 대시보드
│   │   ├── teams/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [teamId]/
│   │   │       ├── page.tsx
│   │   │       ├── settings/page.tsx
│   │   │       ├── members/page.tsx
│   │   │       └── activity/page.tsx
│   │   ├── projects/
│   │   │   └── [projectId]/
│   │   │       ├── page.tsx
│   │   │       ├── board/page.tsx
│   │   │       ├── list/page.tsx
│   │   │       ├── settings/page.tsx
│   │   │       └── dashboard/page.tsx
│   │   ├── issues/
│   │   │   └── [issueId]/page.tsx
│   │   ├── settings/
│   │   │   ├── profile/page.tsx
│   │   │   └── account/page.tsx
│   │   └── notifications/page.tsx
│   ├── api/                      # API Routes
│   │   ├── auth/callback/route.ts
│   │   ├── ai/
│   │   │   ├── summarize/route.ts
│   │   │   ├── suggest/route.ts
│   │   │   ├── auto-label/route.ts
│   │   │   ├── duplicates/route.ts
│   │   │   └── comment-summary/route.ts
│   │   └── email/
│   │       ├── invite/route.ts
│   │       └── reset-password/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn/ui
│   ├── kanban/
│   │   ├── board.tsx
│   │   ├── column.tsx
│   │   ├── issue-card.tsx
│   │   └── sortable-issue.tsx
│   ├── issues/
│   │   ├── issue-form.tsx
│   │   ├── issue-detail-panel.tsx
│   │   ├── priority-badge.tsx
│   │   └── label-tag.tsx
│   ├── ai/
│   │   ├── ai-summary-panel.tsx
│   │   ├── ai-suggestion-panel.tsx
│   │   └── ai-loading.tsx
│   ├── dashboard/
│   │   ├── stat-card.tsx
│   │   ├── status-chart.tsx
│   │   └── activity-timeline.tsx
│   └── layout/
│       ├── sidebar.tsx
│       ├── header.tsx
│       └── notification-dropdown.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── middleware.ts
│   │   └── types.ts
│   ├── openai/
│   │   └── client.ts
│   ├── email/
│   │   └── resend.ts
│   ├── validations/
│   │   ├── auth.ts
│   │   ├── issue.ts
│   │   ├── project.ts
│   │   └── team.ts
│   └── utils/
│       ├── date.ts
│       ├── error.ts
│       └── rate-limit.ts
├── stores/
│   ├── filter-store.ts
│   ├── ui-store.ts
│   └── notification-store.ts
├── hooks/
│   ├── use-issues.ts
│   ├── use-projects.ts
│   ├── use-teams.ts
│   ├── use-realtime.ts
│   └── use-ai.ts
├── types/
│   └── index.ts
├── emails/
│   ├── invite.tsx
│   └── reset-password.tsx
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── public/
├── .env.local.example
├── apphosting.yaml
├── middleware.ts
├── next.config.js
├── tailwind.config.js
├── package.json
└── tsconfig.json
```

## FR Category to Architecture Mapping

| FR 카테고리 | FR 범위 | 주요 경로 | 핵심 기술 |
|-------------|---------|----------|----------|
| 인증 | FR-001~007 | `app/(auth)/*`, `lib/supabase/*` | Supabase Auth, Resend |
| 팀 | FR-010~019 | `app/(dashboard)/teams/*` | RLS, 역할 기반 접근 |
| 프로젝트 | FR-020~027 | `app/(dashboard)/projects/*` | Supabase CRUD |
| 이슈 | FR-030~039-2 | `components/kanban/*`, `components/issues/*` | @dnd-kit, TanStack Query |
| AI | FR-040~045 | `app/api/ai/*`, `components/ai/*` | OpenAI GPT-5-nano |
| 칸반 | FR-050~054 | `components/kanban/*` | @dnd-kit, Supabase Realtime |
| 댓글 | FR-060~063 | `components/issues/comments.tsx` | Supabase Realtime |
| 권한/보안 | FR-070~071 | `lib/supabase/*`, `middleware.ts` | RLS, Soft Delete |
| 대시보드 | FR-080~082 | `components/dashboard/*` | Recharts |
| 알림 | FR-090~091 | `components/layout/notification-dropdown.tsx` | Supabase Realtime |

## Technology Stack Details

### Core Technologies

**Frontend:**
- Next.js 15 (App Router) - React 서버 컴포넌트, 스트리밍
- TypeScript 5.x - 타입 안전성
- Tailwind CSS 3.x - 유틸리티 기반 스타일링
- shadcn/ui - Radix 기반 접근성 컴포넌트

**Backend:**
- Next.js API Routes - 서버리스 함수
- Supabase - PostgreSQL, Auth, Realtime, Storage

**AI Integration:**
- OpenAI GPT-5-nano - 이슈 요약, 제안, 분류, 중복 탐지

**Infrastructure:**
- Firebase App Hosting - 자동 CI/CD, CDN
- Supabase Cloud - 관리형 PostgreSQL

### Integration Points

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Client        │────▶│   Next.js       │────▶│   Supabase      │
│   (Browser)     │     │   (App Router)  │     │   (PostgreSQL)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       ▼                       │
        │               ┌─────────────────┐             │
        │               │   OpenAI API    │             │
        │               │   (GPT-5-nano)  │             │
        │               └─────────────────┘             │
        │                       │                       │
        │                       ▼                       │
        │               ┌─────────────────┐             │
        │               │   Resend        │             │
        │               │   (Email)       │             │
        │               └─────────────────┘             │
        │                                               │
        └───────────────────────────────────────────────┘
                    Supabase Realtime (WebSocket)
```

## Implementation Patterns

### Naming Conventions

| 항목 | 규칙 | 예시 |
|------|------|------|
| 파일명 | kebab-case | `issue-card.tsx` |
| 컴포넌트 | PascalCase | `IssueCard` |
| 함수/변수 | camelCase | `handleDragEnd` |
| DB 테이블 | snake_case (복수) | `issues`, `team_members` |
| DB 컬럼 | snake_case | `created_at`, `assignee_id` |
| API Route | kebab-case | `/api/ai/auto-label` |
| Zustand Store | use + PascalCase + Store | `useFilterStore` |
| Query Key | 배열 형식 | `['issues', projectId]` |

### Code Organization

**컴포넌트 구조:**
```typescript
'use client' // 필요시에만

import { ... } from 'react'
import { ... } from '@/components/ui'
import { ... } from '@/lib/...'
import { ... } from '@/hooks/...'

interface Props { ... }

export function ComponentName({ prop1, prop2 }: Props) {
  // 1. Hooks
  // 2. State
  // 3. Effects
  // 4. Handlers
  // 5. Render
  return (...)
}
```

**API Route 구조:**
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // 1. 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } },
      { status: 401 }
    )
  }

  // 2. 팀 멤버십 검증 (FR-070)
  // 3. 비즈니스 로직
  // 4. 응답 반환
  return NextResponse.json({ success: true, data: result })
}
```

### Error Handling

**에러 타입:**
```typescript
type AppError = {
  code: string;        // 'AUTH_FAILED', 'NOT_FOUND', 'VALIDATION_ERROR'
  message: string;     // 사용자에게 표시할 메시지
  details?: unknown;   // 개발용 상세 정보
}

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: AppError }
```

**HTTP 상태 코드:**
| 상황 | 코드 | error.code |
|------|------|------------|
| 인증 필요 | 401 | `UNAUTHORIZED` |
| 권한 없음 | 403 | `FORBIDDEN` |
| 리소스 없음 | 404 | `NOT_FOUND` |
| 검증 실패 | 400 | `VALIDATION_ERROR` |
| Rate Limit | 429 | `RATE_LIMIT` |
| 서버 에러 | 500 | `INTERNAL_ERROR` |

### Logging Strategy

```typescript
// 개발: console
// 프로덕션: 구조화된 JSON
const logger = {
  info: (message: string, meta?: object) => {...},
  error: (message: string, error: Error, meta?: object) => {...},
}

// ⚠️ 민감 정보 로깅 금지
// ❌ logger.info('User login', { password })
// ✅ logger.info('User login', { userId, email })
```

## Data Architecture

### Database Schema (Supabase PostgreSQL)

```sql
-- Users (Supabase Auth 확장)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ  -- Soft Delete
);

-- Teams
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  owner_id UUID REFERENCES public.profiles NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Team Members
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams NOT NULL,
  user_id UUID REFERENCES public.profiles NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Team Invites
CREATE TABLE public.team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams NOT NULL,
  email VARCHAR(255) NOT NULL,
  invited_by UUID REFERENCES public.profiles NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,  -- 7일 후
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams NOT NULL,
  owner_id UUID REFERENCES public.profiles NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Project Favorites
CREATE TABLE public.project_favorites (
  user_id UUID REFERENCES public.profiles NOT NULL,
  project_id UUID REFERENCES public.projects NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, project_id)
);

-- Custom Statuses
CREATE TABLE public.statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects NOT NULL,
  name VARCHAR(30) NOT NULL,
  color VARCHAR(7),  -- HEX
  position INTEGER NOT NULL,
  wip_limit INTEGER,  -- null = unlimited
  is_default BOOLEAN DEFAULT FALSE
);

-- Labels
CREATE TABLE public.labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects NOT NULL,
  name VARCHAR(30) NOT NULL,
  color VARCHAR(7) NOT NULL  -- HEX
);

-- Issues
CREATE TABLE public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects NOT NULL,
  owner_id UUID REFERENCES public.profiles NOT NULL,
  assignee_id UUID REFERENCES public.profiles,
  status_id UUID REFERENCES public.statuses NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  priority VARCHAR(10) DEFAULT 'MEDIUM' CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
  due_date DATE,
  position INTEGER NOT NULL,  -- 컬럼 내 순서
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Issue Labels (다대다)
CREATE TABLE public.issue_labels (
  issue_id UUID REFERENCES public.issues NOT NULL,
  label_id UUID REFERENCES public.labels NOT NULL,
  PRIMARY KEY (issue_id, label_id)
);

-- Subtasks
CREATE TABLE public.subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues NOT NULL,
  title VARCHAR(200) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues NOT NULL,
  author_id UUID REFERENCES public.profiles NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Issue History
CREATE TABLE public.issue_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues NOT NULL,
  changed_by UUID REFERENCES public.profiles NOT NULL,
  field_name VARCHAR(50) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Cache
CREATE TABLE public.ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues NOT NULL,
  cache_type VARCHAR(20) NOT NULL,  -- 'summary', 'suggestion', 'comment_summary'
  content_hash VARCHAR(64) NOT NULL,  -- description/comments 해시
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Rate Limit
CREATE TABLE public.ai_rate_limits (
  user_id UUID REFERENCES public.profiles PRIMARY KEY,
  minute_count INTEGER DEFAULT 0,
  minute_reset_at TIMESTAMPTZ,
  daily_count INTEGER DEFAULT 0,
  daily_reset_at TIMESTAMPTZ
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles NOT NULL,
  type VARCHAR(30) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Activity Log
CREATE TABLE public.team_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams NOT NULL,
  actor_id UUID REFERENCES public.profiles NOT NULL,
  action VARCHAR(50) NOT NULL,
  target_type VARCHAR(30),
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

```sql
-- 팀 멤버만 팀 데이터 접근
CREATE POLICY "Team members can view team"
  ON public.teams FOR SELECT
  USING (
    id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
  );

-- 프로젝트는 같은 팀 멤버만 접근
CREATE POLICY "Team members can view projects"
  ON public.projects FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

-- 이슈도 동일한 패턴
CREATE POLICY "Team members can view issues"
  ON public.issues FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );
```

## API Contracts

### Response Format

**성공:**
```json
{
  "success": true,
  "data": { ... }
}
```

**에러:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "이메일 형식이 올바르지 않습니다"
  }
}
```

**페이지네이션:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### AI API Endpoints

| Endpoint | Method | 설명 | Rate Limit |
|----------|--------|------|------------|
| `/api/ai/summarize` | POST | 이슈 요약 (FR-040) | 분당 10회 |
| `/api/ai/suggest` | POST | 해결 전략 제안 (FR-041) | 분당 10회 |
| `/api/ai/auto-label` | POST | 라벨 자동 추천 (FR-043) | 분당 10회 |
| `/api/ai/duplicates` | POST | 중복 이슈 탐지 (FR-044) | 분당 10회 |
| `/api/ai/comment-summary` | POST | 댓글 요약 (FR-045) | 분당 10회 |

## Security Architecture

### Authentication Flow

```
1. 이메일/비밀번호 로그인
   Client → Supabase Auth → JWT 발급 → Cookie 저장

2. Google OAuth
   Client → Supabase Auth → Google → Callback → JWT 발급

3. 비밀번호 재설정
   Client → API Route → Resend 이메일 → 토큰 링크 (1시간 유효)
```

### Authorization

| 역할 | 권한 |
|------|------|
| OWNER | 모든 권한, 팀 삭제, 역할 변경 |
| ADMIN | 멤버 초대/퇴장, 프로젝트 관리 |
| MEMBER | 프로젝트/이슈 CRUD |

### Data Protection

- **비밀번호**: Supabase Auth (bcrypt)
- **JWT**: 24시간 만료
- **HTTPS**: Firebase App Hosting 자동 적용
- **Soft Delete**: 모든 주요 엔티티 (복구 가능)
- **RLS**: PostgreSQL Row Level Security

## Performance Considerations

| 요구사항 | 전략 |
|----------|------|
| 페이지 로드 3초 이내 | Next.js 서버 컴포넌트, 코드 스플리팅 |
| API 응답 500ms 이내 | Supabase Edge Functions, 인덱싱 |
| Drag & Drop 100ms 이내 | @dnd-kit 최적화, Optimistic Updates |
| AI 응답 10초 이내 | 스트리밍 응답, 캐싱 |

**캐싱 전략:**
- TanStack Query: 서버 상태 캐싱
- AI 결과: DB 캐싱 (content hash 기반 무효화)
- 정적 자산: Firebase CDN

## Deployment Architecture

### Firebase App Hosting 설정

**apphosting.yaml:**
```yaml
runConfig:
  cpu: 1
  memoryMiB: 512
  concurrency: 80

env:
  - variable: NEXT_PUBLIC_SUPABASE_URL
    value: your-project.supabase.co
  - variable: NEXT_PUBLIC_SUPABASE_ANON_KEY
    secret: supabase-anon-key
  - variable: SUPABASE_SERVICE_ROLE_KEY
    secret: supabase-service-role-key
  - variable: OPENAI_API_KEY
    secret: openai-api-key
  - variable: RESEND_API_KEY
    secret: resend-api-key
```

### CI/CD Flow

```
Git Push → GitHub → Firebase App Hosting
                         ↓
                    Cloud Build
                         ↓
                    Cloud Run + CDN
```

**자동 배포:**
- `main` 브랜치 푸시 → 프로덕션 배포
- PR → 프리뷰 배포 (선택)

## Development Environment

### Prerequisites

- Node.js 18+
- npm 9+
- Git
- Supabase CLI
- Firebase CLI

### Environment Variables

**.env.local.example:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Resend
RESEND_API_KEY=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Setup Commands

```bash
# 1. 저장소 클론
git clone https://github.com/hojeongna/LitmersVibeCodingContest.git
cd LitmersVibeCodingContest

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.local.example .env.local
# .env.local 편집

# 4. Supabase 로컬 실행 (선택)
supabase start

# 5. 개발 서버 실행
npm run dev

# 6. 배포
git push origin main  # Firebase App Hosting 자동 배포
```

## Architecture Decision Records (ADRs)

### ADR-001: Next.js + Supabase 선택

**컨텍스트:** 8시간 해커톤 MVP, 풀스택 웹앱 필요

**결정:** Next.js 15 (App Router) + Supabase

**근거:**
- Firebase App Hosting 공식 지원
- Supabase로 인증/DB/실시간/스토리지 통합
- 빠른 개발 속도

### ADR-002: Firebase App Hosting 선택

**컨텍스트:** 사용자 요청 - Git 푸시로 자동 배포

**결정:** Firebase App Hosting

**근거:**
- Git 푸시 → 자동 빌드 → 배포
- Cloud Run + CDN 자동 구성
- Next.js 공식 지원

### ADR-003: OpenAI GPT-5-nano 선택

**컨텍스트:** AI 기능 6개 (요약, 제안, 분류, 중복 탐지, 댓글 요약)

**결정:** OpenAI GPT-5-nano

**근거:**
- 사용자가 이미 보유한 모델
- 비용 효율적
- 한국어 성능 양호

### ADR-004: @dnd-kit 선택

**컨텍스트:** 칸반 보드 Drag & Drop, 100ms 반응 요구

**결정:** @dnd-kit

**근거:**
- 현대적, 접근성 우수
- React 18 완전 호환
- UX 스펙 권장

### ADR-005: Supabase Realtime 선택

**컨텍스트:** 칸반 보드 실시간 동기화

**결정:** Supabase Realtime

**근거:**
- 이미 Supabase 사용
- 추가 설정/비용 없음
- PostgreSQL 변경 자동 감지

---

_Generated by BMAD Decision Architecture Workflow v1.0_
_Date: 2025-11-29_
_For: hojeong_
