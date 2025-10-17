'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, Filter } from 'lucide-react';
import { ArticleFeedItem } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArticlePanel } from './ArticlePanel';

interface MediaFeedClientProps {
  articles: ArticleFeedItem[];
  initialFocus?: string;
}

const keyForArticle = (article: ArticleFeedItem) => `article:${article.id}`;

export function MediaFeedClient({ articles, initialFocus }: MediaFeedClientProps) {
  const router = useRouter();
  const [activeKey, setActiveKey] = useState<string | undefined>(initialFocus);
  const refs = useRef<Map<string, HTMLDivElement>>(new Map());
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialFocus) return;
    const focusRef = refs.current.get(initialFocus);
    if (focusRef) {
      focusRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [initialFocus]);

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    articles.forEach((article) => {
      article.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).slice(0, 6);
  }, [articles]);

  const handleResetFocus = () => {
    setActiveKey(undefined);
    router.replace('/feed', { scroll: false });
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-10">
      <div ref={topRef} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Article Feed</h1>
            <p className="text-sm text-slate-600">
              Deep dives on legislation, executive actions, and landmark cases curated by GovLens.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" aria-hidden="true" />
              Filters
            </Button>
            <Button variant="ghost" size="sm" onClick={handleResetFocus} className="gap-2">
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
              Back to top
            </Button>
          </div>
        </div>
        {uniqueTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {uniqueTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-full bg-slate-100 text-slate-700">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {articles.map((article) => {
          const articleKey = keyForArticle(article);
          return (
            <div
              key={articleKey}
              ref={(node) => {
                if (node) {
                  refs.current.set(articleKey, node);
                } else {
                  refs.current.delete(articleKey);
                }
              }}
              className="scroll-mt-24"
              onMouseEnter={() => setActiveKey(articleKey)}
            >
              <ArticlePanel article={article} isActive={activeKey === articleKey} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
