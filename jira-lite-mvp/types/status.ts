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

export interface CreateStatusRequest {
  name: string;
  color: string;
  wip_limit?: number | null;
}

export interface UpdateStatusRequest {
  name?: string;
  color?: string;
  position?: number;
  wip_limit?: number | null;
}

export interface DeleteStatusResponse {
  success: true;
  data: {
    moved_issues_count: number;
  };
}
