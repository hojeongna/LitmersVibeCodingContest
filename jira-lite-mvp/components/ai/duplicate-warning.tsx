"use client"

import { useState, useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, ExternalLink, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/use-debounce'
import Link from 'next/link'

interface Duplicate {
  issue_id: string
  issue_key: string
  title: string
  similarity: number
}

interface DuplicateWarningProps {
  projectId: string
  title: string
  description: string
}

export function DuplicateWarning({ projectId, title, description }: DuplicateWarningProps) {
  const [duplicates, setDuplicates] = useState<Duplicate[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const debouncedTitle = useDebounce(title, 500)
  const debouncedDescription = useDebounce(description, 500)

  useEffect(() => {
    const checkDuplicates = async () => {
      if (!debouncedTitle || debouncedTitle.length < 5 || !projectId) {
        setDuplicates([])
        return
      }

      setIsChecking(true)
      try {
        const response = await fetch('/api/ai/duplicates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            project_id: projectId, 
            title: debouncedTitle, 
            description: debouncedDescription 
          })
        })

        if (response.ok) {
          const data = await response.json()
          setDuplicates(data.data.duplicates || [])
          if ((data.data.duplicates || []).length > 0) {
              setIsVisible(true)
          }
        }
      } catch (error) {
        console.error('Duplicate check failed:', error)
      } finally {
        setIsChecking(false)
      }
    }

    checkDuplicates()
  }, [debouncedTitle, debouncedDescription, projectId])

  if (duplicates.length === 0 || !isVisible) return null

  return (
    <Alert className="bg-amber-50 border-amber-200 text-amber-900 mb-4 animate-in slide-in-from-top-2 duration-300">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <div className="flex items-center justify-between w-full">
        <AlertTitle className="text-amber-800 mb-0 font-semibold">
          Potential Duplicates Detected
        </AlertTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 text-amber-600 hover:bg-amber-100 hover:text-amber-800"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <AlertDescription className="mt-2 w-full">
        <div className="space-y-2">
          {duplicates.map((dup) => (
            <div key={dup.issue_id} className="flex items-center justify-between bg-white/60 p-2 rounded text-sm border border-amber-100">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="font-mono text-xs text-amber-700 bg-amber-100 px-1 rounded flex-shrink-0">
                  {dup.issue_key}
                </span>
                <span className="font-medium truncate text-amber-900">{dup.title}</span>
                <span className="text-xs text-amber-600 bg-amber-100 px-1.5 rounded-full flex-shrink-0">
                  {Math.round(dup.similarity * 100)}% match
                </span>
              </div>
              <Link 
                href={`/projects/${projectId}/issues/${dup.issue_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 hover:text-amber-800 flex-shrink-0 ml-2"
              >
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  )
}
