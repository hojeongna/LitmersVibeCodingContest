# Story 3.4: 이슈 상세 & 수정

Status: review

## Story

As a **팀 멤버**,
I want **이슈의 상세 정보를 조회하고 수정**할 수 있기를 원합니다,
so that **이슈의 현재 상태를 파악하고 필요에 따라 정보를 업데이트**할 수 있습니다.

## Acceptance Criteria

| AC# | 설명 | FR |
|-----|------|-----|
| AC-1 | 이슈 상세 패널에서 ID, 제목, 설명, 상태, 우선순위, 담당자, 마감일, 라벨, 생성일, 수정일이 표시되어야 한다 | FR-031 |
| AC-2 | 이슈 설명이 마크다운으로 렌더링되어야 한다 | FR-031 |
| AC-3 | 팀 멤버는 이슈의 제목, 설명, 담당자, 마감일, 상태, 우선순위, 라벨을 수정할 수 있어야 한다 | FR-032 |
| AC-4 | 상태 변경은 드롭다운 또는 Drag & Drop으로 가능해야 한다 (이 스토리에서는 드롭다운) | FR-033 |
| AC-5 | 담당자는 팀 멤버 목록에서만 선택할 수 있어야 한다 | FR-034 |
| AC-6 | "Assign to me" 버튼으로 자기 자신에게 빠르게 할당할 수 있어야 한다 | FR-034 |
| AC-7 | 이슈 소유자, 프로젝트 소유자, 팀 OWNER, 팀 ADMIN만 이슈를 삭제할 수 있어야 한다 | FR-035 |
| AC-8 | 이슈 삭제 시 확인 모달이 표시되고 Soft Delete 처리되어야 한다 | FR-035 |
| AC-9 | 필드 수정 시 즉시 UI에 반영되어야 한다 (낙관적 업데이트) | FR-032 |
| AC-10 | 상태 변경 시 자동으로 히스토리에 기록되어야 한다 | FR-033, FR-039 |

## Tasks / Subtasks

### 1. 이슈 상세 API (AC: #1, #2)

- [ ] Task 1.1: 이슈 상세 조회 API 구현
  - [ ] `GET /api/issues/[issueId]` 엔드포인트 생성
  - [ ] 팀 멤버십 검증
  - [ ] 라벨, 담당자, 상태 정보 JOIN 조회
  - [ ] 서브태스크 포함 (다음 스토리에서 상세 구현)
  - [ ] 프로젝트 키 조회 (이슈 ID 표시용: JL-1)

### 2. 이슈 수정/삭제 API (AC: #3, #4, #7, #8, #10)

- [ ] Task 2.1: 이슈 수정 API 구현
  - [ ] `PUT /api/issues/[issueId]` 엔드포인트 생성
  - [ ] Zod 스키마 검증
  - [ ] 팀 멤버십 검증
  - [ ] 라벨 연결 업데이트 (DELETE + INSERT)
  - [ ] 이슈당 라벨 5개 제한 검증

- [ ] Task 2.2: 상태 변경 히스토리 기록
  - [ ] 상태 변경 시 `issue_history` 테이블에 자동 INSERT
  - [ ] field_name: 'status', old_value, new_value, changed_by

- [ ] Task 2.3: 담당자/우선순위 변경 히스토리 기록
  - [ ] 담당자 변경 시 히스토리 기록
  - [ ] 우선순위 변경 시 히스토리 기록
  - [ ] 제목/마감일 변경 시 히스토리 기록

- [ ] Task 2.4: 이슈 삭제 API 구현
  - [ ] `DELETE /api/issues/[issueId]` 엔드포인트 생성
  - [ ] 권한 검증 (이슈 소유자, 프로젝트 소유자, OWNER, ADMIN)
  - [ ] Soft Delete (deleted_at 설정)

### 3. 이슈 상세 패널 UI (AC: #1, #2, #9)

- [ ] Task 3.1: 이슈 상세 패널 레이아웃
  - [ ] `components/issues/issue-detail-panel.tsx` 생성
  - [ ] 오른쪽 슬라이드 패널 (400px) 또는 모달
  - [ ] 닫기 버튼
  - [ ] 이슈 ID 표시 (JL-1 형식)

- [ ] Task 3.2: 이슈 헤더 섹션
  - [ ] 제목 (클릭 시 인라인 편집)
  - [ ] 상태 드롭다운
  - [ ] 우선순위 드롭다운

- [ ] Task 3.3: 이슈 본문 섹션
  - [ ] 설명 마크다운 렌더링 (Story 3-2의 MarkdownRenderer 재사용)
  - [ ] 편집 버튼 → 편집 모드 토글
  - [ ] 저장/취소 버튼

- [ ] Task 3.4: 이슈 메타데이터 섹션
  - [ ] 담당자 Select + "Assign to me" 버튼
  - [ ] 마감일 Date Picker
  - [ ] 라벨 Multi-select
  - [ ] 생성일/수정일 표시

- [ ] Task 3.5: 삭제 버튼 및 확인 모달
  - [ ] 삭제 권한 있는 사용자에게만 표시
  - [ ] 삭제 확인 모달 (경고 메시지 포함)

### 4. 인라인 편집 기능 (AC: #3, #9)

- [ ] Task 4.1: 인라인 제목 편집
  - [ ] 제목 클릭 → input 모드 전환
  - [ ] Enter 또는 blur 시 저장
  - [ ] Escape 시 취소

- [ ] Task 4.2: 상태/우선순위 드롭다운
  - [ ] 선택 즉시 API 호출
  - [ ] 낙관적 업데이트

- [ ] Task 4.3: 담당자 드롭다운
  - [ ] 팀 멤버 목록 Select
  - [ ] 아바타 + 이름 표시
  - [ ] "Assign to me" 버튼

### 5. TanStack Query 훅 확장 (All ACs)

- [ ] Task 5.1: 이슈 훅 확장
  - [ ] `useIssue` - 개별 이슈 상세 조회
  - [ ] `useUpdateIssue` - 이슈 수정 mutation
  - [ ] `useDeleteIssue` - 이슈 삭제 mutation
  - [ ] 캐시 무효화 및 낙관적 업데이트

- [ ] Task 5.2: 팀 멤버 훅
  - [ ] `useTeamMembers` - 담당자 선택용 팀 멤버 목록

### 6. 테스트 (All ACs)

- [ ] Task 6.1: 이슈 상세 API 테스트
  - [ ] 팀 멤버가 이슈 조회 성공
  - [ ] 타 팀 멤버 접근 시 404

- [ ] Task 6.2: 이슈 수정 API 테스트
  - [ ] 각 필드 수정 성공
  - [ ] 히스토리 기록 확인
  - [ ] 라벨 5개 초과 시 에러

- [ ] Task 6.3: 이슈 삭제 API 테스트
  - [ ] 권한별 삭제 성공/실패
  - [ ] Soft Delete 확인

## Dev Notes

### 관련 아키텍처 패턴 및 제약사항

- **API Response Format**: `{ success: true, data: {...} }` 또는 `{ success: false, error: { code, message } }` [Source: CLAUDE.md#API-Response-Format]
- **팀 멤버십 검증**: 모든 API에서 필수 (FR-070) [Source: docs/prd.md#FR-070]
- **Soft Delete**: `deleted_at` 필드 사용 [Source: docs/architecture.md]
- **히스토리 기록**: 상태, 담당자, 우선순위, 제목, 마감일 변경 시 자동 기록 [Source: docs/prd.md#FR-039]
- **삭제 권한**: 이슈 소유자, 프로젝트 소유자, 팀 OWNER, 팀 ADMIN [Source: docs/prd.md#FR-035]

### 프로젝트 구조 노트

**생성할 파일:**
- `app/api/issues/[issueId]/route.ts` - 이슈 상세/수정/삭제 API
- `components/issues/issue-detail-panel.tsx` - 이슈 상세 패널
- `components/issues/inline-title-editor.tsx` - 인라인 제목 편집
- `components/issues/assignee-select.tsx` - 담당자 선택
- `components/issues/delete-issue-modal.tsx` - 삭제 확인 모달
- `hooks/use-team-members.ts` - 팀 멤버 훅

**재사용할 컴포넌트:**
- `components/shared/markdown-renderer.tsx` (Story 3-2)
- `components/ui/priority-badge.tsx` (Story 3-3)
- `components/ui/label-tag.tsx` (Story 3-3)

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

CREATE INDEX idx_issue_history_issue ON issue_history(issue_id);
```
[Source: docs/sprint-artifacts/tech-spec-epic-3.md#Data-Models]

### UX Design 참조

**이슈 상세 패널 레이아웃:**
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
| [Subtasks - Story 3-6에서 구현]          |
|                                          |
| [History - Story 3-6에서 구현]           |
|                                          |
| [Comments - Epic 4에서 구현]             |
+------------------------------------------+
```

**색상 테마:**
- Primary: `#5B5FC7` (Indigo)
- Background: `#FAFAFA`
- Surface: `#FFFFFF`
- Border: `#E4E4E7`
- Text Primary: `#18181B`
- Text Secondary: `#71717A`

[Source: docs/sprint-artifacts/tech-spec-epic-3.md#UX-Design-Specification]

### References

- [Source: docs/prd.md#FR-031] 이슈 상세 조회 요구사항
- [Source: docs/prd.md#FR-032] 이슈 수정 요구사항
- [Source: docs/prd.md#FR-033] 상태 변경 요구사항
- [Source: docs/prd.md#FR-034] 담당자 지정 요구사항
- [Source: docs/prd.md#FR-035] 이슈 삭제 요구사항
- [Source: docs/prd.md#FR-039] 변경 히스토리 요구사항
- [Source: docs/sprint-artifacts/tech-spec-epic-3.md#AC-I03~I08] 이슈 상세/수정 AC
- [Source: docs/architecture.md#Database-Schema] issue_history 테이블 스키마

### Learnings from Previous Story

**From Story 3-3-issue-create-list (Status: drafted)**

Story 3-3이 drafted 상태이므로 구현 컨텍스트가 없습니다. 이 스토리(3-4)는 3-3에서 생성된 이슈 기반 위에 상세/수정 기능을 추가합니다.

**의존성:**
- Story 3-3에서 구현한 이슈 카드 컴포넌트 재사용
- Story 3-3에서 구현한 우선순위 배지, 라벨 태그 컴포넌트 재사용
- Story 3-3에서 구현한 useIssues 훅 확장
- Story 3-2에서 구현한 마크다운 렌더러 재사용

[Source: docs/sprint-artifacts/3-3-issue-create-list.md]

## Dev Agent Record

### Context Reference

docs/sprint-artifacts/3-4-issue-detail-edit.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
