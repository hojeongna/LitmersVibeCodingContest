# Story 5.5: AI 고급 기능

Status: done

## Story

As a **팀 멤버**,
I want **AI 사용량 제한과 댓글 요약 기능을 사용할 수 있도록**,
so that **AI 리소스를 효율적으로 관리하고 긴 토론을 빠르게 파악할 수 있다**.

## Acceptance Criteria

### AC-1: AI Rate Limiting (FR-042)
- [x] 사용자별 분당 10회 AI 호출 제한
- [x] 사용자별 일당 100회 AI 호출 제한
- [x] 제한 도달 시 AI 버튼 비활성화
- [x] 친화적 안내 메시지 표시:
  - "분당 제한 도달: X초 후 다시 시도하세요"
  - "일일 제한 도달: 내일 다시 시도하세요"
- [ ] 현재 사용량 표시 (선택): "오늘 X/100 사용"

### AC-2: AI 댓글 요약 (FR-045)
- [x] 댓글이 5개 이상인 이슈에서만 "댓글 요약" 버튼 활성화
- [x] 버튼 클릭 시 전체 댓글 스레드 요약 생성
- [x] 요약 결과 표시:
  - 논의 요약 (3~5문장)
  - 주요 결정 사항 (있는 경우)
- [x] 새 댓글 추가 시 캐시 무효화
- [x] 요약 결과 복사 버튼

### AC-3: Rate Limiting 구현
- [x] `ai_usage` 테이블 생성
- [x] Rate Limiter 미들웨어/유틸리티 구현
- [x] 모든 AI API에 Rate Limit 검증 적용
- [x] 429 Too Many Requests 에러 반환

### AC-4: API Endpoints
- [x] `POST /api/ai/comment-summary` - 댓글 요약
- [x] `GET /api/ai/usage` - 현재 사용량 조회

### AC-5: 사용량 표시 UI (선택)
- [ ] 프로필 설정 페이지에 AI 사용량 표시 (선택 - API만 존재)
- [ ] 또는 AI Panel 하단에 사용량 표시 (선택)

## Tasks / Subtasks

### Task 1: Rate Limiting 인프라
- [x] 1.1 `ai_usage` 테이블 마이그레이션
- [x] 1.2 `lib/ai/rate-limiter.ts` 구현

### Task 2: Rate Limiter 구현
- [x] 2.1 분당 사용량 체크 함수
- [x] 2.2 일당 사용량 체크 함수
- [x] 2.3 사용량 기록 함수
- [x] 2.4 남은 시간/횟수 계산 함수

### Task 3: 기존 AI API에 Rate Limit 적용
- [x] 3.1 `/api/ai/summary`에 Rate Limit 추가
- [x] 3.2 `/api/ai/suggestions`에 Rate Limit 추가
- [x] 3.3 `/api/ai/classify`에 Rate Limit 추가
- [x] 3.4 `/api/ai/duplicates`에 Rate Limit 추가

### Task 4: 댓글 요약 API
- [x] 4.1 `app/api/ai/comment-summary/route.ts` 생성
- [x] 4.2 댓글 5개 이상 검증
- [x] 4.3 댓글 목록 조회 및 프롬프트 생성
- [x] 4.4 OpenAI 호출 및 결과 파싱
- [x] 4.5 캐싱 (댓글 hash 기반)

### Task 5: 댓글 요약 UI
- [x] 5.1 `components/ai/comment-summary.tsx` 생성
- [x] 5.2 이슈 상세 패널 댓글 섹션에 버튼 추가
- [x] 5.3 요약 결과 표시 모달/패널
- [x] 5.4 복사 버튼 구현

### Task 6: 사용량 조회 API
- [x] 6.1 `app/api/ai/usage/route.ts` 생성
- [x] 6.2 분당/일당 사용량 반환

### Task 7: Rate Limit 에러 UI
- [x] 7.1 AI 버튼에 disabled 상태 처리
- [x] 7.2 에러 메시지 표시 컴포넌트
- [ ] 7.3 재시도 가능 시간 카운트다운 (선택)

## Dev Notes

### Rate Limiter 구현

```typescript
// lib/ai/rate-limiter.ts
const LIMITS = {
  PER_MINUTE: 10,
  PER_DAY: 100
}

interface RateLimitResult {
  allowed: boolean
  remaining: { minute: number; daily: number }
  resetIn?: { minute: number; daily: number } // seconds
}

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const now = new Date()
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
  const startOfDay = new Date(now.setHours(0, 0, 0, 0))

  const [minuteResult, dailyResult] = await Promise.all([
    supabase
      .from('ai_usage')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', oneMinuteAgo.toISOString()),
    supabase
      .from('ai_usage')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', startOfDay.toISOString())
  ])

  const minuteCount = minuteResult.count || 0
  const dailyCount = dailyResult.count || 0

  const allowed = minuteCount < LIMITS.PER_MINUTE && dailyCount < LIMITS.PER_DAY

  return {
    allowed,
    remaining: {
      minute: Math.max(0, LIMITS.PER_MINUTE - minuteCount),
      daily: Math.max(0, LIMITS.PER_DAY - dailyCount)
    },
    resetIn: allowed ? undefined : {
      minute: 60 - Math.floor((Date.now() - oneMinuteAgo.getTime()) / 1000),
      daily: Math.floor((new Date().setHours(24, 0, 0, 0) - Date.now()) / 1000)
    }
  }
}

export async function recordUsage(userId: string, actionType: string) {
  await supabase.from('ai_usage').insert({
    user_id: userId,
    action_type: actionType
  })
}
```

### 댓글 요약 프롬프트

```typescript
// lib/ai/prompts.ts
export const COMMENT_SUMMARY_PROMPT = `
You are an AI assistant for an issue tracking system. Summarize the discussion thread in Korean.

Issue Title: {title}
Issue Description: {description}

Comments:
{comments}

Provide:
1. A summary of the discussion (3-5 sentences)
2. Key decisions or action items (if any)

Format:
## 토론 요약
(요약 내용)

## 주요 결정 사항
- (결정 1)
- (결정 2)
(결정 사항이 없으면 "명시적인 결정 사항 없음"으로 표시)
`
```

### 에러 응답 형식

```typescript
// Rate Limit 에러
{
  success: false,
  error: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: '분당 AI 사용 제한에 도달했습니다',
    details: {
      type: 'minute', // or 'daily'
      resetIn: 45, // seconds
      remaining: { minute: 0, daily: 85 }
    }
  }
}

// 댓글 부족 에러
{
  success: false,
  error: {
    code: 'INSUFFICIENT_COMMENTS',
    message: '댓글이 5개 이상일 때만 요약할 수 있습니다',
    details: {
      required: 5,
      current: 3
    }
  }
}
```

### 댓글 요약 UI

```tsx
// components/ai/comment-summary.tsx
export function CommentSummary({ issueId, commentCount }: Props) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const isEnabled = commentCount >= 5

  const handleSummarize = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/ai/comment-summary', {
        method: 'POST',
        body: JSON.stringify({ issue_id: issueId })
      })
      const data = await res.json()
      setSummary(data.data.summary)
    } catch (error) {
      toast.error('요약 생성에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleSummarize}
        disabled={!isEnabled || isLoading}
        className="btn-ai"
      >
        {isLoading ? <Spinner /> : <Sparkles className="w-4 h-4" />}
        댓글 요약
        {!isEnabled && <span className="text-xs opacity-70">({commentCount}/5)</span>}
      </button>

      {summary && (
        <div className="ai-panel mt-3">
          <div className="flex justify-between items-center mb-2">
            <span className="ai-title">AI 댓글 요약</span>
            <button onClick={() => navigator.clipboard.writeText(summary)}>
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm whitespace-pre-wrap">{summary}</div>
        </div>
      )}
    </div>
  )
}
```

### References

- [Source: docs/prd.md#FR-042] - AI Rate Limiting 요구사항
- [Source: docs/prd.md#FR-045] - 댓글 요약 요구사항
- [Source: docs/sprint-artifacts/tech-spec-epic-5.md#FR-042] - Rate Limit AC
- [Source: docs/sprint-artifacts/tech-spec-epic-5.md#FR-045] - 댓글 요약 AC
- [Source: docs/sprint-artifacts/tech-spec-epic-5.md#Security] - Rate Limiting 보안

## Dev Agent Record

### Context Reference
### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
- supabase/migrations/005_create_ai_usage.sql
- lib/supabase/types.ts
- lib/ai/rate-limiter.ts
- lib/ai/prompts.ts
- app/api/ai/summary/route.ts
- app/api/ai/suggestions/route.ts
- app/api/ai/classify/route.ts
- app/api/ai/duplicates/route.ts
- app/api/ai/comment-summary/route.ts
- app/api/ai/usage/route.ts
- components/ai/comment-summary.tsx

---

## Senior Developer Review (AI)

### Reviewer: hojeong
### Date: 2025-11-29
### Outcome: **APPROVE**

### Summary
Story 5.5의 AI 고급 기능(Rate Limiting, 댓글 요약)이 성공적으로 구현되었습니다. Rate Limiter가 모든 AI API에 적용되어 있고, 댓글 요약 기능은 5개 이상 댓글 검증, 캐싱, 복사 기능 모두 포함되어 있습니다.

### Key Findings

**LOW Severity:**
- `lib/ai/rate-limiter.ts:23` - `now.setHours(0, 0, 0, 0)`가 now 객체 자체를 수정함. 의도된 동작이지만 가독성을 위해 별도 변수 사용 권장.

### Acceptance Criteria Coverage

| AC# | Description | Status | Evidence |
|-----|-------------|--------|----------|
| AC-1 | Rate Limiting - 분당 10회, 일당 100회, 버튼 비활성화, 안내 메시지 | ✅ IMPLEMENTED | `lib/ai/rate-limiter.ts:3-6,41`, `app/api/ai/summary/route.ts:22-40` |
| AC-2 | 댓글 요약 - 5개 이상, 요약 결과, 복사 버튼 | ✅ IMPLEMENTED | `app/api/ai/comment-summary/route.ts:98-113`, `components/ai/comment-summary.tsx:57-67` |
| AC-3 | Rate Limiting 구현 - ai_usage 테이블, 미들웨어, 429 에러 | ✅ IMPLEMENTED | `supabase/migrations/005_create_ai_usage.sql`, `lib/ai/rate-limiter.ts` |
| AC-4 | API Endpoints - comment-summary, usage | ✅ IMPLEMENTED | 2 API route files verified |
| AC-5 | 사용량 표시 UI (선택) | ⚠️ PARTIAL | API 존재, UI 미구현 (선택 사항) |

**Summary: 4 of 5 acceptance criteria fully implemented, 1 optional**

### Task Completion Validation

| Task | Marked As | Verified As | Evidence |
|------|-----------|-------------|----------|
| 1.1 ai_usage 테이블 마이그레이션 | [x] | ✅ VERIFIED | `supabase/migrations/005_create_ai_usage.sql` |
| 1.2 rate-limiter.ts | [x] | ✅ VERIFIED | `lib/ai/rate-limiter.ts:1-62` |
| 2.1 분당 사용량 체크 | [x] | ✅ VERIFIED | `lib/ai/rate-limiter.ts:25-30` |
| 2.2 일당 사용량 체크 | [x] | ✅ VERIFIED | `lib/ai/rate-limiter.ts:31-36` |
| 2.3 사용량 기록 함수 | [x] | ✅ VERIFIED | `lib/ai/rate-limiter.ts:56-62` |
| 2.4 남은 시간/횟수 계산 | [x] | ✅ VERIFIED | `lib/ai/rate-limiter.ts:38-53` |
| 3.1-3.4 기존 AI API Rate Limit | [x] | ✅ VERIFIED | 4 API files include `checkRateLimitWithDetails` |
| 4.1 comment-summary API | [x] | ✅ VERIFIED | `app/api/ai/comment-summary/route.ts:1-189` |
| 4.2 댓글 5개 이상 검증 | [x] | ✅ VERIFIED | `app/api/ai/comment-summary/route.ts:98-113` |
| 4.3 댓글 조회 및 프롬프트 | [x] | ✅ VERIFIED | `app/api/ai/comment-summary/route.ts:91-97,139-156` |
| 4.4 OpenAI 호출 | [x] | ✅ VERIFIED | `app/api/ai/comment-summary/route.ts:139-156` |
| 4.5 캐싱 | [x] | ✅ VERIFIED | `app/api/ai/comment-summary/route.ts:115-136,158-169` |
| 5.1 comment-summary.tsx | [x] | ✅ VERIFIED | `components/ai/comment-summary.tsx:1-116` |
| 5.2 댓글 섹션에 버튼 추가 | [x] | ✅ VERIFIED | `components/issues/comment-section.tsx:56-57` |
| 5.3 요약 결과 표시 | [x] | ✅ VERIFIED | `components/ai/comment-summary.tsx:87-113` |
| 5.4 복사 버튼 | [x] | ✅ VERIFIED | `components/ai/comment-summary.tsx:96-107` |
| 6.1-6.2 usage API | [x] | ✅ VERIFIED | `app/api/ai/usage/route.ts:1-39` |
| 7.1-7.2 Rate Limit 에러 UI | [x] | ✅ VERIFIED | `components/ai/comment-summary.tsx:33-39` |

**Summary: 18 of 18 completed tasks verified, 0 questionable, 0 false completions**

### Test Coverage and Gaps
- Rate Limiter 로직 unit 테스트 권장
- 캐싱 무효화 테스트 권장

### Architectural Alignment
- ✅ Rate Limiting 패턴 (ai_usage 테이블 사용)
- ✅ 캐싱 패턴 (ai_cache 테이블, content hash 기반)
- ✅ 재시도 로직 (withRetry 사용)

### Security Notes
- ✅ Rate Limiting으로 API 남용 방지
- ✅ 팀 멤버십 검증
- ✅ 429 상태 코드 반환

### Best-Practices and References
- [OpenAI Rate Limits](https://platform.openai.com/docs/guides/rate-limits)
- [API Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)

### Action Items

**Advisory Notes:**
- Note: 사용량 표시 UI(AC-5)는 선택 사항으로, 추후 프로필 페이지나 AI Panel에 추가 가능
- Note: `startOfDay` 계산에서 `now.setHours()`가 now 객체를 수정하므로 별도 변수 사용 권장

---

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2025-11-29 | 1.0 | Senior Developer Review notes appended - APPROVED |
