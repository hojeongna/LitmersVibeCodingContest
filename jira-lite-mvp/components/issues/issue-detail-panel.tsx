'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { LabelTag } from '@/components/ui/label-tag';
import { Skeleton } from '@/components/ui/skeleton';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import { Calendar, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { CommentSection } from './comment-section';
import { AISummaryPanel } from '@/components/ai/ai-summary-panel';

interface Issue {
  id: string;
  title: string;
  description: string | null;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: { id: string; name: string; color: string | null };
  assignee: { id: string; name: string; avatar_url: string | null } | null;
  owner: { id: string; name: string } | null;
  labels: Array<{ id: string; name: string; color: string }>;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  ai_summary: string | null;
  ai_suggestions: any | null;
}

interface IssueDetailPanelProps {
  issueId: string | null;
  projectId: string;
  open: boolean;
  onClose: () => void;
}

export function IssueDetailPanel({ issueId, projectId, open, onClose }: IssueDetailPanelProps) {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!issueId || !open) {
      setIssue(null);
      return;
    }

    const fetchIssue = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/issues/${issueId}`);
        if (response.ok) {
          const result = await response.json();
          setIssue(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch issue:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssue();
  }, [issueId, open]);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {isLoading || !issue ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>
                <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">{issue.id.slice(0, 8)}</span>
              </SheetTitle>
            </SheetHeader>

            <div className="mt-4 space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{issue.title}</h2>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-2">
                <PriorityBadge priority={issue.priority} />
                <span
                  className="inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: issue.status.color ? `${issue.status.color}20` : '#F4F4F5',
                    color: issue.status.color || '#71717A',
                  }}
                >
                  {issue.status.name}
                </span>
              </div>

              {/* Labels */}
              {issue.labels.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">라벨</h3>
                  <div className="flex flex-wrap gap-1">
                    {issue.labels.map((label) => (
                      <LabelTag key={label.id} label={label.name} bgColor={label.color} textColor="#FFFFFF" preset="custom" />
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">설명</h3>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <MarkdownRenderer content={issue.description || ''} />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                  <div className="flex-1">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">담당자</p>
                    {issue.assignee ? (
                      <div className="mt-1 flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={issue.assignee.avatar_url || undefined} alt={issue.assignee.name} />
                          <AvatarFallback className="text-xs">
                            {issue.assignee.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{issue.assignee.name}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">미할당</p>
                    )}
                  </div>
                </div>

                {issue.due_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                    <div className="flex-1">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">마감일</p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {format(new Date(issue.due_date), 'PPP', { locale: ko })}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                  <div className="flex-1">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">생성일</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {format(new Date(issue.created_at), 'PPP', { locale: ko })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <CommentSection issueId={issue.id} issueReporterId={issue.owner?.id} />

              {/* AI Summary & Suggestions */}
              <AISummaryPanel 
                issueId={issue.id} 
                title={issue.title} 
                description={issue.description || ''} 
                initialSummary={issue.ai_summary}
                initialSuggestions={issue.ai_suggestions}
              />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
