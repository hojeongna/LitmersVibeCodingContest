# Story 1.3: 회원가입 & 로그인

Status: ready-for-dev

## Story

As a **사용자**,
I want **이메일과 비밀번호로 회원가입하고 로그인**,
so that **시스템에 접근하여 이슈 트래킹 기능을 사용할 수 있다**.

## Acceptance Criteria

| AC # | 설명 | FR | 검증 방법 |
|------|------|-----|----------|
| AC-1 | 유효한 이메일/비밀번호/이름으로 회원가입 성공 | FR-001 | 회원가입 폼 제출 후 자동 로그인 확인 |
| AC-2 | 회원가입 후 자동 로그인 및 대시보드 리다이렉트 | FR-001 | `/` 페이지로 리다이렉트 확인 |
| AC-3 | 중복 이메일로 회원가입 시 에러 메시지 표시 | FR-001 | "이미 사용 중인 이메일입니다" 메시지 확인 |
| AC-4 | 비밀번호 6자 미만 시 유효성 에러 표시 | FR-001 | 폼 유효성 검증 메시지 확인 |
| AC-5 | 비밀번호 강도 표시 동작 (Weak/Medium/Strong) | FR-001 | 입력 중 강도 인디케이터 변화 확인 |
| AC-6 | 올바른 자격 증명으로 로그인 성공 | FR-002 | 로그인 후 대시보드 이동 확인 |
| AC-7 | 로그인 실패 시 에러 메시지 표시 | FR-002 | "이메일 또는 비밀번호가 올바르지 않습니다" 메시지 확인 |
| AC-8 | 로그아웃 시 `/auth/login`으로 리다이렉트 | FR-002 | 로그아웃 버튼 클릭 후 리다이렉트 확인 |
| AC-9 | 미인증 사용자가 보호된 페이지 접근 시 로그인 페이지로 리다이렉트 | FR-002 | 직접 `/` 접근 시 로그인 페이지로 이동 확인 |
| AC-10 | 폼에 "Remember me" 체크박스 존재 | FR-002 | UI에 체크박스 표시 확인 |

## Tasks / Subtasks

### Part A: 회원가입 페이지 (FR-001)

- [ ] Task 1: 회원가입 페이지 라우트 생성 (AC: 1, 2)
  - [ ] 1.1 `app/(auth)/signup/page.tsx` 생성
  - [ ] 1.2 `app/(auth)/layout.tsx` 생성 (인증 페이지 공통 레이아웃)

- [ ] Task 2: 회원가입 폼 구현 (AC: 1, 3, 4, 5)
  - [ ] 2.1 이메일 입력 필드 (유효성: 이메일 형식, 최대 255자)
  - [ ] 2.2 비밀번호 입력 필드 (유효성: 6~100자)
  - [ ] 2.3 비밀번호 보기/숨기기 토글 버튼
  - [ ] 2.4 비밀번호 강도 표시 인디케이터 구현
    - Weak: 빨간색 (6자 미만 또는 숫자만)
    - Medium: 노란색 (6자 이상, 문자+숫자)
    - Strong: 초록색 (8자 이상, 문자+숫자+특수문자)
  - [ ] 2.5 이름 입력 필드 (유효성: 1~50자)
  - [ ] 2.6 Zod 스키마 유효성 검증 (`lib/validations/auth.ts`)
  - [ ] 2.7 react-hook-form 연동

- [ ] Task 3: 회원가입 API 연동 (AC: 1, 2, 3)
  - [ ] 3.1 Supabase Auth `signUp()` 호출
  - [ ] 3.2 메타데이터로 이름 전달 (`options.data.name`)
  - [ ] 3.3 성공 시 자동 로그인 및 대시보드 리다이렉트
  - [ ] 3.4 에러 처리 (중복 이메일, 약한 비밀번호 등)
  - [ ] 3.5 Toast로 성공/에러 메시지 표시

### Part B: 로그인 페이지 (FR-002)

- [ ] Task 4: 로그인 페이지 생성 (AC: 6, 7, 10)
  - [ ] 4.1 `app/(auth)/login/page.tsx` 생성
  - [ ] 4.2 이메일 입력 필드
  - [ ] 4.3 비밀번호 입력 필드
  - [ ] 4.4 비밀번호 보기/숨기기 토글
  - [ ] 4.5 "Remember me" 체크박스
  - [ ] 4.6 "Sign Up" 링크 (회원가입 페이지로)
  - [ ] 4.7 "Forgot password?" 링크 (비밀번호 재설정 페이지로 - Story 1.5)

- [ ] Task 5: 로그인 API 연동 (AC: 6, 7)
  - [ ] 5.1 Supabase Auth `signInWithPassword()` 호출
  - [ ] 5.2 성공 시 대시보드로 리다이렉트
  - [ ] 5.3 에러 처리 ("이메일 또는 비밀번호가 올바르지 않습니다")
  - [ ] 5.4 Toast로 에러 메시지 표시

### Part C: 로그아웃 기능 (FR-002)

- [ ] Task 6: 로그아웃 구현 (AC: 8)
  - [ ] 6.1 Sidebar 또는 Header 사용자 메뉴에 로그아웃 버튼 추가
  - [ ] 6.2 `supabase.auth.signOut()` 호출
  - [ ] 6.3 세션 클리어 후 `/auth/login`으로 리다이렉트

### Part D: 인증 미들웨어 (FR-002)

- [ ] Task 7: 보호된 라우트 미들웨어 (AC: 9)
  - [ ] 7.1 `middleware.ts` 구현 (Supabase SSR 패턴)
  - [ ] 7.2 세션 갱신 로직 (`supabase.auth.getSession()`)
  - [ ] 7.3 미인증 시 `/auth/login`으로 리다이렉트
  - [ ] 7.4 인증된 사용자가 `/auth/*` 접근 시 대시보드로 리다이렉트

### Part E: 인증 레이아웃 UI

- [ ] Task 8: 인증 페이지 레이아웃 (AC: 1, 6)
  - [ ] 8.1 좌측: 브랜드 영역 (로고, 태그라인, AI 기능 소개)
  - [ ] 8.2 우측: 폼 영역 (회원가입/로그인 폼)
  - [ ] 8.3 그라디언트 배경 (좌측 영역)
  - [ ] 8.4 모바일 반응형 (단일 컬럼)

### Part F: 테스트 및 검증

- [ ] Task 9: E2E 테스트 시나리오 (AC: 1-10)
  - [ ] 9.1 회원가입 성공 플로우 테스트
  - [ ] 9.2 중복 이메일 에러 테스트
  - [ ] 9.3 로그인 성공 플로우 테스트
  - [ ] 9.4 로그인 실패 에러 테스트
  - [ ] 9.5 로그아웃 플로우 테스트
  - [ ] 9.6 보호된 라우트 리다이렉트 테스트

## Dev Notes

### UX 시각 자료 (필수 참조)

> **IMPORTANT**: 아래 HTML 파일들은 개발 전 반드시 브라우저에서 열어 확인하세요. 로그인/회원가입 화면의 정확한 구현을 위한 인터랙티브 시각 가이드입니다.

| 파일 | 설명 | 확인 내용 |
|------|------|----------|
| **[docs/ux-design-specification.md](../ux-design-specification.md)** | 전체 UX 사양서 | 디자인 시스템, 색상, 타이포그래피, 폼 패턴, 에러 표시 방식 |
| **[docs/ux-design-directions.html](../ux-design-directions.html)** | 인터랙티브 UI 목업 | **Login 화면** 탭에서 실제 레이아웃 확인 (좌측 브랜드 + 우측 폼) |
| **[docs/ux-color-themes.html](../ux-color-themes.html)** | 색상 테마 시각화 | 버튼, Input, 에러 상태, Primary 색상 (#5B5FC7) 컴포넌트 미리보기 |

### 아키텍처 패턴

- **인증 방식**: Supabase Auth (JWT 기반, 24시간 만료)
- **폼 관리**: react-hook-form + zod
- **상태 관리**: AuthProvider Context (Story 1.2에서 구현)
- **라우트 보호**: Next.js Middleware + Supabase SSR

[Source: docs/architecture.md#Authentication-Flow]

### Supabase Auth API 사용법

```typescript
// 회원가입
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { name }  // profiles 테이블에 저장될 메타데이터
  }
});

// 로그인
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// 로그아웃
await supabase.auth.signOut();

// 세션 확인
const { data: { session } } = await supabase.auth.getSession();
```

[Source: docs/sprint-artifacts/tech-spec-epic-1.md#APIs-and-Interfaces]

### Zod 스키마 정의

```typescript
// lib/validations/auth.ts
export const signUpSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요').max(255),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다').max(100),
  name: z.string().min(1, '이름을 입력하세요').max(50),
});

export const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  password: z.string().min(1, '비밀번호를 입력하세요'),
});
```

[Source: docs/sprint-artifacts/tech-spec-epic-1.md#Data-Models-and-Contracts]

### 에러 코드 매핑

| Supabase Error | 사용자 메시지 |
|----------------|--------------|
| `user_already_exists` | 이미 사용 중인 이메일입니다 |
| `invalid_credentials` | 이메일 또는 비밀번호가 올바르지 않습니다 |
| `weak_password` | 비밀번호가 너무 약합니다 |

[Source: docs/sprint-artifacts/tech-spec-epic-1.md#APIs-and-Interfaces]

### UX 레이아웃 참조

```
+------------------------+------------------------+
| Brand Section          | Form Section           |
| - Logo                 | - Title                |
| - Tagline              | - Email Input          |
| - Feature List         | - Password Input       |
|   (AI benefits)        | - Sign In Button       |
|                        | - Google OAuth Button  |
|                        | - Sign Up Link         |
+------------------------+------------------------+
```

[Source: docs/ux-design-specification.md#Screen-3-Login-Sign-Up]

### 비밀번호 강도 표시

```typescript
function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (password.length < 6) return 'weak';

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length >= 8 && hasLetter && hasNumber && hasSpecial) {
    return 'strong';
  }
  if (hasLetter && hasNumber) {
    return 'medium';
  }
  return 'weak';
}
```

[Source: docs/ux-design-specification.md#Password-Change-Form]

### Project Structure Notes

파일 생성 경로:
```
app/
├── (auth)/
│   ├── layout.tsx        # 인증 페이지 공통 레이아웃
│   ├── login/
│   │   └── page.tsx      # 로그인 페이지
│   └── signup/
│       └── page.tsx      # 회원가입 페이지

lib/
└── validations/
    └── auth.ts           # Zod 스키마 (signUpSchema, loginSchema)

middleware.ts             # 인증 미들웨어
```

[Source: docs/architecture.md#Project-Structure]

### 색상 및 스타일 참조

- **Primary 버튼**: `bg-[#5B5FC7] hover:bg-[#4F52B3]`
- **에러 텍스트**: `text-[#EF4444]`
- **강도 인디케이터**:
  - Weak: `bg-[#EF4444]` (빨강)
  - Medium: `bg-[#F59E0B]` (노랑)
  - Strong: `bg-[#22C55E]` (초록)

[Source: docs/ux-design-specification.md#Color-System, docs/ux-color-themes.html]

### 좌측 브랜드 영역 그라디언트

```css
/* 인증 페이지 좌측 브랜드 섹션 배경 */
background: linear-gradient(135deg, #5B5FC7 0%, #3B82F6 100%);
```

[Source: docs/ux-design-directions.html - Login Screen]

### AI 기능 강조 리스트 (좌측 영역)

좌측 브랜드 섹션에 표시할 AI 기능 소개 4개 항목:

```tsx
const features = [
  "AI 자동 요약으로 이슈를 빠르게 파악",
  "직관적인 칸반 보드로 작업 관리",
  "실시간 팀 협업 지원",
  "중복 이슈 자동 탐지",
];
```

[Source: docs/ux-design-directions.html - Login Screen]

### Remember me 체크박스 구현

```tsx
// 체크박스 + 라벨 구조
<div className="flex items-center justify-between">
  <label className="flex items-center gap-2 text-sm">
    <Checkbox id="remember" />
    <span>Remember me</span>
  </label>
  <Link href="/auth/forgot-password" className="text-sm text-[#5B5FC7] hover:underline">
    Forgot password?
  </Link>
</div>
```

**참고**: shadcn/ui Checkbox 컴포넌트 사용 (`@radix-ui/react-checkbox`)

[Source: docs/ux-design-directions.html - Login Screen]

### 버튼 상태별 스타일

| 상태 | 스타일 |
|------|--------|
| **Default** | `bg-[#5B5FC7] text-white` |
| **Hover** | `bg-[#4F52B3]` |
| **Focus** | `ring-2 ring-[#5B5FC7] ring-offset-2` |
| **Disabled** | `opacity-50 cursor-not-allowed` |
| **Loading** | `opacity-80` + Spinner 아이콘 |

[Source: docs/ux-color-themes.html]

### References

- [Source: docs/prd.md#FR-001] - 회원가입 요구사항
- [Source: docs/prd.md#FR-002] - 로그인/로그아웃 요구사항
- [Source: docs/architecture.md#Authentication-Flow] - 인증 아키텍처
- [Source: docs/sprint-artifacts/tech-spec-epic-1.md#AC-3-AC-4] - 수락 조건 상세
- [Source: docs/ux-design-specification.md#Screen-3-Login-Sign-Up] - UI 레이아웃
- [Source: docs/ux-design-directions.html] - 인터랙티브 UI 목업
- [Source: docs/epics.md#Story-1.3] - 스토리 상세 설명

### Learnings from Previous Story

**From Story 1-2-common-layout-ui-components (Status: ready-for-dev)**

이전 스토리는 아직 구현이 시작되지 않았습니다 (`ready-for-dev` 상태).

**의존성 참고:**
- Story 1.1에서 Next.js 프로젝트, Supabase 연동, DB 스키마가 완료되어야 함
- Story 1.2에서 `AuthProvider`, `useAuth` 훅, 공통 UI 컴포넌트가 구현되어야 함
- 환경변수 설정이 필요 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

**확인 필요 사항:**
- `lib/supabase/client.ts`, `lib/supabase/server.ts`가 존재하는지
- `components/providers/auth-provider.tsx`가 구현되어 있는지
- `hooks/use-auth.ts`가 구현되어 있는지
- shadcn/ui Button, Input, Toast 등 기본 컴포넌트가 설치되어 있는지

**재사용할 컴포넌트 (Story 1.2에서 생성):**
- `AuthProvider` - 인증 컨텍스트
- `useAuth` 훅 - 로그인/로그아웃 함수 제공
- shadcn/ui 컴포넌트: Button, Input, Toast, Card

[Source: docs/sprint-artifacts/1-2-common-layout-ui-components.md]

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/1-3-signup-login.context.xml`

### Agent Model Used

<!-- Will be filled by dev agent -->

### Debug Log References

<!-- Will be filled by dev agent during implementation -->

### Completion Notes List

<!-- Will be filled by dev agent after completion -->

### File List

<!-- Will be filled by dev agent: NEW, MODIFIED, DELETED files -->

## Change Log

| 날짜 | 변경 내용 | 작성자 |
|------|----------|--------|
| 2025-11-29 | 스토리 초안 작성 | SM (create-story workflow) |
| 2025-11-29 | UX 시각 자료 필수 참조 섹션 추가 (ux-design-specification.md, ux-design-directions.html, ux-color-themes.html) | SM |
