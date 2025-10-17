'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArticleFeedItem } from '@/types/types';
import { FeaturedSection } from './FeaturedSection';

interface FeaturedLandingClientProps {
  articles: ArticleFeedItem[];
}

const MAX_CATEGORY_BUTTONS = 6;

export function FeaturedLandingClient({ articles }: FeaturedLandingClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(
        articles
          .map((article) => article.typeLabel)
          .filter((label): label is string => Boolean(label)),
      ),
    );
    return unique.slice(0, MAX_CATEGORY_BUTTONS);
  }, [articles]);

  const filteredArticles =
    activeCategory === 'all'
      ? articles
      : articles.filter((article) => article.typeLabel === activeCategory);

  if (!articles.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-10 text-center">
        <h2 className="text-lg font-semibold text-slate-900">No featured stories yet</h2>
        <p className="mt-2 text-sm text-slate-600">
          Fresh legislation and agency updates will appear here as soon as they are available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => setActiveCategory('all')}
          >
            All topics
          </Button>
          {categories.map((category) => (
            <Badge
              key={category}
              variant={activeCategory === category ? 'default' : 'secondary'}
              className={[
                'cursor-pointer rounded-full px-4 py-2 text-sm',
                activeCategory === category ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700',
              ].join(' ')}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      )}
      <FeaturedSection articles={filteredArticles} />
    </div>
  );
}
