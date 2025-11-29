# Jira Lite MVP - Epic Breakdown

**Author:** hojeong
**Date:** 2025-11-29
**Project Level:** MVP (8시간 해커톤)
**Target Scale:** 소규모 개발팀, 스타트업

---

## Overview

이 문서는 Jira Lite MVP의 PRD를 Epic과 Story로 분해한 결과입니다. [PRD](./prd.md), [UX Design](./ux-design-specification.md), [Architecture](./architecture.md) 문서의 요구사항을 기반으로 작성되었습니다.

**Epic 설계 원칙:**
- 각 Epic은 **병렬로 진행 가능** (Epic 간 의존성 최소화)
- 각 Epic 내 Story는 **순차적으로 진행** (Story 간 의존성 존재)
- 각 Story는 **단일 개발 세션**에서 완료 가능한 크기

**Living Document Notice:** 이 문서는 PRD + UX + Architecture 컨텍스트를 모두 반영한 버전입니다.

---

## Functional Requirements Inventory

| 영역 | FR 범위 | 개수 |
|------|---------|------|
| 인증 | FR-001 ~ FR-007 | 7개 |
| 팀 | FR-010 ~ FR-019 | 10개 |
| 프로젝트 | FR-020 ~ FR-027 | 8개 |
| 이슈 | FR-030 ~ FR-039-2 | 11개 |
| AI | FR-040 ~ FR-045 | 6개 |
| 칸반 | FR-050 ~ FR-054 | 5개 |
| 댓글 | FR-060 ~ FR-063 | 4개 |
| 권한/보안 | FR-070 ~ FR-071 | 2개 |
| 대시보드 | FR-080 ~ FR-082 | 3개 |
| 알림 | FR-090 ~ FR-091 | 2개 |
| **총계** | | **58개** |

---

## FR Coverage Map

| Epic | FR 범위 | 커버리지 |
|------|---------|----------|
| Epic 1 | FR-001~007, FR-070~071 | 9개 |
| Epic 2 | FR-010~019 | 10개 |
| Epic 3 | FR-020~027, FR-030~039-2 | 19개 |
| Epic 4 | FR-050~054, FR-060~063 | 9개 |
| Epic 5 | FR-040~045, FR-080~082, FR-090~091 | 11개 |
| **총계** | | **58개 (100%)** |

---

## Epic 구조 및 의존성

```
                    ┌─────────────────────────────────────┐
                    │     Epic 1: Foundation & 인증       │
                    │   (모든 Epic의 공통 기반 - 선행)     │
                    └─────────────────┬───────────────────┘
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           │                          │                          │
           ▼                          ▼                          ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  Epic 2: 팀 관리  │      │ Epic 3: 프로젝트 │      │ Epic 4: 칸반보드 │
│                  │      │    & 이슈 관리    │      │    & 댓글        │
└──────────────────┘      └──────────────────┘      └──────────────────┘
           │                          │                          │
           └──────────────────────────┼──────────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────────┐
                    │  Epic 5: AI & 대시보드 & 알림       │
                    │  (다른 Epic 데이터 활용 가능)       │
                    └─────────────────────────────────────┘
```

**병렬 처리 가능:**
- Epic 1 완료 후 → Epic 2, 3, 4, 5 **모두 병렬 진행 가능**
- Epic 5는 다른 Epic의 데이터를 활용하지만, Mock 데이터로 독립 개발 가능

---

## Epic Summary

| Epic | 이름 | 설명 | Stories | 의존성 |
|------|------|------|---------|--------|
| 1 | Foundation & 인증 | 프로젝트 기반 및 사용자 인증 시스템 | 6개 | 없음 (선행) |
| 2 | 팀 관리 | 팀 생성, 멤버 관리, 역할 체계 | 5개 | Epic 1 |
| 3 | 프로젝트 & 이슈 관리 | 프로젝트/이슈 CRUD 및 검색 | 6개 | Epic 1 |
| 4 | 칸반 보드 & 댓글 | Drag & Drop 칸반, 댓글 시스템 | 5개 | Epic 1 |
| 5 | AI & 대시보드 & 알림 | AI 기능, 통계, 알림 센터 | 5개 | Epic 1 |

---

## Epic 1: Foundation & 인증

**목표:** 프로젝트 기반 구축 및 완전한 사용자 인증 시스템 구현
**FR 커버리지:** FR-001~007, FR-070~071
**의존성:** 없음 (선행 필수)
**스토리 순서:** 순차적 (1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6)

### Story 1.1: 프로젝트 초기화 & DB 스키마

**FR:** FR-070 (팀 멤버십 검증), FR-071 (Soft Delete)

**작업 내용:**
1. Next.js 15 프로젝트 생성 (App Router, TypeScript)
2. Supabase 프로젝트 연결 및 환경변수 설정
3. 전체 DB 스키마 생성:
   - `users` 테이블 (auth.users 확장)
   - `teams`, `team_members` 테이블
   - `projects` 테이블
   - `issues`, `issue_labels`, `issue_history` 테이블
   - `comments` 테이블
   - `notifications` 테이블
4. RLS (Row Level Security) 정책 설정
5. Soft Delete 트리거 함수 구현
6. TypeScript 타입 생성 (supabase gen types)

**인수 조건:**
- [ ] `pnpm dev` 실행 시 에러 없이 로컬 서버 시작
- [ ] Supabase 대시보드에서 모든 테이블 확인 가능
- [ ] `deleted_at` 컬럼이 있는 테이블에 Soft Delete 정책 적용

---

### Story 1.2: 공통 레이아웃 & UI 컴포넌트

**FR:** 없음 (기반 작업)

**작업 내용:**
1. shadcn/ui 설치 및 테마 설정 (Linear Productivity 테마)
   - Primary: #5B5FC7 (Indigo)
   - Accent: #3B82F6 (Blue)
2. 공통 레이아웃 컴포넌트:
   - `AppShell` - 메인 레이아웃
   - `Sidebar` - 좌측 네비게이션 (240px, 다크)
   - `Header` - 상단 헤더
3. 공통 UI 컴포넌트:
   - Button (Primary, Secondary, Destructive, AI)
   - Input, Select, Textarea
   - Card, Badge, Avatar
   - Modal, Toast
4. 인증 컨텍스트 Provider 설정

**인수 조건:**
- [ ] `/` 접속 시 Sidebar + 메인 영역 레이아웃 표시
- [ ] 다크모드 Sidebar 스타일 적용
- [ ] 모든 공통 컴포넌트 Storybook 또는 테스트 페이지에서 확인 가능

---

### Story 1.3: 회원가입 & 로그인

**FR:** FR-001 (회원가입), FR-002 (로그인/로그아웃)

**작업 내용:**
1. 회원가입 페이지 (`/auth/signup`)
   - 이메일, 비밀번호, 이름 입력
   - 비밀번호 강도 표시
   - 폼 유효성 검증 (react-hook-form + zod)
2. 로그인 페이지 (`/auth/login`)
   - 이메일, 비밀번호 입력
   - "Remember me" 체크박스
   - 에러 메시지 표시
3. 로그아웃 기능
4. 인증 미들웨어 (보호된 라우트)
5. 세션 관리 및 자동 갱신

**인수 조건:**
- [ ] 회원가입 후 자동 로그인 및 대시보드 리다이렉트
- [ ] 로그인 실패 시 적절한 에러 메시지 표시
- [ ] 로그아웃 시 `/auth/login`으로 리다이렉트
- [ ] 미인증 사용자가 보호된 페이지 접근 시 로그인 페이지로 리다이렉트

---

### Story 1.4: Google OAuth

**FR:** FR-004 (Google OAuth 로그인)

**작업 내용:**
1. Supabase Google OAuth Provider 설정
2. 로그인 페이지에 "Continue with Google" 버튼 추가
3. OAuth 콜백 처리 (`/auth/callback`)
4. 신규 사용자 프로필 자동 생성

**인수 조건:**
- [ ] Google 버튼 클릭 시 Google 로그인 팝업 표시
- [ ] Google 로그인 성공 시 대시보드로 리다이렉트
- [ ] 신규 Google 사용자의 이름/이메일 자동 설정

---

### Story 1.5: 프로필 & 비밀번호 관리

**FR:** FR-003 (비밀번호 찾기/재설정), FR-005 (프로필 관리), FR-006 (비밀번호 변경)

**작업 내용:**
1. 프로필 설정 페이지 (`/settings/profile`)
   - 프로필 사진 업로드 (Supabase Storage)
   - 이름 수정
   - 이메일 표시 (읽기 전용)
2. 비밀번호 찾기 페이지 (`/auth/forgot-password`)
   - 이메일 입력 → 재설정 링크 발송
3. 비밀번호 재설정 페이지 (`/auth/reset-password`)
4. 비밀번호 변경 (프로필 설정 내)
   - 현재 비밀번호 확인
   - 새 비밀번호 입력 + 확인

**인수 조건:**
- [ ] 프로필 사진 업로드 및 미리보기 동작
- [ ] 비밀번호 재설정 이메일 발송 확인
- [ ] 비밀번호 변경 시 현재 비밀번호 검증

---

### Story 1.6: 계정 삭제

**FR:** FR-007 (계정 삭제 - Soft Delete)

**작업 내용:**
1. 계정 삭제 섹션 (프로필 설정 내 Danger Zone)
2. 삭제 확인 모달:
   - 삭제될 데이터 목록 표시
   - 소유한 팀 경고 (소유권 이전 필요)
   - 비밀번호 입력
   - "DELETE" 텍스트 입력 확인
3. Soft Delete 처리 (`deleted_at` 설정)
4. 로그아웃 및 로그인 페이지로 리다이렉트

**인수 조건:**
- [ ] 소유한 팀이 있는 경우 삭제 버튼 비활성화
- [ ] 비밀번호 + "DELETE" 입력 완료 시에만 삭제 버튼 활성화
- [ ] 삭제 후 해당 이메일로 재로그인 불가

---

## Epic 2: 팀 관리

**목표:** 팀 생성, 멤버 관리, 역할 체계 구현
**FR 커버리지:** FR-010~019
**의존성:** Epic 1 완료 후 병렬 진행 가능
**스토리 순서:** 순차적 (2.1 → 2.2 → 2.3 → 2.4 → 2.5)

### Story 2.1: 팀 생성 & 목록 조회

**FR:** FR-010 (팀 생성), FR-017 (역할 체계)

**작업 내용:**
1. 팀 생성 모달/페이지
   - 팀 이름 입력
   - 생성자는 자동으로 OWNER 역할 부여
2. Sidebar에 팀 목록 표시
   - 팀별 컬러 도트 표시
   - 활성 팀 하이라이트
3. API 구현:
   - `POST /api/teams` - 팀 생성
   - `GET /api/teams` - 내 팀 목록 조회
4. 역할 체계 기반 구현 (OWNER/ADMIN/MEMBER)

**인수 조건:**
- [ ] 팀 생성 후 Sidebar에 즉시 표시
- [ ] 생성자가 OWNER 역할로 `team_members` 테이블에 등록
- [ ] 팀 선택 시 해당 팀 컨텍스트로 전환

---

### Story 2.2: 팀 상세 & 수정 & 삭제

**FR:** FR-011 (팀 수정), FR-012 (팀 삭제)

**작업 내용:**
1. 팀 설정 페이지 (`/teams/[teamId]/settings`)
   - 팀 이름 수정
   - 팀 설명 수정
2. 팀 삭제 기능 (OWNER만)
   - 삭제 확인 모달
   - 연관 데이터 Soft Delete
3. API 구현:
   - `PUT /api/teams/[teamId]` - 팀 수정
   - `DELETE /api/teams/[teamId]` - 팀 삭제
4. 권한 검증 미들웨어 (OWNER/ADMIN만 수정 가능)

**인수 조건:**
- [ ] MEMBER 역할은 설정 페이지 접근 불가
- [ ] ADMIN은 수정 가능, 삭제 불가
- [ ] OWNER만 팀 삭제 가능
- [ ] 삭제된 팀은 Sidebar에서 제거

---

### Story 2.3: 멤버 초대 시스템

**FR:** FR-013 (팀 멤버 초대)

**작업 내용:**
1. 멤버 초대 모달
   - 이메일 입력
   - 역할 선택 (ADMIN/MEMBER)
2. 초대 이메일 발송 (Supabase Edge Function 또는 Resend)
   - 초대 링크 포함
   - 7일 만료
3. 초대 수락 페이지 (`/invites/[token]`)
   - 로그인 필요 시 로그인 후 자동 수락
4. Pending Invites 목록 표시
   - 재발송/취소 기능
5. API 구현:
   - `POST /api/teams/[teamId]/invites` - 초대 생성
   - `POST /api/invites/[token]/accept` - 초대 수락
   - `DELETE /api/invites/[inviteId]` - 초대 취소

**인수 조건:**
- [ ] 초대 이메일 발송 확인
- [ ] 초대 링크 클릭 시 팀 가입 완료
- [ ] 만료된 초대 링크 접근 시 에러 표시
- [ ] 이미 팀 멤버인 경우 초대 불가

---

### Story 2.4: 멤버 관리

**FR:** FR-014 (멤버 조회), FR-015 (강제 퇴장), FR-016 (팀 탈퇴), FR-018 (역할 변경)

**작업 내용:**
1. 팀 멤버 페이지 (`/teams/[teamId]/members`)
   - 멤버 테이블 (아바타, 이름, 이메일, 역할, 가입일)
   - 역할별 필터링
2. 역할 변경 드롭다운 (OWNER/ADMIN만)
3. 멤버 강제 퇴장 (Remove 버튼)
   - OWNER는 제거 불가
   - 본인은 제거 불가 (탈퇴 사용)
4. 팀 탈퇴 기능
   - OWNER는 탈퇴 전 소유권 이전 필요
5. API 구현:
   - `GET /api/teams/[teamId]/members` - 멤버 목록
   - `PUT /api/teams/[teamId]/members/[userId]` - 역할 변경
   - `DELETE /api/teams/[teamId]/members/[userId]` - 강제 퇴장/탈퇴

**인수 조건:**
- [ ] 멤버 목록에 역할 배지 표시
- [ ] MEMBER는 역할 변경 드롭다운 비활성화
- [ ] OWNER 강제 퇴장 시도 시 에러 표시
- [ ] 탈퇴 후 해당 팀 접근 불가

---

### Story 2.5: 팀 활동 로그

**FR:** FR-019 (팀 활동 로그)

**작업 내용:**
1. 활동 로그 탭 (팀 설정 또는 별도 페이지)
2. 기록되는 활동:
   - 멤버 가입/탈퇴
   - 역할 변경
   - 프로젝트 생성/삭제
   - 팀 설정 변경
3. 활동 로그 테이블 (`team_activity_logs`)
4. 무한 스크롤 또는 페이지네이션
5. API 구현:
   - `GET /api/teams/[teamId]/activities` - 활동 로그 조회

**인수 조건:**
- [ ] 멤버 가입 시 활동 로그 자동 기록
- [ ] 최신순 정렬
- [ ] 활동 타입별 아이콘/색상 표시

---

## Epic 3: 프로젝트 & 이슈 관리

**목표:** 프로젝트 및 이슈의 전체 CRUD 및 고급 기능 구현
**FR 커버리지:** FR-020~027, FR-030~039-2
**의존성:** Epic 1 완료 후 병렬 진행 가능
**스토리 순서:** 순차적 (3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6)

### Story 3.1: 프로젝트 CRUD

**FR:** FR-020 (생성), FR-021 (목록), FR-022 (상세), FR-023 (수정), FR-024 (삭제)

**작업 내용:**
1. 프로젝트 생성 모달
   - 프로젝트 이름
   - 프로젝트 키 (JL, PROJ 등 자동 생성 또는 수동)
   - 팀 선택
2. Sidebar에 프로젝트 목록 표시
   - 팀별 그룹화
   - 컬러 도트
3. 프로젝트 상세 페이지 (`/projects/[projectId]`)
   - 프로젝트 헤더 (이름, 키, 설명)
   - 이슈 목록 영역 (다음 스토리에서 구현)
4. 프로젝트 설정 페이지
   - 이름/키 수정
   - 삭제 (Soft Delete)
5. API 구현:
   - `POST /api/projects` - 생성
   - `GET /api/projects` - 목록
   - `GET /api/projects/[projectId]` - 상세
   - `PUT /api/projects/[projectId]` - 수정
   - `DELETE /api/projects/[projectId]` - 삭제

**인수 조건:**
- [ ] 프로젝트 생성 후 해당 프로젝트 페이지로 이동
- [ ] Sidebar에서 프로젝트 클릭 시 상세 페이지 이동
- [ ] 삭제 시 Soft Delete 적용

---

### Story 3.2: 프로젝트 고급 기능

**FR:** FR-025 (마크다운 설명), FR-026 (아카이브), FR-027 (즐겨찾기)

**작업 내용:**
1. 프로젝트 설명 (마크다운)
   - 마크다운 에디터 (react-markdown 또는 @uiw/react-md-editor)
   - 미리보기 모드
2. 프로젝트 아카이브
   - 아카이브 토글 버튼
   - 아카이브된 프로젝트 목록 별도 표시
   - 아카이브 복원
3. 프로젝트 즐겨찾기
   - 즐겨찾기 토글 (별 아이콘)
   - Sidebar 상단에 즐겨찾기 프로젝트 표시
4. API 구현:
   - `PUT /api/projects/[projectId]/archive` - 아카이브 토글
   - `PUT /api/projects/[projectId]/favorite` - 즐겨찾기 토글

**인수 조건:**
- [ ] 마크다운 설명 저장 및 렌더링 동작
- [ ] 아카이브된 프로젝트는 기본 목록에서 숨김
- [ ] 즐겨찾기 프로젝트 Sidebar 상단 표시

---

### Story 3.3: 이슈 생성 & 목록

**FR:** FR-030 (생성), FR-037 (우선순위), FR-038 (라벨)

**작업 내용:**
1. 이슈 생성 모달/페이지
   - 제목 (필수)
   - 설명 (마크다운)
   - 우선순위 선택 (HIGH/MEDIUM/LOW)
   - 라벨 선택 (Bug, Feature, Enhancement 등)
   - 담당자 선택 (다음 스토리)
   - 마감일 선택
2. 이슈 목록 (List View)
   - 테이블 형태: ID, 제목, 상태, 우선순위, 담당자, 마감일
   - 이슈 카드 클릭 시 상세 패널
3. 라벨 관리
   - 기본 라벨 제공 (Bug, Feature, Enhancement, Docs)
   - 커스텀 라벨 생성 (프로젝트 설정)
4. API 구현:
   - `POST /api/projects/[projectId]/issues` - 이슈 생성
   - `GET /api/projects/[projectId]/issues` - 이슈 목록
   - `GET /api/projects/[projectId]/labels` - 라벨 목록
   - `POST /api/projects/[projectId]/labels` - 라벨 생성

**인수 조건:**
- [ ] 이슈 생성 시 자동 ID 부여 (JL-1, JL-2...)
- [ ] 우선순위별 색상 배지 표시 (HIGH: 빨강, MEDIUM: 노랑, LOW: 초록)
- [ ] 라벨별 색상 표시

---

### Story 3.4: 이슈 상세 & 수정

**FR:** FR-031 (상세), FR-032 (수정), FR-033 (상태변경), FR-034 (담당자), FR-035 (삭제)

**작업 내용:**
1. 이슈 상세 패널 (오른쪽 슬라이드 또는 모달)
   - 이슈 ID, 제목
   - 설명 (마크다운 렌더링)
   - 상태, 우선순위, 라벨
   - 담당자 (아바타 + 이름)
   - 마감일
   - 생성일, 수정일
2. 인라인 수정
   - 제목 클릭 → 편집 모드
   - 상태 드롭다운
   - 담당자 선택 드롭다운
3. 담당자 지정
   - 팀 멤버 목록에서 선택
   - 자기 자신에게 할당 버튼
4. 이슈 삭제 (Soft Delete)
5. API 구현:
   - `GET /api/issues/[issueId]` - 상세
   - `PUT /api/issues/[issueId]` - 수정
   - `DELETE /api/issues/[issueId]` - 삭제

**인수 조건:**
- [ ] 상태 변경 시 즉시 UI 반영
- [ ] 담당자 변경 시 해당 사용자에게 알림 (Epic 5)
- [ ] 삭제 시 확인 모달 표시

---

### Story 3.5: 이슈 검색 & 필터링

**FR:** FR-036 (검색/필터링)

**작업 내용:**
1. 검색 바
   - 제목, 설명, ID로 검색
   - 디바운스 적용 (300ms)
2. 필터 바
   - 상태 필터 (체크박스 또는 드롭다운)
   - 우선순위 필터
   - 담당자 필터
   - 라벨 필터
   - 마감일 범위 필터
3. 정렬
   - 생성일순, 수정일순, 우선순위순, 마감일순
4. 필터 상태 URL 반영 (?status=TODO&priority=HIGH)
5. 필터 초기화 버튼

**인수 조건:**
- [ ] 검색어 입력 시 실시간 결과 필터링
- [ ] 복합 필터 동작 (AND 조건)
- [ ] URL 공유 시 동일 필터 상태 복원

---

### Story 3.6: 히스토리 & 서브태스크

**FR:** FR-039 (변경 히스토리), FR-039-2 (서브태스크)

**작업 내용:**
1. 이슈 변경 히스토리
   - 이슈 상세 패널 내 히스토리 탭
   - 기록 항목: 상태 변경, 담당자 변경, 우선순위 변경, 제목/설명 수정
   - 타임라인 UI
2. 서브태스크
   - 이슈 상세 내 서브태스크 섹션
   - 서브태스크 추가 (제목만)
   - 체크박스로 완료 토글
   - 진행률 표시 (2/5)
   - 서브태스크 삭제
3. DB 테이블:
   - `issue_history` - 변경 이력
   - `subtasks` - 서브태스크
4. API 구현:
   - `GET /api/issues/[issueId]/history` - 히스토리
   - `POST /api/issues/[issueId]/subtasks` - 서브태스크 생성
   - `PUT /api/subtasks/[subtaskId]` - 서브태스크 수정
   - `DELETE /api/subtasks/[subtaskId]` - 서브태스크 삭제

**인수 조건:**
- [ ] 상태 변경 시 자동으로 히스토리 기록
- [ ] 서브태스크 완료 시 진행률 업데이트
- [ ] 이슈 카드에 서브태스크 진행률 표시 (2/5)

---

## Epic 4: 칸반 보드 & 댓글

**목표:** Drag & Drop 칸반 보드 및 이슈 댓글 시스템 구현
**FR 커버리지:** FR-050~054, FR-060~063
**의존성:** Epic 1 완료 후 병렬 진행 가능
**스토리 순서:** 순차적 (4.1 → 4.2 → 4.3 → 4.4 → 4.5)

### Story 4.1: 칸반 보드 기본 UI

**FR:** FR-050 (칸반 보드 표시)

**작업 내용:**
1. 칸반 보드 뷰 (`/projects/[projectId]/board`)
   - View Tabs: Board | List | Timeline
2. 기본 컬럼 구조:
   - Backlog (회색)
   - In Progress (파랑)
   - Review (보라)
   - Done (초록)
3. 이슈 카드 컴포넌트:
   - 이슈 ID
   - 제목
   - 우선순위 배지
   - 라벨 태그
   - 담당자 아바타
   - 마감일
   - 서브태스크 진행률
4. 컬럼 헤더:
   - 컬럼명
   - 이슈 개수 배지
   - 메뉴 버튼 (...)
5. 컬럼별 "Add Issue" 버튼

**인수 조건:**
- [ ] 프로젝트 페이지에서 Board 탭 클릭 시 칸반 뷰 표시
- [ ] 이슈가 올바른 상태 컬럼에 표시
- [ ] 컬럼별 이슈 개수 정확히 표시

---

### Story 4.2: Drag & Drop

**FR:** FR-051 (컬럼 간 이동), FR-052 (순서 변경)

**작업 내용:**
1. Drag & Drop 라이브러리 설정 (@dnd-kit/core)
2. 이슈 카드 드래그:
   - 드래그 시작 시 시각적 피드백 (회전, 그림자)
   - 드래그 중 원본 위치에 placeholder
3. 컬럼 간 이동:
   - 다른 컬럼에 드롭 시 상태 자동 변경
   - API 호출 및 낙관적 업데이트
4. 같은 컬럼 내 순서 변경:
   - 드롭 위치에 따른 순서 업데이트
   - `position` 필드 또는 Fractional Indexing
5. 터치 디바이스 지원
6. API 구현:
   - `PUT /api/issues/[issueId]/move` - 이동 (상태 + 순서)

**인수 조건:**
- [ ] 카드 드래그 시 시각적 피드백 표시
- [ ] 다른 컬럼 드롭 시 상태 즉시 변경
- [ ] 같은 컬럼 내 순서 변경 유지
- [ ] 모바일 터치 드래그 동작

---

### Story 4.3: 커스텀 컬럼 & WIP Limit

**FR:** FR-053 (커스텀 컬럼), FR-054 (WIP Limit)

**작업 내용:**
1. 커스텀 상태 (컬럼) 관리:
   - 프로젝트 설정에서 상태 추가/수정/삭제
   - 상태 순서 변경 (드래그)
   - 상태별 색상 설정
2. WIP (Work In Progress) Limit:
   - 컬럼별 WIP 제한 설정
   - 제한 초과 시 시각적 경고 (빨간 테두리)
   - 제한 초과해도 이동은 허용 (경고만)
3. 상태 테이블 (`project_statuses`)
   - id, project_id, name, color, position, wip_limit
4. API 구현:
   - `GET /api/projects/[projectId]/statuses` - 상태 목록
   - `POST /api/projects/[projectId]/statuses` - 상태 추가
   - `PUT /api/statuses/[statusId]` - 상태 수정
   - `DELETE /api/statuses/[statusId]` - 상태 삭제

**인수 조건:**
- [ ] 커스텀 상태 추가 시 칸반에 새 컬럼 표시
- [ ] WIP 제한 초과 시 컬럼 헤더에 경고 표시
- [ ] 기본 상태 (Backlog, Done)는 삭제 불가

---

### Story 4.4: 댓글 CRUD

**FR:** FR-060 (작성), FR-061 (조회), FR-062 (수정), FR-063 (삭제)

**작업 내용:**
1. 이슈 상세 패널 내 댓글 섹션
2. 댓글 목록:
   - 작성자 아바타 + 이름
   - 작성 시간 (2 hours ago)
   - 댓글 내용
   - 수정/삭제 버튼 (본인 댓글만)
3. 댓글 작성:
   - 텍스트 입력 (마크다운 지원)
   - Submit 버튼
4. 댓글 수정:
   - 인라인 편집 모드
   - 저장/취소 버튼
5. 댓글 삭제:
   - 확인 후 삭제
6. API 구현:
   - `GET /api/issues/[issueId]/comments` - 목록
   - `POST /api/issues/[issueId]/comments` - 작성
   - `PUT /api/comments/[commentId]` - 수정
   - `DELETE /api/comments/[commentId]` - 삭제

**인수 조건:**
- [ ] 댓글 작성 후 목록에 즉시 표시
- [ ] 본인 댓글만 수정/삭제 버튼 표시
- [ ] 댓글 개수 이슈 상세에 표시 (Comments (3))

---

### Story 4.5: 뷰 전환 & UX 개선

**FR:** 없음 (UX 개선)

**작업 내용:**
1. 뷰 전환 탭:
   - Board (칸반) - 기본
   - List (테이블)
   - Timeline (간트 차트 - MVP에서는 placeholder)
2. 뷰 상태 저장 (localStorage)
3. 칸반 UX 개선:
   - 빈 컬럼 시 "No issues" 메시지
   - 카드 hover 효과
   - 키보드 단축키 (n: 새 이슈)
4. 필터 바 통합 (검색, 필터)
5. 반응형 칸반:
   - 모바일에서 가로 스크롤
   - 축소된 Sidebar

**인수 조건:**
- [ ] Board/List 뷰 전환 동작
- [ ] 뷰 선택 상태 새로고침 후에도 유지
- [ ] 모바일에서 가로 스크롤로 모든 컬럼 접근 가능

---

## Epic 5: AI & 대시보드 & 알림

**목표:** AI 기능, 프로젝트 통계 대시보드, 인앱 알림 시스템 구현
**FR 커버리지:** FR-040~045, FR-080~082, FR-090~091
**의존성:** Epic 1 완료 후 병렬 진행 가능
**스토리 순서:** 순차적 (5.1 → 5.2 → 5.3 → 5.4 → 5.5)

### Story 5.1: AI 요약 & 제안

**FR:** FR-040 (AI Summary), FR-041 (AI Suggestion)

**작업 내용:**
1. AI 서비스 설정:
   - OpenAI API 또는 Anthropic Claude API 연동
   - API 키 환경변수 설정
   - AI 서비스 추상화 레이어
2. AI Summary (이슈 설명 요약):
   - 이슈 상세 패널에 AI Panel 추가
   - "Generate Summary" 버튼
   - 요약 결과 표시 (그라데이션 배경)
   - "Regenerate" 버튼
3. AI Suggestion (해결 전략 제안):
   - "Get Suggestions" 버튼
   - 해결 방법 리스트 형태로 표시
4. 로딩 상태 및 에러 처리
5. API 구현:
   - `POST /api/ai/summary` - 요약 생성
   - `POST /api/ai/suggestions` - 제안 생성

**인수 조건:**
- [ ] AI Summary 버튼 클릭 시 요약 생성 (3초 이내)
- [ ] 요약 결과가 AI Panel에 표시
- [ ] API 에러 시 사용자 친화적 에러 메시지

---

### Story 5.2: AI 자동 분류 & 중복 탐지

**FR:** FR-043 (Auto-Label), FR-044 (중복 탐지)

**작업 내용:**
1. AI 자동 라벨링:
   - 이슈 생성 시 제목/설명 분석
   - 추천 라벨 표시 (Bug, Feature 등)
   - 사용자가 수락/거절 가능
2. 중복 이슈 탐지:
   - 이슈 생성 시 유사 이슈 검색
   - 유사도 기반 후보 목록 표시
   - "Similar Issues" 섹션
   - 링크로 기존 이슈 참조 가능
3. Embedding 기반 유사도 검색 (선택적):
   - 이슈 생성 시 embedding 저장
   - pgvector 또는 간단한 텍스트 유사도
4. API 구현:
   - `POST /api/ai/classify` - 자동 분류
   - `POST /api/ai/duplicates` - 중복 탐지

**인수 조건:**
- [ ] 이슈 생성 시 추천 라벨 표시
- [ ] 유사 이슈 있을 경우 경고 표시
- [ ] 중복 탐지 결과 무시하고 생성 가능

---

### Story 5.3: 대시보드

**FR:** FR-080 (프로젝트 대시보드), FR-081 (개인 대시보드), FR-082 (팀 통계)

**작업 내용:**
1. 개인 대시보드 (`/dashboard`):
   - 내 이슈 통계 (In Progress, Due Soon, Completed)
   - 마감 임박 이슈 목록 (Next 7 Days)
   - 최근 활동
2. 프로젝트 대시보드 (`/projects/[projectId]/dashboard`):
   - 프로젝트 진행률 (완료/전체)
   - 상태별 이슈 분포 (Pie Chart)
   - 활동 트렌드 (Line Chart)
3. 팀 통계 (`/teams/[teamId]/stats`):
   - 멤버별 이슈 할당 현황
   - 프로젝트별 진행률
4. 차트 라이브러리 (recharts 또는 chart.js)
5. API 구현:
   - `GET /api/dashboard/personal` - 개인 통계
   - `GET /api/projects/[projectId]/stats` - 프로젝트 통계
   - `GET /api/teams/[teamId]/stats` - 팀 통계

**인수 조건:**
- [ ] 로그인 후 기본 랜딩이 개인 대시보드
- [ ] 차트 데이터 실시간 반영
- [ ] 마감 임박 이슈 클릭 시 해당 이슈로 이동

---

### Story 5.4: 알림 시스템

**FR:** FR-090 (인앱 알림), FR-091 (읽음 처리)

**작업 내용:**
1. 알림 생성 트리거:
   - 이슈 담당자 지정
   - 이슈 댓글 작성
   - 마감일 임박 (D-1, D-day)
   - 팀 초대
   - 이슈 상태 변경
2. Sidebar 알림 배지:
   - 읽지 않은 알림 개수
3. 알림 센터 (`/notifications`):
   - 알림 목록 (타임라인)
   - 읽음/안읽음 구분 (파란 점)
   - 알림 타입별 아이콘/색상
   - "Mark all as read" 버튼
4. 알림 클릭 시 해당 페이지로 이동
5. API 구현:
   - `GET /api/notifications` - 목록
   - `PUT /api/notifications/[id]/read` - 읽음 처리
   - `PUT /api/notifications/read-all` - 전체 읽음

**인수 조건:**
- [ ] 담당자 지정 시 해당 사용자에게 알림 생성
- [ ] Sidebar 배지에 읽지 않은 알림 개수 표시
- [ ] 알림 클릭 시 관련 이슈/팀으로 이동

---

### Story 5.5: AI 고급 기능

**FR:** FR-042 (Rate Limiting), FR-045 (댓글 요약)

**작업 내용:**
1. AI Rate Limiting:
   - 사용자별 일일 AI 호출 제한 (예: 50회/일)
   - 팀별 월간 제한 (선택적)
   - 제한 도달 시 안내 메시지
   - 사용량 표시 UI
2. AI 댓글 요약:
   - 댓글이 5개 이상인 이슈에서 활성화
   - "Summarize Discussion" 버튼
   - 토론 요약 결과 표시
3. Rate Limit 테이블 (`ai_usage`):
   - user_id, date, count
4. API 구현:
   - `GET /api/ai/usage` - 사용량 조회
   - `POST /api/ai/comment-summary` - 댓글 요약

**인수 조건:**
- [ ] 일일 제한 도달 시 AI 버튼 비활성화 + 안내
- [ ] 댓글 요약 버튼 5개 이상 댓글에서만 표시
- [ ] 사용량 프로필 설정에서 확인 가능

---

## Summary

### Epic & Story 총계

| Epic | 이름 | Stories |
|------|------|---------|
| 1 | Foundation & 인증 | 6개 |
| 2 | 팀 관리 | 5개 |
| 3 | 프로젝트 & 이슈 관리 | 6개 |
| 4 | 칸반 보드 & 댓글 | 5개 |
| 5 | AI & 대시보드 & 알림 | 5개 |
| **Total** | | **27개** |

### FR Coverage 검증

| FR 범위 | Epic | 상태 |
|---------|------|------|
| FR-001~007 | Epic 1 | ✅ 완료 |
| FR-010~019 | Epic 2 | ✅ 완료 |
| FR-020~027 | Epic 3 | ✅ 완료 |
| FR-030~039-2 | Epic 3 | ✅ 완료 |
| FR-040~045 | Epic 5 | ✅ 완료 |
| FR-050~054 | Epic 4 | ✅ 완료 |
| FR-060~063 | Epic 4 | ✅ 완료 |
| FR-070~071 | Epic 1 | ✅ 완료 |
| FR-080~082 | Epic 5 | ✅ 완료 |
| FR-090~091 | Epic 5 | ✅ 완료 |

**58개 FR 중 58개 커버 = 100% 커버리지**

### 병렬 진행 가이드

```
Week 1: Epic 1 (Foundation) - 전체 팀 협업
        ↓
Week 2+: 병렬 진행
        ├── 개발자 A: Epic 2 (팀 관리)
        ├── 개발자 B: Epic 3 (프로젝트 & 이슈)
        ├── 개발자 C: Epic 4 (칸반 & 댓글)
        └── 개발자 D: Epic 5 (AI & 대시보드)
```

---

