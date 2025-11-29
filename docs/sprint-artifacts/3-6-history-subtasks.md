# Story 3.6: 히스토리 & 서브태스크

Status: review

## Story

As a **팀 멤버**,
I want **이슈의 변경 히스토리를 조회하고 서브태스크를 관리**할 수 있기를 원합니다,
so that **이슈의 변경 이력을 추적하고 작업을 세분화하여 진행률을 관리**할 수 있습니다.

## Acceptance Criteria

| AC# | 설명 | FR |
|-----|------|-----|
| AC-1 | 이슈 상세 패널에서 히스토리 탭을 통해 변경 이력을 조회할 수 있어야 한다 | FR-039 |
| AC-2 | 히스토리에는 상태, 담당자, 우선순위, 제목, 마감일 변경이 기록되어야 한다 | FR-039 |
| AC-3 | 각 히스토리 항목에 변경 항목, 이전 값, 새 값, 변경자, 변경 일시가 표시되어야 한다 | FR-039 |
| AC-4 | 히스토리는 최신순으로 정렬되어 표시되어야 한다 | FR-039 |
| AC-5 | 이슈 상세 패널에서 서브태스크를 추가할 수 있어야 한다 (제목 1~200자) | FR-039-2 |
| AC-6 | 체크박스로 서브태스크 완료/미완료를 토글할 수 있어야 한다 | FR-039-2 |
| AC-7 | 드래그로 서브태스크 순서를 변경할 수 있어야 한다 | FR-039-2 |
| AC-8 | 서브태스크를 삭제할 수 있어야 한다 | FR-039-2 |
| AC-9 | 이슈당 최대 20개 서브태스크 제한이 적용되어야 한다 | FR-039-2 |
| AC-10 | 이슈 카드에 서브태스크 진행률이 표시되어야 한다 (예: 3/5) | FR-039-2 |
| AC-11 | 이슈 상세 패널에 서브태스크 진행률 바가 표시되어야 한다 | FR-039-2 |

## Tasks / Subtasks

### 1. 히스토리 API (AC: #1~4)

- [ ] Task 1.1: 히스토리 조회 API 구현
  - [ ] `GET /api/issues/[issueId]/history` 엔드포인트 생성
  - [ ] 팀 멤버십 검증
  - [ ] 변경자 프로필 정보 JOIN
  - [ ] 최신순 정렬 (ORDER BY created_at DESC)
  - [ ] 페이지네이션 (선택)

- [ ] Task 1.2: 히스토리 자동 기록 확인
  - [ ] Story 3-4에서 구현한 히스토리 기록 로직 검증
  - [ ] 누락된 필드 히스토리 기록 보완

### 2. 서브태스크 API (AC: #5~9)

- [ ] Task 2.1: 서브태스크 CRUD API 구현
  - [ ] `GET /api/issues/[issueId]/subtasks` - 서브태스크 목록
  - [ ] `POST /api/issues/[issueId]/subtasks` - 서브태스크 생성
    - [ ] 제목 검증 (1~200자)
    - [ ] 이슈당 20개 제한 검증
    - [ ] position 자동 설정 (최하단)
  - [ ] `PUT /api/subtasks/[subtaskId]` - 서브태스크 수정 (제목, 완료 상태)
  - [ ] `DELETE /api/subtasks/[subtaskId]` - 서브태스크 삭제

- [ ] Task 2.2: 서브태스크 순서 변경 API
  - [ ] `PUT /api/subtasks/[subtaskId]/reorder` 또는 PATCH
  - [ ] position 필드 업데이트
  - [ ] 순서 재정렬 (같은 이슈 내 다른 서브태스크 position 조정)

- [ ] Task 2.3: 이슈 상세 API에 서브태스크 포함
  - [ ] `GET /api/issues/[issueId]` 응답에 subtasks 배열 추가
  - [ ] 완료 개수/전체 개수 계산

### 3. 히스토리 UI (AC: #1~4)

- [ ] Task 3.1: 히스토리 탭/섹션 구현
  - [ ] `components/issues/issue-history.tsx` 생성
  - [ ] 이슈 상세 패널 내 탭 또는 접이식 섹션
  - [ ] 히스토리 없을 때 빈 상태 표시

- [ ] Task 3.2: 히스토리 타임라인 UI
  - [ ] 타임라인 형태 레이아웃
  - [ ] 각 항목: 변경 항목 아이콘, 변경 내용, 변경자 아바타/이름, 시간
  - [ ] 예: "Status changed from Backlog to In Progress by Hojeong - 2 hours ago"

- [ ] Task 3.3: 히스토리 항목 포맷팅
  - [ ] 상태 변경: 상태명 표시
  - [ ] 담당자 변경: 아바타 + 이름 표시
  - [ ] 우선순위 변경: 배지 색상 표시
  - [ ] 마감일 변경: 날짜 포맷팅
  - [ ] 제목 변경: 이전/새 제목 표시

### 4. 서브태스크 UI (AC: #5~8, #10, #11)

- [ ] Task 4.1: 서브태스크 섹션 구현
  - [ ] `components/issues/subtask-section.tsx` 생성
  - [ ] 이슈 상세 패널 내 섹션
  - [ ] 헤더: "Subtasks (3/5)" 형태 진행률 표시

- [ ] Task 4.2: 서브태스크 추가 폼
  - [ ] 인라인 입력 필드 ("Add subtask..." placeholder)
  - [ ] Enter 시 생성
  - [ ] 20개 제한 도달 시 비활성화 + 안내 메시지

- [ ] Task 4.3: 서브태스크 아이템 컴포넌트
  - [ ] `components/issues/subtask-item.tsx` 생성
  - [ ] 체크박스 (완료 토글)
  - [ ] 제목 (완료 시 취소선)
  - [ ] 삭제 버튼 (hover 시 표시)

- [ ] Task 4.4: 서브태스크 Drag & Drop
  - [ ] @dnd-kit 사용
  - [ ] 드래그 핸들
  - [ ] 순서 변경 시 API 호출

- [ ] Task 4.5: 진행률 바
  - [ ] `components/issues/progress-bar.tsx` 생성
  - [ ] 완료 비율 시각화

- [ ] Task 4.6: 이슈 카드 진행률 표시 업데이트
  - [ ] Story 3-3의 issue-card.tsx 수정
  - [ ] 서브태스크 있을 때 "3/5" 형태 표시

### 5. TanStack Query 훅 (All ACs)

- [ ] Task 5.1: 히스토리 훅 구현
  - [ ] `hooks/use-issue-history.ts` 생성
  - [ ] `useIssueHistory` - 히스토리 조회

- [ ] Task 5.2: 서브태스크 훅 구현
  - [ ] `hooks/use-subtasks.ts` 생성
  - [ ] `useSubtasks` - 서브태스크 목록
  - [ ] `useCreateSubtask` - 생성 mutation
  - [ ] `useUpdateSubtask` - 수정 mutation (제목, 완료)
  - [ ] `useDeleteSubtask` - 삭제 mutation
  - [ ] `useReorderSubtasks` - 순서 변경 mutation
  - [ ] 낙관적 업데이트

### 6. 테스트 (All ACs)

- [ ] Task 6.1: 히스토리 테스트
  - [ ] 히스토리 조회 API 동작
  - [ ] 각 필드 변경 시 기록 확인

- [ ] Task 6.2: 서브태스크 테스트
  - [ ] CRUD 동작 확인
  - [ ] 20개 제한 검증
  - [ ] 순서 변경 동작
  - [ ] 진행률 계산 정확성

## Dev Notes

### 관련 아키텍처 패턴 및 제약사항

- **API Response Format**: `{ success: true, data: {...} }` [Source: CLAUDE.md#API-Response-Format]
- **팀 멤버십 검증**: 모든 API에서 필수 (FR-070) [Source: docs/prd.md#FR-070]
- **서브태스크 제한**: 이슈당 최대 20개 [Source: docs/prd.md#FR-039-2]
- **히스토리 기록 대상**: 상태, 담당자, 우선순위, 제목, 마감일 [Source: docs/prd.md#FR-039]
- **Drag & Drop**: @dnd-kit 사용 [Source: docs/architecture.md]

### 프로젝트 구조 노트

**생성할 파일:**
- `app/api/issues/[issueId]/history/route.ts` - 히스토리 API
- `app/api/issues/[issueId]/subtasks/route.ts` - 서브태스크 CRUD API
- `app/api/subtasks/[subtaskId]/route.ts` - 개별 서브태스크 API
- `app/api/subtasks/[subtaskId]/reorder/route.ts` - 순서 변경 API
- `components/issues/issue-history.tsx` - 히스토리 UI
- `components/issues/subtask-section.tsx` - 서브태스크 섹션
- `components/issues/subtask-item.tsx` - 서브태스크 아이템
- `components/issues/progress-bar.tsx` - 진행률 바
- `hooks/use-issue-history.ts` - 히스토리 훅
- `hooks/use-subtasks.ts` - 서브태스크 훅

### 데이터베이스 스키마 참조

```sql
-- issue_history 테이블
CREATE TABLE public.issue_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues NOT NULL,
  changed_by UUID REFERENCES public.profiles NOT NULL,
  field_name VARCHAR(50) NOT NULL,     -- 'status', 'assignee', 'priority', 'title', 'due_date'
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- subtasks 테이블
CREATE TABLE public.subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues NOT NULL,
  title VARCHAR(200) NOT NULL,         -- 1~200자
  is_completed BOOLEAN DEFAULT FALSE,
  position INTEGER NOT NULL,           -- 순서
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_issue_history_issue ON issue_history(issue_id);
CREATE INDEX idx_subtasks_issue ON subtasks(issue_id);
```
[Source: docs/sprint-artifacts/tech-spec-epic-3.md#Data-Models]

### UX Design 참조

**히스토리 타임라인 예시:**
```
| ● Status: Backlog → In Progress         |
|   Hojeong • 2 hours ago                  |
|                                          |
| ● Priority: MEDIUM → HIGH                |
|   Hojeong • 3 hours ago                  |
|                                          |
| ● Assignee: Unassigned → Hojeong         |
|   Admin • Yesterday                      |
```

**서브태스크 UI 예시:**
```
Subtasks (2/4)
━━━━━━━━━━━━ (50% 진행률 바)

☑ Setup @dnd-kit                    [×]
☑ Create draggable cards            [×]
☐ Implement drop zones              [×]
☐ Add visual feedback               [×]

[+ Add subtask...]
```

**진행률 표시:**
- 카드: "2/5" 텍스트
- 상세 패널: 진행률 바 (bg-indigo-500)

**색상:**
- 완료된 서브태스크: 취소선 + text-zinc-400
- 진행률 바 배경: bg-zinc-200
- 진행률 바 채움: bg-indigo-500

[Source: docs/sprint-artifacts/tech-spec-epic-3.md#UX-Design-Specification]

### References

- [Source: docs/prd.md#FR-039] 변경 히스토리 요구사항
- [Source: docs/prd.md#FR-039-2] 서브태스크 요구사항
- [Source: docs/sprint-artifacts/tech-spec-epic-3.md#AC-I04] 서브태스크 진행률 AC
- [Source: docs/sprint-artifacts/tech-spec-epic-3.md#AC-I06] 히스토리 기록 AC
- [Source: docs/sprint-artifacts/tech-spec-epic-3.md#AC-I16~I19] 히스토리/서브태스크 AC
- [Source: docs/architecture.md#Database-Schema] issue_history, subtasks 스키마

### Learnings from Previous Story

**From Story 3-5-issue-search-filter (Status: drafted)**

Story 3-5가 drafted 상태이므로 구현 컨텍스트가 없습니다. 이 스토리(3-6)는 이전 스토리들에서 구현된 이슈 기반 위에 히스토리와 서브태스크 기능을 추가합니다.

**의존성:**
- Story 3-4에서 구현한 히스토리 기록 로직 활용
- Story 3-4에서 구현한 이슈 상세 패널 확장
- Story 3-3에서 구현한 이슈 카드 컴포넌트 확장 (진행률 표시)

**주의사항:**
- 이 스토리에서 @dnd-kit를 서브태스크 순서 변경에 처음 사용
- Epic 4의 칸반 보드에서 동일한 @dnd-kit 패턴 재사용 예정

[Source: docs/sprint-artifacts/3-5-issue-search-filter.md]

## Dev Agent Record

### Context Reference

docs/sprint-artifacts/3-6-history-subtasks.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
