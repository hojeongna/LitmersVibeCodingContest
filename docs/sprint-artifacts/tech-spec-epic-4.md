# Epic Technical Specification: 칸반 보드 & 댓글

Date: 2025-11-29
Author: hojeong
Epic ID: 4
Status: Draft

---

## Overview

본 Epic은 Jira Lite MVP의 핵심 사용자 경험인 **Drag & Drop 칸반 보드**와 **이슈 댓글 시스템**을 구현합니다. PRD에서 정의한 FR-050~054(칸반)와 FR-060~063(댓글) 총 9개의 기능 요구사항을 다룹니다.

칸반 보드는 사용자가 이슈의 상태를 시각적으로 파악하고 Drag & Drop으로 즉각적인 상태 변경을 수행할 수 있는 핵심 인터페이스입니다. "AI가 알아서 도와주니까 나는 중요한 것에만 집중할 수 있는 칸반 보드"라는 UX 비전을 실현하며, 100ms 이내의 즉각적인 반응성과 Linear/Trello 스타일의 직관적인 Drag & Drop 경험을 제공합니다.

댓글 시스템은 팀 멤버 간의 이슈 관련 논의를 지원하며, 이후 Epic 5에서 구현되는 AI 댓글 요약 기능의 기반이 됩니다.

## Objectives and Scope

### In Scope (구현 범위)

- **칸반 보드 UI (FR-050)**
  - 상태별 컬럼 표시 (Backlog, In Progress, Review, Done)
  - 이슈 카드 컴포넌트 (ID, 제목, 우선순위, 라벨, 담당자, 마감일, 서브태스크 진행률)
  - 컬럼 헤더 (컬럼명, 이슈 개수, WIP 상태)
  - View Tabs (Board/List/Timeline)

- **Drag & Drop (FR-051, FR-052)**
  - @dnd-kit 기반 드래그 앤 드롭 구현
  - 컬럼 간 이동 시 상태 자동 변경
  - 같은 컬럼 내 순서 변경
  - Optimistic Updates를 통한 즉각적 UI 반영
  - 드래그 중 시각적 피드백 (회전, 그림자, placeholder)

- **커스텀 컬럼 & WIP Limit (FR-053, FR-054)**
  - 프로젝트별 커스텀 상태 추가/수정/삭제
  - 컬럼별 WIP(Work In Progress) 제한 설정
  - WIP 초과 시 시각적 경고

- **댓글 CRUD (FR-060~063)**
  - 댓글 작성/조회/수정/삭제
  - 마크다운 지원
  - 작성 시간 표시 (상대 시간)
  - 권한 기반 수정/삭제 (본인 댓글, 팀 OWNER/ADMIN)

- **뷰 전환 & UX 개선**
  - Board/List 뷰 전환
  - 빈 상태 처리
  - 반응형 레이아웃 (모바일 가로 스크롤)

### Out of Scope (범위 외)

- Timeline(간트 차트) 뷰 구현 (placeholder만)
- 실시간 협업 동기화 (Supabase Realtime 별도 Epic)
- AI 댓글 요약 (Epic 5에서 구현)
- 멘션(@) 기능 (향후 확장)
- 파일 첨부 (향후 확장)

## System Architecture Alignment

### 아키텍처 컴포넌트 매핑

| 컴포넌트 | 경로 | 역할 |
|----------|------|------|
| `KanbanBoard` | `components/kanban/board.tsx` | 칸반 보드 전체 컨테이너, DndContext Provider |
| `KanbanColumn` | `components/kanban/column.tsx` | 상태별 컬럼, SortableContext |
| `IssueCard` | `components/kanban/issue-card.tsx` | 드래그 가능한 이슈 카드 |
| `SortableIssue` | `components/kanban/sortable-issue.tsx` | @dnd-kit 래퍼 컴포넌트 |
| `IssueDetailPanel` | `components/issues/issue-detail-panel.tsx` | 우측 슬라이드 패널, 댓글 포함 |
| `CommentSection` | `components/issues/comment-section.tsx` | 댓글 목록 및 입력 |
| `CommentItem` | `components/issues/comment-item.tsx` | 개별 댓글 컴포넌트 |

### 기술 스택 정렬

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- **State**: Zustand (UI 상태), TanStack Query (서버 상태)
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase PostgreSQL (issues, comments, statuses 테이블)
- **API**: Next.js API Routes

### 데이터 흐름

```
User Drag Action
       ↓
DndContext (onDragEnd)
       ↓
Optimistic Update (TanStack Query)
       ↓
API Call (PUT /api/issues/[issueId]/move)
       ↓
Supabase Update (issues.status_id, issues.position)
       ↓
issue_history 트리거 (상태 변경 기록)
       ↓
Success → UI 유지 / Error → Rollback
```

## UX Design Specification

### 화면 레이아웃

UX 스펙 문서(`docs/ux-design-specification.md`)의 Section 4.2 "Key Screen Designs"를 참조합니다.

```
+------------------+--------------------------------+------------------+
| Sidebar (240px)  | Main Panel                     | Detail Panel     |
| - Logo           | - Header (Project + Actions)   | - Issue Title    |
| - Navigation     | - View Tabs (Board/List)       | - AI Summary     |
| - Projects       | - Filters                      | - Description    |
| - Team           | - Kanban Columns               | - Meta Info      |
|                  |   [Backlog][Progress][Done]    | - Comments       |
+------------------+--------------------------------+------------------+
```

### 색상 테마 (Linear Productivity)

| 용도 | 색상 | HEX |
|------|------|-----|
| Primary | Indigo | `#5B5FC7` |
| Accent | Blue | `#3B82F6` |
| Background | Zinc 50 | `#FAFAFA` |
| Surface | White | `#FFFFFF` |
| Border | Zinc 200 | `#E4E4E7` |
| Text Primary | Zinc 900 | `#18181B` |
| Text Secondary | Zinc 500 | `#71717A` |

### 컬럼 색상

| 상태 | Background | Border |
|------|------------|--------|
| Backlog | `#F4F4F5` (Zinc 100) | `#E4E4E7` |
| In Progress | `#DBEAFE` (Blue 100) | `#93C5FD` |
| Review | `#EDE9FE` (Violet 100) | `#C4B5FD` |
| Done | `#DCFCE7` (Green 100) | `#86EFAC` |

### 이슈 카드 컴포넌트 스타일

```
+------------------------------------------+
| JL-42                        [HIGH] 🔴   |
| Fix authentication timeout bug           |
|                                          |
| [Bug] [Backend]                          |
|                                          |
| 👤 HJ    📅 Nov 30    ✓ 2/5              |
+------------------------------------------+
```

**카드 규격:**
- Width: min 280px, max 320px
- Padding: 16px
- Border Radius: 8px (md)
- Shadow: `shadow-sm` (hover 시 `shadow-md`)
- 드래그 중: `rotate-3`, `shadow-lg`, `opacity-90`

### 우선순위 배지

| 우선순위 | Background | Text | 아이콘 |
|----------|------------|------|--------|
| HIGH | `#FEE2E2` | `#DC2626` | 🔴 또는 ⬆ |
| MEDIUM | `#FEF3C7` | `#D97706` | 🟡 또는 ➡ |
| LOW | `#DCFCE7` | `#16A34A` | 🟢 또는 ⬇ |

### 댓글 컴포넌트 스타일

```
+------------------------------------------+
| +-------+  Hojeong           2 hours ago |
| | [HJ]  |  This looks good! Let me check |
| +-------+  the edge cases first.         |
|            [Edit] [Delete]               |
+------------------------------------------+
```

**댓글 입력:**
```
+------------------------------------------+
| +-------+  Write a comment...            |
| | [HJ]  |  [____________________________]|
| +-------+  [@ Mention] [📎] [Send →]     |
+------------------------------------------+
```

### 인터랙션 패턴

**Drag & Drop:**
1. 카드 클릭 & 홀드 (150ms) → 드래그 시작
2. 카드 들어올림 효과 (회전 3°, 그림자 증가)
3. 드롭 존 하이라이트 (파란 테두리)
4. 드롭 → 상태 변경, 히스토리 기록

**WIP Limit 경고:**
- 컬럼 헤더: `5/3` (빨간색 텍스트)
- 컬럼 테두리: `border-red-300`
- 드롭 시 Toast 경고 (이동은 허용)

### 반응형 브레이크포인트

| 브레이크포인트 | 너비 | 레이아웃 변경 |
|---------------|------|--------------|
| Desktop | 1280px+ | 전체 레이아웃 |
| Laptop | 1024-1279px | Detail Panel 오버레이 |
| Tablet | 768-1023px | Sidebar 축소 (60px), 가로 스크롤 |
| Mobile | < 768px | 단일 컬럼, 스와이프 전환 |

## Detailed Design

### Services and Modules

| 모듈 | 책임 | 입력 | 출력 |
|------|------|------|------|
| `KanbanService` | 칸반 보드 데이터 조회/조작 | projectId, statusId | Issue[], Status[] |
| `IssuePositionService` | 이슈 순서 관리 | issueId, newPosition | updated Issue |
| `StatusService` | 커스텀 상태 CRUD | projectId, statusData | Status |
| `CommentService` | 댓글 CRUD | issueId, commentData | Comment |
| `HistoryService` | 변경 이력 기록 | issueId, changeData | IssueHistory |

### Data Models and Contracts

#### statuses 테이블 (기존 architecture.md 기반)

```sql
CREATE TABLE public.statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects NOT NULL,
  name VARCHAR(30) NOT NULL,
  color VARCHAR(7),  -- HEX
  position INTEGER NOT NULL,
  wip_limit INTEGER,  -- null = unlimited
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 상태 생성 트리거
CREATE OR REPLACE FUNCTION create_default_statuses()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.statuses (project_id, name, color, position, is_default) VALUES
    (NEW.id, 'Backlog', '#71717A', 0, true),
    (NEW.id, 'In Progress', '#3B82F6', 1, true),
    (NEW.id, 'Review', '#8B5CF6', 2, true),
    (NEW.id, 'Done', '#22C55E', 3, true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_project_created
  AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION create_default_statuses();
```

#### issues 테이블 확장 (position 필드)

```sql
-- issues 테이블에 position 필드 확인
ALTER TABLE public.issues
  ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0;

-- 인덱스 추가 (칸반 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_issues_status_position
  ON public.issues(status_id, position)
  WHERE deleted_at IS NULL;
```

#### comments 테이블 (기존 architecture.md 기반)

```sql
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues NOT NULL,
  author_id UUID REFERENCES public.profiles NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- RLS 정책
CREATE POLICY "Team members can view comments"
  ON public.comments FOR SELECT
  USING (
    issue_id IN (
      SELECT i.id FROM public.issues i
      JOIN public.projects p ON i.project_id = p.id
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Team members can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (
    issue_id IN (
      SELECT i.id FROM public.issues i
      JOIN public.projects p ON i.project_id = p.id
      JOIN public.team_members tm ON p.team_id = tm.team_id
      WHERE tm.user_id = auth.uid()
    )
  );
```

#### TypeScript 타입 정의

```typescript
// types/kanban.ts
export interface Status {
  id: string;
  project_id: string;
  name: string;
  color: string | null;
  position: number;
  wip_limit: number | null;
  is_default: boolean;
}

export interface IssueCard {
  id: string;
  title: string;
  status_id: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  position: number;
  assignee: { id: string; name: string; avatar_url: string } | null;
  labels: { id: string; name: string; color: string }[];
  due_date: string | null;
  subtask_count: number;
  subtask_completed: number;
}

export interface KanbanColumn {
  status: Status;
  issues: IssueCard[];
  issueCount: number;
  isOverWipLimit: boolean;
}

// types/comment.ts
export interface Comment {
  id: string;
  issue_id: string;
  author: { id: string; name: string; avatar_url: string };
  content: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
}
```

### APIs and Interfaces

#### 칸반 보드 API

| Endpoint | Method | 설명 | Request | Response |
|----------|--------|------|---------|----------|
| `/api/projects/[projectId]/board` | GET | 칸반 보드 데이터 | - | `{ columns: KanbanColumn[] }` |
| `/api/issues/[issueId]/move` | PUT | 이슈 이동 | `{ status_id, position }` | `{ issue: Issue }` |
| `/api/projects/[projectId]/statuses` | GET | 상태 목록 | - | `{ statuses: Status[] }` |
| `/api/projects/[projectId]/statuses` | POST | 상태 추가 | `{ name, color, position, wip_limit }` | `{ status: Status }` |
| `/api/statuses/[statusId]` | PUT | 상태 수정 | `{ name?, color?, position?, wip_limit? }` | `{ status: Status }` |
| `/api/statuses/[statusId]` | DELETE | 상태 삭제 | - | `{ success: true }` |

#### 댓글 API

| Endpoint | Method | 설명 | Request | Response |
|----------|--------|------|---------|----------|
| `/api/issues/[issueId]/comments` | GET | 댓글 목록 | `?page=1&limit=20` | `{ comments: Comment[], pagination }` |
| `/api/issues/[issueId]/comments` | POST | 댓글 작성 | `{ content }` | `{ comment: Comment }` |
| `/api/comments/[commentId]` | PUT | 댓글 수정 | `{ content }` | `{ comment: Comment }` |
| `/api/comments/[commentId]` | DELETE | 댓글 삭제 | - | `{ success: true }` |

#### API 응답 형식

```typescript
// 성공
{ success: true, data: {...} }

// 에러
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'FORBIDDEN',
    message: '에러 메시지'
  }
}
```

#### 이슈 이동 API 상세

```typescript
// PUT /api/issues/[issueId]/move
interface MoveIssueRequest {
  status_id: string;      // 새 상태 ID
  position: number;       // 새 position (0-based)
}

interface MoveIssueResponse {
  success: true;
  data: {
    issue: Issue;
    affected_issues: { id: string; position: number }[];  // 순서 변경된 이슈들
  };
}
```

### Workflows and Sequencing

#### Drag & Drop 시퀀스

```
1. User: 이슈 카드 드래그 시작
   └→ UI: 카드 들어올림 효과, placeholder 표시

2. User: 다른 컬럼으로 드래그
   └→ UI: 드롭 존 하이라이트

3. User: 드롭
   └→ DndContext: onDragEnd 이벤트 발생
   └→ TanStack Query: 낙관적 업데이트 (즉시 UI 반영)
   └→ API: PUT /api/issues/[issueId]/move 호출

4. Server:
   └→ 트랜잭션 시작
   └→ issues 테이블 업데이트 (status_id, position)
   └→ 영향받는 이슈들 position 재계산
   └→ issue_history 기록 (상태 변경)
   └→ 트랜잭션 커밋

5. Client:
   └→ 성공: UI 유지
   └→ 실패: 롤백, Toast 에러 메시지
```

#### 댓글 작성 시퀀스

```
1. User: 댓글 입력 및 Submit
   └→ 입력 필드 비활성화, 로딩 표시

2. Client:
   └→ API: POST /api/issues/[issueId]/comments 호출

3. Server:
   └→ 권한 검증 (팀 멤버십)
   └→ comments 테이블 INSERT
   └→ 알림 생성 (이슈 소유자, 담당자)

4. Client:
   └→ 성공: 댓글 목록에 추가, 입력 필드 초기화
   └→ 실패: Toast 에러 메시지
```

## Non-Functional Requirements

### Performance

| 항목 | 목표 | 측정 방법 |
|------|------|----------|
| Drag & Drop 반응 | 100ms 이내 | @dnd-kit 이벤트 → UI 업데이트 시간 |
| 칸반 보드 로드 | 1초 이내 (200 이슈) | First Contentful Paint |
| 이슈 이동 API | 300ms 이내 | API 응답 시간 |
| 댓글 로드 | 500ms 이내 | 페이지네이션 응답 시간 |

**최적화 전략:**
- TanStack Query 캐싱 (staleTime: 30초)
- Optimistic Updates (즉시 UI 반영)
- 이슈 카드 가상화 (200+ 이슈 시)
- position 필드 인덱싱

### Security

| 항목 | 구현 |
|------|------|
| 팀 멤버십 검증 | 모든 API에서 RLS 정책 적용 (FR-070) |
| 댓글 수정/삭제 권한 | 본인 댓글 또는 팀 OWNER/ADMIN |
| 상태 관리 권한 | 팀 OWNER/ADMIN만 커스텀 상태 관리 |
| Soft Delete | 댓글/상태 삭제 시 deleted_at 기록 (FR-071) |
| XSS 방지 | 댓글 내용 HTML 이스케이프 |

### Reliability/Availability

| 항목 | 전략 |
|------|------|
| 드래그 실패 복구 | Optimistic Update 롤백, 원래 위치로 복원 |
| 네트워크 오류 | 3회 재시도 (exponential backoff) |
| 동시 수정 충돌 | 최종 업데이트 우선 (Last Write Wins) |
| 데이터 일관성 | 트랜잭션 사용 (position 재계산 시) |

### Observability

| 항목 | 구현 |
|------|------|
| 로깅 | 이슈 이동, 댓글 CRUD 이벤트 로그 |
| 메트릭 | 드래그 성공/실패율, API 응답 시간 |
| 에러 추적 | 드래그 실패, API 에러 console.error |
| 변경 이력 | issue_history 테이블 자동 기록 |

## Dependencies and Integrations

### 외부 라이브러리

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `@dnd-kit/core` | ^6.x | Drag & Drop 코어 |
| `@dnd-kit/sortable` | ^8.x | 정렬 가능한 리스트 |
| `@dnd-kit/utilities` | ^3.x | CSS 트랜스폼 유틸리티 |
| `@tanstack/react-query` | ^5.x | 서버 상태 관리, 캐싱 |
| `date-fns` | ^3.x | 상대 시간 표시 |
| `react-markdown` | ^9.x | 댓글 마크다운 렌더링 |

### 내부 의존성

| 모듈 | 의존 대상 | 설명 |
|------|----------|------|
| KanbanBoard | Epic 3 IssueService | 이슈 데이터 조회 |
| IssueCard | Epic 3 LabelTag, PriorityBadge | UI 컴포넌트 재사용 |
| CommentSection | Epic 5 AICommentSummary | AI 요약 통합 (선택적) |
| 모든 API | Epic 1 AuthMiddleware | 인증/권한 검증 |

### Supabase 테이블 의존성

- `issues` (Epic 3에서 생성)
- `statuses` (본 Epic에서 확장)
- `comments` (본 Epic에서 생성)
- `issue_history` (Epic 3에서 생성, 본 Epic에서 활용)
- `profiles`, `team_members` (Epic 1에서 생성)

## Acceptance Criteria (Authoritative)

### FR-050: 칸반 보드 표시

1. **AC-050-1**: 프로젝트 페이지에서 Board 탭 클릭 시 상태별 컬럼이 표시된다
2. **AC-050-2**: 각 컬럼에 해당 상태의 이슈 카드가 표시된다
3. **AC-050-3**: 이슈 카드에 ID, 제목, 우선순위, 라벨, 담당자, 마감일, 서브태스크 진행률이 표시된다
4. **AC-050-4**: 컬럼 헤더에 컬럼명과 이슈 개수가 표시된다

### FR-051: 컬럼 간 Drag & Drop

5. **AC-051-1**: 이슈 카드를 드래그하여 다른 컬럼에 드롭할 수 있다
6. **AC-051-2**: 드롭 시 이슈 상태가 해당 컬럼의 상태로 자동 변경된다
7. **AC-051-3**: 드래그 중 시각적 피드백(회전, 그림자)이 표시된다
8. **AC-051-4**: 드롭 후 100ms 이내에 UI가 업데이트된다

### FR-052: 같은 컬럼 내 순서 변경

9. **AC-052-1**: 같은 컬럼 내에서 이슈 카드 순서를 드래그로 변경할 수 있다
10. **AC-052-2**: 변경된 순서가 저장되어 새로고침 후에도 유지된다
11. **AC-052-3**: 새 이슈는 컬럼 최하단에 추가된다

### FR-053: 커스텀 컬럼

12. **AC-053-1**: 프로젝트 설정에서 커스텀 상태를 추가할 수 있다 (최대 5개)
13. **AC-053-2**: 커스텀 상태의 이름과 색상을 수정할 수 있다
14. **AC-053-3**: 커스텀 상태를 삭제할 수 있다 (해당 이슈는 Backlog로 이동)
15. **AC-053-4**: 기본 상태(Backlog, Done)는 삭제할 수 없다

### FR-054: WIP Limit

16. **AC-054-1**: 컬럼별로 WIP Limit을 설정할 수 있다 (1~50 또는 무제한)
17. **AC-054-2**: WIP Limit 초과 시 컬럼 헤더에 경고 표시가 나타난다
18. **AC-054-3**: WIP Limit 초과해도 이슈 이동은 허용된다 (경고만)

### FR-060: 댓글 작성

19. **AC-060-1**: 이슈 상세 패널에서 댓글을 작성할 수 있다
20. **AC-060-2**: 댓글 내용은 1~1000자 사이여야 한다
21. **AC-060-3**: 댓글 작성 후 목록에 즉시 표시된다

### FR-061: 댓글 조회

22. **AC-061-1**: 댓글이 작성일 순으로 표시된다
23. **AC-061-2**: 각 댓글에 작성자, 내용, 작성 시간이 표시된다
24. **AC-061-3**: 20개 이상 댓글 시 페이지네이션 또는 무한 스크롤이 동작한다

### FR-062: 댓글 수정

25. **AC-062-1**: 본인 댓글만 수정 버튼이 표시된다
26. **AC-062-2**: 수정된 댓글에 "(수정됨)" 표시가 나타난다

### FR-063: 댓글 삭제

27. **AC-063-1**: 본인 댓글, 이슈 소유자, 팀 OWNER/ADMIN이 삭제할 수 있다
28. **AC-063-2**: 삭제 확인 모달이 표시된다
29. **AC-063-3**: 삭제된 댓글은 목록에서 제거된다 (Soft Delete)

## Traceability Mapping

| AC | FR | Spec Section | Component/API | Test Idea |
|----|-----|--------------|---------------|-----------|
| AC-050-1~4 | FR-050 | Detailed Design | KanbanBoard, KanbanColumn | 컬럼 렌더링, 이슈 카드 표시 테스트 |
| AC-051-1~4 | FR-051 | Workflows | IssueCard, PUT /move | 드래그 이벤트, 상태 변경 테스트 |
| AC-052-1~3 | FR-052 | Data Models | position 필드, SortableContext | 순서 변경 지속성 테스트 |
| AC-053-1~4 | FR-053 | APIs | StatusService, POST/PUT/DELETE statuses | 상태 CRUD 테스트 |
| AC-054-1~3 | FR-054 | UX Design | wip_limit 필드, 경고 UI | WIP 초과 시나리오 테스트 |
| AC-060-1~3 | FR-060 | APIs | POST /comments | 댓글 작성 테스트 |
| AC-061-1~3 | FR-061 | APIs | GET /comments | 댓글 목록, 페이지네이션 테스트 |
| AC-062-1~2 | FR-062 | Security | PUT /comments | 권한 검증, 수정 표시 테스트 |
| AC-063-1~3 | FR-063 | Security | DELETE /comments | 권한별 삭제 테스트 |

## Risks, Assumptions, Open Questions

### Risks

| ID | 항목 | 영향 | 완화 전략 |
|----|------|------|----------|
| R1 | 대량 이슈 시 드래그 성능 저하 | 높음 | 가상화 적용, 페이지당 이슈 수 제한 |
| R2 | position 재계산 동시성 이슈 | 중간 | 트랜잭션 사용, 낙관적 락 고려 |
| R3 | 모바일 터치 드래그 UX 불편 | 중간 | 터치 타겟 44px 이상, 길게 누르기로 시작 |
| R4 | 커스텀 상태 삭제 시 이슈 손실 우려 | 낮음 | Backlog로 자동 이동, 확인 모달 |

### Assumptions

| ID | 가정 |
|----|------|
| A1 | Epic 1에서 RLS 정책이 올바르게 설정되어 있다 |
| A2 | Epic 3에서 issues, issue_history 테이블이 생성되어 있다 |
| A3 | @dnd-kit이 React 18 Concurrent Mode와 호환된다 |
| A4 | 프로젝트당 이슈 수는 200개 이하가 일반적이다 |

### Open Questions

| ID | 질문 | 결정 |
|----|------|------|
| Q1 | 실시간 동기화는 언제 구현? | 향후 확장 (Supabase Realtime) |
| Q2 | 모바일에서 스와이프로 컬럼 전환? | Yes, 구현 예정 |
| Q3 | 댓글 멘션(@) 기능 범위? | Out of Scope (향후 확장) |

## Test Strategy Summary

### 테스트 레벨

| 레벨 | 범위 | 도구 |
|------|------|------|
| Unit | 컴포넌트 렌더링, 유틸 함수 | Vitest, React Testing Library |
| Integration | API 엔드포인트, DB 연동 | Vitest, Supabase 테스트 클라이언트 |
| E2E | 드래그 앤 드롭 시나리오, 댓글 플로우 | Chrome DevTools MCP, Playwright |

### 핵심 테스트 시나리오

1. **드래그 앤 드롭 기본 플로우**
   - 이슈 카드 드래그 → 다른 컬럼 드롭 → 상태 변경 확인
   - 같은 컬럼 내 순서 변경 → 새로고침 후 순서 유지

2. **WIP Limit 시나리오**
   - WIP Limit 설정 → 제한 초과 이동 → 경고 표시 확인

3. **댓글 CRUD 플로우**
   - 댓글 작성 → 목록 표시 → 수정 → 삭제

4. **권한 테스트**
   - MEMBER: 본인 댓글만 수정/삭제
   - ADMIN: 모든 댓글 삭제 가능
   - 타 팀 멤버: 접근 불가 (404)

### 커버리지 목표

- Unit: 80% (컴포넌트 로직)
- Integration: 핵심 API 경로 100%
- E2E: 주요 사용자 시나리오 100%

---

_Generated by BMAD Epic Tech Context Workflow v6_
_Date: 2025-11-29_
_Epic: 4 - 칸반 보드 & 댓글_
