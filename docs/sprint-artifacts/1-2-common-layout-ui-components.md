# Story 1.2: 공통 레이아웃 & UI 컴포넌트

Status: done

## Story

As a **개발자**,
I want **shadcn/ui 기반의 공통 레이아웃과 UI 컴포넌트 시스템을 구축**,
so that **일관된 디자인으로 빠르게 UI를 개발할 수 있다**.

## Acceptance Criteria

| AC # | 설명 | 검증 방법 |
|------|------|----------|
| AC-1 | `/` 접속 시 Sidebar + 메인 영역 레이아웃 표시 | 브라우저에서 메인 레이아웃 구조 확인 |
| AC-2 | 다크모드 Sidebar 스타일 적용 (240px 너비) | Sidebar 배경색이 다크 테마, 너비 240px 확인 |
| AC-3 | 모든 공통 컴포넌트가 테스트 페이지에서 확인 가능 | `/dev/components` 또는 Storybook에서 컴포넌트 렌더링 확인 |
| AC-4 | Linear Productivity 테마 색상 적용 (Primary: #5B5FC7) | 버튼, 링크 등에 Indigo 색상 적용 확인 |
| AC-5 | 인증 컨텍스트 Provider가 앱 전체에 설정됨 | useAuth 훅으로 사용자 상태 접근 가능 확인 |

## Tasks / Subtasks

### Part A: shadcn/ui 설치 및 테마 설정

- [x] Task 1: shadcn/ui 초기화 (AC: 4)
  - [x] 1.1 `npx shadcn@latest init` 실행
  - [x] 1.2 Tailwind CSS 설정 확인 및 최적화
  - [x] 1.3 `components.json` 설정 검토

- [x] Task 2: Linear Productivity 테마 적용 (AC: 4)
  - [x] 2.1 `tailwind.config.js`에 커스텀 색상 추가
    - Primary: #5B5FC7 (Indigo), Hover: #4F52B3
    - Accent: #3B82F6 (Blue)
    - Success: #22C55E
    - Warning: #F59E0B
    - Error: #EF4444
  - [x] 2.2 CSS 변수로 테마 색상 정의 (`globals.css`)
    - 칸반 컬럼 색상: Backlog(#71717A), Progress(#3B82F6), Review(#A855F7), Done(#22C55E)
    - 라벨 색상: Bug(#FEE2E2/#DC2626), Feature(#DBEAFE/#2563EB), Enhancement(#F3E8FF/#7C3AED), Docs(#D1FAE5/#059669)
  - [x] 2.3 Inter 폰트 설정 (next/font)
  - [x] 2.4 Dark Mode 테마 변수 준비 (Zinc 900 배경, Zinc 700 카드 등)

### Part B: 공통 레이아웃 컴포넌트

- [x] Task 3: AppShell 레이아웃 생성 (AC: 1)
  - [x] 3.1 `components/layout/app-shell.tsx` 생성
  - [x] 3.2 Sidebar + Main Content 영역 구조 구현
  - [x] 3.3 `app/(dashboard)/layout.tsx`에 AppShell 적용

- [x] Task 4: Sidebar 컴포넌트 생성 (AC: 2)
  - [x] 4.1 `components/layout/sidebar.tsx` 생성
  - [x] 4.2 다크 테마 스타일 적용 (배경: Zinc 900)
  - [x] 4.3 너비 240px 고정
  - [x] 4.4 로고/브랜드 영역
  - [x] 4.5 네비게이션 메뉴 구조 (팀, 프로젝트, 설정)
  - [x] 4.6 알림 버튼 + 미읽음 뱃지 placeholder

- [x] Task 5: Header 컴포넌트 생성 (AC: 1)
  - [x] 5.1 `components/layout/header.tsx` 생성
  - [x] 5.2 페이지 제목 영역
  - [x] 5.3 검색 바 placeholder (Command Palette 연동 준비)
  - [x] 5.4 사용자 아바타 드롭다운

### Part C: 공통 UI 컴포넌트

- [x] Task 6: shadcn/ui 기본 컴포넌트 설치 (AC: 3)
  - [x] 6.1 Button (Primary, Secondary, Destructive, AI 변형)
  - [x] 6.2 Input, Textarea, Select
  - [x] 6.3 Card, Badge, Avatar
  - [x] 6.4 Dialog (Modal), Sheet (슬라이드 패널)
  - [x] 6.5 Toast (알림 메시지) - sonner로 대체
  - [x] 6.6 Skeleton (로딩 상태)
  - [x] 6.7 Tabs, Dropdown Menu
  - [x] 6.8 Alert (Success, Error, Warning, Info 변형)

- [x] Task 7: 커스텀 UI 컴포넌트 생성 (AC: 3)
  - [x] 7.1 `components/ui/ai-button.tsx` - AI 그라디언트 버튼
  - [x] 7.2 `components/ui/priority-badge.tsx` - 우선순위 뱃지 (HIGH/MEDIUM/LOW)
  - [x] 7.3 `components/ui/label-tag.tsx` - 라벨 태그 (동적 색상)

### Part D: 인증 컨텍스트 설정

- [x] Task 8: AuthProvider 구현 (AC: 5)
  - [x] 8.1 `components/providers/auth-provider.tsx` 생성
  - [x] 8.2 Supabase Auth 연동 (onAuthStateChange)
  - [x] 8.3 사용자 세션 상태 관리
  - [x] 8.4 `app/layout.tsx`에 AuthProvider 적용

- [x] Task 9: useAuth 훅 구현 (AC: 5)
  - [x] 9.1 `hooks/use-auth.ts` 생성
  - [x] 9.2 user, loading, error 상태 반환
  - [x] 9.3 signIn, signOut, signUp 함수 제공

### Part E: 검증 및 테스트

- [x] Task 10: 컴포넌트 테스트 페이지 (AC: 3)
  - [x] 10.1 `app/(dashboard)/dev/components/page.tsx` 생성
  - [x] 10.2 모든 UI 컴포넌트 렌더링 테스트
  - [x] 10.3 버튼 변형, 색상, 상태 확인

- [x] Task 11: 레이아웃 검증 (AC: 1, 2)
  - [x] 11.1 반응형 동작 확인 (Desktop, Tablet, Mobile)
  - [x] 11.2 Sidebar 접기/펼치기 준비 (Tablet 이하)
  - [x] 11.3 다크모드 Sidebar 스타일 확인

## Dev Notes

### UX 시각 자료 (필수 참조)

> **IMPORTANT**: 아래 HTML 파일들은 개발 전 반드시 브라우저에서 열어 확인하세요. 색상, 레이아웃, 컴포넌트 스타일의 정확한 구현을 위한 인터랙티브 시각 가이드입니다.

| 파일 | 설명 | 확인 내용 |
|------|------|----------|
| **[docs/ux-design-specification.md](../ux-design-specification.md)** | 전체 UX 사양서 | 디자인 시스템, 색상, 타이포그래피, 컴포넌트 상태, 접근성 |
| **[docs/ux-design-directions.html](../ux-design-directions.html)** | 인터랙티브 UI 목업 | Kanban, Dashboard, Login, Team, Profile, Notifications 6개 화면 실제 레이아웃 |
| **[docs/ux-color-themes.html](../ux-color-themes.html)** | 색상 테마 시각화 | 버튼, 폼, 카드, Alert, AI Panel, Priority Badge, Label Tag 컴포넌트 미리보기 + 다크모드 |

### 아키텍처 패턴

- **디자인 시스템**: shadcn/ui + Tailwind CSS + Radix UI
- **레이아웃**: Sidebar (240px) + Main Content + Detail Panel (선택적)
- **테마**: Linear Productivity (Indigo Primary + Blue Accent)
- **폰트**: Inter (Google Fonts via next/font)

[Source: docs/ux-design-specification.md#Design-System-Foundation]

### 색상 시스템

```css
/* Primary Colors */
--primary: #5B5FC7;      /* Indigo - 주요 버튼, 링크 */
--accent: #3B82F6;       /* Blue - AI 기능, 강조 */
--text-primary: #18181B; /* Zinc 900 - 제목, 본문 */
--text-secondary: #71717A; /* Zinc 500 - 보조 텍스트 */
--background: #FAFAFA;   /* Zinc 50 - 페이지 배경 */
--surface: #FFFFFF;      /* White - 카드, 모달 */
--border: #E4E4E7;       /* Zinc 200 - 구분선 */

/* Semantic Colors */
--success: #22C55E;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;

/* Priority Colors */
--priority-high-bg: #FEE2E2;
--priority-high-text: #DC2626;
--priority-medium-bg: #FEF3C7;
--priority-medium-text: #D97706;
--priority-low-bg: #DCFCE7;
--priority-low-text: #16A34A;

/* AI Gradient */
background: linear-gradient(135deg, #5B5FC7 0%, #3B82F6 100%);

/* Kanban Column Colors */
--column-backlog: #71717A;
--column-progress: #3B82F6;
--column-review: #A855F7;
--column-done: #22C55E;

/* Label Colors (bg / text) */
--label-bug-bg: #FEE2E2;
--label-bug-text: #DC2626;
--label-feature-bg: #DBEAFE;
--label-feature-text: #2563EB;
--label-enhancement-bg: #F3E8FF;
--label-enhancement-text: #7C3AED;
--label-docs-bg: #D1FAE5;
--label-docs-text: #059669;
```

[Source: docs/ux-design-specification.md#Color-System, docs/ux-color-themes.html]

### Typography

| 용도 | Weight | Size | Line Height |
|------|--------|------|-------------|
| H1 | Bold (700) | 32px | 1.2 |
| H2 | Semibold (600) | 24px | 1.3 |
| H3 | Semibold (600) | 20px | 1.4 |
| Body | Regular (400) | 16px | 1.6 |
| Small | Regular (400) | 14px | 1.5 |
| Tiny | Medium (500) | 12px | 1.4 |

[Source: docs/ux-design-specification.md#Typography]

### Sidebar 레이아웃 사양

- **너비**: 240px (Desktop), 60px 아이콘만 (Tablet ≤1024px), 숨김 (Mobile ≤768px)
- **배경색**: Zinc 900 (#18181B) - 다크 테마
- **구성**: 로고, 팀 선택, 프로젝트 목록, 설정, 사용자 메뉴
- **활성 상태**: Primary 배경색
- **반응형 Breakpoints**:
  - Desktop (>1024px): 전체 Sidebar 표시
  - Tablet (768px-1024px): 아이콘만 표시, 라벨 숨김
  - Mobile (<768px): Sidebar 숨김, 햄버거 메뉴

[Source: docs/ux-design-specification.md#Design-Direction, docs/ux-design-directions.html]

### 컴포넌트 상태 지원

모든 인터랙티브 컴포넌트는 다음 상태 지원:
- Default, Hover, Focus, Active, Disabled, Loading, Error

[Source: docs/ux-design-specification.md#Component-States]

### Project Structure Notes

파일 생성 경로:
```
components/
├── layout/
│   ├── app-shell.tsx
│   ├── sidebar.tsx
│   └── header.tsx
├── providers/
│   └── auth-provider.tsx
└── ui/
    ├── ai-button.tsx
    ├── priority-badge.tsx
    └── label-tag.tsx

hooks/
└── use-auth.ts
```

[Source: docs/architecture.md#Project-Structure]

### References

- [Source: docs/ux-design-specification.md#Design-System-Foundation] - 디자인 시스템
- [Source: docs/ux-design-specification.md#Color-System] - 색상 체계
- [Source: docs/ux-design-specification.md#Typography] - 타이포그래피
- [Source: docs/ux-design-specification.md#Design-Direction] - 레이아웃 설계
- [Source: docs/ux-color-themes.html] - 색상 테마 시각화 (버튼, 카드, Alert, AI Panel 등)
- [Source: docs/ux-design-directions.html] - UI 목업 (Kanban, Dashboard, Login, Team, Profile, Notifications)
- [Source: docs/architecture.md#Project-Structure] - 폴더 구조
- [Source: docs/epics.md#Story-1.2] - 스토리 상세 설명

### Learnings from Previous Story

**From Story 1-1-project-init-db-schema-deploy (Status: ready-for-dev)**

이전 스토리는 아직 개발이 시작되지 않았습니다 (`ready-for-dev` 상태).

**의존성 참고:**
- Story 1.1에서 Next.js 프로젝트와 Supabase 연동이 완료되어야 함
- 환경변수 설정 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)이 필요
- `lib/supabase/client.ts`, `lib/supabase/server.ts`가 생성되어 있어야 함

**확인 필요 사항:**
- Next.js 프로젝트가 정상 실행되는지 (`npm run dev`)
- Supabase 클라이언트 설정이 완료되어 있는지
- `app/(dashboard)/layout.tsx`가 존재하는지

[Source: docs/sprint-artifacts/1-1-project-init-db-schema-deploy.md]

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/1-2-common-layout-ui-components.context.xml`

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Task 1: shadcn/ui 이미 초기화됨 (components.json 확인)
- Task 2: globals.css에 Linear Productivity 테마 색상 변수 추가, tailwind.config.ts 확장
- Task 3-5: AppShell, Sidebar, Header 컴포넌트 생성 및 (dashboard) 레이아웃에 적용
- Task 6: shadcn/ui 컴포넌트 11개 설치 (dialog, sheet, sonner, skeleton, tabs, select, textarea, avatar, alert, separator, tooltip)
- Task 7: 커스텀 UI 컴포넌트 3개 생성 (AIButton, PriorityBadge, LabelTag)
- Task 8-9: AuthProvider와 useAuth 훅 구현, root layout에 적용
- Task 10: /dev/components 페이지에서 모든 컴포넌트 테스트 가능
- Task 11: 빌드 성공 확인 (npm run build)

### Completion Notes List

- Linear Productivity 테마 완전 구현 (Primary: #5B5FC7, Accent: #3B82F6)
- Sidebar는 Zinc 900 다크 테마로 240px 고정 너비
- 모바일 반응형 지원 (햄버거 메뉴, 슬라이드 오버레이)
- AI 버튼은 그라디언트 스타일로 구현 (btn-ai 클래스)
- Priority Badge와 Label Tag에 커스텀 색상 시스템 적용
- AuthProvider로 Supabase Auth 완전 연동 (signIn, signUp, signOut, signInWithGoogle)
- Sonner를 Toast 대신 사용 (deprecated 대응)

### File List

**NEW:**
- jira-lite-mvp/components/layout/app-shell.tsx
- jira-lite-mvp/components/layout/sidebar.tsx
- jira-lite-mvp/components/layout/header.tsx
- jira-lite-mvp/components/layout/index.ts
- jira-lite-mvp/components/providers/auth-provider.tsx
- jira-lite-mvp/components/ui/ai-button.tsx
- jira-lite-mvp/components/ui/priority-badge.tsx
- jira-lite-mvp/components/ui/label-tag.tsx
- jira-lite-mvp/components/ui/dialog.tsx
- jira-lite-mvp/components/ui/sheet.tsx
- jira-lite-mvp/components/ui/sonner.tsx
- jira-lite-mvp/components/ui/skeleton.tsx
- jira-lite-mvp/components/ui/tabs.tsx
- jira-lite-mvp/components/ui/select.tsx
- jira-lite-mvp/components/ui/textarea.tsx
- jira-lite-mvp/components/ui/avatar.tsx
- jira-lite-mvp/components/ui/alert.tsx
- jira-lite-mvp/components/ui/separator.tsx
- jira-lite-mvp/components/ui/tooltip.tsx
- jira-lite-mvp/hooks/use-auth.ts
- jira-lite-mvp/app/(dashboard)/layout.tsx
- jira-lite-mvp/app/(dashboard)/page.tsx
- jira-lite-mvp/app/(dashboard)/dev/components/page.tsx

**MODIFIED:**
- jira-lite-mvp/app/layout.tsx (Inter 폰트, AuthProvider, Toaster 추가)
- jira-lite-mvp/app/globals.css (Linear Productivity 테마 색상 변수)
- jira-lite-mvp/tailwind.config.ts (커스텀 색상, sidebar spacing, ai-gradient)

**DELETED:**
- jira-lite-mvp/app/page.tsx (dashboard 레이아웃으로 대체)

## Change Log

| 날짜 | 변경 내용 | 작성자 |
|------|----------|--------|
| 2025-11-29 | 스토리 초안 작성 | SM (create-story workflow) |
| 2025-11-29 | UX HTML 목업 반영: 칸반 컬럼 색상, 라벨 색상, Alert 컴포넌트, 반응형 breakpoints 추가 | SM |
| 2025-11-29 | UX 시각 자료 필수 참조 섹션 추가 (ux-design-specification.md, ux-design-directions.html, ux-color-themes.html) | UX Designer |
| 2025-11-29 | Story context 생성 완료, 상태 drafted → ready-for-dev | story-context workflow |
| 2025-11-29 | 스토리 구현 완료 - 모든 AC 달성, 상태 in-progress → review | Dev Agent (Claude Opus 4.5) |
