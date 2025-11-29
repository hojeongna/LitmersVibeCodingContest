'use client';

import { LayoutGrid, List } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import type { ViewMode } from '@/types/view';

interface ViewToggleProps {
  projectId: string;
}

export function ViewToggle({ projectId }: ViewToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = (searchParams.get('view') as ViewMode) || 'board';

  // Save view preference to localStorage
  useEffect(() => {
    if (currentView) {
      localStorage.setItem(`project-${projectId}-view`, currentView);
    }
  }, [currentView, projectId]);

  const handleViewChange = (view: ViewMode) => {
    const params = new URLSearchParams(searchParams);
    params.set('view', view);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
      <button
        onClick={() => handleViewChange('board')}
        className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
          currentView === 'board'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-transparent text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
        }`}
      >
        <LayoutGrid className="h-4 w-4" />
        Board
      </button>
      <button
        onClick={() => handleViewChange('list')}
        className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
          currentView === 'list'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-transparent text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
        }`}
      >
        <List className="h-4 w-4" />
        List
      </button>
    </div>
  );
}
