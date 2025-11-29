'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { useUpdateComment, useDeleteComment } from '@/hooks/use-comments';
import { MarkdownRenderer } from '@/components/shared/markdown-renderer';
import type { Comment } from '@/types/comment';

interface CommentItemProps {
  comment: Comment;
  issueId: string;
  currentUserId?: string;
  issueReporterId?: string;
  userRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export function CommentItem({ comment, issueId, currentUserId, issueReporterId, userRole }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateMutation = useUpdateComment(issueId);
  const deleteMutation = useDeleteComment(issueId);

  const isAuthor = comment.author.id === currentUserId;
  const canDelete = isAuthor || issueReporterId === currentUserId || userRole === 'OWNER' || userRole === 'ADMIN';
  const isEdited = new Date(comment.updated_at) > new Date(comment.created_at);

  const handleSave = async () => {
    if (!editContent.trim() || editContent.length > 1000) return;

    await updateMutation.mutateAsync({
      commentId: comment.id,
      content: editContent.trim(),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(comment.id);
    setShowDeleteConfirm(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="flex gap-3 py-4">
      <Avatar className="h-8 w-8 flex-shrink-0">
        {comment.author.avatar_url ? (
          <img src={comment.author.avatar_url} alt={comment.author.name} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary text-xs text-primary-foreground">
            {comment.author.name.charAt(0).toUpperCase()}
          </div>
        )}
      </Avatar>

      <div className="flex-1 space-y-1">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{comment.author.name}</span>
          <span className="text-xs text-zinc-500">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ko })}
          </span>
          {isEdited && <span className="text-xs text-zinc-400">(수정됨)</span>}
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[80px]"
              autoFocus
            />
            <div className="flex items-center justify-between">
              <span className={`text-xs ${editContent.length > 1000 ? 'text-red-600' : 'text-zinc-500'}`}>
                {editContent.length}/1000
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="mr-1 h-3 w-3" />
                  취소
                </Button>
                <Button size="sm" onClick={handleSave} disabled={!editContent.trim() || editContent.length > 1000}>
                  <Save className="mr-1 h-3 w-3" />
                  저장
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <MarkdownRenderer content={comment.content} />
          </div>
        )}

        {/* Actions */}
        {!isEditing && (
          <div className="flex gap-2 pt-1">
            {isAuthor && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-7 text-xs">
                <Edit2 className="mr-1 h-3 w-3" />
                수정
              </Button>
            )}

            {canDelete &&
              (showDeleteConfirm ? (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)} className="h-7 text-xs">
                    취소
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete} className="h-7 text-xs">
                    확인
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  삭제
                </Button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
