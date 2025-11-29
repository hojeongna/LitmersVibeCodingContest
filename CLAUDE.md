# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jira Lite MVP - AI 기반 이슈 트래킹 웹 애플리케이션. 8시간 해커톤 프로젝트.

## Tech Stack

- **Frontend/Backend**: Next.js 15 (App Router) + TypeScript
- **Database**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Hosting**: Firebase App Hosting
- **AI**: OpenAI GPT-5-nano
- **Email**: Resend
- **UI**: Tailwind CSS + shadcn/ui
- **Drag & Drop**: @dnd-kit
- **State**: Zustand + TanStack Query
- **Charts**: Recharts

## Development Commands

```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint
supabase start       # 로컬 Supabase
git push origin main # Firebase 자동 배포
```

## Project Structure (When Created)

```
jira-lite-mvp/
├── app/              # Next.js App Router 페이지
│   ├── (auth)/       # 로그인/회원가입 (공개)
│   ├── (dashboard)/  # 메인 앱 (인증 필요)
│   └── api/          # API Routes
├── components/       # React 컴포넌트
├── lib/              # 유틸리티 (supabase, openai, validations)
├── stores/           # Zustand 상태
├── hooks/            # Custom React hooks
└── supabase/         # 마이그레이션, seed
```

## BMAD Workflow

이 프로젝트는 BMAD Method를 사용합니다. 주요 슬래시 커맨드:
- `/bmad:bmm:workflows:dev-story` - 스토리 구현
- `/bmad:bmm:workflows:story-context` - 스토리 컨텍스트 조립
- `/bmad:bmm:workflows:sprint-planning` - 스프린트 상태 관리

문서 위치: `docs/` 폴더 (PRD, architecture, epics, ux-design)

## Git Commit Style

**커밋 메시지는 한 줄로 간단하게 작성:**
```
feat: 로그인 기능 구현
fix: 이슈 드래그 버그 수정
docs: README 업데이트
```

서명 라인 사용 안 함. 상세 설명 필요 없음.

## Naming Conventions

| 항목 | 규칙 | 예시 |
|------|------|------|
| 파일명 | kebab-case | `issue-card.tsx` |
| 컴포넌트 | PascalCase | `IssueCard` |
| 함수/변수 | camelCase | `handleDragEnd` |
| DB 테이블 | snake_case 복수 | `issues`, `team_members` |
| DB 컬럼 | snake_case | `created_at` |
| API Route | kebab-case | `/api/ai/auto-label` |

## Key FR Numbers Reference

- FR-001~007: 인증 (회원가입, 로그인, OAuth, 프로필)
- FR-010~019: 팀 (생성, 초대, 역할, 활동로그)
- FR-020~027: 프로젝트 (CRUD, 아카이브, 즐겨찾기)
- FR-030~039: 이슈 (CRUD, 검색, 필터, 히스토리, 서브태스크)
- FR-040~045: AI (요약, 제안, 자동분류, 중복탐지, 댓글요약)
- FR-050~054: 칸반 (Drag&Drop, 커스텀상태, WIP Limit)
- FR-060~063: 댓글
- FR-070~071: 권한/보안 (RLS, Soft Delete)
- FR-080~082: 대시보드/통계
- FR-090~091: 알림

## API Response Format

```typescript
// 성공
{ success: true, data: {...} }

// 에러
{ success: false, error: { code: 'VALIDATION_ERROR', message: '...' } }
```

## 주의사항

- 모든 API에서 팀 멤버십 검증 필수 (FR-070)
- Soft Delete 사용 (`deleted_at` 필드)
- AI 기능은 description 10자 이하면 비활성화
- AI Rate Limit: 분당 10회 또는 일당 100회
