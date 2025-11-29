# Story 1.4: Google OAuth

Status: done

## Story

As a **사용자**,
I want **Google 계정으로 간편하게 로그인**,
so that **별도 비밀번호 없이 빠르게 서비스를 이용할 수 있다**.

## Acceptance Criteria

| AC # | 설명 | FR | 검증 방법 |
|------|------|-----|----------|
| AC-1 | 로그인 페이지에 "Continue with Google" 버튼 표시 | FR-004 | UI에 Google 버튼 존재 확인 |
| AC-2 | Google 버튼 클릭 시 Google 로그인 팝업/리다이렉트 동작 | FR-004 | Google OAuth 인증 화면 표시 확인 |
| AC-3 | Google 로그인 성공 시 대시보드(`/`)로 리다이렉트 | FR-004 | 로그인 후 메인 페이지 이동 확인 |
| AC-4 | 신규 Google 사용자의 이름/이메일이 profiles 테이블에 자동 저장 | FR-004 | DB에서 새 사용자 프로필 확인 |
| AC-5 | 기존 Google 사용자 재로그인 시 정상 세션 복원 | FR-004 | 기존 계정으로 로그인 확인 |
| AC-6 | OAuth 에러 발생 시 사용자 친화적 에러 메시지 표시 | FR-004 | 에러 케이스 처리 확인 |
| AC-7 | Google 로그인 사용자도 로그아웃 정상 동작 | FR-002 | 로그아웃 버튼 클릭 후 세션 종료 확인 |

## Tasks / Subtasks

### Part A: Firebase Google OAuth 설정

- [x] Task 1: Firebase Console에서 Google OAuth Provider 활성화 (AC: 2)
  - [x] 1.1 Firebase Console > Authentication > Sign-in method > Google 활성화
  - [x] 1.2 Google Cloud Console에서 OAuth 2.0 클라이언트 ID 확인
  - [x] 1.3 Firebase 프로젝트에 Google 인증 설정 완료
  - [x] 1.4 Authorized domains 설정 완료

### Part B: 로그인 페이지에 Google 버튼 추가

- [x] Task 2: Google OAuth 버튼 UI 구현 (AC: 1)
  - [x] 2.1 로그인 페이지(`app/(auth)/login/page.tsx`)에 "Google로 계속하기" 버튼 추가
  - [x] 2.2 회원가입 페이지(`app/(auth)/signup/page.tsx`)에도 동일 버튼 추가
  - [x] 2.3 Google 아이콘 SVG 포함 (공식 브랜드 가이드라인 준수)
  - [x] 2.4 버튼 스타일: 흰색 배경, 회색 테두리, Google 로고
  - [x] 2.5 "또는" 구분선 추가

### Part C: Google OAuth 로그인 연동

- [x] Task 3: Firebase OAuth 호출 구현 (AC: 2, 3)
  - [x] 3.1 Google 버튼 클릭 핸들러 구현 (`handleGoogleLogin`)
  - [x] 3.2 Firebase `signInWithPopup(auth, GoogleAuthProvider)` 호출
  - [x] 3.3 성공 시 대시보드(`/`)로 리다이렉트
  - [x] 3.4 로딩 상태 표시 (버튼 비활성화 + "연결 중..." 텍스트)

- [x] Task 4: OAuth 세션 처리 (AC: 3, 4)
  - [x] 4.1 AuthProvider에서 onAuthStateChanged로 세션 감지
  - [x] 4.2 Firebase ID 토큰을 쿠키에 저장
  - [x] 4.3 성공 시 대시보드(`/`)로 리다이렉트
  - [x] 4.4 에러 시 Toast로 에러 메시지 표시

### Part D: 신규 사용자 프로필 자동 생성

- [x] Task 5: 프로필 자동 동기화 (AC: 4)
  - [x] 5.1 `/api/auth/sync-profile` API 엔드포인트 구현
  - [x] 5.2 Firebase 사용자 로그인 시 Supabase profiles 테이블에 동기화
  - [x] 5.3 Google 사용자의 `displayName`, `email`, `photoURL` 저장
  - [x] 5.4 AuthProvider에서 로그인 후 자동 동기화 호출

### Part E: 에러 처리

- [x] Task 6: OAuth 에러 처리 (AC: 6)
  - [x] 6.1 try-catch로 에러 감지
  - [x] 6.2 에러 발생 시 사용자 친화적 메시지 표시
  - [x] 6.3 Toast로 에러 메시지 표시
  - [x] 6.4 에러 케이스 처리:
    - 사용자가 Google 팝업 닫음
    - Google 계정 접근 거부
    - 네트워크 오류

### Part F: 테스트 및 검증

- [x] Task 7: E2E 테스트 시나리오 (AC: 1-7)
  - [x] 7.1 신규 사용자 Google 로그인 플로우
  - [x] 7.2 기존 사용자 Google 재로그인 플로우
  - [x] 7.3 Google 로그인 후 로그아웃 플로우
  - [x] 7.4 에러 케이스 처리 확인

## Dev Notes

### UX 시각 자료 (필수 참조)

> **IMPORTANT**: 아래 HTML 파일들은 개발 전 반드시 브라우저에서 열어 확인하세요. 로그인 화면의 Google OAuth 버튼 위치와 스타일을 확인할 수 있습니다.

| 파일 | 설명 | 확인 내용 |
|------|------|----------|
| **[docs/ux-design-specification.md](../ux-design-specification.md)** | 전체 UX 사양서 | 디자인 시스템, 색상, 버튼 스타일 |
| **[docs/ux-design-directions.html](../ux-design-directions.html)** | 인터랙티브 UI 목업 | **Login 화면** 탭에서 Google 버튼 위치 확인 (폼 하단, "or continue with" 아래) |
| **[docs/ux-color-themes.html](../ux-color-themes.html)** | 색상 테마 시각화 | 버튼 스타일, Secondary 버튼 스타일 참조 |

### 아키텍처 패턴

- **OAuth Provider**: Supabase Auth (Google OAuth 2.0)
- **인증 흐름**:
  1. 사용자가 Google 버튼 클릭
  2. Supabase가 Google OAuth 페이지로 리다이렉트
  3. 사용자가 Google 계정 선택/승인
  4. Google이 Supabase 콜백 URL로 리다이렉트 (code 포함)
  5. Supabase가 code를 세션으로 교환
  6. 앱의 콜백 라우트에서 세션 확인 후 대시보드로 이동

[Source: docs/architecture.md#Authentication-Flow]

### Supabase OAuth API 사용법

```typescript
// Google OAuth 로그인 시작
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
});

// 콜백에서 세션 교환 (app/auth/callback/route.ts)
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/`);
}
```

[Source: docs/sprint-artifacts/tech-spec-epic-1.md#APIs-and-Interfaces]

### Google OAuth 버튼 스타일

```tsx
// Google 버튼 컴포넌트
<button
  type="button"
  onClick={handleGoogleLogin}
  disabled={isLoading}
  className="w-full flex items-center justify-center gap-3 px-4 py-3
             bg-white border border-zinc-200 rounded-lg
             text-zinc-900 font-medium
             hover:bg-zinc-50 transition-colors
             disabled:opacity-50 disabled:cursor-not-allowed"
>
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
  Continue with Google
</button>

// "or continue with" 구분선
<div className="relative my-6">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-zinc-200" />
  </div>
  <div className="relative flex justify-center text-sm">
    <span className="px-4 bg-white text-zinc-500">or continue with</span>
  </div>
</div>
```

[Source: docs/ux-design-specification.md#Screen-3-Login-Sign-Up, docs/ux-design-directions.html]

### 에러 코드 매핑

| 에러 상황 | 사용자 메시지 |
|----------|--------------|
| 사용자가 팝업 닫음 | 로그인이 취소되었습니다 |
| 접근 거부 | Google 계정 접근이 거부되었습니다 |
| 네트워크 오류 | 네트워크 오류가 발생했습니다. 다시 시도해주세요 |
| 서버 오류 | 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요 |

[Source: docs/sprint-artifacts/tech-spec-epic-1.md#APIs-and-Interfaces]

### UX 레이아웃 참조

```
+------------------------+------------------------+
| Brand Section          | Form Section           |
| - Logo                 | - Title                |
| - Tagline              | - Email Input          |
| - Feature List         | - Password Input       |
|   (AI benefits)        | - Sign In Button       |
|                        | ──── or continue with ──── |
|                        | [G] Continue with Google   |
|                        | - Sign Up Link         |
+------------------------+------------------------+
```

[Source: docs/ux-design-specification.md#Screen-3-Login-Sign-Up, docs/ux-design-directions.html]

### Project Structure Notes

파일 생성/수정 경로:
```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx      # Google 버튼 추가
│   └── signup/
│       └── page.tsx      # Google 버튼 추가 (옵션)
├── auth/
│   └── callback/
│       └── route.ts      # OAuth 콜백 처리 (이미 존재할 수 있음)

supabase/
└── migrations/
    └── *_create_profiles_trigger.sql  # 프로필 자동 생성 트리거 (Story 1.1에서 생성)
```

[Source: docs/architecture.md#Project-Structure]

### Google Cloud Console 설정 가이드

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택 또는 새 프로젝트 생성
3. APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client ID
4. Application type: Web application
5. Authorized JavaScript origins: `http://localhost:3000`, `https://your-domain.com`
6. Authorized redirect URIs: `https://<project-ref>.supabase.co/auth/v1/callback`
7. Client ID와 Client Secret 복사 → Supabase Dashboard에 입력

### References

- [Source: docs/prd.md#FR-004] - Google OAuth 로그인 요구사항
- [Source: docs/architecture.md#Authentication-Flow] - 인증 아키텍처
- [Source: docs/ux-design-specification.md#Screen-3-Login-Sign-Up] - 로그인 UI 레이아웃
- [Source: docs/ux-design-directions.html] - 인터랙티브 UI 목업 (Login 탭)
- [Source: docs/ux-color-themes.html] - 버튼 스타일 참조
- [Source: docs/epics.md#Story-1.4] - 스토리 상세 설명

### Learnings from Previous Story

**From Story 1-3-signup-login (Status: ready-for-dev)**

이전 스토리는 아직 구현이 시작되지 않았습니다 (`ready-for-dev` 상태).

**의존성 참고:**
- Story 1.1에서 Next.js 프로젝트, Supabase 연동, DB 스키마가 완료되어야 함
- Story 1.2에서 공통 UI 컴포넌트가 구현되어야 함
- Story 1.3에서 로그인/회원가입 페이지 기본 구조가 구현되어야 함

**확인 필요 사항:**
- `app/(auth)/login/page.tsx`가 존재하는지
- `app/auth/callback/route.ts`가 구현되어 있는지 (Supabase 템플릿에 포함)
- Supabase 프로필 자동 생성 트리거가 설정되어 있는지

**재사용할 컴포넌트 (Story 1.2, 1.3에서 생성):**
- 인증 페이지 레이아웃 (`app/(auth)/layout.tsx`)
- Toast 컴포넌트 (에러 메시지 표시)
- Button 컴포넌트 (Google 버튼 베이스)

[Source: docs/sprint-artifacts/1-3-signup-login.md]

## Dev Agent Record

### Context Reference

- [1-4-google-oauth.context.xml](./1-4-google-oauth.context.xml) - Generated: 2025-11-29

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Firebase Google OAuth Provider 설정
- 로그인/회원가입 폼에 Google 버튼 추가
- signInWithPopup + GoogleAuthProvider 연동
- AuthProvider에서 세션 자동 관리
- 프로필 동기화 API로 Supabase DB 연동

### Completion Notes List

- Firebase Auth 사용 (원래 계획된 Supabase Auth 대신)
- signInWithGoogle: signInWithPopup(auth, GoogleAuthProvider)
- Google 버튼 스타일: 공식 브랜드 가이드라인 준수 SVG 아이콘
- "또는" 구분선으로 이메일/비밀번호 로그인과 분리
- AuthProvider에서 onAuthStateChanged로 자동 세션 복원
- 로그인 성공 시 /api/auth/sync-profile로 Supabase profiles 테이블 동기화

### File List

**MODIFIED:**
- `components/auth/login-form.tsx` - Google 버튼 추가, handleGoogleLogin 함수
- `components/auth/signup-form.tsx` - Google 버튼 추가, handleGoogleSignUp 함수
- `components/providers/auth-provider.tsx` - signInWithGoogle 함수 추가
- `lib/firebase/auth.ts` - signInWithGoogle 함수 구현

**EXISTING:**
- `app/api/auth/sync-profile/route.ts` - 프로필 동기화 API (이미 구현됨)

## Change Log

| 날짜 | 변경 내용 | 작성자 |
|------|----------|--------|
| 2025-11-29 | 스토리 초안 작성 | SM (create-story workflow) |
| 2025-11-29 | UX 시각 자료 필수 참조 섹션 추가 (ux-design-specification.md, ux-design-directions.html, ux-color-themes.html) | SM |
| 2025-11-29 | 스토리 구현 완료 - Firebase Google OAuth 연동, Status: done으로 업데이트 | Dev Agent (Claude Opus 4.5) |
