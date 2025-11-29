# Story 2.4: 멤버 관리

Status: drafted

## Story

As a **팀 OWNER 또는 ADMIN**,
I want **팀 멤버 목록을 조회하고, 역할을 변경하고, 멤버를 관리**,
so that **팀 구성을 효율적으로 관리하고 적절한 권한을 부여할 수 있다**.

## Acceptance Criteria

| AC # | 설명 | FR | 검증 방법 |
|------|------|-----|----------|
| AC-1 | 팀 멤버 목록에서 이름, 이메일, 역할, 가입일 표시 | FR-014 | Members 탭에서 정보 확인 |
| AC-2 | 역할별 필터링 가능 | FR-014 | 필터 적용 시 해당 역할만 표시 |
| AC-3 | 멤버 역할이 배지로 표시 (OWNER: 금색, ADMIN: 파랑, MEMBER: 회색) | FR-014, FR-017 | 배지 스타일 확인 |
| AC-4 | OWNER는 모든 멤버(ADMIN, MEMBER)를 강제 퇴장 가능 | FR-015 | OWNER로 ADMIN 퇴장 시 성공 확인 |
| AC-5 | ADMIN은 MEMBER만 강제 퇴장 가능 | FR-015 | ADMIN으로 ADMIN 퇴장 시도 시 에러 |
| AC-6 | OWNER 본인은 강제 퇴장 대상이 될 수 없음 | FR-015 | OWNER 퇴장 시도 시 에러 |
| AC-7 | ADMIN 또는 MEMBER는 팀을 자발적으로 탈퇴 가능 | FR-016 | 탈퇴 버튼 클릭 시 팀에서 제거 확인 |
| AC-8 | OWNER는 탈퇴 불가 (팀 삭제 또는 소유권 이전 필요) | FR-016 | OWNER 탈퇴 시도 시 에러 메시지 |
| AC-9 | OWNER만 멤버의 역할 변경 가능 | FR-018 | ADMIN으로 역할 변경 시도 시 에러 |
| AC-10 | MEMBER → ADMIN 승격, ADMIN → MEMBER 강등 가능 | FR-018 | 역할 변경 후 DB 및 UI 확인 |
| AC-11 | OWNER 권한을 다른 ADMIN에게 이전 가능 | FR-018 | 소유권 이전 후 역할 교환 확인 |
| AC-12 | 소유권 이전 시 기존 OWNER는 ADMIN으로 변경 | FR-018 | 이전 후 기존 OWNER 역할 확인 |
| AC-13 | 역할 변경 시 확인 모달 표시 | FR-018 | 모달 확인 후 변경 실행 |
| AC-14 | API 응답 형식이 표준 포맷 준수 | FR-014~018 | API 응답 JSON 구조 확인 |

## Tasks / Subtasks

### Part A: 멤버 목록 API

- [ ] Task 1: 멤버 목록 조회 API (AC: 1, 2, 14)
  - [ ] 1.1 `app/api/teams/[teamId]/members/route.ts` 생성 (GET)
  - [ ] 1.2 멤버 목록 + 프로필 정보 JOIN
  - [ ] 1.3 역할별 필터링 쿼리 파라미터
  - [ ] 1.4 팀 멤버십 검증

### Part B: 역할 변경 API

- [ ] Task 2: 역할 변경 API (AC: 9, 10, 11, 12, 14)
  - [ ] 2.1 `app/api/teams/[teamId]/members/[userId]/route.ts` 생성 (PUT, DELETE)
  - [ ] 2.2 PUT 핸들러: 역할 변경 (OWNER만)
  - [ ] 2.3 소유권 이전 로직 (기존 OWNER → ADMIN)
  - [ ] 2.4 활동 로그 기록

### Part C: 멤버 퇴장/탈퇴 API

- [ ] Task 3: 강제 퇴장/자발적 탈퇴 API (AC: 4, 5, 6, 7, 8)
  - [ ] 3.1 DELETE 핸들러: 강제 퇴장 또는 자발적 탈퇴
  - [ ] 3.2 OWNER 퇴장 차단 검증
  - [ ] 3.3 ADMIN의 ADMIN 퇴장 차단
  - [ ] 3.4 OWNER 탈퇴 차단 (팀 삭제 또는 소유권 이전 안내)
  - [ ] 3.5 활동 로그 기록

### Part D: UI 구현

- [ ] Task 4: Members 탭 페이지 (AC: 1, 2, 3)
  - [ ] 4.1 `app/(dashboard)/teams/[teamId]/members/page.tsx` 생성
  - [ ] 4.2 멤버 목록 테이블 (Avatar, 이름, 이메일, 역할 배지, 가입일)
  - [ ] 4.3 역할 필터 드롭다운
  - [ ] 4.4 역할 배지 스타일링 (OWNER: 금색 그라데이션, ADMIN: 파랑, MEMBER: 회색)

- [ ] Task 5: 멤버 액션 UI (AC: 4, 5, 9, 10)
  - [ ] 5.1 역할 변경 드롭다운 (OWNER만 표시)
  - [ ] 5.2 퇴장 버튼 (X) - 권한에 따른 표시
  - [ ] 5.3 역할 변경 확인 모달
  - [ ] 5.4 퇴장 확인 모달

- [ ] Task 6: 소유권 이전 모달 (AC: 11, 12, 13)
  - [ ] 6.1 `components/teams/transfer-ownership-modal.tsx` 생성
  - [ ] 6.2 경고 메시지 표시
  - [ ] 6.3 확인 입력 필드
  - [ ] 6.4 이전 후 역할 안내

- [ ] Task 7: 팀 탈퇴 UI (AC: 7, 8)
  - [ ] 7.1 Settings 페이지에 "Leave Team" 섹션 추가
  - [ ] 7.2 탈퇴 확인 모달
  - [ ] 7.3 OWNER인 경우 탈퇴 불가 안내

### Part E: 훅 및 유틸리티

- [ ] Task 8: 멤버 관리 훅 (AC: 1, 2)
  - [ ] 8.1 `hooks/use-members.ts` 생성
  - [ ] 8.2 `useTeamMembers(teamId, filter?)` - 멤버 목록 조회
  - [ ] 8.3 `useUpdateMemberRole()` - 역할 변경 mutation
  - [ ] 8.4 `useRemoveMember()` - 멤버 퇴장 mutation
  - [ ] 8.5 `useLeaveTeam()` - 팀 탈퇴 mutation
  - [ ] 8.6 `useTransferOwnership()` - 소유권 이전 mutation

## Dev Notes

### UX 시각 자료 (필수 참조)

| 항목 | 설명 |
|------|------|
| **[docs/sprint-artifacts/tech-spec-epic-2.md](./tech-spec-epic-2.md)** | 멤버 관리 UI 및 API 스펙 |
| **[docs/ux-color-themes.html](../ux-color-themes.html)** | 역할 배지 색상 |

### Members 테이블 UI

```
+--------------------------------------------------------------------+
| [Avatar] Name               Email                  Role    Action  |
+--------------------------------------------------------------------+
| [🟣 HJ]  홍길동            hong@example.com       [OWNER]   -      |
| [🔵 KS]  김서연            kim@example.com        [▼ ADMIN] [X]    |
| [⚫ PY]  박영희            park@example.com       [▼ MEMBER][X]    |
+--------------------------------------------------------------------+
                                                  [+ Invite Member]
```

### 역할 배지 스타일

```css
/* OWNER - 금색 그라데이션 */
.role-badge-owner {
  background: linear-gradient(135deg, #F59E0B, #D97706);
  color: #1A1A1D;
  font-weight: 600;
}

/* ADMIN - 파랑 */
.role-badge-admin {
  background: #3B82F6;
  color: #FAFAFA;
}

/* MEMBER - 회색 */
.role-badge-member {
  background: #27272A;
  color: #A1A1AA;
}
```

### API 설계

#### GET /api/teams/[teamId]/members

```typescript
// Query: ?role=ADMIN (optional)
// Response
{
  "success": true,
  "data": [
    {
      "id": "member-uuid",
      "user_id": "user-uuid",
      "role": "OWNER",
      "joined_at": "2025-11-29T...",
      "profile": {
        "name": "홍길동",
        "email": "hong@example.com",
        "avatar_url": null
      }
    }
  ]
}
```

#### PUT /api/teams/[teamId]/members/[userId]

```typescript
// Request
{
  "role": "ADMIN"  // 또는 "MEMBER", "OWNER" (소유권 이전)
}

// Response (성공)
{
  "success": true,
  "data": {
    "id": "member-uuid",
    "role": "ADMIN"
  }
}

// Response (권한 없음)
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSION",
    "message": "역할 변경은 OWNER만 가능합니다"
  }
}
```

#### DELETE /api/teams/[teamId]/members/[userId]

```typescript
// Response (성공)
{
  "success": true,
  "data": { "message": "멤버가 퇴장되었습니다" }
}

// Response (OWNER 퇴장 시도)
{
  "success": false,
  "error": {
    "code": "CANNOT_REMOVE_OWNER",
    "message": "OWNER는 퇴장할 수 없습니다"
  }
}

// Response (OWNER 탈퇴 시도)
{
  "success": false,
  "error": {
    "code": "OWNER_CANNOT_LEAVE",
    "message": "OWNER는 탈퇴할 수 없습니다. 팀을 삭제하거나 소유권을 이전하세요."
  }
}
```

### 권한 매트릭스

| 액션 | OWNER | ADMIN | MEMBER |
|------|-------|-------|--------|
| 멤버 목록 조회 | ✅ | ✅ | ✅ |
| 역할 변경 | ✅ | ❌ | ❌ |
| OWNER 퇴장 | ❌ | ❌ | ❌ |
| ADMIN 퇴장 | ✅ | ❌ | ❌ |
| MEMBER 퇴장 | ✅ | ✅ | ❌ |
| 자발적 탈퇴 | ❌ | ✅ | ✅ |
| 소유권 이전 | ✅ | ❌ | ❌ |

### 소유권 이전 워크플로우

```
1. OWNER가 "Transfer Ownership" 클릭
2. 확인 모달 표시 (경고 메시지)
3. ADMIN 목록에서 새 OWNER 선택
4. 확인 입력 (예: "TRANSFER")
5. API 호출:
   - 새 OWNER의 role = 'OWNER'
   - 기존 OWNER의 role = 'ADMIN'
   - teams.owner_id 업데이트
6. 활동 로그 기록
7. UI 업데이트
```

### 파일 생성 경로

```
app/
├── (dashboard)/
│   └── teams/
│       └── [teamId]/
│           └── members/
│               └── page.tsx            # Members 탭
├── api/
│   └── teams/
│       └── [teamId]/
│           └── members/
│               ├── route.ts            # GET (목록)
│               └── [userId]/
│                   └── route.ts        # PUT, DELETE

components/
└── teams/
    ├── member-table.tsx
    ├── role-change-modal.tsx
    ├── remove-member-modal.tsx
    └── transfer-ownership-modal.tsx

hooks/
└── use-members.ts
```

### References

- [Source: docs/prd.md#FR-014] - 멤버 조회
- [Source: docs/prd.md#FR-015] - 강제 퇴장
- [Source: docs/prd.md#FR-016] - 팀 탈퇴
- [Source: docs/prd.md#FR-017] - 역할 체계
- [Source: docs/prd.md#FR-018] - 역할 변경
- [Source: docs/sprint-artifacts/tech-spec-epic-2.md] - 기술 사양

## Change Log

| 날짜 | 변경 내용 | 작성자 |
|------|----------|--------|
| 2025-11-29 | 스토리 초안 작성 | Story Context Workflow |
