export interface Comment {
  id: string;
  issue_id: string;
  author: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateCommentRequest {
  content: string; // 1-1000자
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentsResponse {
  success: true;
  data: {
    comments: Comment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      has_more: boolean;
    };
  };
}
