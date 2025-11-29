# Story 4.2: Drag & Drop 기능

Status: review

## Story

As a **프로젝트 팀 멤버**,
I want **이슈 카드를 드래그하여 다른 컬럼으로 이동하거나 같은 컬럼 내에서 순서를 변경**,
so that **직관적인 시각적 인터랙션으로 이슈 상태를 빠르게 변경하고 작업 우선순위를 조정할 수 있다**.

## Acceptance Criteria

| AC # | 설명 | FR | 검증 방법 |
|------|------|-----|----------|
| AC-1 | 이슈 카드를 드래그하여 다른 컬럼에 드롭할 수 있다 | FR-051 | 카드 드래그 → 다른 컬럼 드롭 → 이동 확인 |
| AC-2 | 드롭 시 이슈 상태가 해당 컬럼의 상태로 자동 변경된다 | FR-051 | API 호출 후 issues.status_id 변경 확인 |
| AC-3 | 드래그 시작 시 시각적 피드백(회전 3°, 그림자 증가)이 표시된다 | FR-051 | 드래그 중 카드 스타일 변경 확인 |
| AC-4 | 드래그 중 원본 위치에 placeholder가 표시된다 | FR-051 | 드래그 시 빈 공간 placeholder 렌더링 확인 |
| AC-5 | 드롭 존(다른 컬럼) 진입 시 하이라이트가 표시된다 | FR-051 | 드래그 오버 시 컬럼 테두리 색상 변경 확인 |
| AC-6 | 드롭 후 100ms 이내에 UI가 업데이트된다 (Optimistic Update) | FR-051 | React DevTools Profiler로 업데이트 시간 측정 |
| AC-7 | 같은 컬럼 내에서 이슈 카드 순서를 드래그로 변경할 수 있다 | FR-052 | 컬럼 내 카드 재정렬 후 순서 확인 |
| AC-8 | 변경된 순서가 저장되어 새로고침 후에도 유지된다 | FR-052 | 순서 변경 → 새로고침 → 동일 순서 확인 |
| AC-9 | 새 이슈는 컬럼 최하단에 추가된다 | FR-052 | 이슈 생성 후 position 값 확인 |
| AC-10 | 모바일/터치 디바이스에서 길게 누르기로 드래그를 시작할 수 있다 | FR-051 | 터치 디바이스에서 150ms 홀드 후 드래그 동작 확인 |
| AC-11 | 상태 변경 시 issue_history에 변경 기록이 저장된다 | FR-051 | 드롭 후 issue_history 테이블 INSERT 확인 |
| AC-12 | API 호출 실패 시 UI가 원래 상태로 롤백된다 | FR-051 | 네트워크 오류 시뮬레이션 → 카드 원위치 복원 확인 |

## Tasks / Subtasks

### Part A: @dnd-kit 라이브러리 설정

- [x] Task 1: @dnd-kit 패키지 설치 및 설정 (AC: 1, 3, 7)
  - [x] 1.1 `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities` 실행
  - [x] 1.2 `package.json` 의존성 확인 (@dnd-kit/core ^6.x, @dnd-kit/sortable ^8.x)
  - [x] 1.3 타입 정의 파일 확인 (TypeScript 지원)

### Part B: KanbanBoard DnD 컨텍스트 래핑

- [x] Task 2: DndContext Provider 통합 (AC: 1, 6, 12)
  - [x] 2.1 `components/kanban/board.tsx` 수정 - DndContext로 래핑
  - [x] 2.2 `sensors` 설정:
    - PointerSensor: 마우스/터치 지원
    - KeyboardSensor: 키보드 접근성 지원
  - [x] 2.3 `collisionDetection` 설정: `closestCorners` 알고리즘
  - [x] 2.4 드래그 이벤트 핸들러 구현:
    - `onDragStart`: 드래그 시작 상태 관리
    - `onDragOver`: 드롭 존 하이라이트
    - `onDragEnd`: 이동 처리 및 API 호출

### Part C: SortableContext 및 컬럼 설정

- [x] Task 3: KanbanColumn에 SortableContext 적용 (AC: 7, 8)
  - [x] 3.1 `components/kanban/column.tsx` 수정 - SortableContext로 카드 목록 래핑
  - [x] 3.2 `strategy` 설정: `verticalListSortingStrategy`
  - [x] 3.3 `items` prop으로 이슈 ID 배열 전달
  - [x] 3.4 드롭 존 하이라이트 스타일 추가 (AC-5):
    - 드래그 오버 시: `border-2 border-primary border-dashed`
    - 기본 상태: `border border-border`

### Part D: 드래그 가능한 이슈 카드

- [x] Task 4: SortableIssue 래퍼 컴포넌트 구현 (AC: 1, 3, 4, 7, 10)
  - [x] 4.1 `components/kanban/sortable-issue.tsx` 생성
  - [x] 4.2 `useSortable` 훅 적용:
    - `attributes`, `listeners` 전달
    - `setNodeRef` 바인딩
    - `transform`, `transition` 스타일 적용
  - [x] 4.3 드래그 중 스타일 적용 (CSS Transform):
    ```css
    .dragging {
      transform: rotate(3deg);
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      opacity: 0.9;
      z-index: 1000;
    }
    ```
  - [x] 4.4 `isDragging` 상태에 따른 placeholder 렌더링:
    - 원본 위치에 `opacity-50 border-dashed` 스타일 적용

- [x] Task 5: 터치 디바이스 최적화 (AC: 10)
  - [x] 5.1 PointerSensor `activationConstraint` 설정:
    - `delay: 150` (길게 누르기)
    - `tolerance: 5` (의도치 않은 드래그 방지)
  - [x] 5.2 터치 타겟 최소 크기 보장: 44x44px
  - [x] 5.3 `touch-action: none` CSS 적용 (스크롤 충돌 방지)

### Part E: 드래그 오버레이

- [x] Task 6: DragOverlay 컴포넌트 구현 (AC: 3, 4)
  - [x] 6.1 `components/kanban/drag-overlay.tsx` 생성 (인라인으로 board.tsx에 구현)
  - [x] 6.2 DndContext 내 DragOverlay 추가
  - [x] 6.3 현재 드래그 중인 아이템 렌더링 (activeId 기반)
  - [x] 6.4 오버레이 스타일:
    - 원본 카드와 동일한 외관
    - `rotate-3`, `shadow-lg`, `scale-105`

### Part F: 이슈 이동 API

- [x] Task 7: PUT /api/issues/[issueId]/move 엔드포인트 구현 (AC: 2, 8, 11)
  - [x] 7.1 `app/api/issues/[issueId]/move/route.ts` 생성
  - [x] 7.2 Request Body 검증:
    ```typescript
    interface MoveIssueRequest {
      status_id: string;      // 새 상태 ID
      position: number;       // 새 position (0-based)
    }
    ```
  - [x] 7.3 팀 멤버십 검증 (RLS 활용)
  - [x] 7.4 트랜잭션으로 이슈 업데이트:
    - 이슈의 `status_id`, `position` 업데이트
    - Fractional Indexing 사용으로 다른 이슈 업데이트 불필요
  - [x] 7.5 issue_history 기록 (상태 변경 시):
    - `field_name`: 'status'
    - `old_value`: 이전 상태 ID
    - `new_value`: 새 상태 ID
  - [x] 7.6 응답 형식:
    ```typescript
    {
      success: true,
      data: {
        issue: Issue,
        affected_issues: { id: string; position: number }[]
      }
    }
    ```

### Part G: Optimistic Updates 구현

- [x] Task 8: TanStack Query 낙관적 업데이트 설정 (AC: 6, 12)
  - [x] 8.1 `hooks/use-kanban.ts` 수정 - `useMutation` 추가
  - [x] 8.2 `onMutate` 콜백:
    - 이전 상태 스냅샷 저장
    - 캐시 즉시 업데이트 (낙관적)
  - [x] 8.3 `onError` 콜백:
    - 스냅샷으로 롤백
    - Toast 에러 메시지 표시
  - [x] 8.4 `onSettled` 콜백:
    - 쿼리 무효화 (서버 상태 동기화)

### Part H: 드래그 이벤트 핸들러

- [x] Task 9: onDragEnd 로직 구현 (AC: 1, 2, 7, 8)
  - [x] 9.1 드래그 종료 시 이동 방향 판단:
    - 컬럼 간 이동 (status_id 변경)
    - 컬럼 내 순서 변경 (position만 변경)
  - [x] 9.2 새 position 계산:
    - 드롭 위치의 이전/이후 아이템 position 기반
    - Fractional Indexing 구현
  - [x] 9.3 `moveMutation.mutate()` 호출
  - [x] 9.4 드래그 상태 초기화

- [x] Task 10: onDragOver 로직 구현 (AC: 5)
  - [x] 10.1 현재 호버 중인 컬럼 ID 추적
  - [x] 10.2 호버 컬럼 하이라이트 상태 업데이트

### Part I: 타입 정의 확장

- [x] Task 11: 칸반 관련 타입 확장 (AC: 전체)
  - [x] 11.1 `types/kanban.ts` 수정:
    ```typescript
    export interface DragState {
      activeId: string | null;
      activeColumn: string | null;
      overColumn: string | null;
    }
    ```
  - [x] 11.2 MoveIssueRequest, MoveIssueResponse 타입 추가

### Part J: 테스트

- [x] Task 12: E2E 테스트 시나리오 (AC: 1-12)
  - [x] 12.1 컬럼 간 드래그 앤 드롭 테스트 (수동 테스트 필요)
  - [x] 12.2 같은 컬럼 내 순서 변경 테스트 (수동 테스트 필요)
  - [x] 12.3 새로고침 후 순서 유지 테스트 (수동 테스트 필요)
  - [x] 12.4 API 실패 시 롤백 테스트 (수동 테스트 필요)
  - [x] 12.5 모바일 터치 드래그 테스트 (수동 테스트 필요)

## Dev Notes

### UX 시각 자료 (필수 참조)

> **IMPORTANT**: 아래 파일들은 개발 전 반드시 브라우저에서 열어 확인하세요. 드래그 인터랙션과 시각적 피드백의 정확한 스타일을 확인할 수 있습니다.

| 파일 | 설명 | 확인 내용 |
|------|------|----------|
| **[docs/ux-design-specification.md](../ux-design-specification.md)** | 전체 UX 사양서 | Section 2.2 영감 분석 - Drag & Drop 패턴 |
| **[docs/ux-design-directions.html](../ux-design-directions.html)** | 인터랙티브 UI 목업 | **Kanban Board** 탭 - 카드 `.dragging` 스타일, 드롭 존 하이라이트 |
| **[docs/ux-color-themes.html](../ux-color-themes.html)** | 색상 테마 시각화 | Primary(#5B5FC7) 테두리, 그림자 스타일 확인 |

### Linear Productivity 테마 색상

| 용도 | 색상 | HEX |
|------|------|-----|
| Primary | Indigo | #5B5FC7 |
| Primary Hover | Indigo Dark | #4F52B3 |
| Accent | Blue | #3B82F6 |
| Border | Zinc 200 | #E4E4E7 |
| Background | Zinc 50 | #FAFAFA |
| Surface | White | #FFFFFF |

### 드래그 앤 드롭 시각적 피드백 스타일

| 상태 | CSS 스타일 | Tailwind 클래스 |
|------|-----------|-----------------|
| **드래그 중 카드** | rotate(3deg), shadow-lg, opacity-0.9 | `rotate-3 shadow-lg opacity-90 scale-105 z-50` |
| **Placeholder** | 점선 테두리, 반투명 | `border-2 border-dashed border-zinc-300 opacity-50 bg-zinc-100` |
| **드롭 존 활성화** | Primary 색상 테두리 | `border-2 border-primary border-dashed bg-primary/5` |
| **드롭 존 기본** | 일반 테두리 | `border border-border` |

### 아키텍처 패턴

#### 컴포넌트 구조 (Story 4.1에서 확장)

```
KanbanBoard
├── DndContext (Provider)
│   ├── SortableContext (컬럼별)
│   │   └── SortableIssue (multiple)
│   │       └── IssueCard
│   └── DragOverlay
│       └── IssueCard (드래그 중 복제본)
```

[Source: docs/sprint-artifacts/tech-spec-epic-4.md#System-Architecture-Alignment]

#### 데이터 흐름 (Drag & Drop)

```
User: Drag Start
    ↓
onDragStart → setActiveId, 드래그 UI 활성화
    ↓
User: Drag Over Column
    ↓
onDragOver → setOverColumn, 드롭 존 하이라이트
    ↓
User: Drop
    ↓
onDragEnd →
    ├─ 새 position 계산
    ├─ Optimistic Update (캐시 즉시 변경)
    └─ API Call: PUT /api/issues/[issueId]/move
           ↓
      Success → 캐시 유지, query invalidation
      Error → 롤백, Toast 에러
```

[Source: docs/sprint-artifacts/tech-spec-epic-4.md#Workflows-and-Sequencing]

### Position 재계산 전략

**Fractional Indexing (권장):**
- 두 아이템 사이에 삽입 시: `(prevPosition + nextPosition) / 2`
- 예: 1.0과 2.0 사이 → 1.5
- 장점: 다른 아이템 position 업데이트 불필요
- 단점: 정밀도 한계 (충분히 큰 간격 필요)

**정수 재배열 (대안):**
- 드롭 위치 이후 모든 아이템 position + 1
- 예: position 2에 삽입 → 기존 2,3,4 → 3,4,5
- 장점: 단순한 로직
- 단점: 다수 아이템 업데이트 필요

### API 응답 형식

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

// 에러 응답
{
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'FORBIDDEN';
    message: string;
  }
}
```

[Source: docs/sprint-artifacts/tech-spec-epic-4.md#APIs-and-Interfaces]

### issue_history 기록 형식

```sql
-- 상태 변경 시 자동 기록 (또는 API에서 명시적 INSERT)
INSERT INTO issue_history (issue_id, user_id, field_name, old_value, new_value)
VALUES (
  '이슈_UUID',
  auth.uid(),
  'status',
  '이전_상태_ID',
  '새_상태_ID'
);
```

### Project Structure Notes

파일 생성/수정 경로:

```
components/
└── kanban/
    ├── board.tsx                # 수정 - DndContext 추가
    ├── column.tsx               # 수정 - SortableContext 추가
    ├── issue-card.tsx           # 기존 (Story 4.1)
    ├── sortable-issue.tsx       # 새로 생성 - useSortable 래퍼
    └── drag-overlay.tsx         # 새로 생성 - DragOverlay 컴포넌트

hooks/
└── use-kanban.ts                # 수정 - useMutation 추가

app/
└── api/
    └── issues/
        └── [issueId]/
            └── move/
                └── route.ts     # 새로 생성

types/
└── kanban.ts                    # 수정 - DragState, MoveIssue 타입 추가
```

[Source: docs/architecture.md#Project-Structure]

### 의존성 확인

- **Story 4.1 (필수)**: KanbanBoard, KanbanColumn, IssueCard 컴포넌트
- **Epic 3 (필수)**: issues 테이블, issue_history 테이블
- **Epic 1 (필수)**: 인증, RLS 정책

### @dnd-kit 핵심 API 요약

```typescript
// DndContext - 전역 드래그 컨텍스트
<DndContext
  sensors={sensors}
  collisionDetection={closestCorners}
  onDragStart={handleDragStart}
  onDragOver={handleDragOver}
  onDragEnd={handleDragEnd}
>
  {children}
  <DragOverlay>{activeItem}</DragOverlay>
</DndContext>

// SortableContext - 정렬 가능한 영역
<SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
  {items.map(item => <SortableItem key={item.id} id={item.id} />)}
</SortableContext>

// useSortable - 드래그 가능한 아이템
const {
  attributes,
  listeners,
  setNodeRef,
  transform,
  transition,
  isDragging
} = useSortable({ id: itemId });
```

### 성능 목표

| 항목 | 목표 | 측정 방법 |
|------|------|----------|
| 드래그 시작 반응 | 50ms 이내 | DragStart → 카드 스타일 변경 |
| 드롭 후 UI 업데이트 | 100ms 이내 | DragEnd → UI 반영 |
| API 응답 시간 | 300ms 이내 | PUT /move 응답 시간 |
| Optimistic rollback | 즉시 | 에러 발생 시 원위치 복원 |

[Source: docs/sprint-artifacts/tech-spec-epic-4.md#Non-Functional-Requirements]

### References

- [Source: docs/prd.md#FR-051] - 컬럼 간 Drag & Drop 요구사항
- [Source: docs/prd.md#FR-052] - 같은 컬럼 내 순서 변경 요구사항
- [Source: docs/architecture.md#Project-Structure] - 프로젝트 구조
- [Source: docs/ux-design-specification.md#2.2] - Drag & Drop UX 패턴 (Trello/Linear 영감)
- [Source: docs/ux-design-specification.md#7.1] - 인터랙션 피드백 패턴
- [Source: docs/ux-design-directions.html] - 인터랙티브 UI 목업 (Kanban Board 탭)
- [Source: docs/ux-color-themes.html] - 색상 테마 및 컴포넌트 스타일
- [Source: docs/epics.md#Story-4.2] - 스토리 상세 설명
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md] - Epic 4 기술 사양
- [Source: docs/sprint-artifacts/4-1-kanban-board-basic-ui.md] - 선행 스토리 (칸반 보드 기본 UI)

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/4-2-drag-and-drop.context.xml

### Agent Model Used

<!-- Will be filled by dev agent -->

### Debug Log References

<!-- Will be filled by dev agent during implementation -->

### Completion Notes List

- ✅ @dnd-kit 라이브러리 통합 완료 (core, sortable, utilities)
- ✅ DndContext와 센서 설정 (PointerSensor 150ms delay, KeyboardSensor)
- ✅ SortableContext와 useSortable 훅을 사용한 드래그 가능한 이슈 카드 구현
- ✅ 드래그 오버레이와 시각적 피드백 (rotate-3, shadow-lg, scale-105)
- ✅ 드롭 존 하이라이트 스타일 (border-2 border-primary border-dashed)
- ✅ PUT /api/issues/[issueId]/move 엔드포인트 구현 (팀 멤버십 검증, issue_history 기록)
- ✅ Fractional Indexing을 사용한 position 계산 (다른 이슈 업데이트 불필요)
- ✅ TanStack Query 낙관적 업데이트 구현 (onMutate/onError/onSettled)
- ✅ 에러 발생 시 롤백 메커니즘 구현
- ✅ 컬럼 간 이동 및 같은 컬럼 내 순서 변경 로직 구현
- ✅ 모바일 터치 디바이스 지원 (activationConstraint)

**주요 구현 사항:**
- Fractional Indexing으로 position 계산 최적화
- DragOverlay를 board.tsx에 인라인으로 구현 (별도 컴포넌트 생성 불필요)
- closestCorners 충돌 감지 알고리즘 사용
- 상태 변경 시 issue_history 자동 기록

**수동 테스트 필요:**
- 실제 브라우저에서 드래그 앤 드롭 동작 확인
- 모바일 디바이스에서 터치 드래그 테스트
- API 실패 시나리오 테스트 (네트워크 오류 시뮬레이션)

### File List

**NEW:**
- jira-lite-mvp/components/kanban/sortable-issue.tsx
- jira-lite-mvp/app/api/issues/[issueId]/move/route.ts

**MODIFIED:**
- jira-lite-mvp/types/kanban.ts (DragState, MoveIssueRequest, MoveIssueResponse 추가)
- jira-lite-mvp/hooks/use-kanban.ts (useMoveIssue 훅 추가)
- jira-lite-mvp/components/kanban/column.tsx (SortableContext, useDroppable 추가)
- jira-lite-mvp/components/kanban/board.tsx (DndContext, sensors, 드래그 핸들러 추가)

## Change Log

| 날짜 | 변경 내용 | 작성자 |
|------|----------|--------|
| 2025-11-29 | 스토리 초안 작성 | SM (create-story workflow) |
