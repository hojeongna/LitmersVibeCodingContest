export type ViewMode = 'board' | 'list';
export type SortField = 'status' | 'priority' | 'due_date' | 'assignee' | 'created_at';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  status?: string[];
  priority?: string[];
  assignee?: string;
  label?: string[];
  search?: string;
  due?: 'today' | 'week' | 'overdue';
}

export interface SortState {
  field: SortField;
  order: SortOrder;
}
