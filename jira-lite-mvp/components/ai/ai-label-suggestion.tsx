"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Label {
  id: string
  name: string
  color: string
  confidence?: number
}

interface AILabelSuggestionProps {
  projectId: string
  title: string
  description: string
  selectedLabels: string[]
  onLabelSelect: (labelId: string) => void
}

export function AILabelSuggestion({
  projectId,
  title,
  description,
  selectedLabels,
  onLabelSelect
}: AILabelSuggestionProps) {
  const [suggestions, setSuggestions] = useState<Label[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSuggest = async () => {
    if (!title || !projectId) {
        toast.error('Please enter a title first')
        return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, title, description })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get suggestions')
      }

      setSuggestions(data.data.labels)
      if (data.data.labels.length === 0) {
        toast.info('No labels suggested')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!projectId) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSuggest}
          disabled={isLoading}
          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 h-8 text-xs"
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3 mr-2" />
          )}
          AI Label Suggestion
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-indigo-50/50 rounded-md border border-indigo-100 animate-in fade-in zoom-in-95 duration-200">
          {suggestions.map((label) => {
            const isSelected = selectedLabels.includes(label.id)
            return (
              <button
                key={label.id}
                type="button"
                onClick={() => !isSelected && onLabelSelect(label.id)}
                disabled={isSelected}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-all border",
                  isSelected ? "opacity-50 cursor-not-allowed" : "hover:scale-105 cursor-pointer shadow-sm"
                )}
                style={{
                  backgroundColor: isSelected ? '#e5e7eb' : label.color,
                  color: isSelected ? '#9ca3af' : '#fff',
                  borderColor: label.color
                }}
              >
                <span>{label.name}</span>
                {label.confidence && (
                  <span className="bg-black/20 px-1 rounded text-[10px]">
                    {Math.round(label.confidence * 100)}%
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
