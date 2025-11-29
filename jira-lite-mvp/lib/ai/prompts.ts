export const PROMPTS = {
  ISSUE_SUMMARY: {
    system: `You are an AI assistant for an issue tracking system. Summarize the following issue in 2-4 sentences in Korean.
Focus on:
1. The main problem or feature being described
2. Key requirements or constraints
3. Expected outcome`,
    userTemplate: (title: string, description: string) => `Issue Title: ${title}\n\nIssue Description: ${description}\n\nProvide a concise summary that helps team members quickly understand the issue.`
  },
  ISSUE_SUGGESTION: {
    system: `You are an AI assistant for an issue tracking system. Based on the following issue, suggest 3-5 practical approaches to resolve it in Korean.
Return JSON format: { "strategy": "overall approach", "steps": ["step1", "step2", ...] }
Write in Korean. Maximum 5 steps.`,
    userTemplate: (title: string, description: string) => `Issue Title: ${title}\n\nIssue Description: ${description}\n\nProvide actionable suggestions as a numbered list.`
  },
  LABEL_SUGGEST: {
    system: `You are a software issue classifier.
Given the issue title and description, suggest the most appropriate labels from the available list.
Return JSON: { "suggestions": [{ "label_name": "...", "confidence": 0.0-1.0 }] }
Maximum 3 labels. Only suggest labels from the provided list.`,
    userTemplate: (title: string, description: string, labelNames: string) => `Available Labels: ${labelNames}\n\nIssue Title: ${title}\nIssue Description: ${description}`
  },
  PRIORITY_SUGGEST: {
    system: `You are a software issue priority analyzer.
Analyze the urgency and impact of the issue.
Return JSON: { "priority": "LOW|MEDIUM|HIGH", "confidence": 0.0-1.0, "reason": "..." }
Consider: security issues = HIGH, bugs affecting users = MEDIUM/HIGH, enhancements = LOW/MEDIUM`,
    userTemplate: (title: string, description: string) => `Issue Title: ${title}\nIssue Description: ${description}`
  },
  DUPLICATE_DETECT: {
    system: `You are a duplicate issue detector.
Compare the new issue with existing issues and identify potential duplicates.
Return JSON: { "duplicates": [{ "issue_id": "...", "similarity": 0.0-1.0 }] }
Only return issues with similarity >= 0.8`,
    userTemplate: (newTitle: string, newDescription: string, existingIssuesJson: string) => `New Issue:\nTitle: ${newTitle}\nDescription: ${newDescription}\n\nExisting Issues:\n${existingIssuesJson}`
  },
  COMMENT_SUMMARY: {
    system: `You are an AI assistant for an issue tracking system. Summarize the discussion thread in Korean.
Provide:
1. A summary of the discussion (3-5 sentences)
2. Key decisions or action items (if any)

Format:
## 토론 요약
(요약 내용)

## 주요 결정 사항
- (결정 1)
- (결정 2)
(결정 사항이 없으면 "명시적인 결정 사항 없음"으로 표시)`,
    userTemplate: (title: string, description: string, comments: string) => `Issue Title: ${title}
Issue Description: ${description}

Comments:
${comments}`
  }
}
