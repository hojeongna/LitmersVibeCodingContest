# Epic Technical Specification: 프로젝트 & 이슈 관리

Date: 2025-11-29
Author: hojeong
Epic ID: 3
Status: Draft

---

## Overview

Epic 3는 Jira Lite MVP의 핵심 기능인 프로젝트와 이슈 관리 시스템을 구현합니다. 사용자는 팀 내에서 프로젝트를 생성하고, 각 프로젝트 내에서 이슈를 생성/수정/삭제할 수 있습니다. 이슈는 우선순위, 라벨, 담당자, 마감일 등의 메타데이터를 가지며, 상태 변경 히스토리와 서브태스크를 지원합니다.

이 Epic은 PRD의 FR-020~027 (프로젝트 관련 8개 FR)과 FR-030~039-2 (이슈 관련 11개 FR)를 구현하며, 총 19개의 Functional Requirements를 커버합니다. Epic 1 (Foundation & 인증) 완료 후 Epic 2, 4, 5와 병렬로 진행 가능합니다.

## Objectives and Scope

### In-Scope (구현 대상)

**프로젝트 관리 (FR-020~027):**
- 프로젝트 CRUD (생성, 목록조회, 상세조회, 수정, 삭제)
- 프로젝트 설명 (마크다운 지원, 최대 2000자)
- 프로젝트 아카이브/복원
- 프로젝트 즐겨찾기 (사용자별)
- 팀당 최대 15개 프로젝트 제한

**이슈 관리 (FR-030~039-2):**
- 이슈 CRUD (생성, 상세조회, 수정, 삭제)
- 이슈 상태 변경 (Backlog → In Progress → Done + 커스텀)
- 담당자 지정 (팀 멤버 중 선택)
- 이슈 검색/필터링 (제목, 상태, 우선순위, 담당자, 라벨, 마감일)
- 우선순위 (HIGH/MEDIUM/LOW)
- 라벨/태그 (프로젝트당 최대 20개, 이슈당 최대 5개)
- 변경 히스토리 (상태, 담당자, 우선순위 등)
- 서브태스크 (이슈당 최대 20개, 체크리스트 형태)
- 프로젝트당 최대 200개 이슈 제한

### Out-of-Scope (이번 Epic에서 제외)

- 칸반 보드 Drag & Drop (Epic 4에서 구현)
- AI 기능 (요약, 제안, 자동 라벨, 중복 탐지) (Epic 5에서 구현)
- 댓글 시스템 (Epic 4에서 구현)
- 알림 시스템 (Epic 5에서 구현)
- 대시보드 통계 (Epic 5에서 구현)

## System Architecture Alignment

### 관련 아키텍처 컴포넌트

| 레이어 | 컴포넌트 | 역할 |
|--------|----------|------|
| **Frontend** | `app/(dashboard)/projects/*` | 프로젝트 페이지 (목록, 상세, 설정) |
| **Frontend** | `components/issues/*` | 이슈 관련 컴포넌트 (폼, 카드, 상세 패널) |
| **API** | `app/api/projects/*` | 프로젝트 CRUD API Routes |
| **API** | `app/api/issues/*` | 이슈 CRUD API Routes |
| **Database** | `projects`, `project_favorites` | 프로젝트 테이블 |
| **Database** | `issues`, `issue_labels`, `issue_history`, `subtasks`, `labels`, `statuses` | 이슈 관련 테이블 |
| **State** | `stores/filter-store.ts` | 이슈 필터 상태 관리 (Zustand) |
| **Hooks** | `hooks/use-projects.ts`, `hooks/use-issues.ts` | TanStack Query 훅 |

### 아키텍처 제약사항

- **RLS (Row Level Security)**: 모든 프로젝트/이슈 접근은 팀 멤버십 기반 RLS 정책 적용
- **Soft Delete**: 프로젝트, 이슈 삭제 시 `deleted_at` 필드 사용
- **Validation**: react-hook-form + zod로 클라이언트/서버 유효성 검증
- **Optimistic Updates**: TanStack Query로 낙관적 UI 업데이트

## UX Design Specification

### Screen Layout

**프로젝트 목록 (Sidebar)**
```
+------------------+
| Sidebar (240px)  |
| - Logo           |
| - Dashboard      |
| - Notifications  |
| - My Issues      |
|                  |
| [Projects]       |
|  ● Jira Lite MVP |
|  ● Marketing     |
|  + New Project   |
+------------------+
```

**프로젝트 상세 페이지**
```
+------------------+--------------------------------+------------------+
| Sidebar          | Main Panel                     | Detail Panel     |
|                  | - Header (Project Name)        | (이슈 상세)      |
|                  | - View Tabs [Board|List]       | - Title          |
|                  | - Filters                      | - Description    |
|                  | - Issue List/Board             | - Status/Priority|
|                  |                                | - Assignee       |
+------------------+--------------------------------+------------------+
```

### Color Theme (Linear Productivity)

| 용도 | 색상 | HEX |
|------|------|-----|
| Primary | Indigo | `#5B5FC7` |
| Accent | Blue | `#3B82F6` |
| Background | Zinc 50 | `#FAFAFA` |
| Surface | White | `#FFFFFF` |
| Border | Zinc 200 | `#E4E4E7` |
| Text Primary | Zinc 900 | `#18181B` |
| Text Secondary | Zinc 500 | `#71717A` |

### Priority Badge Colors

| 우선순위 | Background | Text |
|----------|------------|------|
| HIGH | `#FEE2E2` | `#DC2626` |
| MEDIUM | `#FEF3C7` | `#D97706` |
| LOW | `#DCFCE7` | `#16A34A` |

### Label Tag Colors (기본 라벨)

| 라벨 | Background | Text |
|------|------------|------|
| Bug | `#FEE2E2` | `#DC2626` |
| Feature | `#DBEAFE` | `#2563EB` |
| Enhancement | `#F3E8FF` | `#7C3AED` |
| Docs | `#D1FAE5` | `#059669` |

### Issue Card Component

```
+------------------------------------------+
| JL-12                                    |
| Implement email notification system      |
| +--------+  +----------+                 |
| | MEDIUM |  | Feature  |                 |
| +--------+  +----------+                 |
| [Avatar] Hojeong          2/5    Dec 20  |
+------------------------------------------+
```

핵심 요소:
- 이슈 ID (JL-12 형식)
- 제목 (최대 2줄)
- 우선순위 배지
- 라벨 태그 (최대 2개 표시, 나머지 +N)
- 담당자 아바타
- 서브태스크 진행률 (2/5)
- 마감일

### Issue Detail Panel (400px)

```
+------------------------------------------+
| JL-8                              [X]    |
+------------------------------------------+
| Build kanban board drag & drop           |
|                                          |
| [AI Panel - Epic 5에서 구현]             |
|                                          |
| Description                              |
| Implement drag and drop functionality... |
|                                          |
| Status: In Progress    Priority: HIGH    |
| Assignee: Hojeong      Due: Dec 18       |
|                                          |
| [Subtasks]                               |
| ☑ Setup @dnd-kit                         |
| ☑ Create draggable cards                 |
| ☐ Implement drop zones                   |
| ☐ Add visual feedback                    |
|                                          |
| [History]                                |
| - Status: Backlog → In Progress (2h ago) |
|                                          |
| [Comments - Epic 4에서 구현]             |
+------------------------------------------+
```

### Form Patterns

**이슈 생성 모달**
- Label 위치: Input 위
- 필수 표시: 라벨 옆 빨간 *
- Validation 시점: onBlur
- Error 표시: Input 아래 빨간 텍스트

**필터 UI**
- 상태 필터: Multi-select Checkbox
- 우선순위 필터: Multi-select Checkbox
- 담당자 필터: Searchable Select
- 라벨 필터: Multi-select Chips
- 마감일 필터: Date Range Picker

### Responsive Design

| Breakpoint | 레이아웃 |
|------------|----------|
| Desktop (1280px+) | Sidebar + Main + Detail Panel |
| Laptop (1024-1279px) | Sidebar 축소 + Detail Panel 오버레이 |
| Tablet (768-1023px) | Sidebar 숨김, 단일 컬럼 |
| Mobile (<768px) | Bottom Nav, 전체 화면 뷰 |

## Detailed Design

### Services and Modules

| 모듈 | 책임 | 입력 | 출력 |
|------|------|------|------|
| `ProjectService` | 프로젝트 CRUD, 아카이브, 즐겨찾기 | projectId, teamId, userId | Project, Project[] |
| `IssueService` | 이슈 CRUD, 상태 변경, 검색/필터 | issueId, projectId, filters | Issue, Issue[] |
| `LabelService` | 라벨 CRUD, 이슈 라벨 연결 | labelId, projectId, issueId | Label, Label[] |
| `SubtaskService` | 서브태스크 CRUD, 완료 토글 | subtaskId, issueId | Subtask, Subtask[] |
| `HistoryService` | 이슈 변경 히스토리 기록/조회 | issueId | IssueHistory[] |

### Data Models and Contracts

#### Projects 테이블
```sql
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams NOT NULL,
  owner_id UUID REFERENCES public.profiles NOT NULL,
  name VARCHAR(100) NOT NULL,          -- 1~100자
  key VARCHAR(10) NOT NULL,            -- 프로젝트 키 (JL, PROJ 등)
  description TEXT,                     -- 최대 2000자, 마크다운 지원
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(team_id, key)                 -- 팀 내 고유 키
);
```

#### Project Favorites 테이블
```sql
CREATE TABLE public.project_favorites (
  user_id UUID REFERENCES public.profiles NOT NULL,
  project_id UUID REFERENCES public.projects NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, project_id)
);
```

#### Statuses 테이블 (커스텀 상태)
```sql
CREATE TABLE public.statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects NOT NULL,
  name VARCHAR(30) NOT NULL,           -- 1~30자
  color VARCHAR(7),                    -- HEX 색상
  position INTEGER NOT NULL,           -- 컬럼 순서
  wip_limit INTEGER,                   -- WIP Limit (null = 무제한)
  is_default BOOLEAN DEFAULT FALSE,    -- 기본 상태 여부
  UNIQUE(project_id, name)
);
```

#### Labels 테이블
```sql
CREATE TABLE public.labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects NOT NULL,
  name VARCHAR(30) NOT NULL,           -- 1~30자
  color VARCHAR(7) NOT NULL,           -- HEX 색상
  UNIQUE(project_id, name)
);
```

#### Issues 테이블
```sql
CREATE TABLE public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects NOT NULL,
  owner_id UUID REFERENCES public.profiles NOT NULL,
  assignee_id UUID REFERENCES public.profiles,
  status_id UUID REFERENCES public.statuses NOT NULL,
  issue_number INTEGER NOT NULL,       -- 프로젝트 내 순번
  title VARCHAR(200) NOT NULL,         -- 1~200자
  description TEXT,                    -- 최대 5000자
  priority VARCHAR(10) DEFAULT 'MEDIUM' CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
  due_date DATE,
  position INTEGER NOT NULL,           -- 컬럼 내 순서
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(project_id, issue_number)
);
```

#### Issue Labels 테이블 (다대다)
```sql
CREATE TABLE public.issue_labels (
  issue_id UUID REFERENCES public.issues NOT NULL,
  label_id UUID REFERENCES public.labels NOT NULL,
  PRIMARY KEY (issue_id, label_id)
);
```

#### Subtasks 테이블
```sql
CREATE TABLE public.subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues NOT NULL,
  title VARCHAR(200) NOT NULL,         -- 1~200자
  is_completed BOOLEAN DEFAULT FALSE,
  position INTEGER NOT NULL,           -- 순서
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Issue History 테이블
```sql
CREATE TABLE public.issue_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues NOT NULL,
  changed_by UUID REFERENCES public.profiles NOT NULL,
  field_name VARCHAR(50) NOT NULL,     -- 'status', 'assignee', 'priority', 'title', 'due_date'
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### APIs and Interfaces

#### 프로젝트 API

| Method | Endpoint | 설명 | Request | Response |
|--------|----------|------|---------|----------|
| POST | `/api/projects` | 프로젝트 생성 | `{ name, key?, description?, teamId }` | `{ success: true, data: Project }` |
| GET | `/api/projects` | 프로젝트 목록 | `?teamId=...&archived=false` | `{ success: true, data: Project[] }` |
| GET | `/api/projects/[projectId]` | 프로젝트 상세 | - | `{ success: true, data: Project }` |
| PUT | `/api/projects/[projectId]` | 프로젝트 수정 | `{ name?, description? }` | `{ success: true, data: Project }` |
| DELETE | `/api/projects/[projectId]` | 프로젝트 삭제 | - | `{ success: true }` |
| PUT | `/api/projects/[projectId]/archive` | 아카이브 토글 | - | `{ success: true, data: { isArchived } }` |
| PUT | `/api/projects/[projectId]/favorite` | 즐겨찾기 토글 | - | `{ success: true, data: { isFavorite } }` |

#### 이슈 API

| Method | Endpoint | 설명 | Request | Response |
|--------|----------|------|---------|----------|
| POST | `/api/projects/[projectId]/issues` | 이슈 생성 | `{ title, description?, priority?, assigneeId?, dueDate?, labelIds? }` | `{ success: true, data: Issue }` |
| GET | `/api/projects/[projectId]/issues` | 이슈 목록 | `?status=...&priority=...&assignee=...&label=...&search=...` | `{ success: true, data: Issue[], pagination }` |
| GET | `/api/issues/[issueId]` | 이슈 상세 | - | `{ success: true, data: Issue }` |
| PUT | `/api/issues/[issueId]` | 이슈 수정 | `{ title?, description?, status?, priority?, assigneeId?, dueDate?, labelIds? }` | `{ success: true, data: Issue }` |
| DELETE | `/api/issues/[issueId]` | 이슈 삭제 | - | `{ success: true }` |
| GET | `/api/issues/[issueId]/history` | 히스토리 조회 | - | `{ success: true, data: IssueHistory[] }` |

#### 라벨 API

| Method | Endpoint | 설명 | Request | Response |
|--------|----------|------|---------|----------|
| GET | `/api/projects/[projectId]/labels` | 라벨 목록 | - | `{ success: true, data: Label[] }` |
| POST | `/api/projects/[projectId]/labels` | 라벨 생성 | `{ name, color }` | `{ success: true, data: Label }` |
| PUT | `/api/labels/[labelId]` | 라벨 수정 | `{ name?, color? }` | `{ success: true, data: Label }` |
| DELETE | `/api/labels/[labelId]` | 라벨 삭제 | - | `{ success: true }` |

#### 서브태스크 API

| Method | Endpoint | 설명 | Request | Response |
|--------|----------|------|---------|----------|
| POST | `/api/issues/[issueId]/subtasks` | 서브태스크 생성 | `{ title }` | `{ success: true, data: Subtask }` |
| PUT | `/api/subtasks/[subtaskId]` | 서브태스크 수정 | `{ title?, isCompleted? }` | `{ success: true, data: Subtask }` |
| DELETE | `/api/subtasks/[subtaskId]` | 서브태스크 삭제 | - | `{ success: true }` |
| PUT | `/api/subtasks/[subtaskId]/reorder` | 순서 변경 | `{ position }` | `{ success: true }` |

### Workflows and Sequencing

#### 이슈 생성 Flow
```
1. 사용자가 "+ New Issue" 클릭
2. 이슈 생성 모달 표시
3. 사용자가 제목, 설명, 우선순위, 라벨, 담당자, 마감일 입력
4. 클라이언트 유효성 검증 (zod)
5. POST /api/projects/[projectId]/issues 호출
6. 서버: 팀 멤버십 검증 (FR-070)
7. 서버: 프로젝트당 이슈 개수 검증 (최대 200개)
8. 서버: issue_number 자동 생성 (프로젝트 내 최대값 + 1)
9. 서버: 기본 상태(Backlog)의 status_id 조회
10. 서버: issues 테이블에 INSERT
11. 서버: issue_labels 테이블에 라벨 연결 INSERT
12. 응답 반환, 낙관적 UI 업데이트
```

#### 이슈 상태 변경 Flow (히스토리 기록)
```
1. 사용자가 상태 드롭다운 변경 또는 Drag & Drop
2. PUT /api/issues/[issueId] 호출 (status_id 변경)
3. 서버: 팀 멤버십 검증
4. 서버: 이전 status 값 조회
5. 서버: issues 테이블 UPDATE
6. 서버: issue_history 테이블에 변경 기록 INSERT
7. 응답 반환, 낙관적 UI 업데이트
```

#### 이슈 검색/필터링 Flow
```
1. 사용자가 검색어 입력 또는 필터 선택
2. Debounce 적용 (300ms)
3. URL 쿼리 파라미터 업데이트 (?status=TODO&priority=HIGH)
4. GET /api/projects/[projectId]/issues 호출
5. 서버: WHERE 조건 동적 구성
   - title ILIKE '%search%' (검색어)
   - status_id IN (...) (상태 필터)
   - priority IN (...) (우선순위 필터)
   - assignee_id = ... (담당자 필터)
   - issue_id IN (SELECT issue_id FROM issue_labels WHERE label_id IN (...)) (라벨 필터)
   - due_date BETWEEN ... AND ... (마감일 필터)
6. 페이지네이션 적용 (LIMIT, OFFSET)
7. 응답 반환
```

## Non-Functional Requirements

### Performance

| 요구사항 | 목표 | 구현 전략 |
|----------|------|----------|
| API 응답 시간 | 500ms 이내 | Supabase Edge Functions, 적절한 인덱싱 |
| 이슈 목록 로딩 | 1초 이내 | TanStack Query 캐싱, 페이지네이션 (20개/페이지) |
| 검색 반응 | 300ms 디바운스 | useDeferredValue, 낙관적 업데이트 |
| 필터 변경 | 즉각적 | URL 상태 동기화, 캐시 활용 |

**인덱스 전략:**
```sql
CREATE INDEX idx_issues_project_status ON issues(project_id, status_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_issues_project_assignee ON issues(project_id, assignee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_issues_project_priority ON issues(project_id, priority) WHERE deleted_at IS NULL;
CREATE INDEX idx_issues_due_date ON issues(due_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_issue_labels_issue ON issue_labels(issue_id);
CREATE INDEX idx_issue_labels_label ON issue_labels(label_id);
CREATE INDEX idx_subtasks_issue ON subtasks(issue_id);
CREATE INDEX idx_issue_history_issue ON issue_history(issue_id);
```

### Security

| 요구사항 | 구현 |
|----------|------|
| 팀 멤버십 검증 (FR-070) | RLS 정책 + API 미들웨어 |
| Soft Delete (FR-071) | `deleted_at` 필드, 조회 시 필터 |
| 권한 검증 | 삭제: 이슈 소유자, 프로젝트 소유자, 팀 OWNER/ADMIN |
| 입력 검증 | zod 스키마로 클라이언트/서버 이중 검증 |
| XSS 방지 | 마크다운 렌더링 시 sanitize-html 사용 |

**RLS 정책 (이슈):**
```sql
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

CREATE POLICY "Team members can insert issues"
  ON public.issues FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );
```

### Reliability/Availability

| 요구사항 | 구현 |
|----------|------|
| 데이터 손실 방지 | Soft Delete 패턴 (복구 가능) |
| 낙관적 업데이트 실패 | TanStack Query 롤백 메커니즘 |
| 오프라인 지원 | 미지원 (MVP 범위 외) |
| 에러 복구 | Toast 알림 + 재시도 버튼 |

### Observability

| 요구사항 | 구현 |
|----------|------|
| 에러 로깅 | console.error (개발), 구조화된 JSON (프로덕션) |
| 성능 모니터링 | Firebase Performance Monitoring |
| 사용자 행동 | 미구현 (MVP 범위 외) |

**로깅 시그널:**
- `project.created`, `project.updated`, `project.deleted`, `project.archived`
- `issue.created`, `issue.updated`, `issue.deleted`, `issue.statusChanged`
- `error.api`, `error.validation`

## Dependencies and Integrations

### 외부 의존성

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `@tanstack/react-query` | ^5.x | 서버 상태 관리, 캐싱 |
| `zustand` | ^4.x | 클라이언트 상태 (필터) |
| `react-hook-form` | ^7.x | 폼 관리 |
| `zod` | ^3.x | 유효성 검증 스키마 |
| `@hookform/resolvers` | ^3.x | zod + react-hook-form 연동 |
| `date-fns` | ^3.x | 날짜 포맷팅 |
| `react-markdown` | ^9.x | 마크다운 렌더링 |
| `sanitize-html` | ^2.x | HTML 정제 (XSS 방지) |

### 내부 의존성

| 모듈 | 의존 대상 | 설명 |
|------|----------|------|
| `ProjectService` | Supabase Client | 데이터베이스 접근 |
| `IssueService` | Supabase Client, HistoryService | 이슈 CRUD + 히스토리 연동 |
| `use-projects.ts` | TanStack Query, ProjectService | 프로젝트 데이터 훅 |
| `use-issues.ts` | TanStack Query, IssueService, useFilterStore | 이슈 데이터 + 필터 훅 |

### Epic 간 의존성

| Epic | 의존 관계 |
|------|----------|
| Epic 1 | **선행 필수** - 인증, DB 스키마, RLS 정책 |
| Epic 2 | 병렬 가능 - 팀 멤버 목록 (담당자 선택에 사용) |
| Epic 4 | 후행 - 칸반 보드는 이 Epic의 이슈 API 사용 |
| Epic 5 | 후행 - AI 기능은 이 Epic의 이슈 데이터 사용 |

## Acceptance Criteria (Authoritative)

### 프로젝트 관련 (FR-020~027)

| AC ID | 설명 | FR |
|-------|------|-----|
| AC-P01 | 팀 내에서 프로젝트 생성 시 이름(필수), 설명(선택), 키 자동 생성 | FR-020 |
| AC-P02 | 팀당 프로젝트 15개 초과 시 에러 메시지 표시 | FR-020 |
| AC-P03 | 프로젝트 목록에서 즐겨찾기 프로젝트가 상단에 표시됨 | FR-021 |
| AC-P04 | 프로젝트 상세 페이지에서 이슈 통계 (상태별 개수) 표시 | FR-022 |
| AC-P05 | 프로젝트 이름, 설명 수정 시 즉시 반영 | FR-023 |
| AC-P06 | 프로젝트 삭제 시 하위 이슈도 Soft Delete 처리 | FR-024 |
| AC-P07 | 프로젝트 설명에 마크다운 입력 시 렌더링되어 표시 | FR-025 |
| AC-P08 | 아카이브된 프로젝트는 기본 목록에서 숨겨지고 별도 표시 | FR-026 |
| AC-P09 | 즐겨찾기 토글 시 Sidebar에 즉시 반영 | FR-027 |

### 이슈 관련 (FR-030~039-2)

| AC ID | 설명 | FR |
|-------|------|-----|
| AC-I01 | 이슈 생성 시 자동으로 프로젝트 키 기반 ID 부여 (JL-1, JL-2...) | FR-030 |
| AC-I02 | 프로젝트당 이슈 200개 초과 시 에러 메시지 표시 | FR-030 |
| AC-I03 | 이슈 상세에서 제목, 설명, 상태, 우선순위, 담당자, 마감일, 라벨 표시 | FR-031 |
| AC-I04 | 서브태스크 목록과 진행률 (완료/전체) 표시 | FR-031, FR-039-2 |
| AC-I05 | 이슈 필드 수정 시 즉시 반영 | FR-032 |
| AC-I06 | 상태 변경 시 히스토리에 자동 기록 | FR-033, FR-039 |
| AC-I07 | 담당자는 팀 멤버 목록에서만 선택 가능 | FR-034 |
| AC-I08 | 이슈 삭제는 소유자, 프로젝트 소유자, 팀 OWNER/ADMIN만 가능 | FR-035 |
| AC-I09 | 검색어 입력 시 제목 기준 실시간 필터링 | FR-036 |
| AC-I10 | 상태, 우선순위, 담당자, 라벨, 마감일 필터 동작 | FR-036 |
| AC-I11 | 복합 필터 적용 시 AND 조건으로 결합 | FR-036 |
| AC-I12 | 필터 상태가 URL에 반영되어 공유 가능 | FR-036 |
| AC-I13 | 우선순위별 색상 배지 표시 (HIGH: 빨강, MEDIUM: 노랑, LOW: 초록) | FR-037 |
| AC-I14 | 프로젝트당 라벨 20개, 이슈당 라벨 5개 제한 | FR-038 |
| AC-I15 | 라벨 생성 시 이름과 색상 지정 가능 | FR-038 |
| AC-I16 | 히스토리 탭에서 상태, 담당자, 우선순위 변경 이력 조회 가능 | FR-039 |
| AC-I17 | 서브태스크 추가/완료 토글/삭제 동작 | FR-039-2 |
| AC-I18 | 이슈당 서브태스크 20개 제한 | FR-039-2 |
| AC-I19 | 이슈 카드에 서브태스크 진행률 표시 (2/5 형식) | FR-039-2 |

## Traceability Mapping

| AC ID | Spec Section | Component/API | Test Idea |
|-------|--------------|---------------|-----------|
| AC-P01 | Data Models - projects | POST /api/projects | 유효한 입력으로 생성 성공, 필수 필드 누락 시 에러 |
| AC-P02 | Data Constraints | POST /api/projects | 15개 프로젝트 존재 시 추가 생성 실패 |
| AC-P03 | Workflows | GET /api/projects | 즐겨찾기 프로젝트 먼저 정렬 확인 |
| AC-P04 | APIs | GET /api/projects/[id] | 이슈 통계 포함 응답 확인 |
| AC-P05 | APIs | PUT /api/projects/[id] | 수정 후 GET 시 변경 확인 |
| AC-P06 | Security - Soft Delete | DELETE /api/projects/[id] | deleted_at 설정, 이슈도 삭제 확인 |
| AC-P07 | UX - Form | 프로젝트 상세 페이지 | 마크다운 렌더링 확인 |
| AC-P08 | APIs | GET /api/projects?archived=true | 아카이브 필터 동작 확인 |
| AC-P09 | APIs | PUT /api/projects/[id]/favorite | 즐겨찾기 토글 후 상태 확인 |
| AC-I01 | Data Models - issues | POST /api/projects/[id]/issues | issue_number 자동 증가 확인 |
| AC-I02 | Data Constraints | POST /api/projects/[id]/issues | 200개 초과 시 에러 응답 |
| AC-I03 | APIs | GET /api/issues/[id] | 모든 필드 포함 응답 확인 |
| AC-I04 | APIs | GET /api/issues/[id] | subtasks 배열, 진행률 계산 |
| AC-I05 | APIs | PUT /api/issues/[id] | 각 필드 수정 후 확인 |
| AC-I06 | Workflows | PUT /api/issues/[id] | issue_history 테이블 INSERT 확인 |
| AC-I07 | Security | PUT /api/issues/[id] | 팀 외 멤버 지정 시 에러 |
| AC-I08 | Security - Authorization | DELETE /api/issues/[id] | 권한별 삭제 성공/실패 |
| AC-I09 | Workflows - 검색 | GET /api/projects/[id]/issues?search= | 제목 ILIKE 검색 확인 |
| AC-I10 | APIs | GET /api/projects/[id]/issues | 각 필터 파라미터 동작 확인 |
| AC-I11 | Workflows - 검색 | GET /api/projects/[id]/issues | 복합 필터 AND 조건 확인 |
| AC-I12 | UX | 이슈 목록 페이지 | URL 파라미터 ↔ UI 동기화 확인 |
| AC-I13 | UX - Priority Badge | 이슈 카드 컴포넌트 | 색상 클래스 적용 확인 |
| AC-I14 | Data Constraints | POST /api/projects/[id]/labels, PUT /api/issues/[id] | 제한 초과 시 에러 |
| AC-I15 | APIs | POST /api/projects/[id]/labels | name, color 저장 확인 |
| AC-I16 | APIs | GET /api/issues/[id]/history | field_name, old/new_value 포함 |
| AC-I17 | APIs | POST/PUT/DELETE /api/subtasks | CRUD 동작 확인 |
| AC-I18 | Data Constraints | POST /api/issues/[id]/subtasks | 20개 초과 시 에러 |
| AC-I19 | UX - Issue Card | 이슈 카드 컴포넌트 | 진행률 표시 확인 |

## Risks, Assumptions, Open Questions

### Risks

| 리스크 | 영향 | 완화 전략 |
|--------|------|----------|
| **R1**: 복잡한 필터 조합 시 쿼리 성능 저하 | 사용자 경험 저하 | 적절한 인덱스, 페이지네이션 필수 적용 |
| **R2**: 히스토리 테이블 데이터 급증 | 스토리지 비용 증가 | MVP에서는 모니터링만, 추후 정리 정책 도입 |
| **R3**: 동시 편집 충돌 | 데이터 불일치 | MVP에서는 Last-Write-Wins, 추후 실시간 동기화 |

### Assumptions

| 가정 | 설명 |
|------|------|
| **A1** | Epic 1의 DB 스키마와 RLS 정책이 완료된 상태에서 시작 |
| **A2** | 팀 멤버 목록 API가 Epic 2에서 제공됨 (담당자 선택용) |
| **A3** | 프로젝트당 이슈 200개, 팀당 프로젝트 15개는 MVP 규모에 충분 |
| **A4** | 마크다운 렌더링은 기본 문법만 지원 (이미지, 테이블 등 복잡한 기능 제외) |

### Open Questions

| 질문 | 결정 필요 시점 | 제안 |
|------|---------------|------|
| **Q1**: 이슈 ID 형식 (JL-1 vs #1) | Story 3.3 구현 전 | 프로젝트 키 + 번호 (JL-1) 권장 |
| **Q2**: 필터 저장 기능 필요? | MVP 이후 | MVP에서는 URL 공유로 대체 |
| **Q3**: 이슈 템플릿 기능? | MVP 이후 | MVP에서는 미구현 |

## Test Strategy Summary

### 테스트 레벨

| 레벨 | 범위 | 도구 |
|------|------|------|
| **Unit** | 유효성 검증 스키마, 유틸 함수 | Vitest |
| **Integration** | API Routes, DB 쿼리 | Vitest + Supabase 테스트 DB |
| **E2E** | 사용자 시나리오 | Chrome DevTools MCP |

### 핵심 테스트 시나리오

1. **프로젝트 CRUD 플로우**
   - 프로젝트 생성 → 목록 확인 → 수정 → 아카이브 → 복원 → 삭제

2. **이슈 CRUD 플로우**
   - 이슈 생성 → 상태 변경 → 담당자 지정 → 우선순위 변경 → 히스토리 확인 → 삭제

3. **검색/필터 플로우**
   - 검색어 입력 → 상태 필터 → 우선순위 필터 → 복합 필터 → 필터 초기화

4. **서브태스크 플로우**
   - 서브태스크 추가 → 완료 토글 → 진행률 확인 → 삭제

5. **권한 검증**
   - 팀 멤버 아닌 사용자의 접근 차단 확인
   - 삭제 권한 (소유자/관리자) 확인

### 엣지 케이스

- 프로젝트 15개 제한 도달 시 생성 시도
- 이슈 200개 제한 도달 시 생성 시도
- 라벨 20개/5개 제한 도달 시
- 서브태스크 20개 제한 도달 시
- 빈 검색어, 특수문자 검색
- 동시에 같은 이슈 수정 시도

---

*Generated by BMAD Epic Tech Context Workflow*
*Date: 2025-11-29*
*Epic: 3 - 프로젝트 & 이슈 관리*
