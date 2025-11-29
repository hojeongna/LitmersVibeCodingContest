'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { useCreateComment } from '@/hooks/use-comments';

interface CommentInputProps {
  issueId: string;
  currentUser?: {
    name: string;
    avatar_url: string | null;
  };
}

export function CommentInput({ issueId, currentUser }: CommentInputProps) {
  const [content, setContent] = useState('');
  const createMutation = useCreateComment(issueId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || content.length > 1000) return;

    await createMutation.mutateAsync({ content: content.trim() });
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isLoading = createMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 border-t pt-4">
      <Avatar className="h-8 w-8 flex-shrink-0">
        {currentUser?.avatar_url ? (
          <img src={currentUser.avatar_url} alt={currentUser.name} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary text-xs text-primary-foreground">
            {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
      </Avatar>

      <div className="flex-1 space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="댓글을 작성하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
          className="min-h-[80px] max-h-[200px] resize-none"
          disabled={isLoading}
        />

        <div className="flex items-center justify-between">
          <span className={`text-xs ${content.length > 1000 ? 'text-red-600' : 'text-zinc-500'}`}>
            {content.length}/1000
          </span>

          <Button type="submit" size="sm" disabled={!content.trim() || content.length > 1000 || isLoading}>
            <Send className="mr-2 h-4 w-4" />
            {isLoading ? '전송 중...' : '전송'}
          </Button>
        </div>
      </div>
    </form>
  );
}
