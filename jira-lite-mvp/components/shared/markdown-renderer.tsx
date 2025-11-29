'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * 마크다운 렌더러 컴포넌트
 *
 * Features:
 * - GitHub Flavored Markdown (GFM) 지원
 * - XSS 방지를 위한 HTML 정제 (rehype-sanitize)
 * - 안전한 HTML 렌더링
 *
 * AC-3 (Story 3-2): XSS 공격 방지
 */
export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  if (!content || content.trim() === '') {
    return (
      <div className={cn('text-sm text-zinc-500 dark:text-zinc-400', className)}>
        설명이 없습니다.
      </div>
    );
  }

  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none',
        'prose-headings:font-semibold prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100',
        'prose-p:text-zinc-700 dark:prose-p:text-zinc-300',
        'prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline',
        'prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:bg-zinc-900 dark:prose-pre:bg-zinc-950 prose-pre:text-zinc-100',
        'prose-ul:text-zinc-700 dark:prose-ul:text-zinc-300',
        'prose-ol:text-zinc-700 dark:prose-ol:text-zinc-300',
        'prose-blockquote:border-l-indigo-500 prose-blockquote:text-zinc-600 dark:prose-blockquote:text-zinc-400',
        'prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100',
        'prose-em:text-zinc-700 dark:prose-em:text-zinc-300',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
