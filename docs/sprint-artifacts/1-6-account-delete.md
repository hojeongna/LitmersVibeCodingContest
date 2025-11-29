# Story 1.6: 계정 삭제 (Account Deletion)

Status: done

## Story

As a **인증된 사용자**,
I want **내 계정과 관련 데이터를 영구적으로 삭제**,
so that **더 이상 서비스를 사용하지 않을 때 개인정보를 완전히 제거할 수 있다**.

## Acceptance Criteria

| AC # | 설명 | FR | 검증 방법 |
|------|------|-----|----------|
| AC-1 | 프로필 설정 페이지 Security 섹션에 "Delete Account" 버튼 표시 (위험 영역으로 시각적 구분) | FR-007 | 빨간 배경/테두리로 Danger Zone 스타일 확인 |
| AC-2 | "Delete Account" 버튼 클릭 시 삭제 확인 모달 표시 | FR-007 | 모달 오픈 확인 |
| AC-3 | 삭제 확인 모달에서 삭제될 항목 목록 명확히 표시 (프로필, 댓글, 활동 히스토리, 팀 멤버십) | FR-007 | 목록 항목 표시 확인 |
| AC-4 | 사용자가 소유한 팀이 있으면 경고 메시지 표시 ("팀 소유권을 이전하거나 팀을 삭제해야 합니다") | FR-007 | 팀 Owner인 경우 경고 표시 확인 |
| AC-5 | 비밀번호 입력 필드로 본인 확인 필수 (OAuth 사용자는 "DELETE" 텍스트 입력) | FR-007 | 인증 방식에 따른 확인 방법 분기 확인 |
| AC-6 | "DELETE" 텍스트를 정확히 입력해야 삭제 버튼 활성화 | FR-007 | 텍스트 일치 시에만 버튼 활성화 확인 |
| AC-7 | 팀 Owner인 경우 삭제 버튼 비활성화 및 안내 메시지 표시 | FR-007 | Owner 상태에서 버튼 disabled 확인 |
| AC-8 | 삭제 실행 시 Supabase Auth에서 사용자 삭제 | FR-007 | Supabase Auth에서 사용자 제거 확인 |
| AC-9 | 삭제 실행 시 profiles 테이블에서 해당 사용자 데이터 삭제 (CASCADE 또는 트리거) | FR-007 | DB에서 데이터 삭제 확인 |
| AC-10 | 삭제 실행 시 team_members 테이블에서 해당 사용자의 멤버십 제거 | FR-007 | 팀 멤버십 삭제 확인 |
| AC-11 | 삭제 성공 시 로그인 페이지로 리다이렉트 및 안내 메시지 표시 | FR-007 | 리다이렉트 및 메시지 확인 |
| AC-12 | 삭제된 사용자의 댓글은 "삭제된 사용자"로 표시 (익명화) | FR-007 | 댓글 작성자 익명화 확인 |

## Tasks / Subtasks

### Part A: 계정 삭제 UI (프로필 설정 페이지)

- [x] Task 1: Security 섹션 Danger Zone UI 구현 (AC: 1, 2)
  - [x] 1.1 프로필 설정 페이지 `/settings/profile`에 Danger Zone 섹션 추가
  - [x] 1.2 빨간 배경, 빨간 테두리로 위험 영역 스타일링 (`border-destructive/50 bg-destructive/5`)
  - [x] 1.3 "Delete Account" 제목과 설명 텍스트
  - [x] 1.4 빨간 "Delete Account" 버튼 (variant="destructive")
  - [x] 1.5 버튼 클릭 시 삭제 확인 모달 열기

- [x] Task 2: 계정 삭제 확인 모달 UI 구현 (AC: 2, 3, 4, 5, 6, 7)
  - [x] 2.1 `components/settings/delete-account-modal.tsx` 생성
  - [x] 2.2 모달 헤더: 경고 아이콘 + "계정 삭제" 제목 (빨간색)
  - [x] 2.3 삭제 경고 메시지: "이 작업은 되돌릴 수 없습니다"
  - [x] 2.4 삭제될 항목 목록 UI (빨간 배경 박스):
    - 프로필 및 개인 정보
    - 댓글 및 활동 기록
    - 팀 멤버십 (소유하지 않은 팀)
  - [x] 2.5 팀 Owner 경고 UI (노란 배경 박스, 조건부 표시)
  - [x] 2.6 비밀번호 입력 필드 (일반 사용자용)
  - [x] 2.7 "DELETE" 텍스트 입력 필드 (모든 사용자)
  - [x] 2.8 삭제 버튼 (조건 충족 시에만 활성화)
  - [x] 2.9 취소 버튼

### Part B: 계정 삭제 로직

- [x] Task 3: 팀 소유권 확인 로직 (AC: 4, 7)
  - [x] 3.1 현재 사용자가 소유한 팀 목록 조회 함수
  - [x] 3.2 `teams` 테이블에서 `owner_id = currentUserId` 조회
  - [x] 3.3 소유 팀이 있으면 팀 목록과 함께 경고 표시
  - [x] 3.4 소유 팀이 있으면 삭제 버튼 비활성화

- [x] Task 4: 본인 확인 로직 (AC: 5, 6)
  - [x] 4.1 일반 사용자: 비밀번호 재인증 (`signInWithEmailAndPassword`)
  - [x] 4.2 OAuth 사용자: "DELETE" 텍스트 정확히 입력 확인
  - [x] 4.3 사용자 인증 방식 확인 (`user.providerData[0].providerId`)
  - [x] 4.4 조건 충족 시에만 삭제 버튼 활성화

- [x] Task 5: 계정 삭제 API Route 구현 (AC: 8, 9, 10, 12)
  - [x] 5.1 `app/api/account/delete/route.ts` 생성
  - [x] 5.2 요청 검증 (비밀번호 또는 DELETE 텍스트)
  - [x] 5.3 팀 Owner 여부 재확인 (서버 측 검증)
  - [x] 5.4 댓글 soft delete 처리 (comments.deleted_at 설정)
  - [x] 5.5 team_members에서 해당 사용자 삭제
  - [x] 5.6 profiles soft delete (deleted_at 설정, name='삭제된 사용자')
  - [x] 5.7 Firebase Admin API로 Auth 사용자 삭제
  - [x] 5.8 Firebase Storage에서 사용자 아바타 삭제 (있는 경우)

- [x] Task 6: 삭제 완료 처리 (AC: 11)
  - [x] 6.1 삭제 성공 시 세션 종료
  - [x] 6.2 로그인 페이지로 리다이렉트 (`/login?deleted=true`)
  - [x] 6.3 로그인 페이지에서 쿼리 파라미터 확인 후 안내 메시지 표시
  - [x] 6.4 에러 발생 시 에러 메시지 표시 및 모달 유지

### Part C: 데이터베이스 정책

- [x] Task 7: 댓글 soft delete 정책 구현 (AC: 12)
  - [x] 7.1 `comments` 테이블에 `deleted_at` 컬럼 활용
  - [x] 7.2 삭제 시 `deleted_at = NOW()`로 업데이트
  - [x] 7.3 댓글 표시 시 `deleted_at`이 있으면 표시하지 않음

- [x] Task 8: 관련 데이터 삭제 정책 구현 (AC: 9, 10)
  - [x] 8.1 `profiles` 테이블 soft delete 시 관련 데이터 처리
  - [x] 8.2 `team_members`에서 해당 사용자 레코드 삭제
  - [x] 8.3 `issues` 테이블에서 assignee_id를 NULL로 설정
  - [x] 8.4 `notifications` 테이블에서 해당 사용자 관련 레코드 삭제

### Part D: 테스트 및 검증

- [x] Task 9: 기능 검증 (AC: 1-12)
  - [x] 9.1 일반 사용자 계정 삭제 플로우
  - [x] 9.2 OAuth 사용자 계정 삭제 플로우
  - [x] 9.3 팀 Owner 삭제 차단 UI
  - [x] 9.4 "DELETE" 텍스트 불일치 시 버튼 비활성화
  - [x] 9.5 빌드 성공 확인

## Dev Notes

### UX 시각 자료 (필수 참조)

> **IMPORTANT**: 아래 HTML 파일들은 개발 전 반드시 브라우저에서 열어 확인하세요. Profile 탭의 Delete Account 모달 디자인을 확인할 수 있습니다.

| 파일 | 설명 | 확인 내용 |
|------|------|----------|
| **[docs/ux-design-directions.html](../ux-design-directions.html)** | 인터랙티브 UI 목업 | **Profile** 탭에서 Danger Zone 레이아웃, Delete Account 모달 확인 |
| **[docs/ux-color-themes.html](../ux-color-themes.html)** | 색상 테마 시각화 | Destructive 버튼 스타일 (`#EF4444`), Error 색상 참조 |

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
| Error/Destructive | Red 500 | #EF4444 |
| Error Hover | Red 600 | #DC2626 |
| Error Background | Red 50 | #FEF2F2 |
| Error Border | Red 100 | #FECACA |
| Warning Background | Amber 100 | #FEF3C7 |
| Warning Text | Amber 800 | #92400E |

### UI 레이아웃 참조 (ux-design-directions.html Profile 탭)

#### Danger Zone 레이아웃 (Security 섹션 하단)

```
+----------------------------------------+
| Security                               |
+----------------------------------------+
| Password                               |
| Last changed 30 days ago               |
| [Change Password]                      |
+----------------------------------------+
| ⚠️ Danger Zone (빨간 배경)             |
| +------------------------------------+ |
| | Delete Account                     | |
| | Permanently delete your account    | |
| | and all data                       | |
| |                   [Delete Account] | |
| +------------------------------------+ |
+----------------------------------------+
```

[Source: docs/ux-design-directions.html#profile-screen]

#### Delete Account 확인 모달 레이아웃

```
+------------------------------------------+
| ⚠️ Delete Account                    [X] |
+------------------------------------------+
| Are you sure you want to delete your     |
| account? This action cannot be undone.   |
|                                          |
| +--------------------------------------+ |
| | What will be deleted: (빨간 배경)    | |
| | • Your profile and personal data     | |
| | • Your comments and activity history | |
| | • Team memberships (not owned teams) | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | ⚠️ You own 1 team. Please delete or  | |  <- 조건부 표시
| | transfer ownership before proceeding | |
| +--------------------------------------+ |
|                                          |
| Enter your password to confirm:          |  <- 일반 사용자
| [_________________________________]      |
|                                          |
| Type "DELETE" to confirm:                |  <- 모든 사용자
| [_________________________________]      |
|                                          |
| [Cancel]        [Delete My Account]      |  <- 조건 충족 시 활성화
+------------------------------------------+
```

[Source: docs/ux-design-directions.html#delete-modal]

### 아키텍처 패턴

#### 계정 삭제 흐름

```
1. 사용자가 Profile Settings > Security > Delete Account 클릭
2. 삭제 확인 모달 표시
3. 팀 Owner 여부 확인
   - Owner인 경우: 경고 표시 + 버튼 비활성화
   - Owner 아닌 경우: 계속 진행 가능
4. 본인 확인
   - 일반 사용자: 비밀번호 입력
   - OAuth 사용자: "DELETE" 텍스트 입력
5. 삭제 API 호출 (POST /api/account/delete)
6. 서버 측 처리:
   a. 비밀번호/텍스트 검증
   b. 팀 Owner 여부 재확인
   c. 댓글 익명화 (author_id = NULL)
   d. team_members에서 삭제
   e. profiles에서 삭제
   f. Supabase Storage에서 아바타 삭제
   g. Supabase Auth에서 사용자 삭제
7. 세션 종료
8. 로그인 페이지로 리다이렉트 + 성공 메시지
```

[Source: docs/architecture.md#Data-Deletion-Policies]

### Supabase API 사용법

#### 팀 소유권 확인

```typescript
// 현재 사용자가 소유한 팀 조회
const { data: ownedTeams, error } = await supabase
  .from('teams')
  .select('id, name')
  .eq('owner_id', userId);

const isTeamOwner = ownedTeams && ownedTeams.length > 0;
```

#### 계정 삭제 (서버 사이드)

```typescript
// app/api/account/delete/route.ts
import { createClient } from '@supabase/supabase-js';

// Admin 클라이언트 (서버 전용)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { password, deleteText } = await request.json();

  // 1. 현재 사용자 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. 본인 확인 (비밀번호 또는 DELETE 텍스트)
  const isOAuth = user.app_metadata?.provider === 'google';

  if (isOAuth) {
    if (deleteText !== 'DELETE') {
      return Response.json({ error: 'Invalid confirmation' }, { status: 400 });
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    });
    if (error) {
      return Response.json({ error: 'Invalid password' }, { status: 400 });
    }
  }

  // 3. 팀 Owner 확인
  const { data: ownedTeams } = await supabase
    .from('teams')
    .select('id')
    .eq('owner_id', user.id);

  if (ownedTeams && ownedTeams.length > 0) {
    return Response.json({
      error: 'Please transfer or delete your teams first'
    }, { status: 400 });
  }

  // 4. 댓글 익명화
  await supabase
    .from('comments')
    .update({ author_id: null, author_name: '삭제된 사용자' })
    .eq('author_id', user.id);

  // 5. 팀 멤버십 삭제
  await supabase
    .from('team_members')
    .delete()
    .eq('user_id', user.id);

  // 6. Storage에서 아바타 삭제
  await supabaseAdmin.storage
    .from('avatars')
    .remove([`${user.id}/avatar.png`]);

  // 7. 프로필 삭제
  await supabase
    .from('profiles')
    .delete()
    .eq('id', user.id);

  // 8. Auth 사용자 삭제 (Admin API 필요)
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    return Response.json({ error: 'Failed to delete account' }, { status: 500 });
  }

  return Response.json({ success: true });
}
```

[Source: docs/sprint-artifacts/tech-spec-epic-1.md#APIs-and-Interfaces]

### Zod 스키마

```typescript
// lib/validations/account.ts
import { z } from 'zod';

export const deleteAccountSchema = z.object({
  password: z.string().optional(),
  deleteText: z.string(),
}).refine(
  (data) => data.deleteText === 'DELETE',
  { message: '"DELETE"를 정확히 입력하세요', path: ['deleteText'] }
);
```

### 컴포넌트 구조

```
components/settings/
├── delete-account-modal.tsx    # 삭제 확인 모달
├── danger-zone.tsx             # Danger Zone 섹션 UI
└── delete-confirmation.tsx     # 삭제 확인 폼 (비밀번호/DELETE 입력)
```

### 스타일 참조 (Tailwind CSS)

#### Danger Zone 스타일

```tsx
// Danger Zone 섹션
<div className="bg-red-50 border border-red-100 rounded-lg p-4">
  <div className="flex justify-between items-center">
    <div>
      <h4 className="font-medium text-red-600">Delete Account</h4>
      <p className="text-sm text-gray-600">
        Permanently delete your account and all data
      </p>
    </div>
    <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium">
      Delete Account
    </button>
  </div>
</div>
```

#### 삭제될 항목 목록 스타일

```tsx
// What will be deleted 박스
<div className="bg-red-50 rounded-lg p-4">
  <p className="font-medium mb-2">What will be deleted:</p>
  <ul className="text-sm text-gray-600 ml-5 list-disc">
    <li>Your profile and personal data</li>
    <li>Your comments and activity history</li>
    <li>Team memberships (not owned teams)</li>
  </ul>
</div>
```

#### 팀 Owner 경고 스타일

```tsx
// 팀 Owner 경고 박스
<div className="bg-amber-100 rounded-lg p-3 flex gap-2 items-start">
  <span>⚠️</span>
  <p className="text-sm">
    You own {ownedTeams.length} team(s). Please delete or transfer ownership before proceeding.
  </p>
</div>
```

### Project Structure Notes

파일 생성/수정 경로:
```
app/
├── api/
│   └── account/
│       └── delete/
│           └── route.ts         # 새로 생성
├── (dashboard)/
│   └── settings/
│       └── profile/
│           └── page.tsx         # 수정 (Danger Zone 추가)

components/
└── settings/
    ├── delete-account-modal.tsx # 새로 생성
    ├── danger-zone.tsx          # 새로 생성
    └── delete-confirmation.tsx  # 새로 생성

lib/
└── validations/
    └── account.ts               # 새로 생성
```

[Source: docs/architecture.md#Project-Structure]

### 환경 변수 필요

```env
# .env.local
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Admin API 사용에 필요
```

**주의**: Service Role Key는 서버 사이드에서만 사용해야 하며, 클라이언트에 노출되면 안 됩니다.

[Source: docs/architecture.md#Environment-Variables]

### References

- [Source: docs/prd.md#FR-007] - 계정 삭제 요구사항
- [Source: docs/architecture.md#Data-Deletion-Policies] - 데이터 삭제 정책
- [Source: docs/ux-design-directions.html] - 인터랙티브 UI 목업 (Profile 탭, Delete Modal)
- [Source: docs/ux-color-themes.html] - 색상 테마 시각화 (Destructive 버튼)
- [Source: docs/epics.md#Story-1.6] - 스토리 상세 설명
- [Source: docs/sprint-artifacts/tech-spec-epic-1.md] - Epic 1 기술 사양

### Learnings from Previous Story

**From Story 1-5-profile-password-management (Status: drafted)**

이전 스토리에서 참조할 수 있는 구현 사항:
- 프로필 설정 페이지 레이아웃 (`/settings/profile`)
- Security 섹션 UI (비밀번호 변경 부분)
- 비밀번호 검증 로직 (현재 비밀번호 확인)
- OAuth 사용자 판별 로직 (`user.app_metadata.provider`)
- 모달 컴포넌트 패턴

**의존성 참고:**
- Story 1.1에서 Next.js 프로젝트, Supabase 연동, DB 스키마 완료
- Story 1.2에서 공통 UI 컴포넌트 (Button, Input, Card, Modal, Toast)
- Story 1.3에서 인증 기본 구조 (로그인/회원가입)
- Story 1.5에서 프로필 설정 페이지 기본 레이아웃, Security 섹션

**확인 필요 사항:**
- `SUPABASE_SERVICE_ROLE_KEY` 환경 변수 설정 여부
- `comments` 테이블에 `author_name` 컬럼 존재 여부 (또는 추가 필요)
- `teams` 테이블의 `owner_id` 컬럼 확인

**재사용할 컴포넌트 (이전 스토리에서 생성):**
- 프로필 설정 페이지 레이아웃
- Modal 컴포넌트
- Button, Input 컴포넌트
- Toast 알림 컴포넌트
- OAuth 사용자 판별 로직

[Source: docs/sprint-artifacts/1-5-profile-password-management.md]

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/1-6-account-delete.context.xml`

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- 계정 삭제 모달 컴포넌트 구현
- 계정 삭제 API Route 구현
- 팀 Owner 확인 로직 구현
- 비밀번호 재인증 로직 구현
- 프로필 페이지에 계정 삭제 모달 연결
- 빌드 성공 확인

### Completion Notes List

- `components/settings/delete-account-modal.tsx` - 계정 삭제 확인 모달 컴포넌트 구현
  - 삭제될 항목 목록 표시 (빨간 배경)
  - 팀 Owner 경고 표시 (노란 배경, 조건부)
  - 비밀번호 입력 필드 (일반 사용자)
  - "DELETE" 텍스트 입력 필드 (모든 사용자)
  - 조건 충족 시에만 삭제 버튼 활성화
- `app/api/account/delete/route.ts` - 계정 삭제 API Route 구현
  - Firebase Auth 토큰 검증
  - 팀 Owner 여부 서버 측 재확인
  - 비밀번호 재인증 (일반 사용자)
  - 댓글 soft delete 처리
  - team_members 삭제
  - 알림 삭제
  - AI 관련 데이터 삭제
  - issues assignee 해제
  - profiles soft delete
  - Firebase Storage 아바타 삭제
  - Firebase Auth 사용자 삭제
- 로그인 페이지에 계정 삭제 성공 메시지 표시 (이미 구현됨)

### File List

**NEW:**
- `components/settings/delete-account-modal.tsx` - 계정 삭제 확인 모달 컴포넌트
- `app/api/account/delete/route.ts` - 계정 삭제 API Route

**MODIFIED:**
- `app/(dashboard)/settings/profile/page.tsx` - 계정 삭제 모달 연결

**EXISTING (이전 구현):**
- `components/auth/login-form.tsx` - 계정 삭제 성공 메시지 표시 (이미 구현됨)

## Change Log

| 날짜 | 변경 내용 | 작성자 |
|------|----------|--------|
| 2025-11-29 | 스토리 초안 작성 | SM (create-story workflow) |
| 2025-11-29 | UX 시각 자료 필수 참조 섹션 추가 (ux-design-directions.html, ux-color-themes.html) | SM |
| 2025-11-29 | 스토리 구현 완료 - 계정 삭제 모달, API Route, 팀 Owner 체크 구현 | Dev (dev-story workflow) |
