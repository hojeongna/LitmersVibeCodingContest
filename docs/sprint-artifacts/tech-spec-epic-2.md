# Epic Technical Specification: 팀 관리

Date: 2025-11-29
Author: hojeong
Epic ID: 2
Status: Draft

---

## Overview

Epic 2는 Jira Lite MVP의 팀 관리 시스템을 구현합니다. 이 Epic은 FR-010~019의 10개 기능 요구사항을 커버하며, 팀 생성/수정/삭제, 멤버 초대 및 관리, 역할 기반 권한 체계(OWNER/ADMIN/MEMBER), 그리고 팀 활동 로그 기능을 포함합니다.

Epic 1(Foundation & 인증)이 완료된 후 병렬 진행이 가능하며, Supabase Auth를 통한 인증 기반 위에서 팀 멤버십 기반의 접근 제어(RLS)를 구현합니다. 이메일 초대 시스템은 Resend API를 사용하여 실제 이메일을 발송합니다.

## Objectives and Scope

**In-Scope (범위 내):**
- 팀 CRUD 작업 (생성, 조회, 수정, 삭제)
- 3단계 역할 체계 구현 (OWNER, ADMIN, MEMBER)
- 이메일 기반 멤버 초대 시스템 (7일 만료, 재발송 가능)
- 멤버 관리 (조회, 역할 변경, 강제 퇴장, 자발적 탈퇴)
- 팀 활동 로그 (멤버 변경, 역할 변경, 프로젝트 이벤트 기록)
- Sidebar에 팀 목록 표시 및 팀 컨텍스트 전환
- RLS 정책을 통한 팀 기반 데이터 격리

**Out-of-Scope (범위 외):**
- 팀 간 데이터 공유 또는 협업
- 소유권 자동 이전 (수동 이전만 지원)
- 팀 아카이브/복원 (Soft Delete만 적용)
- 초대 거절 기능 (미수락 시 pending 상태 유지)
- 복수 OWNER 지원 (팀당 1명만)

## System Architecture Alignment

**관련 아키텍처 컴포넌트:**

| 컴포넌트 | 역할 | 참조 |
|----------|------|------|
| `app/(dashboard)/teams/*` | 팀 관리 UI 페이지들 | Project Structure |
| `lib/supabase/*` | DB 클라이언트, RLS | Database Schema |
| `lib/email/resend.ts` | 초대 이메일 발송 | Integration Points |
| `components/layout/sidebar.tsx` | 팀 목록 표시 | UI Components |

**데이터베이스 테이블:**
- `teams` - 팀 정보
- `team_members` - 팀-사용자 매핑 및 역할
- `team_invites` - 초대 정보 (7일 만료)
- `team_activities` - 활동 로그

**RLS 정책:**
- 팀 멤버만 해당 팀 데이터 조회/수정 가능
- OWNER/ADMIN만 팀 설정 변경 및 멤버 관리 가능
- OWNER만 팀 삭제 및 역할 변경 가능

## UX Design Specification

### Screen Layout: Team Management

**탭 네비게이션 구조:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Members]  [Pending Invites]  [Activity Log]  [Settings]   │
└─────────────────────────────────────────────────────────────┘
```

| 탭 | 접근 권한 | 컴포넌트 |
|----|----------|----------|
| Members | 전체 | `MemberTable` |
| Pending Invites | OWNER, ADMIN | `PendingInvitesTable` |
| Activity Log | 전체 | `ActivityTimeline` |
| Settings | OWNER, ADMIN | `TeamSettingsForm` |

### Color Theme: Linear Productivity

**Primary Colors:**
```css
--primary: #5B5FC7;        /* Primary 버튼, 활성 탭 */
--primary-hover: #4F52B3;  /* Primary hover state */
--accent: #3B82F6;         /* 링크, 아이콘 강조 */
--background: #0F0F10;     /* 앱 배경 */
--surface: #1A1A1D;        /* 카드, 패널 배경 */
--surface-hover: #242428;  /* 테이블 행 hover */
--border: #2E2E32;         /* 테두리 */
--text-primary: #FAFAFA;   /* 본문 텍스트 */
--text-secondary: #A1A1AA; /* 보조 텍스트 */
```

**Role Badge 스타일링:**
```css
/* OWNER - 특별 그라데이션 */
.role-badge-owner {
  background: linear-gradient(135deg, #F59E0B, #D97706);
  color: #1A1A1D;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
}

/* ADMIN */
.role-badge-admin {
  background: #3B82F6;
  color: #FAFAFA;
}

/* MEMBER */
.role-badge-member {
  background: #27272A;
  color: #A1A1AA;
}
```

### Member Table UI

**테이블 구조:**
```
┌──────────────────────────────────────────────────────────────────┐
│ [Avatar] Name               Email                  Role    Action│
├──────────────────────────────────────────────────────────────────┤
│ [🟣 HJ]  홍길동            hong@example.com       [OWNER]   -    │
│ [🔵 KS]  김서연            kim@example.com        [▼ ADMIN] [X]  │
│ [⚫ PY]  박영희            park@example.com       [▼ MEMBER][X]  │
└──────────────────────────────────────────────────────────────────┘
                                                    [+ Invite Member]
```

**Avatar 스타일링:**
- 크기: 32x32px (w-8 h-8)
- 모양: 원형 (rounded-full)
- Fallback: 이름 이니셜 + 배경색 (프로필 색상 기반)
- Border: 2px solid var(--border)

**Role Dropdown:**
- OWNER가 아닌 멤버에게만 표시
- Options: ADMIN, MEMBER
- OWNER 이전은 별도 확인 모달

### Invite Modal

```
┌─────────────────────────────────────────────────┐
│  Invite Team Member                          [X]│
├─────────────────────────────────────────────────┤
│                                                 │
│  Email Address                                  │
│  ┌─────────────────────────────────────────┐   │
│  │ member@example.com                      │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Role                                           │
│  ┌─────────────────────────────────────────┐   │
│  │ Member                              [▼] │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Cancel]                    [Send Invitation]  │
│                                                 │
└─────────────────────────────────────────────────┘
```

**모달 스타일:**
- 배경: var(--surface) (#1A1A1D)
- Border: 1px solid var(--border)
- Border-radius: 12px
- Width: max-w-md (28rem)
- Shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5)

### Pending Invites Section

```
┌──────────────────────────────────────────────────────────────────┐
│ Email                        Role      Expires      Actions      │
├──────────────────────────────────────────────────────────────────┤
│ invited@example.com          Member    in 6 days    [Resend] [X] │
│ other@example.com            Admin     in 2 days    [Resend] [X] │
└──────────────────────────────────────────────────────────────────┘
```

**만료 표시:**
- 7일 이상: 회색 텍스트
- 3일 이하: 주황색 경고
- 1일 이하: 빨간색 긴급

### Activity Timeline UI

```
┌──────────────────────────────────────────────────────────────────┐
│ 🟢 홍길동 invited 김서연 as Member                    2분 전      │
│ 🔵 김서연 joined the team                            1시간 전     │
│ 🟡 홍길동 changed 박영희's role from Member to Admin  어제        │
│ 🔴 홍길동 removed 이민수 from the team               3일 전       │
└──────────────────────────────────────────────────────────────────┘
```

**Activity 아이콘/색상:**
| Action | 아이콘 | 색상 |
|--------|-------|------|
| member_invited | 📧 | #22C55E (green) |
| member_joined | ✅ | #3B82F6 (blue) |
| role_changed | 🔄 | #F59E0B (amber) |
| member_removed | ❌ | #EF4444 (red) |
| member_left | 👋 | #A1A1AA (gray) |
| team_updated | ⚙️ | #8B5CF6 (purple) |

### Typography

- Font Family: Inter, system-ui, sans-serif
- Heading (Modal Title): 18px, font-semibold
- Body: 14px, font-normal
- Small/Caption: 12px, text-secondary

### Interaction Patterns

**버튼 스타일:**
```css
/* Primary Button (Send Invitation) */
.btn-primary {
  background: var(--primary);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  transition: background 150ms;
}
.btn-primary:hover {
  background: var(--primary-hover);
}

/* Secondary Button (Cancel) */
.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

/* Destructive Button (Remove) */
.btn-destructive {
  color: #EF4444;
}
.btn-destructive:hover {
  background: rgba(239, 68, 68, 0.1);
}
```

**테이블 행 Hover:**
- 배경: var(--surface-hover) (#242428)
- Transition: 150ms ease

**확인 모달 (삭제/퇴장):**
- 제목: "Remove {name}?" 또는 "Delete Team?"
- 본문: 경고 메시지
- 버튼: [Cancel] [Remove/Delete] (destructive)

## Detailed Design

### Services and Modules

| 모듈 | 책임 | 입력 | 출력 | 위치 |
|------|------|------|------|------|
| **TeamService** | 팀 CRUD 로직 | team data, userId | Team entity | `lib/services/team.ts` |
| **TeamMemberService** | 멤버 관리 로직 | memberId, role, teamId | TeamMember entity | `lib/services/team-member.ts` |
| **InviteService** | 초대 생성/수락/취소 | email, teamId, token | Invite entity | `lib/services/invite.ts` |
| **ActivityLogService** | 활동 기록 | action, actorId, targetId | Activity entity | `lib/services/activity.ts` |
| **EmailService** | 초대 이메일 발송 | email, inviteToken, teamName | void | `lib/email/resend.ts` |

**UI 컴포넌트:**

| 컴포넌트 | 역할 | 위치 |
|----------|------|------|
| `TeamList` | Sidebar 팀 목록 | `components/teams/team-list.tsx` |
| `TeamCreateModal` | 팀 생성 모달 | `components/teams/team-create-modal.tsx` |
| `TeamSettingsForm` | 팀 설정 폼 | `components/teams/team-settings-form.tsx` |
| `MemberTable` | 멤버 목록 테이블 | `components/teams/member-table.tsx` |
| `InviteModal` | 멤버 초대 모달 | `components/teams/invite-modal.tsx` |
| `ActivityTimeline` | 활동 로그 타임라인 | `components/teams/activity-timeline.tsx` |

### Data Models and Contracts

**teams 테이블:**
```sql
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,                    -- 1~50자
  owner_id UUID REFERENCES public.profiles NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ                        -- Soft Delete
);

-- 인덱스
CREATE INDEX idx_teams_owner ON public.teams(owner_id);
CREATE INDEX idx_teams_deleted ON public.teams(deleted_at) WHERE deleted_at IS NULL;
```

**team_members 테이블:**
```sql
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams NOT NULL,
  user_id UUID REFERENCES public.profiles NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- 인덱스
CREATE INDEX idx_team_members_team ON public.team_members(team_id);
CREATE INDEX idx_team_members_user ON public.team_members(user_id);
```

**team_invites 테이블:**
```sql
CREATE TABLE public.team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('ADMIN', 'MEMBER')),
  token VARCHAR(64) NOT NULL UNIQUE,            -- 초대 토큰
  invited_by UUID REFERENCES public.profiles NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,              -- 생성 후 7일
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_team_invites_token ON public.team_invites(token);
CREATE INDEX idx_team_invites_email ON public.team_invites(email);
```

**team_activities 테이블:**
```sql
CREATE TABLE public.team_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams NOT NULL,
  actor_id UUID REFERENCES public.profiles NOT NULL,
  action VARCHAR(50) NOT NULL,                  -- 'member_joined', 'role_changed', etc.
  target_type VARCHAR(30),                      -- 'member', 'project', 'team'
  target_id UUID,
  details JSONB,                                -- 추가 정보
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_team_activities_team ON public.team_activities(team_id);
CREATE INDEX idx_team_activities_created ON public.team_activities(created_at DESC);
```

**TypeScript 타입:**
```typescript
// types/team.ts
export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
  // joined profile
  profile?: {
    name: string;
    email: string;
    avatar_url: string | null;
  };
}

export interface TeamInvite {
  id: string;
  team_id: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  token: string;
  invited_by: string;
  expires_at: string;
  created_at: string;
}

export interface TeamActivity {
  id: string;
  team_id: string;
  actor_id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  // joined profile
  actor?: {
    name: string;
    avatar_url: string | null;
  };
}
```

### APIs and Interfaces

**팀 API:**

| Method | Endpoint | 설명 | 권한 | Request | Response |
|--------|----------|------|------|---------|----------|
| POST | `/api/teams` | 팀 생성 | 인증된 사용자 | `{ name: string }` | `{ success: true, data: Team }` |
| GET | `/api/teams` | 내 팀 목록 | 인증된 사용자 | - | `{ success: true, data: Team[] }` |
| GET | `/api/teams/[teamId]` | 팀 상세 | 팀 멤버 | - | `{ success: true, data: Team }` |
| PUT | `/api/teams/[teamId]` | 팀 수정 | OWNER, ADMIN | `{ name: string }` | `{ success: true, data: Team }` |
| DELETE | `/api/teams/[teamId]` | 팀 삭제 | OWNER | - | `{ success: true }` |

**멤버 API:**

| Method | Endpoint | 설명 | 권한 | Request | Response |
|--------|----------|------|------|---------|----------|
| GET | `/api/teams/[teamId]/members` | 멤버 목록 | 팀 멤버 | - | `{ success: true, data: TeamMember[] }` |
| PUT | `/api/teams/[teamId]/members/[userId]` | 역할 변경 | OWNER | `{ role: 'ADMIN' \| 'MEMBER' }` | `{ success: true, data: TeamMember }` |
| DELETE | `/api/teams/[teamId]/members/[userId]` | 강제 퇴장/탈퇴 | OWNER, ADMIN (MEMBER만), 본인 | - | `{ success: true }` |

**초대 API:**

| Method | Endpoint | 설명 | 권한 | Request | Response |
|--------|----------|------|------|---------|----------|
| POST | `/api/teams/[teamId]/invites` | 초대 생성 | OWNER, ADMIN | `{ email: string, role?: string }` | `{ success: true, data: TeamInvite }` |
| GET | `/api/teams/[teamId]/invites` | 대기 중 초대 목록 | OWNER, ADMIN | - | `{ success: true, data: TeamInvite[] }` |
| DELETE | `/api/invites/[inviteId]` | 초대 취소 | OWNER, ADMIN | - | `{ success: true }` |
| POST | `/api/invites/[token]/accept` | 초대 수락 | 초대받은 사용자 | - | `{ success: true, data: TeamMember }` |
| POST | `/api/invites/[inviteId]/resend` | 초대 재발송 | OWNER, ADMIN | - | `{ success: true }` |

**활동 로그 API:**

| Method | Endpoint | 설명 | 권한 | Request | Response |
|--------|----------|------|------|---------|----------|
| GET | `/api/teams/[teamId]/activities` | 활동 로그 | 팀 멤버 | `?page=1&limit=20` | `{ success: true, data: TeamActivity[], pagination }` |

**에러 코드:**

| 코드 | 상황 | HTTP |
|------|------|------|
| `TEAM_NOT_FOUND` | 팀이 존재하지 않음 | 404 |
| `NOT_TEAM_MEMBER` | 팀 멤버가 아님 | 403 |
| `INSUFFICIENT_PERMISSION` | 권한 부족 | 403 |
| `INVITE_EXPIRED` | 초대 만료됨 | 400 |
| `ALREADY_MEMBER` | 이미 팀 멤버임 | 400 |
| `CANNOT_REMOVE_OWNER` | OWNER는 퇴장 불가 | 400 |
| `OWNER_CANNOT_LEAVE` | OWNER는 탈퇴 불가 | 400 |
| `TEAM_LIMIT_EXCEEDED` | 팀 제한 초과 | 400 |

### Workflows and Sequencing

**1. 팀 생성 플로우:**
```
User → POST /api/teams
     → TeamService.create()
     → INSERT teams (owner_id = userId)
     → INSERT team_members (role = 'OWNER')
     → ActivityLogService.log('team_created')
     → Return Team
```

**2. 멤버 초대 플로우:**
```
OWNER/ADMIN → POST /api/teams/[teamId]/invites
            → 이메일 중복 검사 (기존 멤버, 대기 중 초대)
            → 초대 토큰 생성 (crypto.randomUUID())
            → INSERT team_invites (expires_at = NOW() + 7일)
            → EmailService.sendInvite()
            → ActivityLogService.log('member_invited')
            → Return TeamInvite
```

**3. 초대 수락 플로우:**
```
User → POST /api/invites/[token]/accept
     → 토큰 검증 (존재, 만료, 이메일 일치)
     → INSERT team_members (role = invite.role)
     → DELETE team_invites
     → ActivityLogService.log('member_joined')
     → Return TeamMember
```

**4. 역할 변경 플로우:**
```
OWNER → PUT /api/teams/[teamId]/members/[userId]
      → 권한 검증 (OWNER만)
      → OWNER 이전 시: 본인 ADMIN으로 변경
      → UPDATE team_members SET role = newRole
      → ActivityLogService.log('role_changed', { from, to })
      → Return TeamMember
```

**5. 멤버 강제 퇴장 플로우:**
```
OWNER/ADMIN → DELETE /api/teams/[teamId]/members/[userId]
            → 권한 검증
            → OWNER 퇴장 차단
            → 본인 퇴장 차단 (탈퇴 사용)
            → ADMIN은 MEMBER만 퇴장 가능
            → DELETE team_members
            → ActivityLogService.log('member_removed')
            → Return success
```

**6. 팀 삭제 플로우:**
```
OWNER → DELETE /api/teams/[teamId]
      → 권한 검증 (OWNER만)
      → UPDATE teams SET deleted_at = NOW()
      → CASCADE: projects, issues, comments Soft Delete
      → ActivityLogService.log('team_deleted')
      → Return success
```

## Non-Functional Requirements

### Performance

| 요구사항 | 목표 | 구현 전략 |
|----------|------|-----------|
| 팀 목록 조회 | < 200ms | 인덱스 최적화, 쿼리 캐싱 |
| 멤버 목록 조회 | < 300ms | JOIN 최적화, 프로필 데이터 포함 |
| 팀 생성/수정 | < 500ms | 단순 INSERT/UPDATE |
| 초대 이메일 발송 | < 2초 | 비동기 처리, Resend API |
| 활동 로그 조회 | < 500ms | 페이지네이션, 인덱스 활용 |

**최적화 전략:**
- `team_members`에 복합 인덱스 `(team_id, user_id)`
- `team_activities`에 `(team_id, created_at DESC)` 인덱스
- TanStack Query로 클라이언트 캐싱 (staleTime: 30초)

### Security

**인증/인가:**
- 모든 팀 API는 인증 필수 (Supabase Auth JWT)
- RLS 정책으로 팀 멤버십 검증 자동화
- 역할 기반 권한 검사 (OWNER > ADMIN > MEMBER)

**RLS 정책:**
```sql
-- 팀 조회: 멤버만
CREATE POLICY "team_members_can_view" ON public.teams
  FOR SELECT USING (
    id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    AND deleted_at IS NULL
  );

-- 팀 수정: OWNER, ADMIN만
CREATE POLICY "team_admins_can_update" ON public.teams
  FOR UPDATE USING (
    id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
    )
  );

-- 팀 삭제: OWNER만
CREATE POLICY "team_owner_can_delete" ON public.teams
  FOR DELETE USING (owner_id = auth.uid());
```

**데이터 보호:**
- 초대 토큰: `crypto.randomUUID()` (64자 UUID)
- 초대 만료: 7일 후 자동 만료
- Soft Delete: 30일간 복구 가능 (실제 삭제 미구현)

**주의사항:**
- 다른 팀 접근 시 404 반환 (403 대신 정보 노출 방지)
- 이메일 주소 노출 최소화 (초대 목록은 OWNER/ADMIN만)

### Reliability/Availability

**가용성 목표:** 99.9% (Supabase SLA 기준)

**장애 대응:**
- 이메일 발송 실패: 재시도 로직 (최대 3회)
- DB 연결 실패: 에러 메시지 표시, 재시도 버튼
- 토큰 만료: 명확한 만료 메시지 및 재초대 안내

**데이터 일관성:**
- 트랜잭션 사용: 팀 생성 + 멤버 추가
- 초대 수락 시 중복 가입 방지 (UNIQUE 제약)
- 삭제 작업은 Soft Delete로 복구 가능

### Observability

**로깅:**
```typescript
// 팀 생성 로그
logger.info('Team created', {
  teamId: team.id,
  ownerId: user.id,
  teamName: team.name
});

// 초대 발송 로그
logger.info('Invite sent', {
  teamId,
  email: maskEmail(email), // 이메일 마스킹
  invitedBy: userId
});

// 에러 로그
logger.error('Team operation failed', error, {
  operation: 'delete',
  teamId,
  userId
});
```

**모니터링 지표:**
- 팀 생성 수 (일별)
- 초대 발송/수락 비율
- 멤버 가입/탈퇴 추이
- API 응답 시간

**활동 로그 기록 대상:**
| 이벤트 | action | target_type | details |
|--------|--------|-------------|---------|
| 팀 생성 | `team_created` | `team` | `{ name }` |
| 팀 수정 | `team_updated` | `team` | `{ field, from, to }` |
| 멤버 초대 | `member_invited` | `member` | `{ email, role }` |
| 멤버 가입 | `member_joined` | `member` | `{ role }` |
| 멤버 퇴장 | `member_removed` | `member` | `{ reason }` |
| 멤버 탈퇴 | `member_left` | `member` | - |
| 역할 변경 | `role_changed` | `member` | `{ from, to }` |
| 팀 삭제 | `team_deleted` | `team` | - |

## Dependencies and Integrations

**런타임 의존성:**

| 패키지 | 버전 | 용도 | FR 매핑 |
|--------|------|------|---------|
| `@supabase/supabase-js` | ^2.x | DB, Auth, RLS | 전체 |
| `resend` | ^2.x | 초대 이메일 발송 | FR-013 |
| `zod` | ^3.x | 입력 검증 | 전체 |
| `react-hook-form` | ^7.x | 폼 관리 | FR-010, FR-011 |
| `@tanstack/react-query` | ^5.x | 서버 상태 캐싱 | 전체 |
| `zustand` | ^4.x | 클라이언트 상태 | UI 상태 |

**외부 서비스 연동:**

| 서비스 | 용도 | 환경변수 |
|--------|------|----------|
| Supabase Auth | 사용자 인증 | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Supabase DB | 팀/멤버 데이터 | `SUPABASE_SERVICE_ROLE_KEY` |
| Resend | 초대 이메일 | `RESEND_API_KEY` |

**내부 의존성 (Epic 1에서 제공):**

| 컴포넌트 | 제공 기능 | 필수 여부 |
|----------|----------|----------|
| `lib/supabase/client.ts` | Supabase 클라이언트 | 필수 |
| `lib/supabase/server.ts` | 서버 사이드 클라이언트 | 필수 |
| `middleware.ts` | 인증 미들웨어 | 필수 |
| `profiles` 테이블 | 사용자 프로필 | 필수 |
| `components/ui/*` | shadcn/ui 컴포넌트 | 필수 |
| `components/layout/sidebar.tsx` | 팀 목록 표시 영역 | 필수 |

**이메일 템플릿:**

```typescript
// emails/team-invite.tsx
import { Html, Head, Body, Container, Text, Button } from '@react-email/components';

interface TeamInviteEmailProps {
  teamName: string;
  inviterName: string;
  inviteUrl: string;
  expiresAt: string;
}

export function TeamInviteEmail({ teamName, inviterName, inviteUrl, expiresAt }: TeamInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Text>{inviterName}님이 {teamName} 팀에 초대했습니다.</Text>
          <Button href={inviteUrl}>초대 수락하기</Button>
          <Text>이 초대는 {expiresAt}까지 유효합니다.</Text>
        </Container>
      </Body>
    </Html>
  );
}
```

## Acceptance Criteria (Authoritative)

### FR-010: 팀 생성
1. 로그인한 사용자가 팀 이름(1~50자)을 입력하여 팀을 생성할 수 있다
2. 생성자는 자동으로 OWNER 역할로 `team_members`에 등록된다
3. 팀 생성 후 Sidebar에 즉시 표시된다
4. 한 사용자는 여러 팀에 소속될 수 있다

### FR-011: 팀 정보 수정
5. OWNER 또는 ADMIN만 팀 이름을 수정할 수 있다
6. MEMBER는 팀 설정 페이지에 접근할 수 없다 (403 또는 UI 숨김)
7. 수정 후 변경 내용이 즉시 반영된다

### FR-012: 팀 삭제
8. OWNER만 팀을 삭제할 수 있다
9. 삭제 시 확인 모달이 표시된다
10. 삭제된 팀과 하위 데이터(프로젝트, 이슈 등)는 Soft Delete 처리된다
11. 삭제된 팀은 Sidebar에서 제거된다

### FR-013: 멤버 초대
12. OWNER 또는 ADMIN이 이메일로 멤버를 초대할 수 있다
13. 초대 시 역할(ADMIN/MEMBER)을 선택할 수 있다
14. 초대 이메일이 실제로 발송된다
15. 초대 링크는 7일 후 만료된다
16. 이미 팀 멤버인 이메일로는 초대할 수 없다
17. 대기 중인 초대를 재발송하면 만료일이 갱신된다

### FR-014: 멤버 조회
18. 팀 멤버 목록에서 이름, 이메일, 역할, 가입일을 확인할 수 있다
19. 역할별 필터링이 가능하다
20. 멤버 역할이 배지로 표시된다

### FR-015: 강제 퇴장
21. OWNER는 모든 멤버(ADMIN, MEMBER)를 강제 퇴장시킬 수 있다
22. ADMIN은 MEMBER만 강제 퇴장시킬 수 있다
23. OWNER 본인은 강제 퇴장 대상이 될 수 없다
24. 강제 퇴장된 멤버는 해당 팀에 접근할 수 없다

### FR-016: 팀 탈퇴
25. ADMIN 또는 MEMBER는 팀을 자발적으로 탈퇴할 수 있다
26. OWNER는 탈퇴할 수 없다 (팀 삭제 또는 소유권 이전 필요)
27. 탈퇴 후 해당 팀에 접근할 수 없다

### FR-017: 역할 체계
28. 팀 역할은 OWNER, ADMIN, MEMBER 3단계로 구분된다
29. OWNER는 팀당 1명만 존재한다
30. 역할에 따른 권한이 정확히 적용된다

### FR-018: 역할 변경
31. OWNER만 멤버의 역할을 변경할 수 있다
32. MEMBER → ADMIN 승격이 가능하다
33. ADMIN → MEMBER 강등이 가능하다
34. OWNER 권한을 다른 ADMIN에게 이전할 수 있다
35. 소유권 이전 시 기존 OWNER는 ADMIN으로 변경된다

### FR-019: 활동 로그
36. 멤버 가입/탈퇴, 역할 변경, 팀 설정 변경이 기록된다
37. 활동 로그는 최신순으로 정렬된다
38. 무한 스크롤 또는 페이지네이션이 구현된다
39. 활동 타입별 아이콘/색상이 표시된다

## Traceability Mapping

| AC # | FR | 스펙 섹션 | 컴포넌트/API | 테스트 아이디어 |
|------|-----|----------|-------------|----------------|
| 1-4 | FR-010 | Data Models, APIs | `POST /api/teams`, `TeamCreateModal` | 팀 생성 후 DB 확인, Sidebar 반영 |
| 5-7 | FR-011 | APIs, Security | `PUT /api/teams/[teamId]`, RLS | MEMBER로 수정 시도 → 실패 확인 |
| 8-11 | FR-012 | Workflows, Security | `DELETE /api/teams/[teamId]` | Soft Delete 확인, CASCADE 확인 |
| 12-17 | FR-013 | Workflows, Dependencies | `POST /api/invites`, `EmailService` | 이메일 수신 확인, 만료 테스트 |
| 18-20 | FR-014 | APIs, Data Models | `GET /api/teams/[teamId]/members` | 프로필 JOIN 확인, 필터 동작 |
| 21-24 | FR-015 | Workflows, Security | `DELETE /members/[userId]` | ADMIN이 ADMIN 퇴장 시도 → 실패 |
| 25-27 | FR-016 | Workflows | `DELETE /members/[userId]` (self) | OWNER 탈퇴 시도 → 에러 메시지 |
| 28-30 | FR-017 | Data Models | `team_members.role` CHECK | 잘못된 역할 INSERT → 실패 |
| 31-35 | FR-018 | Workflows, APIs | `PUT /members/[userId]` | 소유권 이전 후 역할 확인 |
| 36-39 | FR-019 | Data Models, APIs | `GET /activities`, `ActivityTimeline` | 이벤트 발생 후 로그 확인 |

## Risks, Assumptions, Open Questions

### Risks

| ID | 위험 | 영향도 | 발생 확률 | 완화 전략 |
|----|------|--------|----------|-----------|
| R1 | Resend API 장애로 초대 이메일 발송 실패 | 중 | 낮음 | 재시도 로직, 대기 중 초대 목록에서 수동 재발송 |
| R2 | 이메일 스팸 필터링으로 초대 미수신 | 중 | 중간 | 발신자 도메인 SPF/DKIM 설정, 대체 초대 방법 안내 |
| R3 | RLS 정책 누락으로 데이터 노출 | 높음 | 낮음 | 모든 테이블에 RLS 활성화, API 레벨 이중 검증 |
| R4 | 소유권 이전 중 동시성 문제 | 중 | 낮음 | 트랜잭션 사용, OWNER 수 DB 제약 조건 |
| R5 | 활동 로그 과다 축적으로 성능 저하 | 낮음 | 중간 | 페이지네이션, 오래된 로그 아카이브 (향후) |

### Assumptions

| ID | 가정 | 근거 |
|----|------|------|
| A1 | Epic 1의 인증 시스템이 완료되어 있음 | Epic 의존성 정의 |
| A2 | Supabase RLS가 정상 동작함 | Supabase 공식 기능 |
| A3 | 사용자는 유효한 이메일 주소를 가지고 있음 | 회원가입 시 이메일 검증 |
| A4 | Resend API 키가 설정되어 있음 | 환경변수 필수 항목 |
| A5 | 팀당 멤버 수에 특별한 제한이 없음 | PRD에 명시 없음 |

### Open Questions

| ID | 질문 | 상태 | 결정/답변 |
|----|------|------|-----------|
| Q1 | 팀 삭제 시 30일 복구 기능 구현 여부? | 결정됨 | MVP에서는 미구현, Soft Delete만 적용 |
| Q2 | 초대 거절 기능 필요 여부? | 결정됨 | 미구현, 미수락 시 pending 유지 |
| Q3 | 복수 OWNER 지원 필요 여부? | 결정됨 | 미지원, 팀당 1명만 |
| Q4 | 팀 생성 개수 제한 필요 여부? | 미결정 | 추후 결정 (현재 무제한) |
| Q5 | 활동 로그 보존 기간? | 미결정 | 추후 결정 (현재 무제한) |

## Test Strategy Summary

### 테스트 레벨

| 레벨 | 도구 | 범위 | 자동화 |
|------|------|------|--------|
| 단위 테스트 | Vitest | 서비스 로직, 유틸리티 | 자동 |
| 통합 테스트 | Vitest + Supabase | API 엔드포인트 | 자동 |
| E2E 테스트 | Chrome DevTools MCP | 주요 사용자 시나리오 | 수동/반자동 |

### 테스트 시나리오 (스토리별)

**Story 2.1: 팀 생성 & 목록**
- [ ] 팀 생성 → Sidebar 표시 확인
- [ ] 생성자 OWNER 역할 확인
- [ ] 여러 팀 소속 확인

**Story 2.2: 팀 상세 & 수정 & 삭제**
- [ ] MEMBER로 설정 페이지 접근 → 차단 확인
- [ ] ADMIN으로 수정 → 성공
- [ ] ADMIN으로 삭제 → 실패
- [ ] OWNER로 삭제 → Soft Delete 확인

**Story 2.3: 멤버 초대**
- [ ] 초대 이메일 발송 확인
- [ ] 초대 링크로 가입 → 팀 멤버 확인
- [ ] 만료된 초대 링크 → 에러 표시
- [ ] 이미 멤버인 이메일 초대 → 에러

**Story 2.4: 멤버 관리**
- [ ] 멤버 목록 조회 (프로필 정보 포함)
- [ ] OWNER가 역할 변경 → 성공
- [ ] ADMIN이 역할 변경 → 실패
- [ ] 소유권 이전 → 역할 교환 확인
- [ ] OWNER 강제 퇴장 시도 → 에러
- [ ] OWNER 탈퇴 시도 → 에러

**Story 2.5: 활동 로그**
- [ ] 멤버 가입 시 로그 기록 확인
- [ ] 역할 변경 시 로그 기록 확인
- [ ] 최신순 정렬 확인
- [ ] 페이지네이션 동작 확인

### 엣지 케이스

| 케이스 | 예상 결과 |
|--------|----------|
| 팀 이름 빈 값 | 400 VALIDATION_ERROR |
| 팀 이름 51자 | 400 VALIDATION_ERROR |
| 존재하지 않는 팀 ID | 404 NOT_FOUND |
| 다른 팀 접근 | 404 NOT_FOUND (정보 노출 방지) |
| 동시에 같은 이메일 초대 | 첫 번째만 성공, 두 번째는 중복 에러 |
| 초대 수락 후 다시 수락 | 에러 (이미 멤버) |
| OWNER 없이 팀 존재 | DB 제약 조건으로 불가능 |

### 커버리지 목표

- 단위 테스트: 80% 이상 (서비스 로직)
- 통합 테스트: 주요 API 전체
- E2E: 핵심 시나리오 5개 이상
