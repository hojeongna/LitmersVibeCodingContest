// Kanban Board Types

export interface Status {
  id: string;
  project_id: string;
  name: string;
  color: string | null;
  position: number;
  wip_limit: number | null;
  is_default: boolean;
  created_at?: string;
}

export interface IssueCard {
  id: string;
  issue_number: number;
  title: string;
  status_id: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  position: number;
  assignee: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
  labels: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  due_date: string | null;
  subtask_count: number;
  subtask_completed: number;
}

export interface KanbanColumn {
  status: Status;
  issues: IssueCard[];
  issueCount: number;
  isOverWipLimit: boolean;
}

export interface BoardData {
  columns: KanbanColumn[];
}

// Drag & Drop Types (Story 4.2)
export interface DragState {
  activeId: string | null;
  activeColumn: string | null;
  overColumn: string | null;
}

export interface MoveIssueRequest {
  status_id: string;
  position: number;
}

export interface MoveIssueResponse {
  success: true;
  data: {
    issue: IssueCard;
    affected_issues: Array<{ id: string; position: number }>;
  };
}
