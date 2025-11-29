'use client';

import { use, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { KanbanBoard } from '@/components/kanban/board';
import { ListView } from '@/components/issues/list-view';
import { IssueDetailPanel } from '@/components/issues/issue-detail-panel';
import { ViewToggle } from '@/components/kanban/view-toggle';
import { KanbanSkeleton } from '@/components/kanban/kanban-skeleton';
import { ListSkeleton } from '@/components/issues/list-skeleton';
import { useKanban } from '@/hooks/use-kanban';
import type { ViewMode } from '@/types/view';

export default function BoardPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const searchParams = useSearchParams();
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const { data, isLoading } = useKanban(projectId);

  // Get current view from URL or localStorage
  const urlView = searchParams.get('view') as ViewMode;
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    if (urlView) return urlView;
    const saved = localStorage.getItem(`project-${projectId}-view`) as ViewMode;
    return saved || 'board';
  });

  useEffect(() => {
    if (urlView && urlView !== currentView) {
      setCurrentView(urlView);
    }
  }, [urlView]);

  // Flatten all issues for list view
  const allIssues = data?.columns.flatMap((col) =>
    col.issues.map((issue) => ({
      ...issue,
      status: col.status,
    }))
  ) || [];

  return (
    <div className="flex h-full flex-col">
      {/* Header with View Toggle */}
      <div className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <ViewToggle projectId={projectId} />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden p-6">
        {isLoading ? (
          currentView === 'board' ? <KanbanSkeleton /> : <ListSkeleton />
        ) : currentView === 'board' ? (
          <KanbanBoard projectId={projectId} onIssueClick={setSelectedIssueId} />
        ) : (
          <ListView issues={allIssues} onIssueClick={setSelectedIssueId} />
        )}
      </div>

      {/* Issue Detail Panel */}
      <IssueDetailPanel
        issueId={selectedIssueId}
        projectId={projectId}
        open={!!selectedIssueId}
        onClose={() => setSelectedIssueId(null)}
      />
    </div>
  );
}
