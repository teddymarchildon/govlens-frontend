import Link from 'next/link';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ArrowUpRight, CalendarDays, Clock, Sparkles, User } from 'lucide-react';
import { ArticleFeedItem } from '@/types/types';
import { cn } from '@/lib/utils';

interface FeaturedHeroProps {
  article: ArticleFeedItem;
  className?: string;
}

const formatPublishedDate = (value: string) => {
  try {
    return format(new Date(value), 'MMM d, yyyy');
  } catch (_error) {
    return '';
  }
};

const getFeedHref = (article: ArticleFeedItem) =>
  `/feed?focus=${encodeURIComponent(`article:${article.id}`)}`;

export function FeaturedHero({ article, className }: FeaturedHeroProps) {
  const description = article.dek ?? article.summary ?? article.excerpt ?? '';
  const secondaryTags = article.tags.filter((tag) => tag !== article.typeLabel);

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-none bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50 shadow-xl',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
      <CardContent className="relative z-10 flex h-full flex-col gap-6 p-8 md:p-10">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
          <Badge variant="outline" className="border-slate-500 bg-slate-800/60 text-slate-100">
            <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
            Featured · {article.typeLabel}
          </Badge>
          <div className="flex items-center gap-2 text-slate-300">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            <span>{formatPublishedDate(article.publishedAt)}</span>
          </div>
          {article.readingTime ? (
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>{article.readingTime} min read</span>
            </div>
          ) : null}
          {article.author ? (
            <div className="flex items-center gap-2 text-slate-300">
              <User className="h-4 w-4" aria-hidden="true" />
              <span>{article.author}</span>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            {article.title}
          </h1>
          {description && (
            <p className="max-w-3xl text-base leading-relaxed text-slate-200 md:text-lg">
              {description}
            </p>
          )}
        </div>

        {secondaryTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-200">
            {secondaryTags.map((tag) => (
              <Badge
                key={`${article.id}-${tag}`}
                variant="secondary"
                className="bg-slate-800/60 text-slate-100"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="gap-2">
            <Link href={getFeedHref(article)}>
              Continue in feed
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="bg-slate-800/60 text-slate-100 hover:bg-slate-700/70"
          >
            <Link href={article.sourcePath} className="gap-2">
              See full legislation
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
