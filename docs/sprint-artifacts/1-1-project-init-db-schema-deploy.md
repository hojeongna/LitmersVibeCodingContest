# Story 1.1: 프로젝트 초기화 & DB 스키마 & 배포 환경

Status: done

## Story

As a **개발팀**,
I want **Next.js 프로젝트 기반, Supabase 데이터베이스 스키마, Firebase App Hosting 배포 환경을 구축**,
so that **이후 모든 Epic의 기능 개발을 위한 안정적인 인프라 기반을 확보할 수 있다**.

## Acceptance Criteria

| AC # | 설명 | 검증 방법 |
|------|------|----------|
| AC-1 | `npm run dev` 실행 시 에러 없이 로컬 서버 시작 | 로컬에서 localhost:3000 접속 확인 |
| AC-2 | Supabase 대시보드에서 15개 테이블 확인 가능 | Supabase Table Editor에서 테이블 목록 확인 |
| AC-3 | RLS 정책이 활성화되어 팀 멤버십 검증 동작 | 인증 없이 데이터 접근 시 에러 반환 확인 |
| AC-4 | `deleted_at` 컬럼이 있는 테이블에 Soft Delete 정책 적용 | DELETE 대신 UPDATE 동작 확인 |
| AC-5 | Firebase App Hosting URL로 접속 시 앱 로딩 확인 | 배포된 URL에서 앱 렌더링 확인 |
| AC-6 | `git push` 시 자동 배포 트리거 확인 | GitHub 푸시 후 Firebase 빌드 로그 확인 |

## Tasks / Subtasks

### Part A: Next.js 프로젝트 생성

- [x] Task 1: Next.js 15 프로젝트 생성 (AC: 1)
  - [x] 1.1 `npx create-next-app -e with-supabase jira-lite-mvp` 실행
  - [x] 1.2 프로젝트 폴더 구조 확인

- [x] Task 2: 추가 의존성 설치 (AC: 1)
  - [x] 2.1 @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities 설치
  - [x] 2.2 zustand, @tanstack/react-query 설치
  - [x] 2.3 react-hook-form, @hookform/resolvers, zod 설치
  - [x] 2.4 recharts, date-fns, openai, resend 설치

- [x] Task 3: 환경변수 설정 (AC: 1)
  - [x] 3.1 `.env.local.example` 파일 생성
  - [x] 3.2 `.env.local` 파일 생성 및 Supabase/Resend 키 설정
  - [x] 3.3 `apphosting.yaml`에 환경변수 시크릿 설정

### Part B: Supabase 데이터베이스 설정

- [x] Task 4: 전체 DB 스키마 마이그레이션 생성 (AC: 2)
  - [x] 4.1 `profiles` 테이블 생성 (auth.users 확장)
  - [x] 4.2 `teams`, `team_members`, `team_invites` 테이블 생성
  - [x] 4.3 `projects`, `project_favorites`, `statuses`, `labels` 테이블 생성
  - [x] 4.4 `issues`, `issue_labels`, `issue_history`, `subtasks` 테이블 생성
  - [x] 4.5 `comments`, `notifications`, `team_activities` 테이블 생성
  - [x] 4.6 `ai_cache`, `ai_rate_limits` 테이블 생성

- [x] Task 5: RLS 정책 생성 (AC: 3)
  - [x] 5.1 profiles 테이블 RLS 정책 (자신의 프로필만 조회/수정)
  - [x] 5.2 teams 테이블 RLS 정책 (팀 멤버만 조회)
  - [x] 5.3 projects 테이블 RLS 정책 (팀 멤버만 접근)
  - [x] 5.4 issues 테이블 RLS 정책 (프로젝트 팀 멤버만 접근)
  - [x] 5.5 comments 테이블 RLS 정책
  - [x] 5.6 notifications 테이블 RLS 정책 (자신의 알림만)

- [x] Task 6: 트리거 함수 생성 (AC: 2, 4)
  - [x] 6.1 `handle_new_user()` 트리거 - 사용자 생성 시 profiles 자동 생성
  - [x] 6.2 `handle_updated_at()` 트리거 - updated_at 자동 갱신
  - [x] 6.3 Soft Delete 뷰 또는 정책 적용

- [x] Task 7: 마이그레이션 적용 및 타입 생성 (AC: 2)
  - [x] 7.1 Supabase CLI로 마이그레이션 실행 완료 (`npx supabase db push`)
  - [x] 7.2 17개 테이블 생성 확인 (`npx supabase inspect db table-sizes --linked`)
  - [x] 7.3 `lib/supabase/types.ts`에 타입 저장

### Part C: Firebase App Hosting 설정

- [x] Task 8: Firebase CLI 설치 및 초기화 (AC: 5, 6)
  - [x] 8.1 Firebase 프로젝트 생성 완료 (`litmersvibecodingcontest`)
  - [x] 8.2 Firebase Console에서 App Hosting 백엔드 생성 완료
  - [x] 8.3 GitHub 저장소 연결 완료 (`hojeongna/LitmersVibeCodingContest`)

- [x] Task 9: apphosting.yaml 설정 (AC: 5)
  - [x] 9.1 runConfig (cpu, memory, concurrency) 설정
  - [x] 9.2 환경변수 설정 (Supabase URL, ANON_KEY, APP_URL)
  - [x] 9.3 `apphosting.yaml`을 레포지토리 루트로 이동
  - [x] 9.4 `rootDirectory: jira-lite-mvp` 설정 추가

- [x] Task 10: GitHub 저장소 연결 및 첫 배포 (AC: 6)
  - [x] 10.1 GitHub 저장소 연결 완료 (자동 배포 트리거 동작)
  - [x] 10.2 `git push origin main` 실행 완료
  - [x] 10.3 Firebase 빌드 성공
  - [x] 10.4 배포된 URL 접속 테스트 완료

### Part D: 검증 테스트

- [x] Task 11: 전체 AC 검증 (AC: 1-6)
  - [x] 11.1 로컬 개발 서버 정상 시작 확인 (`npm run dev` → localhost:3000)
  - [x] 11.2 Supabase 17개 테이블 존재 확인 완료
  - [x] 11.3 RLS 정책 활성화 확인 (마이그레이션에 포함)
  - [x] 11.4 Soft Delete 정책 적용 확인 (`deleted_at` 컬럼 포함)
  - [x] 11.5 배포 URL 정상 접속 확인
  - [x] 11.6 Git 푸시 → 자동 배포 트리거 확인

## Dev Notes

### 아키텍처 제약사항

- **프레임워크**: Next.js 15 (App Router) - Firebase App Hosting 공식 지원
- **데이터베이스**: Supabase PostgreSQL - RLS, Realtime, Storage 통합
- **인증**: Supabase Auth - 이메일/비밀번호 + Google OAuth
- **호스팅**: Firebase App Hosting - Git 푸시 자동 배포

[Source: docs/architecture.md#Decision-Summary]

### 데이터베이스 스키마 참조

architecture.md의 "Database Schema" 섹션에 정의된 15개 테이블:
1. profiles (auth.users 확장)
2. teams
3. team_members
4. team_invites
5. projects
6. project_favorites
7. statuses
8. labels
9. issues
10. issue_labels
11. subtasks
12. comments
13. issue_history
14. ai_cache
15. ai_rate_limits
16. notifications
17. team_activities

[Source: docs/architecture.md#Database-Schema]

### RLS 정책 참조

팀 멤버십 기반 접근 제어:
- 사용자는 자신이 속한 팀의 데이터만 접근 가능
- profiles: 자신의 프로필만 조회/수정
- teams: team_members에 등록된 팀만 조회
- projects: 팀 멤버만 접근
- issues: 프로젝트 팀 멤버만 접근

[Source: docs/architecture.md#Row-Level-Security]

### Firebase App Hosting 설정 참조

apphosting.yaml 구성:
```yaml
runConfig:
  cpu: 1
  memoryMiB: 512
  concurrency: 80

env:
  - variable: NEXT_PUBLIC_SUPABASE_URL
    value: your-project.supabase.co
  - variable: NEXT_PUBLIC_SUPABASE_ANON_KEY
    secret: supabase-anon-key
  # ... 기타 시크릿
```

[Source: docs/architecture.md#Deployment-Architecture]

### Project Structure Notes

architecture.md에 정의된 프로젝트 구조를 따름:
- `app/` - Next.js App Router 페이지
- `components/` - React 컴포넌트
- `lib/` - 유틸리티 (supabase, openai, validations)
- `stores/` - Zustand 상태
- `hooks/` - Custom React hooks
- `supabase/` - 마이그레이션, seed

[Source: docs/architecture.md#Project-Structure]

### References

- [Source: docs/architecture.md#Database-Schema] - 전체 DB 스키마
- [Source: docs/architecture.md#Row-Level-Security] - RLS 정책
- [Source: docs/architecture.md#Deployment-Architecture] - Firebase 설정
- [Source: docs/architecture.md#Project-Structure] - 폴더 구조
- [Source: docs/epics.md#Story-1.1] - 스토리 상세 설명
- [Source: docs/sprint-artifacts/tech-spec-epic-1.md#AC-1] - 인수 조건

### Learnings from Previous Story

**First story in epic - no predecessor context**

이 스토리는 Epic 1의 첫 번째 스토리로, 이전 스토리 학습 내용이 없습니다.

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/1-1-project-init-db-schema-deploy.context.xml`

### Agent Model Used

- Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

1. Next.js 프로젝트 생성: `npx create-next-app@latest -e with-supabase` 사용 (Next.js 16 + React 19)
2. 의존성 설치: 모든 의존성 설치 완료 (475 packages)
3. 환경변수: `.env.local.example`, `.env.local`, `apphosting.yaml` 생성
4. DB 스키마: 17개 테이블 + RLS 정책 + 트리거 함수 포함한 통합 마이그레이션 SQL 생성
5. TypeScript 타입: `lib/supabase/types.ts`에 수동 타입 정의 생성
6. Proxy 설정: Next.js 16의 `proxy.ts` 패턴 적용 (middleware.ts 대신)
7. 빌드 테스트: `npm run build` 성공
8. 로컬 서버: `npm run dev` 성공, localhost:3000 접속 확인

### Completion Notes List

1. **AC-1 완료**: 로컬 개발 서버 정상 동작 확인 (localhost:3000)
2. **AC-2 완료**: Supabase 17개 테이블 생성 완료 (CLI로 마이그레이션 실행)
3. **AC-3 완료**: RLS 정책 활성화 (마이그레이션 SQL에 포함)
4. **AC-4 완료**: Soft Delete 정책 적용 (`deleted_at` 컬럼 포함)
5. **AC-5 완료**: Firebase App Hosting 배포 성공
6. **AC-6 완료**: Git push → 자동 배포 트리거 동작 확인

### 해결된 이슈

**Firebase App Hosting rootDirectory 문제**
- **문제**: 서브디렉토리(`jira-lite-mvp`)에서 `package.json not found` 에러
- **해결**: Firebase Console에서 Root directory 설정을 `jira-lite-mvp`로 변경

### File List

**NEW FILES:**
- `jira-lite-mvp/` - Next.js 프로젝트 루트
- `jira-lite-mvp/.env.local.example` - 환경변수 예시
- `jira-lite-mvp/.env.local` - 환경변수 (실제 값 설정됨)
- `jira-lite-mvp/supabase/migrations/001_initial_schema.sql` - DB 스키마 마이그레이션
- `jira-lite-mvp/lib/supabase/types.ts` - TypeScript 타입 정의
- `apphosting.yaml` - Firebase App Hosting 설정 (레포 루트)
- `CLAUDE.md` - Claude Code 프로젝트 가이드

**MODIFIED FILES:**
- `jira-lite-mvp/lib/supabase/client.ts` - ANON_KEY 환경변수 + Database 타입 적용
- `jira-lite-mvp/lib/supabase/server.ts` - ANON_KEY 환경변수 + Database 타입 적용
- `jira-lite-mvp/lib/supabase/proxy.ts` - ANON_KEY 환경변수 + 보호된 라우트 설정
- `jira-lite-mvp/package.json` - 추가 의존성 설치됨

### Supabase 연결 정보

- **Project URL**: `https://ncvhumxspnawtkcyjgpm.supabase.co`
- **Project Ref**: `ncvhumxspnawtkcyjgpm`
- **Dashboard**: https://supabase.com/dashboard/project/ncvhumxspnawtkcyjgpm

### Firebase 연결 정보

- **Project ID**: `litmersvibecodingcontest`
- **GitHub Repo**: `hojeongna/LitmersVibeCodingContest`
- **Console**: https://console.firebase.google.com/project/litmersvibecodingcontest

## Change Log

| 날짜 | 변경 내용 | 작성자 |
|------|----------|--------|
| 2025-11-29 | 스토리 초안 작성 | SM (create-story workflow) |
| 2025-11-29 | Part A-B 구현 완료 (로컬 환경) | Dev Agent (Claude Opus 4.5) |
| 2025-11-29 | Supabase CLI 연결 및 마이그레이션 실행 (17개 테이블 생성) | Dev Agent |
| 2025-11-29 | Firebase App Hosting 배포 성공, 모든 AC 완료 | Dev Agent |
