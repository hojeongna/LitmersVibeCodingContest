# Story 1.5: 프로필 & 비밀번호 관리

Status: done

## Story

As a **인증된 사용자**,
I want **내 프로필 사진과 이름을 수정하고, 비밀번호를 변경하거나 분실 시 재설정**,
so that **개인 정보를 최신 상태로 유지하고 계정 보안을 관리할 수 있다**.

## Acceptance Criteria

| AC # | 설명 | FR | 검증 방법 |
|------|------|-----|----------|
| AC-1 | 프로필 설정 페이지(`/settings/profile`)에서 프로필 사진 업로드 가능 | FR-005 | 이미지 선택 후 미리보기 및 저장 확인 |
| AC-2 | 프로필 사진 업로드 시 Supabase Storage에 저장되고 URL이 profiles 테이블에 반영 | FR-005 | DB에서 avatar_url 업데이트 확인 |
| AC-3 | 이름 수정 후 저장 버튼 클릭 시 profiles 테이블 업데이트 | FR-005 | DB에서 name 필드 변경 확인 |
| AC-4 | 이메일은 읽기 전용으로 표시되며 수정 불가 | FR-005 | 이메일 필드 disabled 상태 확인 |
| AC-5 | 비밀번호 찾기 페이지(`/auth/forgot-password`)에서 이메일 입력 시 재설정 링크 발송 | FR-003 | 이메일 수신 확인 |
| AC-6 | 비밀번호 재설정 링크 클릭 시 `/auth/reset-password` 페이지로 이동 | FR-003 | 페이지 이동 및 새 비밀번호 입력 폼 표시 |
| AC-7 | 새 비밀번호 입력 후 변경 성공 시 로그인 페이지로 리다이렉트 | FR-003 | 새 비밀번호로 로그인 가능 확인 |
| AC-8 | 재설정 링크 1시간 후 만료 시 에러 메시지 표시 | FR-003 | 만료된 링크 접근 시 에러 확인 |
| AC-9 | 프로필 설정 내 비밀번호 변경 섹션에서 현재 비밀번호 검증 후 새 비밀번호 설정 | FR-006 | 현재 비밀번호 틀리면 에러, 맞으면 변경 성공 |
| AC-10 | 비밀번호 변경 시 비밀번호 강도 표시기 동작 | FR-006 | 6자 미만 약함, 6자 이상 중간, 특수문자 포함 강함 |
| AC-11 | Google OAuth 사용자는 비밀번호 변경 섹션 비활성화 | FR-006 | OAuth 사용자 접근 시 안내 메시지 표시 |
| AC-12 | 프로필 이미지 용량 5MB 초과 시 에러 메시지 표시 | FR-005 | 대용량 파일 업로드 시도 시 에러 확인 |

## Tasks / Subtasks

### Part A: 프로필 설정 페이지 구현

- [x] Task 1: 프로필 설정 페이지 레이아웃 구현 (AC: 1, 4)
  - [x] 1.1 `app/(dashboard)/settings/profile/page.tsx` 생성
  - [x] 1.2 프로필 사진 업로드 섹션 UI 구현 (아바타 원형, "Upload Photo" 버튼)
  - [x] 1.3 개인 정보 섹션 UI (이름 입력, 이메일 읽기 전용)
  - [x] 1.4 저장/취소 버튼 그룹
  - [x] 1.5 UX 시각 자료 참조하여 카드 기반 섹션 레이아웃

- [x] Task 2: 프로필 사진 업로드 기능 (AC: 1, 2, 12)
  - [x] 2.1 파일 input 컴포넌트 (`type="file"`, `accept="image/*"`)
  - [x] 2.2 파일 선택 시 미리보기 표시 (`URL.createObjectURL`)
  - [x] 2.3 5MB 용량 제한 검증 (클라이언트)
  - [x] 2.4 Firebase Storage 업로드 (`avatars` 버킷)
  - [x] 2.5 업로드 성공 시 `profiles.avatar_url` 업데이트
  - [x] 2.6 기존 이미지 있으면 교체 (덮어쓰기 또는 삭제 후 업로드)
  - [x] 2.7 업로드 중 로딩 상태 표시

- [x] Task 3: 프로필 정보 수정 기능 (AC: 3, 4)
  - [x] 3.1 이름 수정 폼 (`react-hook-form` + `zod` 검증)
  - [x] 3.2 Firebase Auth + Supabase profiles 테이블 업데이트
  - [x] 3.3 성공 시 Toast 표시 ("프로필이 저장되었습니다")
  - [x] 3.4 에러 시 Toast 표시 (에러 메시지)
  - [x] 3.5 취소 버튼 클릭 시 원래 값으로 복원

### Part B: 비밀번호 찾기 (재설정 요청)

- [x] Task 4: 비밀번호 찾기 페이지 구현 (AC: 5)
  - [x] 4.1 `app/(auth)/forgot-password/page.tsx` 생성
  - [x] 4.2 이메일 입력 폼 UI
  - [x] 4.3 "Send Reset Link" 버튼
  - [x] 4.4 성공 메시지 UI ("이메일을 확인해주세요")
  - [x] 4.5 로그인 페이지 링크

- [x] Task 5: 비밀번호 재설정 이메일 발송 (AC: 5, 8)
  - [x] 5.1 Firebase Auth `sendPasswordResetEmail()` 호출
  - [x] 5.2 `redirectTo` 옵션으로 `/auth/reset-password` 지정
  - [x] 5.3 이메일 발송 중 로딩 상태
  - [x] 5.4 성공/실패 메시지 표시
  - [x] 5.5 토큰 유효기간 1시간 (Firebase 기본값)

### Part C: 비밀번호 재설정 (새 비밀번호 입력)

- [x] Task 6: 비밀번호 재설정 페이지 구현 (AC: 6, 7, 8, 10)
  - [x] 6.1 `app/(auth)/reset-password/page.tsx` 생성
  - [x] 6.2 새 비밀번호 입력 폼 (비밀번호, 비밀번호 확인)
  - [x] 6.3 비밀번호 강도 표시기 UI
  - [x] 6.4 비밀번호 일치 여부 실시간 검증
  - [x] 6.5 Firebase Auth `updatePassword()` 호출
  - [x] 6.6 성공 시 로그인 페이지로 리다이렉트 + 성공 메시지
  - [x] 6.7 토큰 만료 에러 처리 ("링크가 만료되었습니다. 다시 요청해주세요")

### Part D: 비밀번호 변경 (로그인 상태)

- [x] Task 7: 비밀번호 변경 섹션 구현 (AC: 9, 10, 11)
  - [x] 7.1 프로필 설정 페이지 내 "Security" 섹션 추가
  - [x] 7.2 "Change Password" 버튼 → 모달 열기
  - [x] 7.3 비밀번호 변경 모달 UI:
    - 현재 비밀번호 입력
    - 새 비밀번호 입력
    - 새 비밀번호 확인
    - 비밀번호 강도 표시기
  - [x] 7.4 현재 비밀번호 검증 (재인증)
  - [x] 7.5 Firebase Auth `updatePassword()` 호출
  - [x] 7.6 성공/실패 Toast 표시

- [x] Task 8: OAuth 사용자 비밀번호 변경 차단 (AC: 11)
  - [x] 8.1 현재 사용자의 인증 방식 확인 (`user.providerData[0].providerId`)
  - [x] 8.2 Google OAuth 사용자인 경우 비밀번호 변경 버튼 비활성화
  - [x] 8.3 안내 메시지 표시 ("Google 계정으로 로그인하여 비밀번호 변경이 불가합니다")

### Part E: 유틸리티 및 공통 기능

- [x] Task 9: 비밀번호 강도 측정 유틸리티 (AC: 10)
  - [x] 9.1 `lib/utils/password-strength.ts` 생성
  - [x] 9.2 강도 레벨: weak (6자 미만), medium (6자 이상), strong (특수문자+숫자 포함)
  - [x] 9.3 PasswordStrengthIndicator 컴포넌트 (3단계 바 + 텍스트)

- [x] Task 10: Firebase Storage 설정 (AC: 2)
  - [x] 10.1 `avatars` 버킷 생성 (Firebase Storage)
  - [x] 10.2 업로드 API 구현: 본인만 업로드 가능
  - [x] 10.3 읽기 정책: 공개

### Part F: 테스트 및 검증

- [x] Task 11: 기능 검증 (AC: 1-12)
  - [x] 11.1 프로필 사진 업로드 기능 (5MB 제한 포함)
  - [x] 11.2 이름 수정 기능
  - [x] 11.3 비밀번호 찾기 → 재설정 플로우
  - [x] 11.4 비밀번호 변경 기능 (현재 비밀번호 검증)
  - [x] 11.5 OAuth 사용자 비밀번호 변경 차단

## Dev Notes

### UX 시각 자료 (필수 참조)

> **IMPORTANT**: 아래 HTML 파일들은 개발 전 반드시 브라우저에서 열어 확인하세요. 프로필 설정 화면과 비밀번호 관련 UI를 확인할 수 있습니다.

| 파일 | 설명 | 확인 내용 |
|------|------|----------|
| **[docs/ux-design-specification.md](../ux-design-specification.md)** | 전체 UX 사양서 | 프로필 설정 레이아웃, 폼 스타일 |
| **[docs/ux-design-directions.html](../ux-design-directions.html)** | 인터랙티브 UI 목업 | **Profile** 탭에서 프로필 설정 레이아웃, 비밀번호 변경 모달 확인 |
| **[docs/ux-color-themes.html](../ux-color-themes.html)** | 색상 테마 시각화 | 폼 입력 스타일, 버튼 스타일, 에러 상태 |

### Linear Productivity 테마 색상 (ux-color-themes.html 참조)

| 용도 | 색상 | HEX |
|------|------|-----|
| Primary | Indigo | #5B5FC7 |
| Accent | Blue | #3B82F6 |
| Text Primary | Zinc 900 | #18181B |
| Text Secondary | Zinc 500 | #71717A |
| Background | Zinc 50 | #FAFAFA |
| Surface | White | #FFFFFF |
| Border | Zinc 200 | #E4E4E7 |
| Error | Red | #EF4444 |
| Success | Green | #22C55E |
| Warning | Amber | #F59E0B |

### 아키텍처 패턴

#### 프로필 이미지 업로드 흐름

```
1. 사용자가 파일 선택
2. 클라이언트에서 5MB 검증
3. 미리보기 표시 (URL.createObjectURL)
4. "Save Changes" 클릭
5. Supabase Storage에 업로드 (avatars/{userId})
6. 업로드 URL 받기
7. profiles.avatar_url UPDATE
8. 성공 Toast 표시
```

[Source: docs/architecture.md#Integration-Points]

#### 비밀번호 재설정 흐름

```
1. /auth/forgot-password 에서 이메일 입력
2. supabase.auth.resetPasswordForEmail() 호출
3. 이메일로 재설정 링크 발송 (1시간 유효)
4. 사용자가 링크 클릭
5. /auth/reset-password?code=xxx 로 이동
6. 새 비밀번호 입력
7. supabase.auth.updateUser({ password }) 호출
8. 로그인 페이지로 리다이렉트
```

[Source: docs/sprint-artifacts/tech-spec-epic-1.md#Workflows-and-Sequencing]

### Supabase API 사용법

#### 프로필 업데이트

```typescript
// 프로필 이미지 업로드
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file, {
    cacheControl: '3600',
    upsert: true
  });

// 공개 URL 가져오기
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.png`);

// 프로필 테이블 업데이트
const { error } = await supabase
  .from('profiles')
  .update({ name, avatar_url: publicUrl })
  .eq('id', userId);
```

[Source: docs/sprint-artifacts/tech-spec-epic-1.md#APIs-and-Interfaces]

#### 비밀번호 재설정

```typescript
// 비밀번호 재설정 이메일 발송
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/auth/reset-password`,
});

// 새 비밀번호로 변경 (reset-password 페이지에서)
const { error } = await supabase.auth.updateUser({
  password: newPassword
});
```

[Source: docs/sprint-artifacts/tech-spec-epic-1.md#APIs-and-Interfaces]

#### 비밀번호 변경 (로그인 상태)

```typescript
// 현재 비밀번호 재인증 (검증)
const { error: signInError } = await supabase.auth.signInWithPassword({
  email: user.email,
  password: currentPassword
});

if (signInError) {
  // 현재 비밀번호 틀림
  throw new Error('현재 비밀번호가 올바르지 않습니다');
}

// 새 비밀번호로 변경
const { error: updateError } = await supabase.auth.updateUser({
  password: newPassword
});
```

### Zod 스키마 참조

```typescript
// lib/validations/auth.ts
import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요').max(50, '이름은 50자 이내로 입력하세요'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다').max(100),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
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

[Source: docs/sprint-artifacts/tech-spec-epic-1.md#Data-Models-and-Contracts]

### 비밀번호 강도 측정 로직

```typescript
// lib/utils/password-strength.ts
export type PasswordStrength = 'weak' | 'medium' | 'strong';

export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < 6) return 'weak';

  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);

  const score = [hasNumber, hasSpecial, hasUpperCase, hasLowerCase].filter(Boolean).length;

  if (score >= 3 && password.length >= 8) return 'strong';
  if (password.length >= 6) return 'medium';
  return 'weak';
}

export const strengthLabels: Record<PasswordStrength, string> = {
  weak: '약함',
  medium: '보통',
  strong: '강함',
};

export const strengthColors: Record<PasswordStrength, string> = {
  weak: '#EF4444',    // Red
  medium: '#F59E0B',  // Amber
  strong: '#22C55E',  // Green
};
```

### UI 레이아웃 참조 (ux-design-directions.html Profile 탭)

#### 프로필 설정 페이지 레이아웃

```
+--------------------------------------+
| Profile Settings                     |
+--------------------------------------+
| +----------------------------------+ |
| | Profile Photo                    | |
| | +--------+  [Upload Photo]       | |
| | | Avatar |  JPG, PNG up to 5MB   | |
| | +--------+                       | |
| +----------------------------------+ |
| +----------------------------------+ |
| | Personal Information             | |
| | Name *                           | |
| | [_______________]                | |
| | Email (읽기 전용)                 | |
| | [_______________] 🔒             | |
| | [Cancel] [Save Changes]          | |
| +----------------------------------+ |
| +----------------------------------+ |
| | Security                         | |
| | Password                         | |
| | Last changed 30 days ago         | |
| | [Change Password]                | |
| +----------------------------------+ |
+--------------------------------------+
```

[Source: docs/ux-design-directions.html#profile-screen]

#### 비밀번호 변경 모달 레이아웃

```
+----------------------------------+
| Change Password              [X] |
+----------------------------------+
| Current Password *               |
| [____________________________]   |
|                                  |
| New Password *                   |
| [____________________________]   |
| [===---] Strength: Medium        |
|                                  |
| Confirm New Password *           |
| [____________________________]   |
|                                  |
| [Cancel]     [Update Password]   |
+----------------------------------+
```

[Source: docs/ux-design-directions.html#password-modal]

### Project Structure Notes

파일 생성/수정 경로:
```
app/
├── (auth)/
│   ├── forgot-password/
│   │   └── page.tsx              # 새로 생성
│   └── reset-password/
│       └── page.tsx              # 새로 생성
├── (dashboard)/
│   └── settings/
│       └── profile/
│           └── page.tsx          # 새로 생성

components/
├── settings/
│   ├── profile-photo-upload.tsx  # 새로 생성
│   ├── profile-form.tsx          # 새로 생성
│   └── change-password-modal.tsx # 새로 생성
└── ui/
    └── password-strength.tsx     # 새로 생성

lib/
├── utils/
│   └── password-strength.ts      # 새로 생성
└── validations/
    └── auth.ts                   # 수정 (스키마 추가)
```

[Source: docs/architecture.md#Project-Structure]

### Supabase Storage 설정

```sql
-- 1. avatars 버킷 생성 (Supabase Dashboard 또는 SQL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- 2. 업로드 정책: 본인만 업로드 가능
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. 업데이트 정책: 본인만 덮어쓰기 가능
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. 삭제 정책: 본인만 삭제 가능
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. 읽기 정책: 공개 (버킷이 public이므로 별도 정책 불필요)
```

[Source: docs/architecture.md#Row-Level-Security-RLS]

### References

- [Source: docs/prd.md#FR-003] - 비밀번호 찾기/재설정 요구사항
- [Source: docs/prd.md#FR-005] - 프로필 관리 요구사항
- [Source: docs/prd.md#FR-006] - 비밀번호 변경 요구사항
- [Source: docs/architecture.md#Integration-Points] - Supabase Storage 연동
- [Source: docs/ux-design-specification.md] - 전체 UX 사양
- [Source: docs/ux-design-directions.html] - 인터랙티브 UI 목업 (Profile 탭)
- [Source: docs/ux-color-themes.html] - 색상 테마 시각화
- [Source: docs/epics.md#Story-1.5] - 스토리 상세 설명
- [Source: docs/sprint-artifacts/tech-spec-epic-1.md] - Epic 1 기술 사양

### Learnings from Previous Story

**From Story 1-4-google-oauth (Status: drafted)**

이전 스토리는 아직 `drafted` 상태로 구현이 시작되지 않았습니다.

**의존성 참고:**
- Story 1.1에서 Next.js 프로젝트, Supabase 연동, DB 스키마 완료되어야 함
- Story 1.2에서 공통 UI 컴포넌트 (Button, Input, Card, Modal, Toast) 구현되어야 함
- Story 1.3에서 인증 기본 구조 (로그인/회원가입) 구현되어야 함
- Story 1.4에서 OAuth 콜백 처리 구현되어야 함

**확인 필요 사항:**
- `profiles` 테이블에 `avatar_url` 컬럼이 존재하는지
- Supabase Storage에 `avatars` 버킷이 설정되어 있는지
- 기존 인증 컨텍스트에서 사용자 정보 접근 가능한지
- Toast 컴포넌트가 구현되어 있는지

**재사용할 컴포넌트 (이전 스토리에서 생성):**
- 대시보드 레이아웃 (`app/(dashboard)/layout.tsx`)
- 인증 레이아웃 (`app/(auth)/layout.tsx`)
- Button, Input, Card, Modal 컴포넌트
- Toast 알림 컴포넌트
- 폼 검증 스키마 패턴 (`lib/validations/auth.ts`)

[Source: docs/sprint-artifacts/1-4-google-oauth.md]

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/1-5-profile-password-management.md`

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- 프로필 설정 페이지 레이아웃 구현 완료
- 프로필 사진 업로드 기능 (5MB 제한) 구현
- 비밀번호 찾기/재설정 페이지 구현 완료
- 비밀번호 변경 모달 구현 및 연결
- OAuth 사용자 비밀번호 변경 차단 구현

### Completion Notes List

- 프로필 설정 페이지 (`app/(dashboard)/settings/profile/page.tsx`) - 이미 구현됨
- 비밀번호 찾기 페이지 (`app/(auth)/forgot-password/page.tsx`) - 이미 구현됨
- 비밀번호 재설정 페이지 (`app/(auth)/reset-password/page.tsx`) - 이미 구현됨
- 비밀번호 강도 측정 유틸리티 (`lib/utils/password-strength.ts`) - 이미 구현됨
- PasswordStrengthIndicator 컴포넌트 (`components/ui/password-strength.tsx`) - 이미 구현됨
- **새로 구현:** 비밀번호 변경 모달 (`components/settings/change-password-modal.tsx`)
- Firebase Auth 기반 인증 시스템 연동 완료

### File List

**NEW:**
- `components/settings/change-password-modal.tsx` - 비밀번호 변경 모달 컴포넌트

**MODIFIED:**
- `app/(dashboard)/settings/profile/page.tsx` - 비밀번호 변경 모달 연결

**EXISTING (이전 구현):**
- `app/(auth)/forgot-password/page.tsx`
- `app/(auth)/reset-password/page.tsx`
- `components/auth/forgot-password-form.tsx`
- `components/auth/reset-password-form.tsx`
- `lib/utils/password-strength.ts`
- `components/ui/password-strength.tsx`
- `lib/validations/auth.ts`

## Change Log

| 날짜 | 변경 내용 | 작성자 |
|------|----------|--------|
| 2025-11-29 | 스토리 초안 작성 | SM (create-story workflow) |
| 2025-11-29 | UX 시각 자료 필수 참조 섹션 추가 (ux-design-specification.md, ux-design-directions.html, ux-color-themes.html) | SM |
| 2025-11-29 | 비밀번호 변경 모달 구현 및 스토리 완료 | Dev Agent (Claude Opus 4.5) |
