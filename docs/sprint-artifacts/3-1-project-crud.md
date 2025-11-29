# Story 3.1: 프로젝트 CRUD

Status: review

## Story

As a **팀 멤버**,
I want **팀 내에서 프로젝트를 생성, 조회, 수정, 삭제**할 수 있기를 원합니다,
so that **팀의 이슈들을 프로젝트별로 체계적으로 관리**할 수 있습니다.

## Acceptance Criteria

| AC# | 설명 | FR |
|-----|------|-----|
| AC-1 | 로그인한 사용자는 자신이 소속된 팀 내에 새 프로젝트를 생성할 수 있어야 한다 (이름 필수 1~100자, 설명 선택 최대 2000자) | FR-020 |
| AC-2 | 팀당 최대 15개 프로젝트 제한이 적용되어야 한다 | FR-020 |
| AC-3 | 사용자는 자신이 속한 팀의 프로젝트 전체 목록을 조회할 수 있어야 한다 (이름, 설명 요약, 이슈 개수, 생성일 표시) | FR-021 |
| AC-4 | 프로젝트 목록은 즐겨찾기 프로젝트 우선, 이후 생성일 역순으로 정렬되어야 한다 | FR-021 |
| AC-5 | 프로젝트 상세 페이지에서 프로젝트 정보(이름, 설명)와 이슈 통계(상태별 개수)를 표시해야 한다 | FR-022 |
| AC-6 | 팀 OWNER, ADMIN, 또는 프로젝트 소유자만 프로젝트 이름과 설명을 수정할 수 있어야 한다 | FR-023 |
| AC-7 | 팀 OWNER, ADMIN, 또는 프로젝트 소유자만 프로젝트를 삭제할 수 있어야 한다 | FR-024 |
| AC-8 | 프로젝트 삭제 시 하위 이슈, 댓글 등 모두 Soft Delete 처리되어야 한다 | FR-024, FR-071 |
| AC-9 | Sidebar에서 팀별로 그룹화된 프로젝트 목록이 표시되어야 한다 | FR-021 |
| AC-10 | 프로젝트 생성 후 해당 프로젝트 페이지로 자동 이동해야 한다 | FR-020 |

## Tasks / Subtasks

### 1. 데이터베이스 및 API 기반 (AC: #1, #2, #8)

- [ ] Task 1.1: 프로젝트 생성 API 구현
  - [ ] `POST /api/projects` 엔드포인트 생성
  - [ ] Zod 스키마로 입력 검증 (name: 1~100자, description: 최대 2000자)
  - [ ] 팀당 15개 프로젝트 제한 로직 구현
  - [ ] 생성 시 `owner_id`는 현재 사용자, `team_id`는 선택된 팀으로 설정

- [ ] Task 1.2: 프로젝트 목록 조회 API 구현
  - [ ] `GET /api/projects` 엔드포인트 생성
  - [ ] 팀 멤버십 검증 (FR-070)
  - [ ] 즐겨찾기 우선, 생성일 역순 정렬
  - [ ] 이슈 개수 집계 포함

- [ ] Task 1.3: 프로젝트 상세 조회 API 구현
  - [ ] `GET /api/projects/[projectId]` 엔드포인트 생성
  - [ ] 팀 멤버십 검증
  - [ ] 상태별 이슈 통계 포함

- [ ] Task 1.4: 프로젝트 수정 API 구현
  - [ ] `PUT /api/projects/[projectId]` 엔드포인트 생성
  - [ ] 권한 검증 (OWNER, ADMIN, 프로젝트 소유자)

- [ ] Task 1.5: 프로젝트 삭제 API 구현
  - [ ] `DELETE /api/projects/[projectId]` 엔드포인트 생성
  - [ ] Soft Delete 처리 (`deleted_at` 설정)
  - [ ] 하위 이슈/댓글 연쇄 Soft Delete 또는 RLS로 자동 필터링

### 2. UI 컴포넌트 구현 (AC: #3, #4, #9)

- [ ] Task 2.1: 프로젝트 생성 모달 구현
  - [ ] `CreateProjectModal` 컴포넌트 생성
  - [ ] react-hook-form + zod 검증 적용
  - [ ] 팀 선택 드롭다운 (현재 팀 기본 선택)
  - [ ] 성공 시 프로젝트 페이지로 리다이렉트

- [ ] Task 2.2: Sidebar 프로젝트 목록 구현
  - [ ] `ProjectList` 컴포넌트 생성
  - [ ] 팀별 그룹화 표시
  - [ ] 프로젝트별 컬러 도트
  - [ ] 활성 프로젝트 하이라이트
  - [ ] "New Project" 버튼 추가

- [ ] Task 2.3: 프로젝트 목록 페이지 구현
  - [ ] `/teams/[teamId]/projects` 또는 메인 영역에 프로젝트 그리드/리스트
  - [ ] 프로젝트 카드 (이름, 설명, 이슈 개수, 생성일)

### 3. 프로젝트 상세 페이지 (AC: #5, #10)

- [ ] Task 3.1: 프로젝트 상세 페이지 레이아웃
  - [ ] `/projects/[projectId]` 페이지 생성
  - [ ] 프로젝트 헤더 (이름, 설명)
  - [ ] 이슈 통계 카드 (상태별 개수)
  - [ ] 탭 구조 준비 (Board | List - Epic 4에서 구현)

- [ ] Task 3.2: 프로젝트 설정 페이지 구현
  - [ ] `/projects/[projectId]/settings` 페이지 생성
  - [ ] 프로젝트 이름/설명 수정 폼
  - [ ] Danger Zone: 삭제 버튼 (확인 모달)
  - [ ] 권한에 따른 UI 비활성화

### 4. 권한 검증 및 보안 (AC: #6, #7)

- [ ] Task 4.1: 권한 검증 유틸리티 구현
  - [ ] `checkProjectPermission` 함수 생성
  - [ ] OWNER, ADMIN, 프로젝트 소유자 검증 로직
  - [ ] 권한 없는 경우 403 응답

### 5. 테스트 (All ACs)

- [ ] Task 5.1: API 테스트
  - [ ] 프로젝트 CRUD 정상 동작 테스트
  - [ ] 팀 멤버십 검증 테스트
  - [ ] 권한 검증 테스트
  - [ ] 제한 조건 테스트 (15개 제한)

## Dev Notes

### 관련 아키텍처 패턴 및 제약사항

- **API Response Format**: `{ success: true, data: {...} }` 또는 `{ success: false, error: { code, message } }` [Source: docs/architecture.md#API-Contracts]
- **권한 검증**: 모든 API에서 팀 멤버십 검증 필수 (FR-070) [Source: docs/prd.md#FR-070]
- **Soft Delete**: `deleted_at` 필드 사용, 조회 시 `deleted_at IS NULL` 조건 [Source: docs/architecture.md#Data-Protection]

### 프로젝트 구조 노트

- 프로젝트 CRUD 페이지: `app/(dashboard)/projects/[projectId]/page.tsx`
- 프로젝트 설정: `app/(dashboard)/projects/[projectId]/settings/page.tsx`
- API Routes: `app/api/projects/route.ts`, `app/api/projects/[projectId]/route.ts`
- 컴포넌트: `components/projects/` 디렉토리 생성 권장

### 데이터베이스 스키마 참조

```sql
-- projects 테이블 (이미 생성됨)
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
```
[Source: docs/architecture.md#Database-Schema]

### 네이밍 규칙

- 파일명: kebab-case (`project-card.tsx`)
- 컴포넌트: PascalCase (`ProjectCard`)
- API Route: kebab-case (`/api/projects`)
[Source: docs/architecture.md#Naming-Conventions]

### References

- [Source: docs/prd.md#FR-020] 프로젝트 생성 요구사항
- [Source: docs/prd.md#FR-021] 프로젝트 목록 조회 요구사항
- [Source: docs/prd.md#FR-022] 프로젝트 상세 페이지 요구사항
- [Source: docs/prd.md#FR-023] 프로젝트 수정 요구사항
- [Source: docs/prd.md#FR-024] 프로젝트 삭제 요구사항
- [Source: docs/epics.md#Story-3.1] 스토리 정의

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
