# Story 5.1: AI 요약 & 제안

Status: review

## Story

As a **팀 멤버**,
I want **이슈의 AI 요약과 해결 전략 제안을 받을 수 있도록**,
so that **복잡한 이슈를 빠르게 파악하고 효과적인 해결 방향을 찾을 수 있다**.

## Acceptance Criteria

### AC-1: AI 서비스 기반 구축
- [ ] OpenAI 클라이언트 설정 (`lib/ai/openai-client.ts`)
- [ ] API 키 환경변수 검증 (`OPENAI_API_KEY`)
- [ ] AI 프롬프트 템플릿 관리 (`lib/ai/prompts.ts`)
- [ ] 에러 핸들링 및 재시도 로직 구현 (최대 3회, exponential backoff)

### AC-2: AI Summary 기능 (FR-040)
- [ ] 이슈 상세 페이지에 AI Panel 컴포넌트 표시
- [ ] "AI 요약" 버튼 클릭 시 요약 생성
- [ ] description이 10자 미만이면 AI 버튼 비활성화 + 안내 메시지
- [ ] 로딩 중 스피너/스켈레톤 표시
- [ ] 요약 결과를 그라데이션 배경 패널에 표시
- [ ] "Regenerate" 버튼으로 요약 재생성 가능
- [ ] 생성된 요약을 DB에 캐싱 (issues.ai_summary 컬럼)
- [ ] description 수정 시 캐시 무효화

### AC-3: AI Suggestion 기능 (FR-041)
- [ ] "Get Suggestions" 버튼으로 해결 전략 요청
- [ ] 해결 방법을 리스트 형태로 표시
- [ ] 제안 결과를 DB에 캐싱

### AC-4: API Endpoint 구현
- [ ] `POST /api/ai/summary` - 이슈 요약 생성
- [ ] `POST /api/ai/suggestions` - 해결 전략 제안
- [ ] 팀 멤버십 검증 (FR-070)
- [ ] 에러 시 적절한 에러 코드 및 메시지 반환

### AC-5: UI/UX Linear Productivity 테마 적용
- [ ] AI Panel 그라데이션 배경: `linear-gradient(135deg, rgba(91, 95, 199, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)`
- [ ] AI 아이콘 그라데이션: `linear-gradient(135deg, #5B5FC7 0%, #3B82F6 100%)`
- [ ] 버튼 스타일: Primary (#5B5FC7), AI 그라데이션 버튼
- [ ] 로딩 상태: 스피너 + "AI is generating..." 텍스트
- [ ] 에러 상태: 빨간색 Alert 컴포넌트

## Tasks / Subtasks

### Task 1: AI 서비스 모듈 구축 (AC: #1)
- [x] 1.1 `lib/ai/openai-client.ts` 생성 - OpenAI 클라이언트 초기화
- [x] 1.2 `lib/ai/prompts.ts` 생성 - 프롬프트 템플릿 정의
  - ISSUE_SUMMARY 프롬프트 (한국어 지원)
  - ISSUE_SUGGESTION 프롬프트
- [x] 1.3 `lib/ai/utils.ts` 생성 - 재시도 로직, 타임아웃 처리
- [x] 1.4 환경변수 검증 및 에러 핸들링

### Task 2: DB 스키마 확장 (AC: #2, #3)
- [x] 2.1 issues 테이블에 AI 컬럼 추가 마이그레이션 생성
  ```sql
  ALTER TABLE issues ADD COLUMN IF NOT EXISTS ai_summary TEXT;
  ALTER TABLE issues ADD COLUMN IF NOT EXISTS ai_suggestions JSONB DEFAULT '[]';
  ALTER TABLE issues ADD COLUMN IF NOT EXISTS ai_generated_at TIMESTAMPTZ;
  ```
- [x] 2.2 TypeScript 타입 재생성 (`supabase gen types typescript`)

### Task 3: AI Summary API 구현 (AC: #2, #4)
- [x] 3.1 `app/api/ai/summary/route.ts` 생성
- [x] 3.2 인증 및 팀 멤버십 검증
- [x] 3.3 description 길이 검증 (10자 이상)
- [x] 3.4 OpenAI ChatCompletion 호출
- [x] 3.5 결과 DB 저장 및 캐싱
- [x] 3.6 에러 응답 처리 (RATE_LIMIT, DESCRIPTION_TOO_SHORT, AI_ERROR)

### Task 4: AI Suggestions API 구현 (AC: #3, #4)
- [x] 4.1 `app/api/ai/suggestions/route.ts` 생성
- [x] 4.2 인증 및 검증 로직
- [x] 4.3 OpenAI 해결 전략 프롬프트 호출
- [x] 4.4 결과 파싱 및 저장

### Task 5: AI Panel 컴포넌트 구현 (AC: #2, #3, #5)
- [x] 5.1 `components/ai/ai-summary-panel.tsx` 생성
  - AI Panel 컨테이너 (그라데이션 배경)
  - AI 아이콘 + 제목
  - 요약 콘텐츠 영역
  - 액션 버튼 (Regenerate, Get Suggestions)
- [x] 5.2 `components/ai/ai-loading.tsx` 생성 - 로딩 상태 UI
- [x] 5.3 `components/ai/ai-button.tsx` 생성 - AI 버튼 컴포넌트 (그라데이션)

### Task 6: 이슈 상세 패널에 AI Panel 통합 (AC: #2, #3)
- [x] 6.1 `components/issues/issue-detail-panel.tsx` 수정
- [x] 6.2 AI Panel을 description 섹션 아래에 배치
- [x] 6.3 AI 요약/제안 상태 관리 (TanStack Query 또는 useState)
- [x] 6.4 description 변경 시 캐시 무효화 처리

### Task 7: 테스트 및 검증
- [x] 7.1 AI Summary API 수동 테스트
- [x] 7.2 AI Suggestions API 수동 테스트
- [x] 7.3 UI 동작 검증 (로딩, 성공, 에러 상태)
- [x] 7.4 description 10자 미만 시 비활성화 검증

## Dev Notes

### 아키텍처 패턴

**AI 서비스 레이어 구조:**
```
lib/ai/
├── openai-client.ts    # OpenAI SDK 초기화
├── prompts.ts          # 프롬프트 템플릿
├── utils.ts            # 유틸리티 (재시도, 타임아웃)
└── index.ts            # 통합 export
```

**API Route 패턴:**
```typescript
// app/api/ai/summary/route.ts
export async function POST(request: Request) {
  // 1. 인증 확인
  // 2. 팀 멤버십 검증
  // 3. 입력 검증 (description 길이)
  // 4. OpenAI 호출
  // 5. 결과 저장
  // 6. 응답 반환
}
```

### UX 디자인 가이드라인 (ux-design-directions.html 기반)

**AI Panel 스타일:**
```css
.ai-panel {
  background: linear-gradient(135deg, rgba(91, 95, 199, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
  border: 1px solid rgba(91, 95, 199, 0.2);
  border-radius: 8px;
  padding: 12px;
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-icon {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #5B5FC7 0%, #3B82F6 100%);
  border-radius: 4px;
}

.ai-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: #5B5FC7;
}

.ai-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid rgba(91, 95, 199, 0.3);
  background: white;
  color: #5B5FC7;
}

.ai-btn:hover {
  background: #5B5FC7;
  color: white;
}
```

**컬러 테마 (ux-color-themes.html 기반):**
- Primary: #5B5FC7 (Indigo)
- Accent: #3B82F6 (Blue)
- Text Primary: #18181B (Zinc 900)
- Text Secondary: #71717A (Zinc 500)
- Background: #FAFAFA (Zinc 50)
- Surface: #FFFFFF
- Border: #E4E4E7 (Zinc 200)
- Success: #22C55E
- Warning: #F59E0B
- Error: #EF4444

### 프롬프트 템플릿

**ISSUE_SUMMARY 프롬프트:**
```
You are an AI assistant for an issue tracking system. Summarize the following issue in 2-4 sentences in Korean.
Focus on:
1. The main problem or feature being described
2. Key requirements or constraints
3. Expected outcome

Issue Title: {title}
Issue Description: {description}

Provide a concise summary that helps team members quickly understand the issue.
```

**ISSUE_SUGGESTION 프롬프트:**
```
You are an AI assistant for an issue tracking system. Based on the following issue, suggest 3-5 practical approaches to resolve it in Korean.

Issue Title: {title}
Issue Description: {description}

Provide actionable suggestions as a numbered list, each with:
1. A clear action step
2. Brief explanation of why this approach helps

Format each suggestion on its own line.
```

### 기술 제약사항

1. **description 10자 제한**: PRD FR-040에 명시된 요구사항
2. **서버 사이드 AI 호출**: API 키 보호를 위해 반드시 서버에서만 호출
3. **캐싱 전략**: description 해시 기반 무효화
4. **타임아웃**: OpenAI 호출 10초 타임아웃

### 테스트 데이터

```typescript
// 테스트용 이슈 데이터
const testIssue = {
  title: "로그인 버튼이 모바일에서 정렬이 안됨",
  description: "모바일 화면(375px 이하)에서 로그인 버튼이 중앙 정렬되지 않고 왼쪽으로 치우쳐 있습니다. 반응형 스타일 수정이 필요합니다."
}
```

### Project Structure Notes

- AI 관련 컴포넌트는 `components/ai/` 디렉토리에 배치
- API Routes는 `app/api/ai/` 디렉토리에 배치
- 서비스 레이어는 `lib/ai/` 디렉토리에 배치
- 기존 `lib/supabase/` 패턴을 따라 클라이언트/서버 분리

### References

- [Source: docs/architecture.md#AI-Integration] - OpenAI GPT-5-nano 사용 결정
- [Source: docs/epics.md#Story-5.1] - AI 요약 & 제안 스토리 정의
- [Source: docs/sprint-artifacts/tech-spec-epic-5.md#FR-040] - AI Summary 인수 조건
- [Source: docs/sprint-artifacts/tech-spec-epic-5.md#FR-041] - AI Suggestion 인수 조건
- [Source: docs/prd.md#FR-040] - AI Summary 요구사항 (10자 이상, 캐싱)
- [Source: docs/prd.md#FR-041] - AI Suggestion 요구사항
- [Source: docs/ux-design-directions.html] - AI Panel UI 목업
- [Source: docs/ux-color-themes.html] - Linear Productivity 컬러 테마

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

- lib/ai/openai-client.ts
- lib/ai/prompts.ts
- lib/ai/utils.ts
- supabase/migrations/003_add_ai_columns.sql
- lib/supabase/types.ts
- lib/ai/rate-limiter.ts
- app/api/ai/summary/route.ts
- app/api/ai/suggestions/route.ts
- components/ai/ai-button.tsx
- components/ai/ai-loading.tsx
- components/ai/ai-summary-panel.tsx
- components/issues/issue-detail-panel.tsx

