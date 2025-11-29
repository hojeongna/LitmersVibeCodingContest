'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface CommentSummaryProps {
  issueId: string
  commentCount: number
  className?: string
}

export function CommentSummary({ issueId, commentCount, className }: CommentSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const isEnabled = commentCount >= 5

  const handleSummarize = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/ai/comment-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue_id: issueId })
      })
      
      const data = await res.json()
      
      if (!data.success) {
        if (data.error.code === 'RATE_LIMIT_EXCEEDED') {
          toast.error(data.error.message)
        } else if (data.error.code === 'INSUFFICIENT_COMMENTS') {
          toast.error(`댓글이 ${data.error.details.required}개 이상 필요합니다 (현재: ${data.error.details.current}개)`)
        } else {
          toast.error(data.error.message || '요약 생성에 실패했습니다')
        }
        return
      }
      
      setSummary(data.data.summary)
      if (data.data.cached) {
        toast.success('캐시된 요약을 불러왔습니다')
      } else {
        toast.success('댓글 요약이 생성되었습니다')
      }
    } catch (error) {
      console.error(error)
      toast.error('요약 생성에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!summary) return
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      toast.success('복사되었습니다')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('복사에 실패했습니다')
    }
  }

  return (
    <div className={cn("mt-4", className)}>
      <Button
        onClick={handleSummarize}
        disabled={!isEnabled || isLoading}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        댓글 요약
        {!isEnabled && <span className="text-xs opacity-70">({commentCount}/5)</span>}
      </Button>

      {summary && (
        <div className="mt-3 rounded-lg border bg-gradient-to-br from-purple-50 to-blue-50 p-4 dark:from-purple-950/20 dark:to-blue-950/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold text-sm text-purple-900 dark:text-purple-100">
                AI 댓글 요약
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="text-sm whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 prose prose-sm dark:prose-invert max-w-none">
            {summary}
          </div>
        </div>
      )}
    </div>
  )
}
