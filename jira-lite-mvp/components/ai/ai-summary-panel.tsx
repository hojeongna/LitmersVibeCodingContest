"use client"

import { useState } from 'react'
import { AIButton } from './ai-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, RefreshCw, Lightbulb, Copy, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AISummaryPanelProps {
  issueId: string
  title: string
  description: string
  initialSummary?: string | null
  initialSuggestions?: any
}

export function AISummaryPanel({ 
  issueId, 
  title, 
  description, 
  initialSummary, 
  initialSuggestions 
}: AISummaryPanelProps) {
  const [summary, setSummary] = useState<string | null>(initialSummary || null)
  const [suggestions, setSuggestions] = useState<any>(initialSuggestions || null)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const [copied, setCopied] = useState(false)

  const isDescriptionValid = description && description.length >= 10

  const handleGenerateSummary = async () => {
    if (!isDescriptionValid) return

    setIsGeneratingSummary(true)
    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue_id: issueId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate summary')
      }

      setSummary(data.data.summary)
      toast.success('AI summary generated successfully')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const handleGenerateSuggestions = async () => {
    setIsGeneratingSuggestions(true)
    try {
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue_id: issueId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to generate suggestions')
      }

      setSuggestions(data.data.suggestions)
      toast.success('AI suggestions generated successfully')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="space-y-4">
      {/* Summary Section */}
      <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-blue-50/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-indigo-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Summary
          </CardTitle>
          {summary && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100"
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary}
            >
              <RefreshCw className={cn("w-4 h-4", isGeneratingSummary && "animate-spin")} />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!summary ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                {isDescriptionValid 
                  ? "Generate a concise summary of this issue using AI" 
                  : "Add more description (10+ chars) to use AI summary"}
              </p>
              <AIButton 
                onClick={handleGenerateSummary} 
                isLoading={isGeneratingSummary}
                disabled={!isDescriptionValid}
              >
                Generate Summary
              </AIButton>
            </div>
          ) : (
            <div className="text-sm text-slate-700 leading-relaxed animate-in fade-in duration-500 whitespace-pre-wrap">
              {summary}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggestions Section */}
      {summary && (
        <Card className="border-indigo-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-indigo-700 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!suggestions ? (
              <div className="flex justify-center py-2">
                <Button 
                  variant="outline" 
                  className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                  onClick={handleGenerateSuggestions}
                  disabled={isGeneratingSuggestions}
                >
                  {isGeneratingSuggestions ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Lightbulb className="w-4 h-4 mr-2" />
                  )}
                  Get Solution Suggestions
                </Button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="text-sm font-medium text-slate-900">
                  Strategy: {suggestions.strategy}
                </div>
                <ul className="space-y-2">
                  {suggestions.steps?.map((step: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 p-2 rounded-md">
                      <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold mt-0.5">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-end pt-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground"
                        onClick={() => copyToClipboard(
                            `Strategy: ${suggestions.strategy}\n\nSteps:\n${suggestions.steps?.map((s: string, i: number) => `${i+1}. ${s}`).join('\n')}`
                        )}
                    >
                        {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                        {copied ? "Copied" : "Copy to clipboard"}
                    </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
