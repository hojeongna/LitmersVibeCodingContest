'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Archive, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Project } from '@/hooks/use-projects';
import { useFavoriteProject } from '@/hooks/use-projects';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const favoriteMutation = useFavoriteProject(project.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    favoriteMutation.mutate();
  };

  return (
    <Link href={`/projects/${project.id}/board`}>
      <Card className={cn(
        'group transition-all hover:shadow-md cursor-pointer',
        project.is_archived && 'opacity-60'
      )}>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FolderKanban className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <CardTitle className="text-lg truncate">{project.name}</CardTitle>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {project.is_archived && (
                <Badge variant="outline" className="text-xs">
                  <Archive className="h-3 w-3 mr-1" />
                  보관됨
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8',
                  project.isFavorite ? 'text-yellow-500' : 'text-zinc-400 opacity-0 group-hover:opacity-100'
                )}
                onClick={handleFavoriteClick}
                disabled={favoriteMutation.isPending}
              >
                <Star
                  className={cn('h-4 w-4', project.isFavorite && 'fill-current')}
                />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs font-mono">
              {project.key}
            </Badge>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {project.team.name}
            </span>
          </div>
        </CardHeader>

        {(project.description || project.issueCount > 0) && (
          <CardContent>
            {project.description && (
              <CardDescription className="line-clamp-2 mb-3">
                {project.description}
              </CardDescription>
            )}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-zinc-600 dark:text-zinc-400">
                  이슈 <span className="font-semibold text-zinc-900 dark:text-zinc-100">{project.issueCount}</span>
                </span>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {format(new Date(project.created_at), 'yyyy년 M월 d일', { locale: ko })}
              </span>
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
