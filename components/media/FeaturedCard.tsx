import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowUpRight, Calendar, Clock, Newspaper, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArticleFeedItem } from '@/types/types';
import { cn } from '@/lib/utils';

interface FeaturedCardProps {
  article: ArticleFeedItem;
  className?: string;
}

const formatDate = (value: string) => {
  try {
    return format(new Date(value), 'MMM d, yyyy');
  } catch {
    return '';
  }
};

const feedHref = (article: ArticleFeedItem) =>
  `/feed?focus=${encodeURIComponent(`article:${article.id}`)}`;

export function FeaturedCard({ article, className }: FeaturedCardProps) {
  const description = article.dek ?? article.summary ?? article.excerpt ?? '';

  return (
    <Card
      className={cn(
        'group flex h-full flex-col justify-between border border-slate-200 bg-white shadow-none transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg',
        className,
      )}
    >
      <CardHeader className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
          <Newspaper className="h-4 w-4 text-slate-400" aria-hidden="true" />
          {article.typeLabel}
        </div>
        <CardTitle className="line-clamp-3 text-lg font-semibold text-slate-900 transition group-hover:text-slate-950">
          {article.title}
        </CardTitle>
        {description && (
          <p className="line-clamp-3 text-sm text-slate-600">{description}</p>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <span>{formatDate(article.publishedAt)}</span>
          </div>
          {article.readingTime ? (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>{article.readingTime} min</span>
            </div>
          ) : null}
          {article.author ? (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" aria-hidden="true" />
              <span>{article.author}</span>
            </div>
          ) : null}
          {article.tags
            .filter((tag) => tag !== article.typeLabel)
            .slice(0, 2)
            .map((tag) => (
              <Badge key={`${article.id}-${tag}`} variant="secondary" className="bg-slate-100 text-slate-700">
                {tag}
              </Badge>
            ))}
        </div>
        <div className="mt-auto grid gap-2">
          <Button asChild variant="secondary" size="sm" className="justify-between text-sm">
            <Link href={feedHref(article)}>
              Open in feed
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="justify-between text-xs">
            <Link href={article.sourcePath}>
              See full legislation
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
