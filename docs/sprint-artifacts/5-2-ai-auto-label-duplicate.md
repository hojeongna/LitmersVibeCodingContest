# Story 5.2: AI 자동 분류 & 중복 탐지

Status: drafted

## Story

As a **팀 멤버**,
I want **이슈 생성 시 AI가 라벨을 자동 추천하고 유사한 이슈를 탐지할 수 있도록**,
so that **이슈 분류 시간을 절약하고 중복 이슈 생성을 방지할 수 있다**.

## Acceptance Criteria

### AC-1: AI 자동 라벨링 (FR-043)
- [ ] 이슈 생성/편집 시 "AI 라벨 추천" 버튼 표시
- [ ] 클릭 시 제목/설명 기반으로 프로젝트 내 라벨 중 적합한 것 추천
- [ ] 추천 라벨 최대 3개까지 표시
- [ ] 각 라벨에 신뢰도 점수 표시 (예: 85%)
- [ ] 사용자가 추천 라벨을 원클릭으로 적용 가능
- [ ] 추천 거부하고 수동 선택 가능

### AC-2: 중복 이슈 탐지 (FR-044)
- [ ] 이슈 생성 폼에서 제목/설명 입력 시 (debounce 500ms)
- [ ] "중복 확인" 버튼 또는 자동 검사 옵션
- [ ] 유사도 80% 이상 이슈 경고 표시
- [ ] 유사 이슈 목록 (최대 3개) 표시
  - 이슈 키, 제목, 유사도 점수
- [ ] 유사 이슈 클릭 시 해당 이슈로 새 탭 이동
- [ ] 사용자가 경고 무시하고 생성 진행 가능

### AC-3: API Endpoints
- [ ] `POST /api/ai/classify` - 라벨 자동 분류
  - 입력: issue_id 또는 {title, description, project_id}
  - 출력: {labels: [{name, confidence}], priority: string}
- [ ] `POST /api/ai/duplicates` - 중복 탐지
  - 입력: {title, description, project_id}
  - 출력: {duplicates: [{issue_id, issue_key, title, similarity}]}
- [ ] 팀 멤버십 검증 필수

### AC-4: UI/UX
- [ ] 추천 라벨 칩 형태로 표시 (컬러 배경)
- [ ] 중복 경고: 노란색 Alert 컴포넌트
- [ ] 로딩 상태: 작은 스피너
- [ ] AI 아이콘과 함께 "AI Suggested" 라벨 표시

## Tasks / Subtasks

### Task 1: AI 분류 프롬프트 추가
- [ ] 1.1 `lib/ai/prompts.ts`에 LABEL_SUGGEST 프롬프트 추가
- [ ] 1.2 프로젝트 라벨 목록을 컨텍스트로 제공
- [ ] 1.3 JSON 형식 응답 파싱 로직

### Task 2: AI Classify API 구현
- [ ] 2.1 `app/api/ai/classify/route.ts` 생성
- [ ] 2.2 프로젝트 라벨 목록 조회
- [ ] 2.3 OpenAI 호출 및 라벨 매칭
- [ ] 2.4 신뢰도 점수 계산/반환

### Task 3: 중복 탐지 프롬프트 및 API
- [ ] 3.1 `lib/ai/prompts.ts`에 DUPLICATE_DETECT 프롬프트 추가
- [ ] 3.2 `app/api/ai/duplicates/route.ts` 생성
- [ ] 3.3 같은 프로젝트의 최근 이슈 50개 조회
- [ ] 3.4 텍스트 유사도 비교 (OpenAI Embedding 또는 텍스트 비교)
- [ ] 3.5 유사도 80% 이상 필터링

### Task 4: UI 컴포넌트 구현
- [ ] 4.1 `components/ai/ai-label-suggestion.tsx` - 라벨 추천 UI
- [ ] 4.2 `components/ai/duplicate-warning.tsx` - 중복 경고 UI
- [ ] 4.3 이슈 생성 폼에 통합

### Task 5: 이슈 폼 통합
- [ ] 5.1 `components/issues/issue-form.tsx` 수정
- [ ] 5.2 라벨 선택 영역에 AI 추천 버튼 추가
- [ ] 5.3 제목/설명 입력 시 중복 체크 트리거
- [ ] 5.4 debounce 적용 (500ms)

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
