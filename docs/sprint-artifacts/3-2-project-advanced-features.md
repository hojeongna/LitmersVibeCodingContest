# Story 3.2: 프로젝트 고급 기능 (마크다운, 아카이브, 즐겨찾기)

Status: review

## Story

As a **팀 멤버**,
I want **프로젝트 설명에 마크다운을 사용하고, 프로젝트를 아카이브/즐겨찾기로 관리**할 수 있기를 원합니다,
so that **프로젝트 정보를 풍부하게 표현하고, 활성/비활성 프로젝트를 효율적으로 정리**할 수 있습니다.

## Acceptance Criteria

| AC# | 설명 | FR |
|-----|------|-----|
| AC-1 | 프로젝트 설명 입력 시 마크다운 문법(헤더, 볼드, 이탤릭, 리스트, 코드블록)을 사용할 수 있어야 한다 | FR-025 |
| AC-2 | 프로젝트 상세 페이지에서 마크다운이 렌더링되어 표시되어야 한다 | FR-025 |
| AC-3 | 마크다운 렌더링 시 XSS 공격을 방지하기 위해 HTML이 정제되어야 한다 | FR-025 |
| AC-4 | 팀 OWNER, ADMIN, 프로젝트 소유자는 프로젝트를 아카이브할 수 있어야 한다 | FR-026 |
| AC-5 | 아카이브된 프로젝트는 기본 프로젝트 목록/Sidebar에서 숨겨져야 한다 | FR-026 |
| AC-6 | 아카이브된 프로젝트를 별도 필터/탭에서 조회할 수 있어야 한다 | FR-026 |
| AC-7 | 아카이브된 프로젝트를 복원(unarchive)할 수 있어야 한다 | FR-026 |
| AC-8 | 사용자는 프로젝트를 즐겨찾기에 추가/제거할 수 있어야 한다 | FR-027 |
| AC-9 | 즐겨찾기 토글 시 Sidebar 프로젝트 목록에 즉시 반영되어야 한다 | FR-027 |
| AC-10 | 즐겨찾기 프로젝트는 목록 상단에 우선 표시되어야 한다 | FR-027 |

## Tasks / Subtasks

### 1. 마크다운 지원 (AC: #1, #2, #3)

- [ ] Task 1.1: 마크다운 관련 패키지 설치
  - [ ] `react-markdown` 설치 및 구성
  - [ ] `sanitize-html` 또는 `rehype-sanitize` 설치
  - [ ] remark-gfm 플러그인 설치 (GitHub Flavored Markdown)

- [ ] Task 1.2: 마크다운 렌더러 컴포넌트 구현
  - [ ] `components/shared/markdown-renderer.tsx` 생성
  - [ ] XSS 방지를 위한 HTML 정제 설정
  - [ ] 기본 스타일 적용 (prose 클래스 또는 커스텀 스타일)
  - [ ] 지원 문법: 헤더, 볼드, 이탤릭, 리스트, 코드블록, 링크

- [ ] Task 1.3: 프로젝트 설명에 마크다운 렌더러 적용
  - [ ] 프로젝트 상세 페이지에 MarkdownRenderer 적용
  - [ ] 프로젝트 편집 폼에 마크다운 미리보기 추가 (선택사항)

### 2. 아카이브 기능 (AC: #4, #5, #6, #7)

- [ ] Task 2.1: 아카이브 토글 API 구현
  - [ ] `PUT /api/projects/[projectId]/archive` 엔드포인트 생성
  - [ ] 권한 검증 (OWNER, ADMIN, 프로젝트 소유자)
  - [ ] `is_archived` 필드 토글 로직

- [ ] Task 2.2: 프로젝트 목록 API 아카이브 필터 추가
  - [ ] `GET /api/projects?archived=true|false` 쿼리 파라미터 지원
  - [ ] 기본값: `archived=false` (아카이브되지 않은 프로젝트만)

- [ ] Task 2.3: Sidebar 프로젝트 목록에서 아카이브 프로젝트 숨김
  - [ ] 기본 목록에서 `is_archived=false`만 표시
  - [ ] "Show archived" 토글 또는 별도 섹션 추가

- [ ] Task 2.4: 아카이브 UI 구현
  - [ ] 프로젝트 설정 페이지에 아카이브/복원 버튼 추가
  - [ ] 아카이브된 프로젝트 시각적 표시 (예: 반투명, 아이콘)
  - [ ] 아카이브 확인 모달

### 3. 즐겨찾기 기능 (AC: #8, #9, #10)

- [ ] Task 3.1: 즐겨찾기 토글 API 구현
  - [ ] `PUT /api/projects/[projectId]/favorite` 엔드포인트 생성
  - [ ] `project_favorites` 테이블 INSERT/DELETE
  - [ ] 현재 사용자의 즐겨찾기 상태 반환

- [ ] Task 3.2: 프로젝트 목록 API 즐겨찾기 정렬 적용
  - [ ] LEFT JOIN으로 즐겨찾기 여부 조회
  - [ ] ORDER BY: 즐겨찾기 DESC, 생성일 DESC

- [ ] Task 3.3: Sidebar 즐겨찾기 UI 구현
  - [ ] 프로젝트 항목에 별(⭐) 아이콘 버튼 추가
  - [ ] 클릭 시 즐겨찾기 토글 API 호출
  - [ ] 낙관적 업데이트로 즉시 UI 반영
  - [ ] 즐겨찾기 프로젝트 상단 정렬

- [ ] Task 3.4: 프로젝트 상세 페이지 즐겨찾기 버튼
  - [ ] 프로젝트 헤더에 즐겨찾기 토글 버튼 추가

### 4. TanStack Query 훅 구현 (All ACs)

- [ ] Task 4.1: 프로젝트 관련 훅 확장
  - [ ] `useProjects` 훅에 archived 필터 옵션 추가
  - [ ] `useArchiveProject` mutation 훅 생성
  - [ ] `useFavoriteProject` mutation 훅 생성
  - [ ] 캐시 무효화 및 낙관적 업데이트 구현

### 5. 테스트 (All ACs)

- [ ] Task 5.1: 마크다운 렌더링 테스트
  - [ ] 기본 마크다운 문법 렌더링 확인
  - [ ] XSS 스크립트 정제 확인

- [ ] Task 5.2: 아카이브 기능 테스트
  - [ ] 아카이브/복원 API 동작 테스트
  - [ ] 권한 검증 테스트
  - [ ] 목록 필터링 테스트

- [ ] Task 5.3: 즐겨찾기 기능 테스트
  - [ ] 즐겨찾기 추가/제거 테스트
  - [ ] 정렬 순서 테스트

## Dev Notes

### 관련 아키텍처 패턴 및 제약사항

- **API Response Format**: `{ success: true, data: {...} }` 또는 `{ success: false, error: { code, message } }` [Source: CLAUDE.md#API-Response-Format]
- **권한 검증**: 모든 API에서 팀 멤버십 검증 필수 (FR-070) [Source: docs/prd.md#FR-070]
- **Soft Delete**: 아카이브는 `is_archived` 필드, 삭제는 `deleted_at` 필드 사용 [Source: docs/sprint-artifacts/tech-spec-epic-3.md#Data-Models]

### 프로젝트 구조 노트

- 마크다운 컴포넌트: `components/shared/markdown-renderer.tsx`
- API Routes:
  - `app/api/projects/[projectId]/archive/route.ts`
  - `app/api/projects/[projectId]/favorite/route.ts`
- 훅: `hooks/use-projects.ts` (확장)

### 데이터베이스 스키마 참조

```sql
-- projects 테이블 (is_archived 필드)
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams NOT NULL,
  owner_id UUID REFERENCES public.profiles NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,  -- 마크다운 지원 (최대 2000자)
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- project_favorites 테이블
CREATE TABLE public.project_favorites (
  user_id UUID REFERENCES public.profiles NOT NULL,
  project_id UUID REFERENCES public.projects NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, project_id)
);
```
[Source: docs/sprint-artifacts/tech-spec-epic-3.md#Data-Models]

### UX Design 참조 (Color Theme)

- **Primary**: `#5B5FC7` (Indigo)
- **Background**: `#FAFAFA` (Zinc 50)
- **Surface**: `#FFFFFF` (White)
- **Border**: `#E4E4E7` (Zinc 200)
- **Text Primary**: `#18181B` (Zinc 900)
- **Text Secondary**: `#71717A` (Zinc 500)

**즐겨찾기 아이콘 스타일:**
- 비활성: `#71717A` (Zinc 500) outline star
- 활성: `#F59E0B` (Warning/Yellow) filled star

**아카이브 표시:**
- 아카이브된 프로젝트: `opacity: 0.6`, 회색 배지 표시
- 아카이브 아이콘: `📦` 또는 archive icon

[Source: docs/ux-design-directions.html, docs/ux-color-themes.html]

### 마크다운 렌더링 보안

마크다운 렌더링 시 다음 HTML 태그/속성만 허용:
```javascript
const allowedTags = ['h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'a', 'strong', 'em'];
const allowedAttributes = { 'a': ['href'] };
```

스크립트, iframe, style 태그는 제거해야 함.
[Source: docs/sprint-artifacts/tech-spec-epic-3.md#Security]

### References

- [Source: docs/prd.md#FR-025] 마크다운 지원 요구사항
- [Source: docs/prd.md#FR-026] 프로젝트 아카이브 요구사항
- [Source: docs/prd.md#FR-027] 즐겨찾기 요구사항
- [Source: docs/sprint-artifacts/tech-spec-epic-3.md#AC-P07] 마크다운 AC
- [Source: docs/sprint-artifacts/tech-spec-epic-3.md#AC-P08] 아카이브 AC
- [Source: docs/sprint-artifacts/tech-spec-epic-3.md#AC-P09] 즐겨찾기 AC
- [Source: docs/ux-design-directions.html] UX 디자인 참조
- [Source: docs/ux-color-themes.html] 컬러 테마 참조

### Learnings from Previous Story

**From Story 3-1-project-crud (Status: drafted)**

Story 3-1이 drafted 상태이므로 아직 구현 컨텍스트가 없습니다. 이 스토리(3-2)는 3-1에서 생성된 프로젝트 CRUD 기반 위에 고급 기능을 추가합니다.

**의존성:**
- Story 3-1에서 생성한 `ProjectService`, `useProjects` 훅 재사용
- Story 3-1에서 구현한 프로젝트 상세 페이지 UI 확장
- Story 3-1에서 구현한 Sidebar 프로젝트 목록 확장

[Source: docs/sprint-artifacts/3-1-project-crud.md]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
