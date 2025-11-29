'use client';

import { use, useState } from 'react';
import { KanbanBoard } from '@/components/kanban/board';
import { IssueDetailPanel } from '@/components/issues/issue-detail-panel';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';

export default function BoardPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const router = useRouter();
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col">
      {/* Header with View Tabs */}
      <div className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <Tabs defaultValue="board" className="w-auto">
            <TabsList>
              <TabsTrigger value="board">보드</TabsTrigger>
              <TabsTrigger value="list" disabled>
                리스트
              </TabsTrigger>
              <TabsTrigger value="timeline" disabled>
                타임라인
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard projectId={projectId} onIssueClick={setSelectedIssueId} />
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
