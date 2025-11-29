# Epic Technical Specification: Foundation & 인증

Date: 2025-11-29
Author: hojeong
Epic ID: 1
Status: Draft

---

## Overview

Epic 1은 Jira Lite MVP의 **기반 인프라 및 사용자 인증 시스템**을 구축하는 핵심 Epic입니다. 이 Epic은 다른 모든 Epic(팀 관리, 프로젝트/이슈, 칸반, AI 기능)의 선행 조건으로, 프로젝트 초기화, 데이터베이스 스키마, 배포 환경, 공통 UI 컴포넌트, 그리고 완전한 사용자 인증 플로우를 포함합니다.

PRD에서 정의된 8시간 해커톤 MVP 목표 달성을 위해, Supabase Auth를 활용한 이메일/비밀번호 인증과 Google OAuth를 구현하며, 모든 엔티티에 Soft Delete 패턴과 Row Level Security(RLS)를 적용하여 팀 멤버십 기반 데이터 격리를 보장합니다.

## Objectives and Scope

### In Scope (범위 내)

- **프로젝트 초기화**: Next.js 15 프로젝트 생성, 의존성 설치, 환경변수 설정
- **데이터베이스 구축**: Supabase PostgreSQL 전체 스키마 (15개 테이블) 마이그레이션
- **RLS 정책**: 팀 멤버십 기반 접근 제어 정책 구현 (FR-070)
- **Soft Delete**: 모든 주요 엔티티에 deleted_at 패턴 적용 (FR-071)
- **배포 환경**: Firebase App Hosting 설정, Git 푸시 자동 배포
- **공통 UI**: shadcn/ui 설치, Linear Productivity 테마, AppShell/Sidebar/Header 레이아웃
- **회원가입/로그인**: 이메일/비밀번호 인증 (FR-001, FR-002)
- **비밀번호 재설정**: 이메일 발송 기반 비밀번호 재설정 (FR-003)
- **Google OAuth**: 소셜 로그인 연동 (FR-004)
- **프로필 관리**: 이름/프로필 이미지 수정 (FR-005)
- **비밀번호 변경**: 로그인 상태에서 비밀번호 변경 (FR-006)
- **계정 삭제**: Soft Delete 기반 계정 삭제 (FR-007)

### Out of Scope (범위 외)

- 팀/프로젝트/이슈 CRUD (Epic 2, 3에서 구현)
- 칸반 보드 Drag & Drop (Epic 4에서 구현)
- AI 기능 (Epic 5에서 구현)
- 대시보드 및 알림 (Epic 5에서 구현)
- 이메일 인증(Email Verification) - MVP에서는 제외
- 2단계 인증(2FA) - MVP에서는 제외

## System Architecture Alignment

### 아키텍처 컴포넌트 참조

| 컴포넌트 | 아키텍처 결정 | Epic 1 적용 |
|----------|--------------|-------------|
| **Frontend** | Next.js 15 (App Router) | `app/(auth)/*`, `app/(dashboard)/*` 라우트 구조 |
| **Styling** | Tailwind CSS + shadcn/ui | Linear Productivity 테마 적용, 공통 UI 컴포넌트 |
| **Auth** | Supabase Auth | 이메일/비밀번호 + Google OAuth Provider |
| **Database** | Supabase PostgreSQL | profiles, teams, team_members 등 15개 테이블 |
| **Storage** | Supabase Storage | 프로필 이미지 업로드 (FR-005) |
| **Email** | Resend | 비밀번호 재설정 이메일 (FR-003) |
| **Hosting** | Firebase App Hosting | Git 푸시 자동 배포 설정 |

### 기술 제약사항

- **JWT 토큰 만료**: 24시간 (PRD 명시)
- **비밀번호 재설정 링크 만료**: 1시간 (PRD 명시)
- **비밀번호 최소 길이**: 6자 이상, 최대 100자
- **사용자 이름**: 1~50자
- **이메일**: 최대 255자, 유니크 제약

## Detailed Design

### Services and Modules

| 모듈/서비스 | 경로 | 책임 | 입력 | 출력 |
|------------|------|------|------|------|
| **Supabase Client** | `lib/supabase/client.ts` | 브라우저용 Supabase 클라이언트 | - | SupabaseClient |
| **Supabase Server** | `lib/supabase/server.ts` | 서버 컴포넌트용 Supabase 클라이언트 | cookies | SupabaseClient |
| **Auth Middleware** | `middleware.ts` | 세션 갱신, 보호된 라우트 체크 | Request | NextResponse |
| **Auth Context** | `components/providers/auth-provider.tsx` | 사용자 세션 상태 관리 | children | User context |
| **Resend Service** | `lib/email/resend.ts` | 이메일 발송 추상화 | EmailPayload | SendResult |
| **Validation Schemas** | `lib/validations/auth.ts` | Zod 스키마 (회원가입, 로그인, 비밀번호) | FormData | ValidationResult |

#### 주요 컴포넌트

| 컴포넌트 | 경로 | 용도 |
|----------|------|------|
| `AppShell` | `components/layout/app-shell.tsx` | 메인 레이아웃 (Sidebar + Content) |
| `Sidebar` | `components/layout/sidebar.tsx` | 좌측 네비게이션 (240px, 다크) |
| `Header` | `components/layout/header.tsx` | 상단 헤더 (검색, 알림, 프로필) |
| `SignUpForm` | `app/(auth)/signup/page.tsx` | 회원가입 폼 |
| `LoginForm` | `app/(auth)/login/page.tsx` | 로그인 폼 |
| `ProfileSettings` | `app/(dashboard)/settings/profile/page.tsx` | 프로필 설정 |

### Data Models and Contracts

#### profiles 테이블 (auth.users 확장)

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ  -- Soft Delete (FR-071)
);

-- 사용자 생성 시 자동 프로필 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### TypeScript 타입 정의

```typescript
// types/index.ts
export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile;
}

// Zod 스키마 (lib/validations/auth.ts)
export const signUpSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요').max(255),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다').max(100),
  name: z.string().min(1, '이름을 입력하세요').max(50),
});

export const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  password: z.string().min(1, '비밀번호를 입력하세요'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '현재 비밀번호를 입력하세요'),
  newPassword: z.string().min(6, '새 비밀번호는 6자 이상이어야 합니다').max(100),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});
```

### APIs and Interfaces

#### Auth API Routes

| Method | Endpoint | 설명 | Request Body | Response |
|--------|----------|------|--------------|----------|
| POST | `/api/auth/callback` | OAuth 콜백 처리 | code (query) | Redirect |
| POST | `/api/email/reset-password` | 비밀번호 재설정 이메일 발송 | `{ email: string }` | `{ success: boolean }` |

#### Supabase Auth API (클라이언트)

```typescript
// 회원가입 (FR-001)
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { name }  // 프로필에 저장될 메타데이터
  }
});

// 로그인 (FR-002)
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// 로그아웃 (FR-002)
await supabase.auth.signOut();

// Google OAuth (FR-004)
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${origin}/api/auth/callback`
  }
});

// 비밀번호 재설정 요청 (FR-003)
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${origin}/auth/reset-password`
});

// 비밀번호 변경 (FR-006)
const { error } = await supabase.auth.updateUser({
  password: newPassword
});

// 프로필 업데이트 (FR-005)
const { error } = await supabase
  .from('profiles')
  .update({ name, avatar_url })
  .eq('id', userId);
```

#### 에러 응답 형식

```typescript
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

// 에러 코드
const ErrorCodes = {
  UNAUTHORIZED: '로그인이 필요합니다',
  EMAIL_EXISTS: '이미 사용 중인 이메일입니다',
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다',
  WEAK_PASSWORD: '비밀번호가 너무 약합니다',
  RATE_LIMIT: '요청이 너무 많습니다. 잠시 후 다시 시도하세요',
  HAS_OWNED_TEAMS: '소유한 팀이 있어 계정을 삭제할 수 없습니다',
};
```

### Workflows and Sequencing

#### 회원가입 플로우 (FR-001)

```
User → SignUpForm → Supabase Auth signUp() → Trigger: handle_new_user()
                                            → profiles 테이블에 레코드 생성
                                            → 자동 로그인 → Dashboard 리다이렉트
```

#### 로그인 플로우 (FR-002)

```
User → LoginForm → Supabase Auth signInWithPassword()
     → JWT 토큰 발급 (24시간 만료)
     → 쿠키 저장
     → Dashboard 리다이렉트
```

#### Google OAuth 플로우 (FR-004)

```
User → "Continue with Google" 클릭
     → Supabase Auth signInWithOAuth()
     → Google 인증 팝업
     → /api/auth/callback 리다이렉트
     → 신규 사용자: Trigger로 프로필 자동 생성
     → 기존 사용자: 세션 갱신
     → Dashboard 리다이렉트
```

#### 비밀번호 재설정 플로우 (FR-003)

```
User → ForgotPasswordForm → supabase.auth.resetPasswordForEmail()
     → Resend API로 이메일 발송 (1시간 유효 토큰)
     → User: 이메일 링크 클릭
     → /auth/reset-password?code=xxx
     → ResetPasswordForm → supabase.auth.updateUser()
     → 로그인 페이지 리다이렉트
```

#### 계정 삭제 플로우 (FR-007)

```
User → Settings/Account → "Delete Account" 클릭
     → 소유 팀 확인 (SELECT COUNT(*) FROM teams WHERE owner_id = ?)
     → 소유 팀 있음: 삭제 차단, 안내 메시지
     → 소유 팀 없음: 비밀번호 재확인 모달
     → 확인 후 Soft Delete (profiles.deleted_at = NOW())
     → 세션 종료 → 로그인 페이지 리다이렉트
```

## Non-Functional Requirements

### Performance

| 지표 | 목표 | 근거 |
|------|------|------|
| **페이지 로드 시간** | 3초 이내 | PRD NFR 명시 |
| **API 응답 시간** | 500ms 이내 | PRD NFR 명시 (일반 CRUD) |
| **로그인/회원가입 응답** | 1초 이내 | Supabase Auth 표준 성능 |
| **프로필 이미지 업로드** | 5초 이내 (5MB 기준) | Supabase Storage 성능 |

**최적화 전략:**
- Next.js 서버 컴포넌트 활용으로 초기 로드 최소화
- shadcn/ui 컴포넌트 코드 스플리팅
- 이미지 최적화: Next.js Image 컴포넌트 + Supabase Storage 변환

### Security

| 항목 | 구현 | 근거 |
|------|------|------|
| **비밀번호 해싱** | bcrypt (Supabase Auth 내장) | PRD 보안 요구사항 |
| **JWT 토큰** | 24시간 만료, HttpOnly 쿠키 | PRD 명시 |
| **비밀번호 재설정 토큰** | 1시간 만료 | PRD 명시 |
| **HTTPS** | Firebase App Hosting 자동 적용 | PRD 필수 요구사항 |
| **CSRF 보호** | SameSite 쿠키 속성 | 표준 보안 관행 |
| **XSS 방지** | React 자동 이스케이프 + CSP 헤더 | 표준 보안 관행 |

**Supabase RLS 정책 (FR-070):**
```sql
-- 사용자는 자신의 프로필만 조회/수정 가능
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id AND deleted_at IS NULL);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### Reliability/Availability

| 항목 | 전략 |
|------|------|
| **세션 복구** | Supabase Auth 자동 세션 갱신 (middleware.ts) |
| **오프라인 처리** | 로그인 필요 안내 메시지 표시 |
| **에러 복구** | 폼 입력 값 유지, 재시도 버튼 제공 |
| **서비스 가용성** | Firebase App Hosting SLA (99.95%) + Supabase Cloud |

**Soft Delete 복구 (FR-071):**
- 삭제된 계정은 30일간 데이터 보존
- 복구 요청 시 deleted_at = NULL로 복원 가능 (관리자 기능, MVP 범위 외)

### Observability

| 항목 | 구현 |
|------|------|
| **클라이언트 에러** | console.error + Toast 표시 |
| **서버 에러** | Next.js 에러 로깅 (Vercel/Firebase 로그) |
| **인증 이벤트** | Supabase Auth 이벤트 로그 |
| **성능 모니터링** | Firebase Performance (선택적) |

**로깅 정책:**
```typescript
// ⚠️ 민감 정보 로깅 금지 (PRD 명시)
// ❌ logger.info('Login attempt', { email, password })
// ✅ logger.info('Login attempt', { email, success: true })
```

## Dependencies and Integrations

### NPM Dependencies

| 패키지 | 버전 | 용도 | Epic 1 사용 |
|--------|------|------|-------------|
| `next` | ^15.x | React 프레임워크 | 전체 앱 기반 |
| `react` | ^19.x | UI 라이브러리 | 전체 컴포넌트 |
| `@supabase/supabase-js` | ^2.x | Supabase 클라이언트 | 인증, DB, 스토리지 |
| `@supabase/ssr` | ^0.x | SSR용 Supabase 헬퍼 | 서버 컴포넌트 인증 |
| `tailwindcss` | ^3.x | CSS 프레임워크 | 스타일링 |
| `zod` | ^3.x | 스키마 유효성 검증 | 폼 유효성 검사 |
| `react-hook-form` | ^7.x | 폼 상태 관리 | 회원가입/로그인 폼 |
| `@hookform/resolvers` | ^3.x | Zod + RHF 연동 | 폼 유효성 검사 |
| `resend` | ^2.x | 이메일 발송 | 비밀번호 재설정 이메일 |
| `lucide-react` | ^0.x | 아이콘 라이브러리 | UI 아이콘 |

### shadcn/ui 컴포넌트 (Epic 1 필요)

```bash
npx shadcn-ui@latest add button input label card form toast avatar
npx shadcn-ui@latest add dialog sheet dropdown-menu separator
```

### 외부 서비스 연동

| 서비스 | 용도 | 환경변수 |
|--------|------|----------|
| **Supabase** | 인증, DB, 스토리지 | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Google OAuth** | 소셜 로그인 | Supabase 대시보드에서 설정 |
| **Resend** | 이메일 발송 | `RESEND_API_KEY` |
| **Firebase App Hosting** | 배포 | Firebase CLI 인증 |

### Supabase MCP 통합 (개발 도구)

프로젝트에 **Supabase MCP (Model Context Protocol)** 서버가 설치되어 있어 Claude Code에서 직접 Supabase 작업을 수행할 수 있습니다.

#### 사용 가능한 MCP 기능

| 기능 | 설명 | 사용 예시 |
|------|------|----------|
| **마이그레이션 실행** | SQL 마이그레이션 직접 적용 | 테이블 생성, RLS 정책 적용 |
| **스키마 조회** | 현재 DB 스키마 확인 | 테이블 구조, 컬럼 타입 검증 |
| **데이터 조회** | SELECT 쿼리 실행 | 테스트 데이터 확인 |
| **데이터 조작** | INSERT/UPDATE/DELETE 실행 | 시드 데이터 생성 |
| **RLS 테스트** | 정책 검증 쿼리 | 권한 테스트 |

#### 개발 워크플로우 가속화

Supabase MCP를 통해 다음 작업을 CLI 없이 직접 수행할 수 있습니다:

1. **스키마 마이그레이션**: 15개 테이블 DDL 직접 실행
2. **RLS 정책 적용**: 팀 멤버십 기반 정책 SQL 실행
3. **트리거/함수 생성**: `handle_new_user()` 등 PL/pgSQL 함수 적용
4. **시드 데이터 삽입**: 테스트용 사용자/팀 데이터 생성
5. **실시간 디버깅**: 쿼리 결과 즉시 확인

#### MCP 활용 시 주의사항

- **프로덕션 주의**: MCP는 연결된 Supabase 인스턴스에 직접 영향을 줍니다
- **트랜잭션 관리**: 복잡한 마이그레이션은 트랜잭션 블록으로 감싸기 권장
- **RLS 우회**: `service_role` 키 사용 시 RLS가 우회되므로 주의 필요
- **버전 관리**: MCP로 실행한 마이그레이션도 `supabase/migrations/` 폴더에 SQL 파일로 저장하여 Git 추적

```sql
-- MCP로 실행하는 마이그레이션 예시
BEGIN;
  CREATE TABLE public.profiles (...);
  CREATE POLICY "Users can view own profile" ON public.profiles ...;
COMMIT;
```

### 환경변수 설정

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
RESEND_API_KEY=re_xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Acceptance Criteria (Authoritative)

### AC-1: 프로젝트 초기화 (Story 1.1)
1. `npm run dev` 실행 시 에러 없이 로컬 서버 시작
2. Supabase 대시보드에서 15개 테이블 확인 가능
3. RLS 정책이 활성화되어 팀 멤버십 검증 동작
4. `deleted_at` 컬럼이 있는 테이블에 Soft Delete 정책 적용
5. Firebase App Hosting URL로 접속 시 앱 로딩 확인
6. `git push` 시 자동 배포 트리거 확인

### AC-2: 공통 레이아웃 (Story 1.2)
1. `/` 접속 시 Sidebar + 메인 영역 레이아웃 표시
2. 다크모드 Sidebar 스타일 적용 (240px, Linear 테마)
3. 모든 공통 UI 컴포넌트 렌더링 확인

### AC-3: 회원가입 (FR-001)
1. 유효한 이메일/비밀번호/이름으로 회원가입 성공
2. 회원가입 후 자동 로그인 및 대시보드 리다이렉트
3. 중복 이메일 시 "이미 사용 중인 이메일입니다" 에러 표시
4. 비밀번호 6자 미만 시 유효성 에러 표시

### AC-4: 로그인/로그아웃 (FR-002)
1. 올바른 자격 증명으로 로그인 성공
2. 로그인 실패 시 "이메일 또는 비밀번호가 올바르지 않습니다" 에러 표시
3. 로그아웃 시 `/auth/login`으로 리다이렉트
4. 미인증 사용자가 보호된 페이지 접근 시 로그인 페이지로 리다이렉트
5. JWT 토큰 24시간 후 만료 및 재로그인 요구

### AC-5: 비밀번호 재설정 (FR-003)
1. 이메일 입력 후 재설정 링크 발송 확인
2. 이메일 내 링크 클릭 시 비밀번호 재설정 페이지로 이동
3. 새 비밀번호 입력 후 변경 성공
4. 1시간 후 토큰 만료 시 에러 표시

### AC-6: Google OAuth (FR-004)
1. "Continue with Google" 버튼 클릭 시 Google 로그인 팝업 표시
2. Google 로그인 성공 시 대시보드로 리다이렉트
3. 신규 Google 사용자의 이름/이메일 자동 설정

### AC-7: 프로필 관리 (FR-005)
1. 프로필 사진 업로드 및 미리보기 동작
2. 이름 수정 후 저장 성공
3. 이메일은 읽기 전용으로 표시

### AC-8: 비밀번호 변경 (FR-006)
1. 현재 비밀번호 검증 후 새 비밀번호로 변경 성공
2. 현재 비밀번호 불일치 시 에러 표시
3. Google OAuth 사용자는 비밀번호 변경 섹션 비활성화

### AC-9: 계정 삭제 (FR-007)
1. 소유한 팀이 있는 경우 삭제 버튼 비활성화 및 안내 메시지
2. 비밀번호 + "DELETE" 입력 완료 시에만 삭제 버튼 활성화
3. 삭제 후 해당 이메일로 재로그인 불가 (Soft Delete)

### AC-10: 팀 멤버십 검증 (FR-070)
1. 다른 사용자의 프로필 데이터 접근 시 404 반환
2. RLS 정책에 의해 자신의 데이터만 조회 가능

### AC-11: Soft Delete (FR-071)
1. 삭제 시 `deleted_at` 타임스탬프 기록
2. 조회 시 `deleted_at`이 NULL인 항목만 반환

## Traceability Mapping

| AC # | FR | Spec Section | Component/API | Test Idea |
|------|-----|--------------|---------------|-----------|
| AC-1 | FR-070, FR-071 | Detailed Design > Data Models | DB 스키마, RLS 정책 | 마이그레이션 성공, RLS 테스트 |
| AC-2 | - | Detailed Design > Services | AppShell, Sidebar, Header | 컴포넌트 렌더링 테스트 |
| AC-3 | FR-001 | Workflows > 회원가입 | SignUpForm, signUp() | 회원가입 E2E 테스트 |
| AC-4 | FR-002 | Workflows > 로그인 | LoginForm, signInWithPassword() | 로그인/로그아웃 E2E 테스트 |
| AC-5 | FR-003 | Workflows > 비밀번호 재설정 | ForgotPasswordForm, Resend | 이메일 발송 확인 |
| AC-6 | FR-004 | Workflows > Google OAuth | signInWithOAuth() | OAuth 플로우 테스트 |
| AC-7 | FR-005 | APIs > 프로필 업데이트 | ProfileSettings, Storage | 이미지 업로드 테스트 |
| AC-8 | FR-006 | APIs > 비밀번호 변경 | PasswordChangeForm, updateUser() | 비밀번호 변경 테스트 |
| AC-9 | FR-007 | Workflows > 계정 삭제 | AccountDeleteModal | Soft Delete 테스트 |
| AC-10 | FR-070 | Security > RLS 정책 | Supabase RLS | 권한 테스트 |
| AC-11 | FR-071 | Data Models > Soft Delete | profiles.deleted_at | 삭제된 데이터 필터링 테스트 |

## Risks, Assumptions, Open Questions

### Risks

| ID | 유형 | 설명 | 영향도 | 완화 전략 |
|----|------|------|--------|----------|
| R-1 | Risk | Supabase 서비스 장애 시 인증 불가 | 높음 | Supabase 상태 페이지 모니터링, 사용자에게 장애 안내 |
| R-2 | Risk | Google OAuth 설정 오류로 로그인 실패 | 중간 | Supabase 대시보드에서 설정 검증, 테스트 계정으로 사전 검증 |
| R-3 | Risk | Resend 이메일 발송 실패 (스팸 필터 등) | 중간 | 발송 실패 로깅, 재시도 로직 구현 |
| R-4 | Risk | Firebase App Hosting 빌드 실패 | 중간 | 로컬 빌드 테스트 후 푸시, 빌드 로그 모니터링 |
| R-5 | Risk | RLS 정책 누락으로 데이터 노출 | 높음 | 모든 테이블에 RLS 정책 필수 적용, 보안 테스트 |

### Assumptions

| ID | 유형 | 설명 | 검증 방법 |
|----|------|------|----------|
| A-1 | Assumption | 사용자는 Supabase/Firebase 계정을 보유하고 있음 | 사용자에게 사전 확인 |
| A-2 | Assumption | Google Cloud Console 프로젝트가 준비되어 있음 | OAuth 설정 시 확인 |
| A-3 | Assumption | Resend 계정 및 도메인 인증이 완료됨 | API 키 테스트 |
| A-4 | Assumption | Next.js 15와 Supabase SSR 패키지가 호환됨 | 개발 초기 테스트 |
| A-5 | Assumption | 8시간 해커톤 시간 내 Epic 1 완료 가능 | 스토리별 시간 추정 |

### Open Questions

| ID | 유형 | 질문 | 답변/해결 |
|----|------|------|----------|
| Q-1 | Question | 이메일 인증(Email Verification) 필요 여부? | MVP에서는 제외 (PRD 미명시) |
| Q-2 | Question | 비밀번호 정책 강화 (특수문자 필수 등)? | MVP에서는 6자 이상만 검증 |
| Q-3 | Question | 세션 동시 접속 제한 필요? | MVP에서는 제외 |
| Q-4 | Question | 프로필 이미지 최대 용량? | 5MB 제한 권장 (Supabase Storage 기본) |

## Test Strategy Summary

### 테스트 레벨

| 레벨 | 도구 | 범위 | 담당 |
|------|------|------|------|
| **Unit** | Vitest + React Testing Library | Zod 스키마, 유틸 함수 | 개발자 |
| **Integration** | Vitest + MSW | Supabase API 모킹, 폼 제출 | 개발자 |
| **E2E** | Chrome DevTools MCP | 전체 인증 플로우 | 개발자 + SM |

### AC별 테스트 커버리지

| AC | 테스트 유형 | 테스트 시나리오 |
|----|------------|----------------|
| AC-3 (회원가입) | E2E | 유효한 데이터로 회원가입 → 자동 로그인 → 대시보드 리다이렉트 |
| AC-3 (회원가입) | E2E | 중복 이메일 → 에러 메시지 표시 |
| AC-4 (로그인) | E2E | 유효한 자격 증명 → 대시보드 리다이렉트 |
| AC-4 (로그인) | E2E | 잘못된 자격 증명 → 에러 메시지 표시 |
| AC-5 (비밀번호 재설정) | Integration | 이메일 발송 API 호출 확인 |
| AC-6 (Google OAuth) | E2E | OAuth 플로우 시뮬레이션 (수동 테스트) |
| AC-7 (프로필) | E2E | 이미지 업로드 → 미리보기 → 저장 |
| AC-8 (비밀번호 변경) | E2E | 현재 비밀번호 검증 → 변경 성공 |
| AC-9 (계정 삭제) | E2E | Soft Delete 후 재로그인 불가 |
| AC-10 (RLS) | Integration | 다른 사용자 데이터 접근 시 에러 |
| AC-11 (Soft Delete) | Integration | 삭제된 레코드 쿼리 결과에서 제외 |

### 엣지 케이스

| 시나리오 | 기대 결과 |
|----------|----------|
| 이메일에 특수문자 포함 (test+1@example.com) | 정상 처리 |
| 비밀번호 100자 초과 | 유효성 에러 |
| 동시에 두 탭에서 로그아웃 | 세션 정리, 두 탭 모두 로그인 페이지로 |
| 비밀번호 재설정 링크 2회 사용 | 첫 번째만 성공, 두 번째는 에러 |
| 프로필 이미지 5MB 초과 | 업로드 에러 표시 |
| 소유 팀이 있는 상태에서 계정 삭제 시도 | 삭제 차단, 안내 메시지 |

---

_Generated by BMAD Method Epic Tech Context Workflow_
_Date: 2025-11-29_
_Epic: 1 - Foundation & 인증_
