'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface IssueFilters {
  searchQuery: string;
  statusId: string | null;
  assigneeId: string | null;
  priority: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
  labelIds: string[];
  sortBy: 'created_at' | 'updated_at' | 'priority' | 'due_date';
}

interface IssueFilterPanelProps {
  filters: IssueFilters;
  onFiltersChange: (filters: IssueFilters) => void;
  statuses?: Array<{ id: string; name: string; color: string | null }>;
  teamMembers?: Array<{
    user_id: string;
    profile?: { name: string; email: string };
  }>;
  labels?: Array<{ id: string; name: string; color: string }>;
  issueCount?: number;
}

export function IssueFilterPanel({
  filters,
  onFiltersChange,
  statuses = [],
  teamMembers = [],
  labels = [],
  issueCount = 0,
}: IssueFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchQuery: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, statusId: value === 'all' ? null : value });
  };

  const handleAssigneeChange = (value: string) => {
    onFiltersChange({ ...filters, assigneeId: value === 'all' ? null : value });
  };

  const handlePriorityChange = (value: string) => {
    onFiltersChange({
      ...filters,
      priority: value as 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW',
    });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortBy: value as 'created_at' | 'updated_at' | 'priority' | 'due_date',
    });
  };

  const toggleLabel = (labelId: string) => {
    const current = filters.labelIds;
    if (current.includes(labelId)) {
      onFiltersChange({
        ...filters,
        labelIds: current.filter((id) => id !== labelId),
      });
    } else {
      onFiltersChange({
        ...filters,
        labelIds: [...current, labelId],
      });
    }
  };

  const clearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      statusId: null,
      assigneeId: null,
      priority: 'ALL',
      labelIds: [],
      sortBy: 'created_at',
    });
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.statusId ||
    filters.assigneeId ||
    filters.priority !== 'ALL' ||
    filters.labelIds.length > 0;

  const activeFilterCount =
    (filters.searchQuery ? 1 : 0) +
    (filters.statusId ? 1 : 0) +
    (filters.assigneeId ? 1 : 0) +
    (filters.priority !== 'ALL' ? 1 : 0) +
    (filters.labelIds.length > 0 ? 1 : 0);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                검색
              </Label>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-auto py-1 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  초기화
                </Button>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="제목 또는 설명 검색..."
                value={filters.searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>필터</span>
              {activeFilterCount > 0 && (
                <Badge variant="default" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </div>
            <span className="text-xs text-zinc-500">{issueCount}개 이슈</span>
          </Button>

          {/* Expanded Filters */}
          {isExpanded && (
            <div className="space-y-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              {/* Sort */}
              <div className="space-y-2">
                <Label>정렬</Label>
                <Select value={filters.sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">생성일 (최신순)</SelectItem>
                    <SelectItem value="updated_at">최종 수정일 (최신순)</SelectItem>
                    <SelectItem value="priority">우선순위 (높은순)</SelectItem>
                    <SelectItem value="due_date">마감일 (빠른순)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>상태</Label>
                <Select
                  value={filters.statusId || 'all'}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        <div className="flex items-center gap-2">
                          {status.color && (
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: status.color }}
                            />
                          )}
                          {status.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assignee Filter */}
              <div className="space-y-2">
                <Label>담당자</Label>
                <Select
                  value={filters.assigneeId || 'all'}
                  onValueChange={handleAssigneeChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="unassigned">미지정</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        {member.profile?.name || member.profile?.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter */}
              <div className="space-y-2">
                <Label>우선순위</Label>
                <Select value={filters.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">전체</SelectItem>
                    <SelectItem value="HIGH">높음 (HIGH)</SelectItem>
                    <SelectItem value="MEDIUM">보통 (MEDIUM)</SelectItem>
                    <SelectItem value="LOW">낮음 (LOW)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Label Filter */}
              {labels.length > 0 && (
                <div className="space-y-2">
                  <Label>라벨</Label>
                  <div className="flex flex-wrap gap-2 p-3 border border-zinc-200 dark:border-zinc-800 rounded-md min-h-[42px]">
                    {labels.map((label) => {
                      const isSelected = filters.labelIds.includes(label.id);
                      return (
                        <button
                          key={label.id}
                          type="button"
                          onClick={() => toggleLabel(label.id)}
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all ${
                            isSelected
                              ? 'ring-2 ring-indigo-500'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                          style={{
                            backgroundColor: label.color + '20',
                            color: label.color,
                          }}
                        >
                          {label.name}
                          {isSelected && <X className="ml-1 h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
