'use client';

import { HistoryEntry } from '@/hooks/use-history';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  FileText,
  User,
  Flag,
  Calendar,
  Tag,
  CheckCircle2,
  Edit3,
  ArrowRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface HistoryItemProps {
  entry: HistoryEntry;
}

// 필드명을 한글로 변환
const fieldNameMap: Record<string, string> = {
  title: '제목',
  description: '설명',
  status: '상태',
  assignee: '담당자',
  priority: '우선순위',
  due_date: '마감일',
  labels: '라벨',
};

// 우선순위 값을 한글로 변환
const priorityMap: Record<string, string> = {
  HIGH: '높음',
  MEDIUM: '보통',
  LOW: '낮음',
};

// 필드별 아이콘
const getFieldIcon = (fieldName: string) => {
  switch (fieldName) {
    case 'title':
      return <FileText className="h-4 w-4" />;
    case 'description':
      return <Edit3 className="h-4 w-4" />;
    case 'status':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'assignee':
      return <User className="h-4 w-4" />;
    case 'priority':
      return <Flag className="h-4 w-4" />;
    case 'due_date':
      return <Calendar className="h-4 w-4" />;
    case 'labels':
      return <Tag className="h-4 w-4" />;
    default:
      return <Edit3 className="h-4 w-4" />;
  }
};

// 우선순위 배지 색상
const getPriorityColor = (priority: string): 'default' | 'secondary' | 'destructive' => {
  switch (priority) {
    case 'HIGH':
      return 'destructive';
    case 'MEDIUM':
      return 'default';
    case 'LOW':
      return 'secondary';
    default:
      return 'default';
  }
};

// 값 포맷팅
const formatValue = (fieldName: string, value: string | null): string => {
  if (!value) return '없음';

  switch (fieldName) {
    case 'priority':
      return priorityMap[value] || value;
    case 'due_date':
      return new Date(value).toLocaleDateString('ko-KR');
    default:
      return value;
  }
};

export function HistoryItem({ entry }: HistoryItemProps) {
  const fieldDisplayName = fieldNameMap[entry.field_name] || entry.field_name;
  const timeAgo = formatDistanceToNow(new Date(entry.created_at), {
    addSuffix: true,
    locale: ko,
  });

  const renderValueChange = () => {
    if (entry.field_name === 'priority') {
      return (
        <div className="flex items-center gap-2 flex-wrap">
          {entry.old_value && (
            <Badge variant={getPriorityColor(entry.old_value)}>
              {formatValue(entry.field_name, entry.old_value)}
            </Badge>
          )}
          <ArrowRight className="h-3 w-3 text-zinc-400" />
          <Badge variant={getPriorityColor(entry.new_value || '')}>
            {formatValue(entry.field_name, entry.new_value)}
          </Badge>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 flex-wrap">
        {entry.old_value && (
          <span className="text-sm text-zinc-500 dark:text-zinc-400 line-through">
            {formatValue(entry.field_name, entry.old_value)}
          </span>
        )}
        {entry.old_value && <ArrowRight className="h-3 w-3 text-zinc-400" />}
        <span className="text-sm text-zinc-900 dark:text-zinc-100 font-medium">
          {formatValue(entry.field_name, entry.new_value)}
        </span>
      </div>
    );
  };

  return (
    <div className="flex gap-3 py-3 px-4 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0 mt-0.5">
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          {entry.changedBy?.name?.slice(0, 2).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {entry.changedBy?.name || '알 수 없음'}
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">님이</span>
          <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
            {getFieldIcon(entry.field_name)}
            <span className="text-sm font-medium">{fieldDisplayName}</span>
          </div>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {entry.old_value ? '을(를) 변경' : '을(를) 설정'}했습니다
          </span>
        </div>

        {/* Value Change */}
        <div className="pl-0">{renderValueChange()}</div>

        {/* Timestamp */}
        <div className="text-xs text-zinc-500 dark:text-zinc-500">{timeAgo}</div>
      </div>
    </div>
  );
}
