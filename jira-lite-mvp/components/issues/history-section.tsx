'use client';

import { useIssueHistory } from '@/hooks/use-history';
import { HistoryItem } from './history-item';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { History, Clock } from 'lucide-react';

interface HistorySectionProps {
  issueId: string;
}

export function HistorySection({ issueId }: HistorySectionProps) {
  const { data: history, isLoading } = useIssueHistory(issueId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          <CardTitle>히스토리</CardTitle>
        </div>
        <CardDescription>이슈에 대한 모든 변경 이력을 확인할 수 있습니다</CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 py-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : !history || history.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">아직 변경 이력이 없습니다</p>
            <p className="text-xs mt-1">이슈가 변경되면 여기에 기록됩니다</p>
          </div>
        ) : (
          <div className="space-y-0 divide-y divide-zinc-200 dark:divide-zinc-800">
            {history.map((entry) => (
              <HistoryItem key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
