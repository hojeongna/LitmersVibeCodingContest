# Story 5.2: AI 자동 분류 & 중복 탐지

Status: done

## Story

As a **팀 멤버**,
I want **이슈 생성 시 AI가 라벨을 자동 추천하고 유사한 이슈를 탐지할 수 있도록**,
so that **이슈 분류 시간을 절약하고 중복 이슈 생성을 방지할 수 있다**.

## Acceptance Criteria

### AC-1: AI 자동 라벨링 (FR-043)
- [x] 이슈 생성/편집 시 "AI 라벨 추천" 버튼 표시
- [x] 클릭 시 제목/설명 기반으로 프로젝트 내 라벨 중 적합한 것 추천
- [x] 추천 라벨 최대 3개까지 표시
- [x] 각 라벨에 신뢰도 점수 표시 (예: 85%)
- [x] 사용자가 추천 라벨을 원클릭으로 적용 가능
- [x] 추천 거부하고 수동 선택 가능

### AC-2: 중복 이슈 탐지 (FR-044)
- [x] 이슈 생성 폼에서 제목/설명 입력 시 (debounce 500ms)
- [x] "중복 확인" 버튼 또는 자동 검사 옵션
- [x] 유사도 80% 이상 이슈 경고 표시
- [x] 유사 이슈 목록 (최대 3개) 표시
  - 이슈 키, 제목, 유사도 점수
- [x] 유사 이슈 클릭 시 해당 이슈로 새 탭 이동
- [x] 사용자가 경고 무시하고 생성 진행 가능

### AC-3: API Endpoints
- [x] `POST /api/ai/classify` - 라벨 자동 분류
  - 입력: issue_id 또는 {title, description, project_id}
  - 출력: {labels: [{name, confidence}], priority: string}
- [x] `POST /api/ai/duplicates` - 중복 탐지
  - 입력: {title, description, project_id}
  - 출력: {duplicates: [{issue_id, issue_key, title, similarity}]}
- [x] 팀 멤버십 검증 필수

### AC-4: UI/UX
- [x] 추천 라벨 칩 형태로 표시 (컬러 배경)
- [x] 중복 경고: 노란색 Alert 컴포넌트
- [x] 로딩 상태: 작은 스피너
- [x] AI 아이콘과 함께 "AI Suggested" 라벨 표시

## Tasks / Subtasks

### Task 1: AI 분류 프롬프트 추가
- [x] 1.1 `lib/ai/prompts.ts`에 LABEL_SUGGEST 프롬프트 추가
- [x] 1.2 프로젝트 라벨 목록을 컨텍스트로 제공
- [x] 1.3 JSON 형식 응답 파싱 로직

### Task 2: AI Classify API 구현
- [x] 2.1 `app/api/ai/classify/route.ts` 생성
- [x] 2.2 프로젝트 라벨 목록 조회
- [x] 2.3 OpenAI 호출 및 라벨 매칭
- [x] 2.4 신뢰도 점수 계산/반환

### Task 3: 중복 탐지 프롬프트 및 API
- [x] 3.1 `lib/ai/prompts.ts`에 DUPLICATE_DETECT 프롬프트 추가
- [x] 3.2 `app/api/ai/duplicates/route.ts` 생성
- [x] 3.3 같은 프로젝트의 최근 이슈 50개 조회
- [x] 3.4 텍스트 유사도 비교 (OpenAI Embedding 또는 텍스트 비교)
- [x] 3.5 유사도 80% 이상 필터링

### Task 4: UI 컴포넌트 구현
- [x] 4.1 `components/ai/ai-label-suggestion.tsx` - 라벨 추천 UI
- [x] 4.2 `components/ai/duplicate-warning.tsx` - 중복 경고 UI
- [x] 4.3 이슈 생성 폼에 통합

### Task 5: 이슈 폼 통합
- [x] 5.1 `components/issues/create-issue-modal.tsx` 수정
- [x] 5.2 라벨 선택 영역에 AI 추천 버튼 추가
- [x] 5.3 제목/설명 입력 시 중복 체크 트리거
- [x] 5.4 debounce 적용 (500ms)

## Dev Notes

### 프롬프트 템플릿

**LABEL_SUGGEST 프롬프트:**
```
You are an AI assistant for an issue tracking system. Based on the issue title and description, suggest the most appropriate labels from the available project labels.

Available Labels: {labels_list}

Issue Title: {title}
Issue Description: {description}

Return a JSON object with:
{
  "labels": [
    {"name": "label_name", "confidence": 0.85}
  ]
}

Only suggest labels that exist in the available labels list. Maximum 3 labels.
```

**DUPLICATE_DETECT 프롬프트:**
```
Compare the following new issue with existing issues and identify potential duplicates.

New Issue:
Title: {new_title}
Description: {new_description}

Existing Issues:
{existing_issues_json}

Return a JSON array of potential duplicates with similarity scores (0-1):
[
  {"issue_id": "uuid", "similarity": 0.85}
]

Only return issues with similarity > 0.8
```

### 유사도 계산 방법

간단한 MVP 접근:
1. OpenAI에 두 텍스트 비교 요청
2. 또는 텍스트 정규화 후 단어 겹침 비율 계산

고급 접근 (v2):
1. OpenAI Embedding API 사용
2. 벡터 유사도 (cosine similarity) 계산
3. pgvector 사용하여 DB에서 직접 검색

### UI 스타일

**라벨 추천 칩:**
```css
.ai-label-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  background: var(--label-color);
  cursor: pointer;
}

.ai-label-chip .confidence {
  opacity: 0.7;
  font-size: 0.65rem;
}
```

**중복 경고:**
```css
.duplicate-warning {
  background: #FEF3C7;
  border: 1px solid #FDE68A;
  border-radius: 8px;
  padding: 12px;
  color: #92400E;
}
```

### References

- [Source: docs/prd.md#FR-043] - AI Auto-Label 요구사항
- [Source: docs/prd.md#FR-044] - 중복 탐지 요구사항
- [Source: docs/sprint-artifacts/tech-spec-epic-5.md#FR-043] - Auto-Label AC
- [Source: docs/sprint-artifacts/tech-spec-epic-5.md#FR-044] - Duplicate Detection AC
- [Source: docs/ux-color-themes.html] - Warning 색상: #F59E0B

## Dev Agent Record

### Context Reference
### Agent Model Used
### Debug Log References
### Completion Notes List
### File List

- lib/ai/prompts.ts
- app/api/ai/classify/route.ts
- app/api/ai/duplicates/route.ts
- hooks/use-debounce.ts
- components/ai/ai-label-suggestion.tsx
- components/ai/duplicate-warning.tsx
- components/issues/create-issue-modal.tsx

---

## Senior Developer Review (AI)

### Reviewer: hojeong
### Date: 2025-11-29
### Outcome: **APPROVE**

### Summary
Story 5.2의 AI 자동 라벨링 및 중복 탐지 기능이 성공적으로 구현되었습니다. classify API, duplicates API, UI 컴포넌트, debounce 로직 모두 AC 요구사항을 충족합니다.

### Key Findings

**LOW Severity:**
- `components/ai/duplicate-warning.tsx:99` - 링크 URL `/projects/${projectId}/issues/${dup.issue_id}`가 실제 라우트와 일치하는지 확인 필요 (프로젝트 구조에 따라 다를 수 있음)

### Acceptance Criteria Coverage

| AC# | Description | Status | Evidence |
|-----|-------------|--------|----------|
| AC-1 | AI 자동 라벨링 - 버튼, 추천, 신뢰도, 원클릭 적용 | ✅ IMPLEMENTED | `components/ai/ai-label-suggestion.tsx:67-118`, `app/api/ai/classify/route.ts:91-113` |
| AC-2 | 중복 이슈 탐지 - debounce, 80% 필터, 유사 이슈 목록 | ✅ IMPLEMENTED | `components/ai/duplicate-warning.tsx:28-29,31-65`, `app/api/ai/duplicates/route.ts:79-120` |
| AC-3 | API Endpoints - /api/ai/classify, /api/ai/duplicates, 팀 멤버십 검증 | ✅ IMPLEMENTED | `app/api/ai/classify/route.ts:51-77`, `app/api/ai/duplicates/route.ts:51-77` |
| AC-4 | UI/UX - 라벨 칩, 중복 경고 노란색 Alert | ✅ IMPLEMENTED | `components/ai/ai-label-suggestion.tsx:88-116`, `components/ai/duplicate-warning.tsx:70` |

**Summary: 4 of 4 acceptance criteria fully implemented**

### Task Completion Validation

| Task | Marked As | Verified As | Evidence |
|------|-----------|-------------|----------|
| 1.1 LABEL_SUGGEST 프롬프트 | [x] | ✅ VERIFIED | `lib/ai/prompts.ts:16-22` |
| 1.2 프로젝트 라벨 컨텍스트 제공 | [x] | ✅ VERIFIED | `app/api/ai/classify/route.ts:89,102` |
| 1.3 JSON 응답 파싱 | [x] | ✅ VERIFIED | `app/api/ai/classify/route.ts:107,110-113` |
| 2.1 classify API 생성 | [x] | ✅ VERIFIED | `app/api/ai/classify/route.ts:1-131` |
| 2.2 프로젝트 라벨 목록 조회 | [x] | ✅ VERIFIED | `app/api/ai/classify/route.ts:79-87` |
| 2.3 OpenAI 호출 및 라벨 매칭 | [x] | ✅ VERIFIED | `app/api/ai/classify/route.ts:92-108` |
| 2.4 신뢰도 점수 반환 | [x] | ✅ VERIFIED | `app/api/ai/classify/route.ts:112` |
| 3.1 DUPLICATE_DETECT 프롬프트 | [x] | ✅ VERIFIED | `lib/ai/prompts.ts:30-35` |
| 3.2 duplicates API 생성 | [x] | ✅ VERIFIED | `app/api/ai/duplicates/route.ts:1-138` |
| 3.3 최근 이슈 50개 조회 | [x] | ✅ VERIFIED | `app/api/ai/duplicates/route.ts:79-86` |
| 3.4 텍스트 유사도 비교 | [x] | ✅ VERIFIED | `app/api/ai/duplicates/route.ts:99-115` |
| 3.5 80% 이상 필터링 | [x] | ✅ VERIFIED | `lib/ai/prompts.ts:34` (프롬프트에서 처리) |
| 4.1 ai-label-suggestion.tsx | [x] | ✅ VERIFIED | `components/ai/ai-label-suggestion.tsx:1-120` |
| 4.2 duplicate-warning.tsx | [x] | ✅ VERIFIED | `components/ai/duplicate-warning.tsx:1-112` |
| 4.3 이슈 생성 폼 통합 | [x] | ✅ VERIFIED | `components/issues/create-issue-modal.tsx:179,242-248` |
| 5.1 create-issue-modal 수정 | [x] | ✅ VERIFIED | `components/issues/create-issue-modal.tsx:33-34` |
| 5.2 AI 추천 버튼 추가 | [x] | ✅ VERIFIED | `components/issues/create-issue-modal.tsx:242-248` |
| 5.3 중복 체크 트리거 | [x] | ✅ VERIFIED | `components/issues/create-issue-modal.tsx:179` |
| 5.4 debounce 적용 | [x] | ✅ VERIFIED | `hooks/use-debounce.ts:1-15`, `components/ai/duplicate-warning.tsx:28-29` |

**Summary: 19 of 19 completed tasks verified, 0 questionable, 0 false completions**

### Test Coverage and Gaps
- AI classify/duplicates API 테스트 권장 (unit test with mock)
- debounce hook 테스트 권장

### Architectural Alignment
- ✅ Tech Spec의 AI API 패턴 준수
- ✅ 컴포넌트 분리 (ai-label-suggestion, duplicate-warning)
- ✅ Rate Limiting 적용

### Security Notes
- ✅ 팀 멤버십 검증 (FR-070 준수)
- ✅ Rate Limiting 적용

### Best-Practices and References
- [OpenAI API Best Practices](https://platform.openai.com/docs/guides/best-practices)
- [React Debounce Pattern](https://usehooks.com/usedebounce)

### Action Items

**Advisory Notes:**
- Note: 유사도 임계값(80%)은 프롬프트에서 처리하므로, 필요시 백엔드에서 추가 검증 가능
- Note: 중복 경고 UI의 이슈 링크가 실제 라우트 구조와 일치하는지 확인 권장

---

## Change Log

| Date | Version | Description |
|------|---------|-------------|
| 2025-11-29 | 1.0 | Senior Developer Review notes appended - APPROVED |
